import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC0FAHicxw8rS848XDPLIk5MFzIUWN1sMA",
  authDomain: "wednf-eeff9.firebaseapp.com",
  projectId: "wednf-eeff9",
  storageBucket: "wednf-eeff9.firebasestorage.app",
  messagingSenderId: "778108810647",
  appId: "1:778108810647:web:bb3818dafd6ea2eaa480d2",
  measurementId: "G-HHLKP4PT7M"
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