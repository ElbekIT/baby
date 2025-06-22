import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, push, onChildAdded, get, remove, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAvBcALAIQeURuULMwrIuMep-A67y0pnaw",
  authDomain: "baby-8ec6e.firebaseapp.com",
  projectId: "baby-8ec6e",
  storageBucket: "baby-8ec6e.firebasestorage.app",
  messagingSenderId: "364812463257",
  appId: "1:364812463257:web:85bb278412fe340bee9c08",
  measurementId: "G-X2HTQXX61C"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = JSON.parse(localStorage.getItem("user"));
let selectedUserPhone = null;

if (!currentUser) {
  window.location.href = "register.html";
}

const usersDiv = document.getElementById("users");
const messagesDiv = document.getElementById("messages");
const usernameDisplay = document.getElementById("username");
usernameDisplay.firstChild.textContent = currentUser.name;

get(ref(db, "users")).then(snapshot => {
  snapshot.forEach(child => {
    const phone = child.key;
    const name = child.val().name;
    if (phone !== currentUser.phone) {
      const div = document.createElement("div");
      div.className = "user-item";
      div.innerText = name + " (" + phone + ")";
      div.onclick = () => selectUser(phone);
      usersDiv.appendChild(div);
    }
  });
});

function selectUser(phone) {
  selectedUserPhone = phone;
  messagesDiv.innerHTML = "";
  const chatId = generateChatId(currentUser.phone, selectedUserPhone);
  const chatRef = ref(db, `messages/${chatId}`);
  onChildAdded(chatRef, data => {
    const msg = data.val();
    const div = document.createElement("div");
    div.className = "msg " + (msg.from === currentUser.phone ? "right" : "left");
    div.innerText = msg.text;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

window.sendMessage = function () {
  const text = document.getElementById("messageInput").value;
  if (!text || !selectedUserPhone) return;
  const chatId = generateChatId(currentUser.phone, selectedUserPhone);
  push(ref(db, `messages/${chatId}`), {
    from: currentUser.phone,
    to: selectedUserPhone,
    text,
    timestamp: Date.now()
  });
  document.getElementById("messageInput").value = "";
};

window.toggleDeleteBox = function () {
  const box = document.getElementById("deleteBox");
  box.style.display = box.style.display === "block" ? "none" : "block";
};

window.deleteAccount = function () {
  const confirmDelete = confirm("Akkauntingizni o‘chirmoqchimisiz?");
  if (!confirmDelete) return;
  remove(ref(db, "users/" + currentUser.phone)).then(() => {
    localStorage.removeItem("user");
    window.location.href = "register.html";
  });
};

function generateChatId(phone1, phone2) {
  return [phone1, phone2].sort().join("_");
}

window.showSearchBox = function () {
  document.getElementById("searchBox").style.display = "block";
};

window.searchUser = function () {
  const phone = document.getElementById("searchPhone").value;
  if (!phone) return;
  const searchResult = document.getElementById("searchResult");
  get(child(ref(db), `users/${phone}`)).then(snapshot => {
    if (snapshot.exists()) {
      const name = snapshot.val().name;
      searchResult.innerHTML = `<p><strong>${name}</strong> (${phone})</p><button onclick="selectUser('${phone}')">Message</button>`;
    } else {
      searchResult.innerHTML = "<p>Foydalanuvchi topilmadi.</p>";
    }
  });
};
