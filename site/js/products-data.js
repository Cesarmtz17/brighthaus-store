/* ============================================
   BrightHaus — Product Data
   Shared between index.html and product.html
   ============================================ */

const PRODUCTS = {
    'motion-sensor-3': {
        name: 'LED Motion Sensor Light — 3 Pack',
        category: 'indoor',
        badge: { type: 'bestseller', text: 'Best Seller' },
        rating: { stars: 5, count: '2,847' },
        description: 'Rechargeable USB-C, magnetic mount. Perfect for closets, stairs & hallways. Auto on/off.',
        longDescription: 'Transform every dark corner of your home with our best-selling motion sensor lights. Each light features a 120-degree PIR sensor that detects movement up to 10 feet away, automatically turning on when you enter and off 15 seconds after you leave. The built-in USB-C rechargeable battery lasts 4-6 weeks on a single charge with normal use. Mount them anywhere in seconds with the included magnetic backing or 3M adhesive strips — no tools, no wiring, no electrician needed.',
        price: 24.99,
        comparePrice: 39.99,
        savePercent: 37,
        features: [
            '120° PIR sensor, 10ft range',
            'USB-C rechargeable, 4-6 week battery',
            'Magnetic + adhesive mount'
        ],
        specs: {
            'Sensor': '120° PIR, 10ft detection range',
            'Power': 'USB-C rechargeable (cable included)',
            'Battery Life': '4-6 weeks (10-15 activations/day)',
            'Charge Time': '~2 hours',
            'Light Color': '6000K cool white',
            'Lumens': '150 per light',
            'Mount Type': 'Magnetic + 3M adhesive',
            'Auto-Off': '15 seconds after no motion',
            'Package': '3 lights + 3 USB-C cables + 3 adhesive strips'
        },
        images: ['/img/motion-sensor.jpg'],
        relatedProducts: ['motion-sensor-6', 'cabinet-2pack', 'bundle-starter']
    },
    'motion-sensor-6': {
        name: 'LED Motion Sensor Light — 6 Pack',
        category: 'indoor',
        badge: { type: 'value', text: 'Best Value' },
        rating: { stars: 5, count: '1,523' },
        description: 'Light up your entire home. Closets, pantry, stairs, garage entry — every dark corner covered.',
        longDescription: 'The smart way to light your entire home. This 6-pack gives you enough motion sensor lights to cover every dark spot — closets, pantry, stairs, hallways, garage entry, bathroom, and more. Same premium quality as our 3-pack but at a better per-unit price. Each light features the same powerful 120-degree PIR sensor, USB-C rechargeable battery, and tool-free magnetic mount. Most customers start with 6 and come back for more.',
        price: 39.99,
        comparePrice: 69.99,
        savePercent: 43,
        features: [
            'All features of 3-pack',
            'Covers 6 areas of your home',
            'Save $12 vs buying 2x 3-packs'
        ],
        specs: {
            'Sensor': '120° PIR, 10ft detection range',
            'Power': 'USB-C rechargeable (cable included)',
            'Battery Life': '4-6 weeks (10-15 activations/day)',
            'Charge Time': '~2 hours',
            'Light Color': '6000K cool white',
            'Lumens': '150 per light (900 total)',
            'Mount Type': 'Magnetic + 3M adhesive',
            'Auto-Off': '15 seconds after no motion',
            'Package': '6 lights + 6 USB-C cables + 6 adhesive strips'
        },
        images: ['/img/motion-sensor.jpg'],
        relatedProducts: ['motion-sensor-3', 'cabinet-2pack', 'bundle-complete']
    },
    'garage-80w': {
        name: 'Deformable LED Garage Light — 80W',
        category: 'garage',
        badge: { type: 'bestseller', text: 'Best Seller' },
        rating: { stars: 5, count: '3,214' },
        description: '8,000 lumens of daylight brightness. Screws into any standard E26 socket. No wiring needed.',
        longDescription: 'Say goodbye to your dim, shadowy garage. This deformable LED garage light delivers 8,000 lumens of bright 6500K daylight through three adjustable aluminum panels that you can angle from 0 to 90 degrees for perfect coverage. Installation takes literally 10 seconds — just screw it into any standard E26/E27 light socket. No rewiring, no electrician, no tools. The die-cast aluminum body dissipates heat efficiently for a 50,000-hour lifespan. Works with 85-265V input, so it is compatible with any standard US outlet.',
        price: 19.99,
        comparePrice: 34.99,
        savePercent: 43,
        features: [
            '3 adjustable panels, 0-90 degrees',
            '8,000 lumens, 6500K daylight',
            'Standard E26 socket — instant install'
        ],
        specs: {
            'Wattage': '60W (equivalent to 80W)',
            'Lumens': '8,000',
            'Color Temp': '6500K daylight white',
            'CRI': '80+',
            'Base Type': 'E26/E27 standard socket',
            'Voltage': '85-265V AC',
            'Panels': '3 adjustable (0-90°)',
            'Material': 'Die-cast aluminum + ABS',
            'Lifespan': '50,000 hours',
            'Weight': '366g'
        },
        images: ['/img/garage-light.jpg'],
        relatedProducts: ['garage-150w-2pack', 'motion-sensor-3', 'bundle-starter']
    },
    'garage-150w-2pack': {
        name: 'Deformable LED Garage Light — 2 Pack 150W',
        category: 'garage',
        badge: { type: 'value', text: 'Best Value' },
        rating: { stars: 5, count: '1,892' },
        description: 'Ultra-bright 15,000 lumens each. Cover your entire garage or workshop with stadium-like lighting.',
        longDescription: 'Double the coverage for your garage or workshop. This 2-pack of our highest-output deformable LED lights delivers a combined 12,000 lumens of stadium-like brightness. Each light features the same adjustable 3-panel design with die-cast aluminum construction. Perfect for 2-car garages, large workshops, or anyone who wants even illumination across their entire space. At this price, you save $8 compared to buying two single units.',
        price: 34.99,
        comparePrice: 54.99,
        savePercent: 36,
        features: [
            '5 adjustable panels per light',
            '15,000 lumens each, 6500K',
            'Save $8 vs buying separately'
        ],
        specs: {
            'Wattage': '60W each (equivalent to 150W total)',
            'Lumens': '6,000 each (12,000 total)',
            'Color Temp': '6500K daylight white',
            'CRI': '80+',
            'Base Type': 'E26/E27 standard socket',
            'Voltage': '85-265V AC',
            'Panels': '3 adjustable per light (0-90°)',
            'Material': 'Die-cast aluminum + ABS',
            'Lifespan': '50,000 hours',
            'Package': '2 lights'
        },
        images: ['/img/garage-light.jpg'],
        relatedProducts: ['garage-80w', 'outdoor-flood-2pack', 'bundle-complete']
    },
    'cabinet-2pack': {
        name: 'LED Under Cabinet Light — 2 Pack',
        category: 'kitchen',
        badge: { type: 'new', text: 'New' },
        rating: { stars: 5, count: '1,105' },
        description: 'Wireless, rechargeable kitchen task lighting. Motion sensor activates hands-free while you cook.',
        longDescription: 'Upgrade your kitchen with professional-grade under-cabinet lighting. These slim, elegant light bars feature a built-in motion sensor that turns on automatically when you approach — perfect when your hands are full while cooking. Choose between motion-sensor mode and manual mode with 5 brightness levels and tri-color dimming (warm, neutral, cool white). The strong magnetic backing attaches instantly to any metal surface, or use the included adhesive strips for wood cabinets. USB-C rechargeable with long-lasting battery life.',
        price: 22.99,
        comparePrice: 37.99,
        savePercent: 39,
        features: [
            'Motion sensor + manual mode',
            '5 brightness levels, dimmable',
            'USB-C rechargeable, magnetic mount'
        ],
        specs: {
            'Sensor': 'Built-in PIR motion sensor',
            'Modes': 'Motion sensor / Manual on-off',
            'Brightness': '5 levels, dimmable',
            'Color Temp': 'Tri-color (3000K/4500K/6000K)',
            'Power': 'USB-C rechargeable',
            'Mount': 'Magnetic + adhesive strip',
            'Material': 'Aluminum body',
            'Length': '~30cm per bar',
            'Package': '2 light bars + 2 USB-C cables + adhesive strips'
        },
        images: ['/img/cabinet-light.jpg'],
        relatedProducts: ['motion-sensor-3', 'garage-80w', 'bundle-starter']
    },
    'outdoor-flood-2pack': {
        name: 'Solar Outdoor Security Light 118 LED — 2 Pack',
        category: 'outdoor',
        badge: { type: 'new', text: 'New' },
        rating: { stars: 5, count: '987' },
        description: 'Ultra-wide 270° solar wall light with PIR motion sensor. No wiring, no electricity bill. IP65 weatherproof.',
        longDescription: 'Protect your home with powerful solar-powered security lighting. These 118-LED wall lights provide ultra-wide 270-degree coverage and feature a sensitive PIR motion sensor that detects movement up to 26 feet away. Three smart lighting modes let you choose between motion-activated, dim-to-bright, and always-on. The integrated high-efficiency solar panel charges during the day and provides up to 12 hours of light at night. IP65 waterproof rating means they handle rain, snow, and extreme temperatures. No wiring, no electricity bill — just mount them with the included screws and forget about them.',
        price: 39.99,
        comparePrice: 59.99,
        savePercent: 33,
        features: [
            '118 LEDs, 1000 lumens, 270° coverage',
            'PIR motion sensor, 3 lighting modes',
            'IP65 waterproof, solar-powered'
        ],
        specs: {
            'LEDs': '118 per light (236 total)',
            'Lumens': '1000 per light',
            'Coverage': '270° wide angle',
            'Sensor': 'PIR motion, 26ft range',
            'Modes': 'Motion / Dim-to-Bright / Always On',
            'Solar Panel': 'Integrated polysilicon',
            'Battery': '1200mAh lithium, ~12hr runtime',
            'Waterproof': 'IP65 rated',
            'Material': 'ABS + PC lens',
            'Package': '2 lights + mounting hardware'
        },
        images: ['/img/outdoor-light.jpg'],
        relatedProducts: ['motion-sensor-6', 'garage-80w', 'bundle-complete']
    },
    'bundle-starter': {
        name: 'Whole Home Starter Kit',
        category: 'bundle',
        badge: { type: 'value', text: 'Save $25' },
        rating: { stars: 5, count: '892' },
        description: 'Motion Sensor 6-Pack + Under Cabinet 2-Pack + Garage LED',
        longDescription: 'Everything you need to light up the most important areas of your home in one discounted bundle. Includes our best-selling Motion Sensor 6-Pack for closets, stairs, and hallways; the Under Cabinet 2-Pack for your kitchen; and a Deformable Garage LED for your garage or workshop. Save $25 compared to buying each product separately.',
        price: 69.99,
        comparePrice: 94.97,
        savePercent: 26,
        features: [
            'Motion Sensor 6-Pack',
            'Under Cabinet 2-Pack',
            'Garage LED 80W'
        ],
        specs: {
            'Includes': 'Motion Sensor 6-Pack + Under Cabinet 2-Pack + Garage LED 80W',
            'Total Savings': '$24.98 vs buying separately',
            'Covers': 'Closets, stairs, kitchen, garage',
            'Total Lights': '9 lights'
        },
        images: ['/img/bundle-starter.jpg'],
        relatedProducts: ['bundle-complete', 'motion-sensor-6', 'garage-80w']
    },
    'bundle-complete': {
        name: 'Complete Home Package',
        category: 'bundle',
        badge: { type: 'value', text: 'Most Popular' },
        rating: { stars: 5, count: '1,247' },
        description: 'Motion Sensor 6-Pack + Under Cabinet 2-Pack + Garage LED 2-Pack + Outdoor Flood 2-Pack',
        longDescription: 'The ultimate whole-home lighting upgrade. This package includes everything in the Starter Kit plus our Garage LED 2-Pack (for full garage coverage) and the Solar Outdoor Security Light 2-Pack. You get 12 lights total covering every space — indoors, kitchen, garage, and outdoors. The biggest savings we offer, at nearly $30 off retail.',
        price: 119.99,
        comparePrice: 149.96,
        savePercent: 20,
        features: [
            'Motion Sensor 6-Pack',
            'Under Cabinet 2-Pack',
            'Garage LED 2-Pack 150W',
            'Outdoor Solar Light 2-Pack'
        ],
        specs: {
            'Includes': 'Motion Sensor 6-Pack + Under Cabinet 2-Pack + Garage LED 2-Pack + Solar Outdoor 2-Pack',
            'Total Savings': '$29.97 vs buying separately',
            'Covers': 'Every room + outdoor',
            'Total Lights': '12 lights'
        },
        images: ['/img/bundle-complete.jpg'],
        relatedProducts: ['bundle-starter', 'outdoor-flood-2pack', 'cabinet-2pack']
    }
};
