const socket = io("http://localhost:3000");


// ================= USERNAME =================
let username = sessionStorage.getItem("username");

if (!username || username === "Guest") {
  username = prompt("Enter your name")?.trim();

  if (!username) username = "Guest";

  sessionStorage.setItem("username", username);
}

socket.emit("register-user", username);



// ================= STATE =================
let partyCode = null;
let partyUsers = [];
let lastPosition = null;

const markers = {};
let centered = false;


// ================= MAP =================
const map = L.map("map", { attributionControl: false }).setView([20, 0], 3);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19
}).addTo(map);


// =============== COLOR HASH (LOCKED PER USER) ===============
function hashColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);

  const colors = ["red", "blue", "green", "gold", "violet", "orange"];
  return colors[Math.abs(hash) % colors.length];
}

function getIcon(color) {
  return L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    shadowSize: [41, 41],
  });
}


// ================= GPS (ALWAYS DRAW YOUR MARKER) =================
if (navigator.geolocation) {
  navigator.geolocation.watchPosition((pos) => {

    lastPosition = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    };

    // center once
    if (!centered) {
      centered = true;
      map.setView([lastPosition.latitude, lastPosition.longitude], 16);
    }

    // 🔵 ALWAYS show your own marker — even without party
    drawMarker(socket.id, username, lastPosition.latitude, lastPosition.longitude);

    // 🔵 Only send to others IF inside party
    if (partyCode) socket.emit("send-location", lastPosition);

  });
}



// 🔵 DRAW MARKER FUNCTION (DE-DUPED)
function drawMarker(id, name, lat, lng) {

  const color = hashColor(id);

  // small jitter for others so stacked pins are visible
  const jitter = id === socket.id ? 0 : (Math.random() - 0.5) * 0.00025;

  lat += jitter;
  lng += jitter;

  if (!markers[id]) {
    markers[id] = L.marker([lat, lng], { icon: getIcon(color) }).addTo(map);
    markers[id].bindTooltip(id === socket.id ? `You (${name})` : name);
  } else {
    markers[id].setLatLng([lat, lng]);
  }
}



// ================= PARTY BUTTONS =================
window.createParty = () => socket.emit("createParty", username);

window.joinParty = () => {
  const code = prompt("Enter party code");
  if (!code) return;
  socket.emit("joinParty", { partyCode: code.trim(), username });
};



// ================= PARTY EVENTS =================
socket.on("partyCreated", ({ partyCode: code, users }) => {
  partyCode = code;
  partyUsers = users;

  uiUpdate("Hosting Party", partyCode);

  toast(`🎉 Party created. Code: ${partyCode}`);

  if (lastPosition) socket.emit("send-location", lastPosition);
});

socket.on("partyJoined", ({ partyCode: code, users }) => {
  partyCode = code;
  partyUsers = users;

  uiUpdate("In Party", partyCode);

  toast(`🙋 Joined party ${partyCode}`);

  if (lastPosition) socket.emit("send-location", lastPosition);
});

socket.on("userJoined", (user) => {
  partyUsers.push(user);
  toast(`🟢 ${user.username} joined your party`);
});

socket.on("partyError", msg => toast("❌ " + msg));



// ================= RECEIVE LIVE LOCATIONS =================
socket.on("receive-location", (data) => {
  const { id, username, latitude, longitude } = data;
  drawMarker(id, username, latitude, longitude);
});



// ================= DISCONNECT =================
socket.on("user-disconnected", (id) => {
  if (markers[id]) map.removeLayer(markers[id]);
  delete markers[id];
});



// =================== UI HELPERS ===================
function uiUpdate(status, code) {
  document.getElementById("status").innerText = status;
  document.getElementById("code").innerText = code;
}

function toast(msg) {
  toast(msg);   // 🔵 later we replace with pretty popup UI
}

function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.innerText = msg;
  document.body.appendChild(t);

  setTimeout(()=> t.classList.add("show"), 50);
  setTimeout(()=> {
    t.classList.remove("show");
    setTimeout(()=> t.remove(), 300);
  }, 3000);
}
