// ============================================
// BrightHaus — Main Server
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { initDatabase, getDb } = require('./database');
const { calculateShipping, getAvailableMethods } = require('./shipping');
const { sendOrderConfirmation, sendShippingNotification } = require('./email');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Stripe webhook needs raw body
app.post('/api/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// JSON for everything else
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, '..', 'site')));

// ---- Helper: Generate Order Number ----
function generateOrderNumber() {
    const date = new Date();
    const prefix = 'BH';
    const datePart = date.toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${datePart}-${rand}`;
}

// ---- API: Get Products ----
app.get('/api/products', (req, res) => {
    const db = getDb();
    const products = db.prepare('SELECT * FROM products WHERE active = 1').all();
    products.forEach(p => { p.features = JSON.parse(p.features); });
    res.json(products);
});

// ---- API: Get Shipping Methods ----
app.post('/api/shipping', (req, res) => {
    const { subtotal } = req.body;
    const methods = getAvailableMethods(subtotal || 0);
    res.json({ methods, free_threshold: 49.00 });
});

// ---- API: Calculate Shipping Cost ----
app.post('/api/shipping/calculate', (req, res) => {
    const db = getDb();
    const { items, method, subtotal } = req.body;

    if (!items || !method) {
        return res.status(400).json({ error: 'Missing items or method' });
    }

    const enrichedItems = items.map(item => {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.id);
        if (!product) return null;
        return { ...item, weight_oz: product.weight_oz, price: product.price };
    }).filter(Boolean);

    const result = calculateShipping(enrichedItems, method, subtotal || 0);
    res.json(result);
});

// ---- API: Create Checkout Session ----
app.post('/api/checkout', async (req, res) => {
    try {
        const db = getDb();
        const { items, shipping_method } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        const lineItems = [];
        let subtotal = 0;
        const validatedItems = [];

        for (const item of items) {
            const product = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(item.id);
            if (!product) {
                return res.status(400).json({ error: `Product not found: ${item.id}` });
            }
            subtotal += product.price * item.qty;
            validatedItems.push({
                id: product.id,
                name: product.name,
                price: product.price,
                qty: item.qty,
                weight_oz: product.weight_oz
            });

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        description: product.description
                    },
                    unit_amount: Math.round(product.price * 100)
                },
                quantity: item.qty
            });
        }

        const method = shipping_method || 'standard';
        const shippingResult = calculateShipping(validatedItems, method, subtotal);
        const shippingCost = shippingResult.cost || 0;

        if (shippingCost > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Shipping (${shippingResult.method.name})` },
                    unit_amount: Math.round(shippingCost * 100)
                },
                quantity: 1
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            shipping_address_collection: { allowed_countries: ['US'] },
            metadata: {
                items: JSON.stringify(validatedItems),
                shipping_method: method,
                shipping_cost: shippingCost.toString(),
                subtotal: subtotal.toString()
            },
            success_url: `${process.env.FRONTEND_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/#products`
        });

        res.json({ url: session.url, session_id: session.id });
    } catch (err) {
        console.error('Checkout error:', err);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// ---- API: Stripe Webhook ----
async function handleWebhook(req, res) {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        try {
            await createOrderFromSession(event.data.object);
        } catch (err) {
            console.error('Error saving order from webhook:', err);
        }
    }

    res.json({ received: true });
}

// ---- Helper: Create order from Stripe session ----
async function createOrderFromSession(session) {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM orders WHERE stripe_session_id = ?').get(session.id);
    if (existing) return existing;

    const orderNumber = generateOrderNumber();
    const meta = session.metadata || {};
    const shipping = session.shipping_details || {};
    const address = shipping.address || {};

    const orderData = {
        order_number: orderNumber,
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
        status: 'paid',
        customer_email: session.customer_details?.email || '',
        customer_name: session.customer_details?.name || '',
        customer_phone: session.customer_details?.phone || '',
        shipping_name: shipping.name || '',
        shipping_address_line1: address.line1 || '',
        shipping_address_line2: address.line2 || '',
        shipping_city: address.city || '',
        shipping_state: address.state || '',
        shipping_zip: address.postal_code || '',
        shipping_country: address.country || 'US',
        shipping_method: meta.shipping_method || 'standard',
        shipping_cost: parseFloat(meta.shipping_cost) || 0,
        subtotal: parseFloat(meta.subtotal) || 0,
        total: (session.amount_total || 0) / 100,
        items: meta.items || '[]'
    };

    db.prepare(`
        INSERT INTO orders (order_number, stripe_session_id, stripe_payment_intent, status,
            customer_email, customer_name, customer_phone,
            shipping_name, shipping_address_line1, shipping_address_line2,
            shipping_city, shipping_state, shipping_zip, shipping_country,
            shipping_method, shipping_cost, subtotal, total, items)
        VALUES (@order_number, @stripe_session_id, @stripe_payment_intent, @status,
            @customer_email, @customer_name, @customer_phone,
            @shipping_name, @shipping_address_line1, @shipping_address_line2,
            @shipping_city, @shipping_state, @shipping_zip, @shipping_country,
            @shipping_method, @shipping_cost, @subtotal, @total, @items)
    `).run(orderData);

    await sendOrderConfirmation(orderData);
    console.log(`Order created: ${orderNumber}`);

    return orderData;
}

// ---- API: Order Status (for success page) ----
app.get('/api/order/:sessionId', async (req, res) => {
    try {
        const db = getDb();
        let order = db.prepare('SELECT * FROM orders WHERE stripe_session_id = ?').get(req.params.sessionId);

        if (!order) {
            const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
            if (session.payment_status === 'paid') {
                order = await createOrderFromSession(session);
            } else {
                return res.status(404).json({ error: 'Payment not completed' });
            }
        }

        res.json({
            order_number: order.order_number,
            status: order.status,
            email: order.customer_email,
            total: order.total,
            shipping_method: order.shipping_method,
            created_at: order.created_at
        });
    } catch (err) {
        console.error('Order fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// ---- API: Newsletter Signup ----
app.post('/api/subscribe', (req, res) => {
    const db = getDb();
    const { email } = req.body;
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email' });
    }
    try {
        db.prepare('INSERT OR IGNORE INTO subscribers (email) VALUES (?)').run(email);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

// ---- ADMIN: Basic Auth Middleware ----
function adminAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
        return res.status(401).send('Authentication required');
    }
    const decoded = Buffer.from(auth.slice(6), 'base64').toString();
    const [user, pass] = decoded.split(':');
    if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
        return next();
    }
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).send('Invalid credentials');
}

// ---- ADMIN: Dashboard ----
app.get('/admin', adminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// ---- ADMIN: Get Orders ----
app.get('/api/admin/orders', adminAuth, (req, res) => {
    const db = getDb();
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM orders';
    const params = [];

    if (status) {
        query += ' WHERE status = ?';
        params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const orders = db.prepare(query).all(...params);
    const totalResult = db.prepare('SELECT COUNT(*) as count FROM orders').get();
    const total = totalResult ? totalResult.count : 0;

    orders.forEach(o => { o.items = JSON.parse(o.items); });

    res.json({ orders, total, page: parseInt(page), limit: parseInt(limit) });
});

// ---- ADMIN: Update Order Status ----
app.patch('/api/admin/orders/:id', adminAuth, async (req, res) => {
    const db = getDb();
    const { status, tracking_number, notes } = req.body;
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const updates = [];
    const params = [];

    if (status) { updates.push('status = ?'); params.push(status); }
    if (tracking_number) { updates.push('tracking_number = ?'); params.push(tracking_number); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    updates.push('updated_at = CURRENT_TIMESTAMP');

    params.push(req.params.id);
    db.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    if (status === 'shipped') {
        const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
        await sendShippingNotification(updated);
    }

    res.json({ success: true });
});

// ---- ADMIN: Stats ----
app.get('/api/admin/stats', adminAuth, (req, res) => {
    const db = getDb();
    const stats = {
        total_orders: (db.prepare('SELECT COUNT(*) as c FROM orders').get() || {}).c || 0,
        total_revenue: (db.prepare('SELECT COALESCE(SUM(total), 0) as t FROM orders').get() || {}).t || 0,
        pending_orders: (db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'paid'").get() || {}).c || 0,
        shipped_orders: (db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'shipped'").get() || {}).c || 0,
        subscribers: (db.prepare('SELECT COUNT(*) as c FROM subscribers').get() || {}).c || 0,
        recent_orders: db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5').all()
    };
    stats.recent_orders.forEach(o => { o.items = JSON.parse(o.items); });
    res.json(stats);
});

// ---- Catch-all: serve index.html ----
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'site', 'index.html'));
});

// ---- Start Server ----
async function start() {
    await initDatabase();
    app.listen(PORT, () => {
        console.log(`
    ╔══════════════════════════════════════════╗
    ║       BrightHaus Server Running          ║
    ╠══════════════════════════════════════════╣
    ║  Store:  http://localhost:${PORT}            ║
    ║  Admin:  http://localhost:${PORT}/admin      ║
    ╚══════════════════════════════════════════╝
        `);
    });
}

start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
