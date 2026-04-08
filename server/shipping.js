// ============================================
// BrightHaus — Shipping Configuration
// ============================================

// Shipping zones and rates for US
const SHIPPING_METHODS = {
    standard: {
        id: 'standard',
        name: 'Standard Shipping',
        description: '5-7 business days',
        min_days: 5,
        max_days: 7,
        rates: [
            { max_weight_oz: 16, price: 4.99 },
            { max_weight_oz: 48, price: 6.99 },
            { max_weight_oz: 96, price: 8.99 },
            { max_weight_oz: Infinity, price: 11.99 }
        ]
    },
    express: {
        id: 'express',
        name: 'Express Shipping',
        description: '2-3 business days',
        min_days: 2,
        max_days: 3,
        rates: [
            { max_weight_oz: 16, price: 9.99 },
            { max_weight_oz: 48, price: 12.99 },
            { max_weight_oz: 96, price: 15.99 },
            { max_weight_oz: Infinity, price: 19.99 }
        ]
    }
};

const FREE_SHIPPING_THRESHOLD = 49.00;

function calculateShipping(items, method, subtotal) {
    // Free standard shipping on orders over $49
    if (method === 'standard' && subtotal >= FREE_SHIPPING_THRESHOLD) {
        return {
            method: SHIPPING_METHODS.standard,
            cost: 0,
            free: true
        };
    }

    const shippingMethod = SHIPPING_METHODS[method];
    if (!shippingMethod) {
        return { error: 'Invalid shipping method' };
    }

    // Calculate total weight
    const totalWeight = items.reduce((sum, item) => sum + (item.weight_oz * item.qty), 0);

    // Find rate bracket
    const rate = shippingMethod.rates.find(r => totalWeight <= r.max_weight_oz);
    const cost = rate ? rate.price : shippingMethod.rates[shippingMethod.rates.length - 1].price;

    return {
        method: shippingMethod,
        cost,
        free: false,
        total_weight_oz: totalWeight
    };
}

function getAvailableMethods(subtotal) {
    return Object.values(SHIPPING_METHODS).map(method => {
        const isFreeEligible = method.id === 'standard' && subtotal >= FREE_SHIPPING_THRESHOLD;
        return {
            id: method.id,
            name: method.name,
            description: method.description,
            min_days: method.min_days,
            max_days: method.max_days,
            free: isFreeEligible,
            label: isFreeEligible ? 'FREE' : null
        };
    });
}

module.exports = { calculateShipping, getAvailableMethods, FREE_SHIPPING_THRESHOLD };
