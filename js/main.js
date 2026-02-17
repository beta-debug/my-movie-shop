// --- กำหนดค่าเริ่มต้น ---
const ADMIN_EMAIL = "admin@example.com"; // แก้เป็นอีเมลแอดมินของคุณ

// ระบบจำลองสถานะ Login (หากยังไม่มี Firebase ให้ใช้ LocalStorage ทดสอบก่อน)
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// ฟังก์ชันเปิด Modal Login
function openAuthModal(mode) {
    const modal = document.getElementById('authModal');
    const title = document.getElementById('modalTitle');
    const regFields = document.getElementById('registerFields');
    const toggleText = document.getElementById('toggleText');

    modal.style.display = 'flex';
    if (mode === 'login') {
        title.innerText = 'เข้าสู่ระบบ';
        regFields.style.display = 'none';
        toggleText.innerText = 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่';
        toggleText.onclick = () => openAuthModal('register');
    } else {
        title.innerText = 'สมัครสมาชิก';
        regFields.style.display = 'block';
        toggleText.innerText = 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่';
        toggleText.onclick = () => openAuthModal('login');
    }
}

// ฟังก์ชันจัดการ Auth (Login/Register)
function handleAuth() {
    const email = document.getElementById('authEmail').value;
    const name = document.getElementById('authName').value || email.split('@')[0];

    if (!email) return alert('กรุณากรอกอีเมล');

    currentUser = { email, name, isAdmin: (email === ADMIN_EMAIL) };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    alert('ดำเนินการสำเร็จ!');
    location.reload();
}

// เช็คสิทธิ์และแสดงปุ่ม
window.onload = () => {
    const authSection = document.getElementById('auth-section');
    const userSection = document.getElementById('user-section');
    const historyLink = document.getElementById('history-link');
    const navLinks = document.querySelector('.nav-links');

    if (currentUser) {
        authSection.style.display = 'none';
        userSection.style.display = 'flex';
        historyLink.style.display = 'inline';
        document.getElementById('user-name').innerText = currentUser.name;

        // ถ้าเป็นแอดมิน ให้สร้างปุ่มแอดมิน
        if (currentUser.isAdmin) {
            const adminBtn = document.createElement('a');
            adminBtn.href = "admin.html";
            adminBtn.innerText = "⚙️ แอดมิน";
            adminBtn.style.color = "var(--primary)";
            navLinks.appendChild(adminBtn);
        }
    }
};

function logout() {
    localStorage.removeItem('currentUser');
    location.href = 'index.html';
}
