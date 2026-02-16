import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
  // วางโค้ดที่ก๊อปมาจาก Firebase ตรงนี้
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ฟังก์ชันเพิ่มสินค้า (แอดมิน)
window.saveProduct = async (name, price, img) => {
    await addDoc(collection(db, "products"), {
        name: name,
        price: price,
        img: img,
        date: new Date()
    });
    alert("เพิ่มสินค้าสำเร็จ!");
};

// ฟังก์ชันดึงสินค้ามาโชว์หน้าแรก (ลูกค้า)
onSnapshot(collection(db, "products"), (snapshot) => {
    const list = document.getElementById('product-display');
    list.innerHTML = '';
    snapshot.forEach(doc => {
        const item = doc.data();
        list.innerHTML += `
            <div class="card">
                <img src="${item.img}">
                <h3>${item.name}</h3>
                <p>${item.price} บาท</p>
                <button onclick="buy('${doc.id}')">ซื้อเลย</button>
            </div>`;
    });
});