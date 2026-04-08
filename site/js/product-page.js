/* ============================================
   BrightHaus — Product Detail Page Logic
   Reads product ID from URL and populates page
   ============================================ */

(function() {
    const productId = window.location.pathname.replace('/product/', '').replace(/\/$/, '');
    const product = PRODUCTS[productId];

    if (!product) {
        document.getElementById('productDetail').innerHTML = `
            <div style="text-align:center;padding:80px 20px;">
                <h2>Product not found</h2>
                <p style="color:#666;margin:16px 0;">The product you're looking for doesn't exist.</p>
                <a href="/" class="btn btn-primary">Back to Shop</a>
            </div>`;
        return;
    }

    // Set page title
    document.title = product.name + ' — BrightHaus';

    // Category labels
    const categoryLabels = {
        indoor: 'Indoor Lighting',
        garage: 'Garage & Workshop',
        kitchen: 'Kitchen & Cabinet',
        outdoor: 'Outdoor & Security',
        bundle: 'Bundles'
    };

    // Build breadcrumb
    document.getElementById('breadcrumb').innerHTML = `
        <a href="/">Home</a>
        <span>/</span>
        <a href="/#products">${categoryLabels[product.category] || 'Shop'}</a>
        <span>/</span>
        ${product.name}`;

    // Build gallery
    const galleryHTML = `
        <img class="main-image" id="mainImage" src="${product.images[0]}" alt="${product.name}">
        ${product.images.length > 1 ? `
            <div class="thumbnails">
                ${product.images.map((img, i) => `
                    <img class="thumb ${i === 0 ? 'active' : ''}" src="${img}" alt="${product.name}" onclick="switchImage(this, '${img}')">
                `).join('')}
            </div>` : ''}`;
    document.getElementById('productGallery').innerHTML = galleryHTML;

    // Badge
    const badgeClass = {
        bestseller: 'badge-bestseller',
        value: 'badge-value',
        new: 'badge-new'
    };
    document.getElementById('productBadge').className = 'product-badge ' + (badgeClass[product.badge.type] || '');
    document.getElementById('productBadge').textContent = product.badge.text;

    // Title
    document.getElementById('productTitle').textContent = product.name;

    // Rating
    document.getElementById('productRating').innerHTML = `
        <span class="stars">${'&#9733;'.repeat(product.rating.stars)}</span>
        <span class="rating-count">(${product.rating.count})</span>`;

    // Pricing
    document.getElementById('productPricing').innerHTML = `
        <span class="price-current">$${product.price.toFixed(2)}</span>
        <span class="price-original">$${product.comparePrice.toFixed(2)}</span>
        <span class="price-save">Save ${product.savePercent}%</span>`;

    // Description
    document.getElementById('productDesc').textContent = product.longDescription;

    // Features
    document.getElementById('productFeatures').innerHTML = product.features.map(f => `<li>${f}</li>`).join('');

    // Add to cart button
    const addBtn = document.getElementById('addToCartBtn');
    addBtn.dataset.product = productId;
    addBtn.dataset.price = product.price;
    addBtn.dataset.name = product.name;

    // Quantity selector
    window.currentQty = 1;
    const qtyInput = document.getElementById('qtyValue');

    window.changeQty = function(delta) {
        window.currentQty = Math.max(1, Math.min(10, window.currentQty + delta));
        qtyInput.value = window.currentQty;
    };

    qtyInput.addEventListener('change', function() {
        window.currentQty = Math.max(1, Math.min(10, parseInt(this.value) || 1));
        this.value = window.currentQty;
    });

    // Override add to cart for quantity support
    addBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        for (let i = 0; i < window.currentQty; i++) {
            addToCart(productId, product.price, product.name);
        }
        // If qty > 1, we added multiple, but addToCart opens cart each time
        // The cart will show correct qty since addToCart increments existing items

        const originalText = addBtn.textContent;
        addBtn.textContent = 'Added!';
        addBtn.style.background = '#5A8F6A';
        setTimeout(() => {
            addBtn.textContent = originalText;
            addBtn.style.background = '';
        }, 1500);
    });

    // Specs table
    const specsHTML = Object.entries(product.specs).map(([key, val]) =>
        `<tr><td>${key}</td><td>${val}</td></tr>`
    ).join('');
    document.getElementById('specsTable').innerHTML = specsHTML;

    // Related products
    const relatedHTML = (product.relatedProducts || [])
        .filter(id => PRODUCTS[id])
        .map(id => {
            const p = PRODUCTS[id];
            return `
                <a href="/product/${id}" class="related-card">
                    <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
                    <div class="related-info">
                        <h4>${p.name}</h4>
                        <span class="price-current">$${p.price.toFixed(2)}</span>
                        <span class="price-original">$${p.comparePrice.toFixed(2)}</span>
                    </div>
                </a>`;
        }).join('');
    document.getElementById('relatedGrid').innerHTML = relatedHTML;
})();

function switchImage(thumb, src) {
    document.getElementById('mainImage').src = src;
    document.querySelectorAll('.product-gallery .thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
}
