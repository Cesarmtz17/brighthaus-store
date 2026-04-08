// ============================================
// BrightHaus — CJ Dropshipping Integration
// ============================================
//
// FLUJO ACTUAL (semi-automático):
// 1. Cliente compra en brighthaus.onrender.com
// 2. Stripe procesa el pago
// 3. Se crea la orden en la DB + email de confirmación al cliente
// 4. Te llega email de notificación con datos de la orden
// 5. Tú pides el producto en CJ con los datos del cliente
// 6. Actualizas el tracking en el admin panel
// 7. El cliente recibe email con tracking
//
// PRODUCTOS MAPEADOS EN CJ:
// - Motion Sensor Light: PID 1388763001544380416
//   - 3-pack warm: VID 1602170190710714368 ($3.13)
//   - 3-pack white: VID 1602170190714908672 ($3.13)
//   - 6-pack warm: VID 1647139082495070208 ($5.91)
//   - 6-pack white: VID 1647139082549596160 ($5.91)
//
// - Garage Light: PENDIENTE (buscar en cjdropshipping.com "deformable garage light E26")
// - Under Cabinet: PENDIENTE (buscar "under cabinet LED rechargeable motion sensor")
// - Outdoor Flood: PENDIENTE (buscar "outdoor security flood light 3 head motion")
//
// Cuando tengas los PIDs, agrégalos aquí y en las env vars.
// ============================================

const CJ_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';
let accessToken = null;
let tokenExpiry = null;

async function getToken() {
    if (!process.env.CJ_API_KEY) return null;
    if (accessToken && tokenExpiry && new Date() < tokenExpiry) return accessToken;

    try {
        const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: process.env.CJ_API_KEY })
        });
        const data = await res.json();
        if (!data.result) return null;

        accessToken = data.data.accessToken;
        tokenExpiry = new Date(data.data.accessTokenExpiryDate);
        return accessToken;
    } catch (e) {
        console.error('CJ auth error:', e.message);
        return null;
    }
}

async function cjRequest(endpoint, method = 'GET', body = null) {
    const token = await getToken();
    if (!token) return null;

    const options = {
        method,
        headers: { 'Content-Type': 'application/json', 'CJ-Access-Token': token }
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${CJ_BASE}${endpoint}`, options);
    return await res.json();
}

// Product mapping — our products to CJ variants
const PRODUCT_MAP = {
    'motion-sensor-3': { vid: '1602170190714908672', qty: 1 }, // 3pcs white light
    'motion-sensor-6': { vid: '1647139082549596160', qty: 1 }, // 6pcs white light
    'garage-80w': { vid: process.env.CJ_VID_GARAGE_80W || '', qty: 1 },
    'garage-150w-2pack': { vid: process.env.CJ_VID_GARAGE_150W || '', qty: 1 },
    'cabinet-2pack': { vid: process.env.CJ_VID_CABINET || '', qty: 1 },
    'outdoor-flood-2pack': { vid: process.env.CJ_VID_OUTDOOR || '', qty: 1 },
    // Bundles — need to order each component separately
    'bundle-starter': null, // handled as multiple items
    'bundle-complete': null
};

// Expand bundles into individual CJ orders
function expandBundleItems(items) {
    const expanded = [];
    for (const item of items) {
        if (item.id === 'bundle-starter') {
            expanded.push({ id: 'motion-sensor-6', qty: item.qty });
            expanded.push({ id: 'cabinet-2pack', qty: item.qty });
            expanded.push({ id: 'garage-80w', qty: item.qty });
        } else if (item.id === 'bundle-complete') {
            expanded.push({ id: 'motion-sensor-6', qty: item.qty });
            expanded.push({ id: 'cabinet-2pack', qty: item.qty });
            expanded.push({ id: 'garage-150w-2pack', qty: item.qty });
            expanded.push({ id: 'outdoor-flood-2pack', qty: item.qty });
        } else {
            expanded.push(item);
        }
    }
    return expanded;
}

// Create order on CJ (when all VIDs are configured)
async function createCJOrder(order) {
    const items = JSON.parse(order.items);
    const expanded = expandBundleItems(items);

    const products = [];
    for (const item of expanded) {
        const mapping = PRODUCT_MAP[item.id];
        if (!mapping || !mapping.vid) {
            console.log(`CJ: No VID mapped for ${item.id}, skipping auto-order`);
            return null; // Can't auto-order if any product is unmapped
        }
        products.push({ vid: mapping.vid, quantity: item.qty * mapping.qty });
    }

    const cjOrder = {
        orderNumber: order.order_number,
        shippingZip: order.shipping_zip,
        shippingCountryCode: order.shipping_country || 'US',
        shippingProvince: order.shipping_state,
        shippingCity: order.shipping_city,
        shippingAddress: order.shipping_address_line1 + (order.shipping_address_line2 ? ', ' + order.shipping_address_line2 : ''),
        shippingCustomerName: order.shipping_name,
        shippingPhone: order.customer_phone || '0000000000',
        remark: '',
        fromCountryCode: 'CN',
        logisticName: 'CJPacket Ordinary',
        products
    };

    const data = await cjRequest('/shopping/order/createOrder', 'POST', cjOrder);
    if (data?.result) {
        console.log(`CJ Order created: ${data.data?.orderId} for ${order.order_number}`);
        return data.data;
    } else {
        console.error('CJ Order failed:', data?.message);
        return null;
    }
}

// Check if all products can be auto-ordered
function canAutoOrder(items) {
    const parsed = typeof items === 'string' ? JSON.parse(items) : items;
    const expanded = expandBundleItems(parsed);
    return expanded.every(item => PRODUCT_MAP[item.id]?.vid);
}

module.exports = { createCJOrder, canAutoOrder, getToken, expandBundleItems };
