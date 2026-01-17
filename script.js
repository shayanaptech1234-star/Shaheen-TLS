// --- CONFIGURATION ---
const TARGET_EMAIL = "sales@shaheentls.com"; 

// CITY DATABASE
const cityData = {
    "UAE": [
        "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Al Ain"
    ],
    "Pakistan": [
        "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala"
    ]
};

// --- DATA STORE ---
// (Note: Add actual image URLs to imgSrc properties when available)
const products = [
    { id: 1, category: "fixing", name: "Safety Hook - Small", price: 25.00, desc: "0.6m standad facades.", imgSrc: "" },
    { id: 2, category: "fixing", name: "SS 304 Safety Hook - Large", price: 35.00, desc: "1.0mm heavy duty mechanical fixing.", imgSrc: "" },
    { id: 3, category: "leveling", name: "Leveling Clip 1.0mm", price: 40.00, desc: "Transparent white clips (Pack of 100).", imgSrc: "" },
    { id: 4, category: "leveling", name: "Leveling Clip 1.5mm", price: 42.00, desc: "Professional grade floor clips (Pack of 100).", imgSrc: "" },
    { id: 5, category: "leveling", name: "Leveling Clip 2.0mm", price: 42.00, desc: "Standard spacing for wall tiles (Pack of 100).", imgSrc: "" },
    { id: 6, category: "leveling", name: "Leveling Clip 3.0mm", price: 45.00, desc: "Wide joint leveling solution (Pack of 100).", imgSrc: "" },
    { id: 7, category: "leveling", name: "Reusable Wedges", price: 55.00, desc: "Hardened plastic, pack of 100.", imgSrc: "" },
    { id: 8, category: "leveling", name: "Adjustable Pliers", price: 85.00, desc: "Metal ergonomics for high tension.", imgSrc: "" },
    { id: 9, category: "leveling", name: "Cross Spacers 2mm", price: 15.00, desc: "Precision tile alignment stars (Pack of 200).", imgSrc: "" },
    { id: 10, category: "fixing", name: "Wall Anchor Bolt", price: 5.00, desc: "Secure fixing for mechanical hooks.", imgSrc: "" },
    { id: 11, category: "tools", name: "Suction Cup Pro", price: 120.00, desc: "Heavy duty single head tile lifter.", imgSrc: "" },
    { id: 12, category: "tools", name: "Rubber Grout Float", price: 45.00, desc: "Ergonomic handle for smooth finish.", imgSrc: "" },
    { id: 13, category: "tools", name: "Notched Trowel", price: 60.00, desc: "10mm steel notched trowel.", imgSrc: "" },
    { id: 14, category: "tools", name: "Angle Grinder Blade", price: 95.00, desc: "Diamond rim for ceramic cutting.", imgSrc: "" },
    { id: 15, category: "leveling", name: "Tile Leveling Kit", price: 250.00, desc: "Full starter pack with 500 clips.", imgSrc: "" },
    { id: 16, category: "tools", name: "Laser Level Pro", price: 450.00, desc: "360 degree green beam level.", imgSrc: "" },
    { id: 17, category: "leveling", name: "Spacers 5mm", price: 20.00, desc: "Large format paving spacers (Pack of 100).", imgSrc: "" },
    { id: 18, category: "tools", name: "Knee Pads Pro", price: 75.00, desc: "Gel padded comfort for installers.", imgSrc: "" },
    { id: 19, category: "tools", name: "Tile File", price: 35.00, desc: "Tungsten carbide smoothing tool.", imgSrc: "" },
    { id: 20, category: "tools", name: "Bucket Mixer", price: 50.00, desc: "Heavy duty adhesive mixing paddle.", imgSrc: "" }
];

let cart = [];
let currentUser = null;

// --- DOM REFERENCES ---
// Ensure elements exist before referencing
const grid = document.getElementById('grid');
const authSection = document.getElementById('authSection');
const headerBadge = document.getElementById('headerBadge');
const fabCount = document.getElementById('fabCount');
const cartList = document.getElementById('cartList');
const cartTotalValue = document.getElementById('cartTotalValue');
const toast = document.getElementById('toast');
const receiptContainer = document.getElementById('receiptContainer');
const openMailBtn = document.getElementById('openMailBtn');


// --- INITIALIZATION ---
// Use DOMContentLoaded to ensure HTML is ready before JS runs
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ duration: 800, once: true, offset: 100 });
    checkSession();
    renderProducts('all');
});

// --- SECURITY & VALIDATION FUNCTIONS ---

// Sanitize input to prevent basic XSS (HTML Injection)
function sanitize(input) {
    if (!input) return "";
    // Replace potentially dangerous characters with HTML entities
    return input.replace(/[&<>"'/]/g, function (s) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;'
        }[s];
    });
}

// --- AUTHENTICATION (LOCAL STORAGE DATABASE) ---
function checkSession() {
    const savedUser = localStorage.getItem('shaheenUser_DB_Secure');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    } else {
        updateAuthUI();
    }
}

function updateAuthUI() {
    if (currentUser) {
        // Sanitize name before displaying in HTML to prevent XSS
        const safeName = sanitize(currentUser.name).split(' ')[0];
        authSection.innerHTML = `
            <div class="user-profile" onclick="logout()">
                <i class="fa-solid fa-user-circle fa-lg"></i>
                <span>${safeName}</span>
                <i class="fa-solid fa-right-from-bracket" style="font-size:0.8rem; margin-left:5px; color:#ef4444;"></i>
            </div>
        `;
    } else {
        authSection.innerHTML = `
            <button class="btn-login-nav" onclick="openModal('authModalOverlay')">
                <i class="fa-solid fa-user"></i> Login / Sign Up
            </button>
        `;
    }
}

function handleAuth(e) {
    e.preventDefault();
    
    // Inputs
    const nameInput = document.getElementById('authName');
    const phoneInput = document.getElementById('authPhone');
    const emailInput = document.getElementById('authEmail');

    // Validation Check (Browsers handle patterns, but double check logic)
    if(!nameInput.checkValidity() || !phoneInput.checkValidity() || !emailInput.checkValidity()) {
        alert("Please correct the errors in the form.");
        return;
    }

    // Store Sanitized Data
    const userObj = { 
        name: sanitize(nameInput.value), 
        phone: sanitize(phoneInput.value), 
        email: sanitize(emailInput.value), 
        joined: new Date().toISOString() 
    };
    
    localStorage.setItem('shaheenUser_DB_Secure', JSON.stringify(userObj));
    
    currentUser = userObj;
    updateAuthUI();
    closeModal('authModalOverlay');
    
    if(cart.length > 0) {
        showToast("Secure Profile Saved! Proceeding...");
        setTimeout(() => openModal('cartModalOverlay'), 500);
    } else {
        showToast("Welcome, " + userObj.name.split(' ')[0]);
    }
}

function logout() {
    if(confirm("Log out of your secure session?")) {
        localStorage.removeItem('shaheenUser_DB_Secure');
        currentUser = null;
        updateAuthUI();
        window.location.reload();
    }
}

// --- PRODUCT RENDER LOGIC ---
function renderProducts(category) {
    grid.innerHTML = '';
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const btnCat = btn.innerText.toLowerCase();
        if(category === 'all' && btnCat.includes('all')) btn.classList.add('active');
        else if(btnCat.includes(category) && !btnCat.includes('all')) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    const filtered = category === 'all' ? products : products.filter(p => p.category === category);

    filtered.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', (index % 4) * 100); 
        
        // Prevent opening detail modal if clicking the view button directly (handled by button onclick)
        card.onclick = (e) => { if(!e.target.closest('.btn-view')) openProductDetail(p.id); };

        const imgHtml = p.imgSrc ? `<img src="${p.imgSrc}" alt="${p.name}">` : `<i class="fa-solid fa-box-open"></i>`;

        card.innerHTML = `
            <div class="image-placeholder">${imgHtml}</div>
            <div class="card-content">
                <div class="product-cat">${p.category}</div>
                <h3 class="product-title">${p.name}</h3>
                <div class="product-price">AED ${p.price.toFixed(2)}</div>
                <p class="product-desc">${p.desc}</p>
                <button class="btn-view" onclick="openProductDetail(${p.id})"><i class="fa-solid fa-eye"></i> View Details</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterProducts(cat) { renderProducts(cat); }

function openProductDetail(id) {
    const p = products.find(i => i.id === id);
    document.getElementById('detailTitle').innerText = p.name;
    document.getElementById('detailPrice').innerText = `AED ${p.price.toFixed(2)}`;
    document.getElementById('detailDesc').innerText = p.desc;
    document.getElementById('detailImage').innerHTML = p.imgSrc ? `<img src="${p.imgSrc}">` : `<i class="fa-solid fa-box-open"></i>`;
    document.getElementById('detailAddBtn').onclick = () => { addToCart(p.id); closeModal('productModalOverlay'); };
    openModal('productModalOverlay');
}
function closeProductDetail() { closeModal('productModalOverlay'); }

// --- CART LOGIC ---
function addToCart(id) {
    const p = products.find(i => i.id === id);
    const existing = cart.find(i => i.id === id);
    if(existing) existing.qty++;
    else cart.push({ ...p, qty: 1 });
    updateCartCount();
    showToast("Added to Cart");
}

function updateCartCount() {
    const count = cart.reduce((sum, i) => sum + i.qty, 0);
    headerBadge.innerText = count;
    fabCount.innerText = count;
    headerBadge.classList.toggle('active', count > 0);
    fabCount.style.display = count > 0 ? 'flex' : 'none';
}

function renderCartList() {
    if(cart.length === 0) {
        cartList.innerHTML = '<div style="text-align:center; padding:30px; color:#94a3b8;">Your cart is empty.</div>';
        document.getElementById('cartTotalSection').style.display = 'none';
        return;
    }

    let total = 0;
    cartList.innerHTML = cart.map(item => {
        const sub = item.price * item.qty;
        total += sub;
        return `
            <div class="cart-item">
                <div>
                    <div style="font-weight:700; color:var(--text-dark);">${item.name}</div>
                    <div style="font-size:0.85rem; color:var(--text-gray);">AED ${item.price.toFixed(2)} x ${item.qty}</div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button class="qty-btn" onclick="modQty(${item.id}, -1)">-</button>
                    <span style="font-weight:600; width:20px; text-align:center;">${item.qty}</span>
                    <button class="qty-btn" onclick="modQty(${item.id}, 1)">+</button>
                    <button class="qty-btn" style="color:#ef4444; border-color:#ef4444;" onclick="modQty(${item.id}, -999)"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('cartTotalValue').innerText = `AED ${total.toFixed(2)}`;
    document.getElementById('cartTotalSection').style.display = 'flex';
}

function modQty(id, amt) {
    const item = cart.find(i => i.id === id);
    if(!item) return;
    item.qty += amt;
    if(item.qty <= 0) cart = cart.filter(i => i.id !== id);
    updateCartCount();
    renderCartList();
}

function openCart() { renderCartList(); openModal('cartModalOverlay'); }

// --- CHECKOUT & DYNAMIC CITY LOGIC ---
function checkAuthAndProceed() {
    if(cart.length === 0) return showToast("Cart is empty");
    
    if(!currentUser) {
        closeModal('cartModalOverlay');
        setTimeout(() => {
            alert("Security: You must be logged in to access shipping.");
            openModal('authModalOverlay');
        }, 300);
        return;
    }
    closeModal('cartModalOverlay');
    openModal('shippingModalOverlay');
}

// Dynamic City Dropdown Trigger
function updateCityDropdown() {
    const countrySelect = document.getElementById('shipCountry');
    const citySelect = document.getElementById('shipCity');
    const hint = document.getElementById('shippingHint');
    
    const selectedCountry = countrySelect.value;
    
    // Reset City Dropdown
    citySelect.innerHTML = '<option value="" disabled selected>Select City</option>';
    citySelect.disabled = true;

    if (cityData[selectedCountry]) {
        // Enable and Populate
        citySelect.disabled = false;
        cityData[selectedCountry].forEach(city => {
            const opt = document.createElement('option');
            opt.value = city;
            opt.innerText = city;
            citySelect.appendChild(opt);
        });
        
        // Visual Hint Update
        hint.style.color = '#10b981';
        hint.innerHTML = '<i class="fa-solid fa-check"></i> Shipping available.';
    } else {
        hint.style.color = '#ef4444';
        hint.innerText = "Please select a valid country.";
    }
}

// --- FINAL ORDER & RECEIPT GENERATION ---
function finalizeOrder(e) {
    e.preventDefault();

    const address = sanitize(document.getElementById('shipAddress').value);
    const city = document.getElementById('shipCity').value;
    const country = document.getElementById('shipCountry').value;
    const orderId = Date.now().toString().slice(-6);
    const date = new Date().toLocaleDateString();

    let total = 0;
    let itemsEmailString = "";
    let receiptHtml = `
        <div class="receipt-header">
            <h3>SHAHEEN TLS - ORDER RECEIPT</h3>
            <p>Order ID: #${orderId} | Date: ${date}</p>
        </div>
        <div style="margin-bottom:15px;">
            <strong>Customer:</strong> ${currentUser.name}<br>
            <strong>Phone:</strong> ${currentUser.phone}<br>
            <strong>Ship To:</strong> ${address}, ${city}, ${country}
        </div>
        <div style="border-bottom:1px solid #e2e8f0; padding-bottom:5px; font-weight:bold; display:flex; justify-content:space-between;">
            <span>Item</span><span>Subtotal</span>
        </div>
    `;

    cart.forEach(item => {
        const sub = item.price * item.qty;
        total += sub;
        // String for Email Body
        itemsEmailString += `• ${item.name}\n   Qty: ${item.qty} | Unit: AED ${item.price} | Sub: AED ${sub}\n\n`;
        // HTML for Receipt View
        receiptHtml += `
            <div class="receipt-item">
                <div>${item.name} <small>(x${item.qty})</small></div>
                <div>AED ${sub.toFixed(2)}</div>
            </div>
        `;
    });

    receiptHtml += `
        <div class="receipt-total">
            <span>TOTAL ESTIMATE:</span>
            <span>AED ${total.toFixed(2)}</span>
        </div>
        <p style="text-align:center; margin-top:15px; font-size:0.8rem;">This is a preliminary receipt. Final invoice will be sent via email based on stock availability.</p>
    `;

    // 1. Prepare Email Link
    const subject = `Order Request #${orderId} - ${currentUser.name}`;
    const body = `ORDER CONFIRMATION REQUEST\n--------------------------------------------\nCUSTOMER DETAILS (Verified User):\nName:    ${currentUser.name}\nPhone:   ${currentUser.phone}\nEmail:   ${currentUser.email}\n\nSHIPPING DESTINATION:\nAddress: ${address}\nCity:    ${city}\nCountry: ${country}\n\n--------------------------------------------\nORDERED ITEMS:\n\n${itemsEmailString}--------------------------------------------\nTOTAL ESTIMATED VALUE: AED ${total.toFixed(2)}\n--------------------------------------------\n\nPlease confirm stock availability and send the official invoice to my email.`;
    
    const mailtoLink = `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // 2. Update Success Modal with Receipt & Mail Link
    receiptContainer.innerHTML = receiptHtml;
    openMailBtn.onclick = () => { window.location.href = mailtoLink; };

    // 3. Show Success Modal
    closeModal('shippingModalOverlay');
    openModal('successModalOverlay');

    // 4. Clear Cart
    cart = [];
    updateCartCount();
}


// --- HELPERS ---
function openModal(id) {
    const modal = document.getElementById(id);
    if(modal) modal.classList.add('open');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if(modal) modal.classList.remove('open');
}

function showToast(msg) {
    toast.querySelector('span').innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Close modals on outside click
window.onclick = function(e) {
    if(e.target.classList.contains('modal-overlay')) {
        
        // SPECIFIC CHECK: Is this the Success/Receipt Modal?
        if (e.target.id === 'successModalOverlay') {
            // Show warning instead of closing immediately
            const userWantsToStay = confirm("⚠️ Order is placed via Email!\n\nPlease click on the 'Open Email App' button to complete the process.\n\nClick OK to stay and email, or Cancel to close and continue shopping.");
            
            // If they click "Cancel" (meaning they want to leave), close the modal.
            // If they click "OK", do nothing (keep modal open).
            if (!userWantsToStay) {
                e.target.classList.remove('open');
            }
            return; // Stop here, don't run the code below
        }

        // Default behavior for all other modals (close normally)
        e.target.classList.remove('open');
    }
}
// --- MOBILE NAV LOGIC ---
/**
 * Toggles the 'active' class on the navigation menu to show/hide it on mobile.
 */
function toggleMobileMenu() {
    const nav = document.getElementById('navLinks');
    if (nav) {
        nav.classList.toggle('active');
    }
}

// Close mobile menu automatically when any link inside it is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        const nav = document.getElementById('navLinks');
        if (nav) nav.classList.remove('active');
    });
});

// --- FILTER WRAPPER ---
/**
 * A wrapper function that calls renderProducts and handles UI updates.
 * This matches the 'onclick' attributes in your HTML buttons.
 */
function filterProducts(category) {
    // 1. Call the existing rendering logic
    renderProducts(category);
    
    // 2. Update active state of filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick')?.includes(`'${category}'`)) {
            btn.classList.add('active');
        }
    });

    // 3. Close mobile menu if open
    const nav = document.getElementById('navLinks');
    if (nav) nav.classList.remove('active');
}