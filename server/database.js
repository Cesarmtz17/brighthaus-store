// ============================================
// BrightHaus — Database Setup (SQLite)
// ============================================

const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'brighthaus.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        compare_price REAL,
        category TEXT,
        features TEXT,
        weight_oz REAL DEFAULT 16,
        stock INTEGER DEFAULT 999,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        stripe_session_id TEXT,
        stripe_payment_intent TEXT,
        status TEXT DEFAULT 'paid',
        customer_email TEXT NOT NULL,
        customer_name TEXT,
        customer_phone TEXT,
        shipping_name TEXT,
        shipping_address_line1 TEXT,
        shipping_address_line2 TEXT,
        shipping_city TEXT,
        shipping_state TEXT,
        shipping_zip TEXT,
        shipping_country TEXT DEFAULT 'US',
        shipping_method TEXT,
        shipping_cost REAL DEFAULT 0,
        subtotal REAL NOT NULL,
        total REAL NOT NULL,
        items TEXT NOT NULL,
        tracking_number TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Seed products
const insertProduct = db.prepare(`
    INSERT OR REPLACE INTO products (id, name, description, price, compare_price, category, features, weight_oz)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const products = [
    {
        id: 'motion-sensor-3',
        name: 'LED Motion Sensor Light — 3 Pack',
        description: 'Rechargeable USB-C, magnetic mount. Perfect for closets, stairs & hallways. Auto on/off.',
        price: 24.99,
        compare_price: 39.99,
        category: 'indoor',
        features: JSON.stringify(['120° PIR sensor, 10ft range', 'USB-C rechargeable, 4-6 week battery', 'Magnetic + adhesive mount']),
        weight_oz: 12
    },
    {
        id: 'motion-sensor-6',
        name: 'LED Motion Sensor Light — 6 Pack',
        description: 'Light up your entire home. Closets, pantry, stairs, garage entry — every dark corner covered.',
        price: 39.99,
        compare_price: 69.99,
        category: 'indoor',
        features: JSON.stringify(['All features of 3-pack', 'Covers 6 areas of your home', 'Save $12 vs buying 2x 3-packs']),
        weight_oz: 24
    },
    {
        id: 'garage-80w',
        name: 'Deformable LED Garage Light — 80W',
        description: '8,000 lumens of daylight brightness. Screws into any standard E26 socket. No wiring needed.',
        price: 19.99,
        compare_price: 34.99,
        category: 'garage',
        features: JSON.stringify(['3 adjustable panels (0-90°)', '8,000 lumens, 6500K daylight', 'Standard E26 socket — instant install']),
        weight_oz: 16
    },
    {
        id: 'garage-150w-2pack',
        name: 'Deformable LED Garage Light — 2 Pack 150W',
        description: 'Ultra-bright 15,000 lumens each. Cover your entire garage or workshop with stadium-like lighting.',
        price: 34.99,
        compare_price: 54.99,
        category: 'garage',
        features: JSON.stringify(['5 adjustable panels per light', '15,000 lumens each, 6500K', 'Save $8 vs buying separately']),
        weight_oz: 40
    },
    {
        id: 'cabinet-2pack',
        name: 'LED Under Cabinet Light — 2 Pack',
        description: 'Wireless, rechargeable kitchen task lighting. Motion sensor activates hands-free while you cook.',
        price: 22.99,
        compare_price: 37.99,
        category: 'kitchen',
        features: JSON.stringify(['Motion sensor + manual mode', '5 brightness levels, dimmable', 'USB-C rechargeable, magnetic mount']),
        weight_oz: 14
    },
    {
        id: 'outdoor-flood-2pack',
        name: 'Outdoor Motion Sensor Flood Light — 2 Pack',
        description: '3-head security light with 180° motion detection. IP65 weatherproof for any outdoor environment.',
        price: 39.99,
        compare_price: 59.99,
        category: 'outdoor',
        features: JSON.stringify(['3 adjustable heads, 6200 lumens', '180° sensor, 49ft range', 'IP65 waterproof, anti-rust aluminum']),
        weight_oz: 48
    },
    {
        id: 'bundle-starter',
        name: 'Whole Home Starter Kit',
        description: 'Motion Sensor 6-Pack + Under Cabinet 2-Pack + Garage LED',
        price: 69.99,
        compare_price: 94.97,
        category: 'bundle',
        features: JSON.stringify(['Motion Sensor 6-Pack', 'Under Cabinet 2-Pack', 'Garage LED 80W']),
        weight_oz: 52
    },
    {
        id: 'bundle-complete',
        name: 'Complete Home Package',
        description: 'Motion Sensor 6-Pack + Under Cabinet 2-Pack + Garage LED 2-Pack + Outdoor Flood 2-Pack',
        price: 119.99,
        compare_price: 149.96,
        category: 'bundle',
        features: JSON.stringify(['Motion Sensor 6-Pack', 'Under Cabinet 2-Pack', 'Garage LED 2-Pack 150W', 'Outdoor Flood 2-Pack']),
        weight_oz: 126
    }
];

const seedProducts = db.transaction(() => {
    for (const p of products) {
        insertProduct.run(p.id, p.name, p.description, p.price, p.compare_price, p.category, p.features, p.weight_oz);
    }
});

seedProducts();

module.exports = db;
