/* ============================================
   BrightHaus — Main JavaScript
   ============================================ */

// ---- Cart State ----
let cart = JSON.parse(localStorage.getItem('brighthaus_cart') || '[]');
let selectedShipping = 'standard';

const productIcons = {
    'motion-sensor-3': 'MS',
    'motion-sensor-6': 'MS',
    'garage-80w': 'GL',
    'garage-150w-2pack': 'GL',
    'cabinet-2pack': 'UC',
    'outdoor-flood-2pack': 'FL',
    'bundle-starter': 'BN',
    'bundle-complete': 'BN'
};

// ---- DOM Elements ----
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartFooter = document.getElementById('cartFooter');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.querySelector('.nav-links');

// ---- Cart Functions ----
function getSubtotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
        cartFooter.style.display = 'none';
        return;
    }

    cartFooter.style.display = 'block';
    const subtotal = getSubtotal();
    const freeShipping = subtotal >= 49;
    const shippingLabel = freeShipping ? 'FREE' : 'Calculated at checkout';

    cartItems.innerHTML = cart.map((item, index) => {
        const icon = productIcons[item.id] || 'BH';
        return `
            <div class="cart-item">
                <div class="cart-item-icon">${icon}</div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} × ${item.qty}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">&times;</button>
            </div>
        `;
    }).join('');

    // Shipping info
    const shippingNote = freeShipping
        ? '<div class="cart-shipping-info" style="font-size:13px;color:#5A8F6A;margin-bottom:12px;text-align:center;">✓ Free standard shipping</div>'
        : `<div class="cart-shipping-info" style="font-size:13px;color:#6B6B6B;margin-bottom:12px;text-align:center;">Add $${(49 - subtotal).toFixed(2)} more for free shipping</div>`;

    cartTotal.textContent = `$${subtotal.toFixed(2)}`;

    // Insert shipping info before footer total
    const existingShipInfo = cartFooter.querySelector('.cart-shipping-info');
    if (existingShipInfo) existingShipInfo.remove();
    cartFooter.insertAdjacentHTML('afterbegin', shippingNote);

    localStorage.setItem('brighthaus_cart', JSON.stringify(cart));
}

function addToCart(productId, price, name) {
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: productId, price: parseFloat(price), name, qty: 1 });
    }
    updateCartUI();
    openCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ---- Checkout ----
async function handleCheckout() {
    if (cart.length === 0) return;

    const checkoutBtn = document.getElementById('checkoutBtn');
    const originalText = checkoutBtn.textContent;
    checkoutBtn.textContent = 'Processing...';
    checkoutBtn.disabled = true;

    try {
        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart.map(item => ({ id: item.id, qty: item.qty })),
                shipping_method: getSubtotal() >= 49 ? 'standard' : selectedShipping
            })
        });

        const data = await res.json();

        if (data.url) {
            window.location.href = data.url;
        } else {
            alert(data.error || 'Checkout failed. Please try again.');
            checkoutBtn.textContent = originalText;
            checkoutBtn.disabled = false;
        }
    } catch (err) {
        alert('Connection error. Please try again.');
        checkoutBtn.textContent = originalText;
        checkoutBtn.disabled = false;
    }
}

// ---- Event Listeners ----
cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// Add to cart buttons
document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
        const productId = btn.dataset.product;
        const price = btn.dataset.price;
        const name = btn.dataset.name;
        addToCart(productId, price, name);

        // Button feedback
        const originalText = btn.textContent;
        btn.textContent = '✓ Added!';
        btn.style.background = '#5A8F6A';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 1500);
    });
});

// ---- Product Filters (index page only) ----
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

if (filterBtns.length) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            productCards.forEach(card => {
                const category = card.dataset.category;
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                    card.classList.add('fade-in');
                } else {
                    card.classList.add('hidden');
                    card.classList.remove('fade-in');
                }
            });
        });
    });

    // Collection cards filter integration
    document.querySelectorAll('.collection-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const filter = card.dataset.filter;
            if (filter) {
                filterBtns.forEach(b => {
                    b.classList.toggle('active', b.dataset.filter === filter);
                });
                productCards.forEach(pc => {
                    const category = pc.dataset.category;
                    if (filter === 'all' || category === filter) {
                        pc.classList.remove('hidden');
                        pc.classList.add('fade-in');
                    } else {
                        pc.classList.add('hidden');
                        pc.classList.remove('fade-in');
                    }
                });
            }
        });
    });
}

// ---- FAQ Accordion (index page only) ----
if (document.querySelector('.faq-question')) {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const wasActive = item.classList.contains('active');

            // Close all
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

            // Toggle clicked
            if (!wasActive) {
                item.classList.add('active');
            }
        });
    });
}

// ---- Mobile Menu ----
mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const spans = mobileMenuBtn.querySelectorAll('span');
    if (navLinks.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
});

// Close mobile menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const spans = mobileMenuBtn.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    });
});

// ---- Newsletter Form (index page only) ----
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const email = input.value;
    const btn = e.target.querySelector('button');

    try {
        await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
    } catch (err) {
        // Silently handle — still show success
    }

    input.value = '';
    const originalText = btn.textContent;
    btn.textContent = '✓ Subscribed!';
    btn.style.background = '#5A8F6A';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 3000);
});

// ---- Smooth scroll for nav links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// ---- Initialize ----
updateCartUI();
