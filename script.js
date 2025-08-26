/* ---------------- AUTH SYSTEM ---------------- */
let users = JSON.parse(localStorage.getItem("chatUsers"));
if (!users || users.length === 0) {
  users = [
    { username: "riyanshu", fullName: "Riyanshu Raj Singh", password: "riyanshu", status: "online", lastSeen: new Date() },
    { username: "ankit", fullName: "Ankit Kumar Maurya", password: "ankit", status: "online", lastSeen: new Date() },
    { username: "anurag", fullName: "Anurag Kumar", password: "anurag", status: "offline", lastSeen: new Date(Date.now() - 1000 * 60 * 30) }
  ];
  localStorage.setItem("chatUsers", JSON.stringify(users));
}

let currentAccount = null;
let conversations = JSON.parse(localStorage.getItem("chatConversations")) || {};

const auth = document.getElementById("auth");
const authTitle = document.getElementById("authTitle");
const authUsername = document.getElementById("authUsername");
const authFullname = document.getElementById("authFullname");
const authPassword = document.getElementById("authPassword");
const authMsg = document.getElementById("authMsg");
const toggleAuth = document.getElementById("toggleAuth");
const chatApp = document.getElementById("chatApp");

let isLogin = true;

toggleAuth.onclick = () => {
  isLogin = !isLogin;
  authTitle.textContent = isLogin ? "Login" : "Signup";
  document.querySelector("#auth button").textContent = isLogin ? "Login" : "Signup";
  authFullname.classList.toggle("hidden", isLogin);
  toggleAuth.textContent = isLogin ? "Don't have an account? Signup" : "Already have an account? Login";
  authMsg.textContent = "";
};

function handleAuth() {
  const username = authUsername.value.trim().toLowerCase();
  const fullname = authFullname.value.trim();
  const password = authPassword.value.trim();

  if (!username || !password || (!isLogin && !fullname)) {
    authMsg.textContent = "⚠️ Please fill all fields!";
    return;
  }

  let users = JSON.parse(localStorage.getItem("chatUsers"));

  if (isLogin) {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      currentAccount = user;
      startChatApp();
    } else {
      authMsg.textContent = "❌ Invalid credentials!";
    }
  } else {
    if (users.some(u => u.username === username)) {
      authMsg.textContent = "❌ Username already exists!";
      return;
    }
    const newUser = { username, fullName: fullname, password, status: "online", lastSeen: new Date() };
    users.push(newUser);
    localStorage.setItem("chatUsers", JSON.stringify(users));
    authMsg.style.color = "green";
    authMsg.textContent = "✅ Signup successful! Please login.";
    toggleAuth.click();
  }
}

function startChatApp() {
  auth.classList.add("hidden");
  chatApp.classList.remove("hidden");
  renderContacts();
}

/* ---------------- CHAT LOGIC ---------------- */
const chatContacts = document.getElementById("chatContacts");
const chatMessages = document.getElementById("chatMessages");
const chatSearchInput = document.getElementById("chatSearchInput");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const contactAvatar = document.getElementById("contactAvatar");
const contactName = document.getElementById("contactName");
const contactStatus = document.getElementById("contactStatus");

let selectedContact = null;

const getInitials = (name) => name.split(" ").map(n => n[0]).join("").toUpperCase();
const formatChatTime = (date) => `${String(date.getHours()).padStart(2,0)}:${String(date.getMinutes()).padStart(2,0)}`;
const formatLastSeen = (date) => {
  const diff = (new Date() - new Date(date)) / 60000;
  if (diff < 1) return "Just now";
  if (diff < 60) return `${Math.floor(diff)} min ago`;
  return `${Math.floor(diff/60)} hr ago`;
};

function displayMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("message", msg.sender === currentAccount.username ? "message-sent" : "message-received");
  div.innerHTML = `${msg.text} <br><small>${formatChatTime(new Date(msg.timestamp))}</small>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderContacts() {
  chatContacts.innerHTML = "";
  const users = JSON.parse(localStorage.getItem("chatUsers"));
  const searchTerm = chatSearchInput.value.toLowerCase();
  users
    .filter(u => u.username !== currentAccount.username && u.fullName.toLowerCase().includes(searchTerm))
    .forEach(user => {
      const div = document.createElement("div");
      div.className = "chat-contact" + (selectedContact?.username === user.username ? " active" : "");
      div.dataset.username = user.username;
      div.innerHTML = `
        <div class="contact-avatar">${getInitials(user.fullName)}</div>
        <div>
          <div>${user.fullName}</div>
          <small>${user.status === "online" ? "Online" : "Last seen " + formatLastSeen(user.lastSeen)}</small>
        </div>`;
      div.onclick = () => selectContact(user);
      chatContacts.appendChild(div);
    });
}

function selectContact(contact) {
  selectedContact = contact;
  contactAvatar.textContent = getInitials(contact.fullName);
  contactName.textContent = contact.fullName;
  contactStatus.textContent = contact.status === "online" ? "Online" : "Last seen " + formatLastSeen(contact.lastSeen);
  chatInput.disabled = false;
  chatForm.querySelector("button").disabled = false;
  loadConversation(contact);
}

function loadConversation(contact) {
  chatMessages.innerHTML = "";
  const key = getConversationKey(currentAccount.username, contact.username);
  if (!conversations[key]) conversations[key] = [];
  conversations[key].forEach(displayMessage);
}

function sendMessage(text) {
  if (!text.trim() || !selectedContact) return;
  const msg = { sender: currentAccount.username, recipient: selectedContact.username, text, timestamp: new Date() };
  const key = getConversationKey(currentAccount.username, selectedContact.username);
  conversations[key].push(msg);
  localStorage.setItem("chatConversations", JSON.stringify(conversations));
  displayMessage(msg);
}

function getConversationKey(u1, u2) {
  return [u1, u2].sort().join("_");
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage(chatInput.value);
  chatInput.value = "";
});
chatSearchInput.addEventListener("input", renderContacts);

/* ---------------- Logout / Delete ---------------- */
function logout() {
  let users = JSON.parse(localStorage.getItem("chatUsers"));
  const idx = users.findIndex(u => u.username === currentAccount.username);
  if (idx !== -1) {
    users[idx].status = "offline";
    users[idx].lastSeen = new Date();
    localStorage.setItem("chatUsers", JSON.stringify(users));
  }
  currentAccount = null;
  chatApp.classList.add("hidden");
  auth.classList.remove("hidden");
  authMsg.textContent = "";
  authUsername.value = "";
  authPassword.value = "";
}

function deleteAccount() {
  if (!currentAccount) return;
  if (!confirm("⚠️ This will permanently delete your account and chats. Continue?")) return;

  let users = JSON.parse(localStorage.getItem("chatUsers"));
  users = users.filter(u => u.username !== currentAccount.username);
  localStorage.setItem("chatUsers", JSON.stringify(users));

  Object.keys(conversations).forEach(key => {
    if (key.includes(currentAccount.username)) delete conversations[key];
  });
  localStorage.setItem("chatConversations", JSON.stringify(conversations));

  currentAccount = null;
  chatApp.classList.add("hidden");
  auth.classList.remove("hidden");
  authMsg.style.color = "green";
  authMsg.textContent = "✅ Account deleted successfully.";
  authUsername.value = "";
  authPassword.value = "";
}
