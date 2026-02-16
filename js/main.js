/* ========================================
   Main JavaScript - STREAMSHOP
   ======================================== */

// ============ ADMIN CREDENTIALS (Hardcoded) ============
const ADMIN_EMAIL = 'admin@shop.com';
const ADMIN_PASSWORD = 'admin1234';

// ============ COMPONENT LOADER ============
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Component not found');
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (err) {
        console.error(`Error loading component ${filePath}:`, err);
    }
}

async function initComponents() {
    const headerEl = document.getElementById('header-placeholder');
    const footerEl = document.getElementById('footer-placeholder');

    if (headerEl) {
        // Detect path depth
        const isSubPage = window.location.pathname.includes('/pages/');
        const prefix = isSubPage ? '..' : '.';
        await loadComponent('header-placeholder', `${prefix}/components/header.html`);
        updateAuthUI();
        setActiveNav();
    }
    if (footerEl) {
        const isSubPage = window.location.pathname.includes('/pages/');
        const prefix = isSubPage ? '..' : '.';
        await loadComponent('footer-placeholder', `${prefix}/components/footer.html`);
    }

    // Init scroll effects
    initScrollEffects();
    initAnimations();
}

// ============ AUTH SYSTEM (localStorage) ============
function getUsers() {
    return JSON.parse(localStorage.getItem('ss_users') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('ss_users', JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('ss_currentUser') || 'null');
}

function setCurrentUser(user) {
    localStorage.setItem('ss_currentUser', JSON.stringify(user));
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regPasswordConfirm').value;

    if (password !== confirmPassword) {
        showToast('รหัสผ่านไม่ตรงกัน', 'error');
        return;
    }

    const users = getUsers();
    if (users.find(u => u.email === email)) {
        showToast('อีเมลนี้ถูกใช้งานแล้ว', 'error');
        return;
    }

    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
    closeModal('registerModal');
    updateAuthUI();
    showToast(`ยินดีต้อนรับ ${name}! 🎉`, 'success');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // 1. ตรวจสอบว่าเป็นแอดมินหรือไม่
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // --- ส่วนที่ต้องเพิ่ม/แก้ไข ---
        const adminUser = {
            id: 'admin',
            name: 'แอดมินระบบ',
            email: email,
            role: 'admin' // ใส่ Role ให้ชัดเจน
        };
        localStorage.setItem('ss_user', JSON.stringify(adminUser));
        sessionStorage.setItem('adminAuth', 'true'); // สำหรับเช็คในหน้า admin.html
        // ---------------------------

        showToast('เข้าสู่ระบบในฐานะแอดมิน ⚙️', 'success');
        closeModal('loginModal');
        updateAuthUI();

        // พาไปหน้าแอดมิน
        setTimeout(() => {
            window.location.href = window.location.pathname.includes('/pages/') ? 'admin.html' : 'pages/admin.html';
        }, 1000);
        return;
    }

    // 2. ถ้าไม่ใช่แอดมิน ให้เช็ค User ปกติ (โค้ดเดิมของคุณ)
    const users = JSON.parse(localStorage.getItem('ss_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('ss_user', JSON.stringify(user));
        showToast(`ยินดีต้อนรับคุณ ${user.name} 😊`, 'success');
        closeModal('loginModal');
        updateAuthUI();
    } else {
        showToast('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'error');
    }


    setCurrentUser(user);
    closeModal('loginModal');
    updateAuthUI();
    showToast(`สวัสดี ${user.name}! 👋`, 'success');
}

function logout() {
    localStorage.removeItem('ss_currentUser');
    updateAuthUI();
    showToast('ออกจากระบบแล้ว', 'success');
    // Redirect to home if on protected page
    const protectedPages = ['admin.html', 'history.html'];
    if (protectedPages.some(p => window.location.pathname.includes(p))) {
        const isSubPage = window.location.pathname.includes('/pages/');
        window.location.href = isSubPage ? '../index.html' : 'index.html';
    }
}

function updateAuthUI() {
    const user = getCurrentUser();
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const historyBtn = document.getElementById('historyBtn');
    const userGreeting = document.getElementById('userGreeting');

    if (!loginBtn) return; // Components not loaded yet

    if (user) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-flex';
        userGreeting.style.display = 'inline-flex';
        userGreeting.textContent = `👤 ${user.name}`;

        if (user.isAdmin) {
            historyBtn.style.display = 'none';
        } else {
            historyBtn.style.display = 'inline-flex';
        }
    } else {
        loginBtn.style.display = 'inline-flex';
        registerBtn.style.display = 'inline-flex';
        logoutBtn.style.display = 'none';
        historyBtn.style.display = 'none';
        userGreeting.style.display = 'none';
    }
}

function goToHistory() {
    const user = getCurrentUser();
    if (!user) {
        openModal('loginModal');
        return;
    }
    const isSubPage = window.location.pathname.includes('/pages/');
    window.location.href = isSubPage ? 'history.html' : 'pages/history.html';
}

// ============ MODAL SYSTEM ============
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function switchModal(closeId, openId) {
    closeModal(closeId);
    setTimeout(() => openModal(openId), 200);
}

// Close modal on backdrop click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ============ TOAST SYSTEM ============
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = { success: '✅', error: '❌', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || '📢'}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============ PRODUCTS (localStorage) ============
// ============ PRODUCTS (Firebase Version) ============
async function getProducts() {
    try {
        const snapshot = await db.ref('products').once('value');
        const data = snapshot.val();
        return data ? Object.values(data) : [];
    } catch (e) {
        console.error("Error fetching products:", e);
        return [];
    }
}

function saveProducts(products) {
    // ใช้เพื่อล้างค่าและเขียนใหม่ทั้งหมดลง Firebase
    db.ref('products').set(products);
}

function addProduct(product) {
    const newRef = db.ref('products').push(); // สร้าง ID ออนไลน์ให้สินค้า
    product.id = newRef.key;
    product.createdAt = new Date().toISOString();
    newRef.set(product);
    return product;
}

function updateProduct(id, updates) {
    db.ref(`products/${id}`).update(updates);
}

function deleteProduct(id) {
    db.ref(`products/${id}`).remove();
}

// ============ ORDERS (localStorage) ============
// ============ ORDERS (Firebase Version) ============
async function getOrders() {
    const snapshot = await db.ref('orders').once('value');
    const data = snapshot.val();
    return data ? Object.values(data) : [];
}

function addOrder(order) {
    const orderRef = db.ref('orders').push(); // ออเดอร์จะไปเด้งในระบบแอดมินทันที
    order.id = orderRef.key;
    order.createdAt = new Date().toISOString();
    order.status = 'pending';
    order.credentials = null;
    orderRef.set(order);
    return order;
}

async function getUserOrders(userId) {
    const allOrders = await getOrders();
    return allOrders.filter(o => o.userId === userId);
}

function updateOrderCredentials(orderId, email, password) {
    db.ref(`orders/${orderId}`).update({
        credentials: { email, password },
        status: 'completed'
    });
}

// ============ PAYMENT SETTINGS (localStorage) ============
// ============ PAYMENT SETTINGS (Firebase Version) ============
async function getPaymentSettings() {
    const snapshot = await db.ref('payment').once('value');
    return snapshot.val() || {};
}

function savePaymentSettings(settings) {
    db.ref('payment').set(settings);
}

// ============ NAVIGATION ============
function setActiveNav() {
    const path = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.classList.remove('active');
        const page = link.getAttribute('data-page');
        if (
            (page === 'home' && (path.endsWith('index.html') || path === '/' || path.endsWith('/wed/'))) ||
            (page === 'products' && path.includes('products')) ||
            (page === 'promotions' && path.includes('promotions')) ||
            (page === 'reviews' && path.includes('reviews'))
        ) {
            link.classList.add('active');
        }
    });
}

function toggleNav() {
    const nav = document.getElementById('navMenu');
    if (nav) nav.classList.toggle('active');
}

// ============ SCROLL EFFECTS ============
function initScrollEffects() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ============ SCROLL ANIMATIONS ============
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

// ============ PRODUCT CARD RENDERER ============
function renderProductCard(product, showActions = false) {
    return `
    <div class="card animate-on-scroll" data-product-id="${product.id}">
      <div class="card-img-wrapper">
        <img src="${product.image || getPlaceholderImg()}" alt="${product.name}" class="card-img" onerror="this.src='${getPlaceholderImg()}'">
        ${product.badge ? `<span class="card-badge">${product.badge}</span>` : ''}
      </div>
      <div class="card-body">
        <h3 class="card-title">${product.name}</h3>
        <p class="card-text">${product.description || ''}</p>
        <div class="card-price">฿${Number(product.price).toLocaleString()}</div>
        ${showActions ? `
          <div class="flex gap-sm">
            <button class="btn btn-primary btn-sm" onclick="buyProduct('${product.id}')">🛒 สั่งซื้อ</button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function getPlaceholderImg() {
    return 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" fill="#1e1e2f">
      <rect width="400" height="220"/>
      <text x="200" y="110" fill="#555" font-family="Arial" font-size="16" text-anchor="middle" alignment-baseline="middle">No Image</text>
    </svg>
  `);
}

// ============ BUY PRODUCT ============
function buyProduct(productId) {
    const user = getCurrentUser();
    if (!user || user.isAdmin) {
        openModal('loginModal');
        showToast('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ', 'warning');
        return;
    }

    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) {
        showToast('ไม่พบสินค้า', 'error');
        return;
    }

    // Go to payment page
    localStorage.setItem('ss_pendingOrder', JSON.stringify({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        userId: user.id,
        userName: user.name,
        userEmail: user.email
    }));

    const isSubPage = window.location.pathname.includes('/pages/');
    window.location.href = isSubPage ? 'payment.html' : 'pages/payment.html';
}

// ============ IMAGE UTILS ============
function handleImageUpload(inputId, previewId, callback) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    input.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="preview">`;
                if (callback) callback(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
}

// ============ INIT DEFAULT PRODUCTS ============
// ============ INIT DEFAULT PRODUCTS ============
async function initDefaultProducts() {
    const products = await getProducts();
    // ถ้าในฐานข้อมูลยังไม่มีสินค้าเลย ระบบจะสร้างตัวอย่างให้ในครั้งแรก
    if (products.length === 0) {
        const defaults = [
            {
                id: '1',
                name: 'แพ็คเกจ Basic',
                description: 'ดูได้ 1 จอ ความละเอียด HD พร้อมคอนเทนต์มากมาย',
                price: 199,
                image: 'https://via.placeholder.com/400x220',
                badge: 'ยอดนิยม',
                createdAt: new Date().toISOString()
            }
        ];
        saveProducts(defaults);
    }
}

// ============ INIT ============
// เราต้องใช้ async function ครอบ เพื่อให้ใช้ await ได้
async function startApp() {
    await initDefaultProducts(); // รอโหลดสินค้าเริ่มต้น
    await initComponents();      // รอโหลด Header/Footer
}

// เรียกใช้งานฟังก์ชันเริ่มต้น

document.addEventListener('DOMContentLoaded', startApp);
