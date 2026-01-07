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

const badge = document.getElementById("statusBadge");
const codeBox = document.getElementById("code");


// ================= MAP =================
const map = L.map("map", { attributionControl: false }).setView([20, 0], 3);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19
}).addTo(map);


// =============== COLOR HASH ===============
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


// ================= GPS =================
if (navigator.geolocation) {
  navigator.geolocation.watchPosition((pos) => {

    lastPosition = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    };

    if (!centered) {
      centered = true;
      map.setView([lastPosition.latitude, lastPosition.longitude], 16);
    }

    drawMarker(socket.id, username, lastPosition.latitude, lastPosition.longitude);

    if (partyCode) socket.emit("send-location", lastPosition);

  });
}


// ================= MARKER DRAW =================
function drawMarker(id, name, lat, lng) {

  const color = hashColor(id);
  const jitter = id === socket.id ? 0 : (Math.random()-0.5)*0.00025;

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

  setBadge("Hosting Party", "green");
  codeBox.innerText = code;

  notify(`🎉 Party created — Code: ${code}`);

  if (lastPosition) socket.emit("send-location", lastPosition);
});

socket.on("partyJoined", ({ partyCode: code, users }) => {
  partyCode = code;
  partyUsers = users;

  setBadge("In Party", "blue");
  codeBox.innerText = code;

  notify(`🙋 Joined party ${code}`);

  if (lastPosition) socket.emit("send-location", lastPosition);
});

socket.on("userJoined", (user) => {
  partyUsers.push(user);
  notify(`🟢 ${user.username} joined your party`);
});

socket.on("partyError", msg => notify("❌ " + msg));


// ================= LIVE LOCATION FROM OTHERS =================
socket.on("receive-location", (data) => {
  drawMarker(data.id, data.username, data.latitude, data.longitude);
});


// ================= DISCONNECT =================
socket.on("user-disconnected", (id) => {
  if (markers[id]) map.removeLayer(markers[id]);
  delete markers[id];
});


// ================= UI HELPERS =================
function setBadge(text, style){
  badge.innerText = text;
  badge.className = "badge " + style;
}

function notify(msg){
  const t = document.createElement("div");
  t.className = "toast";
  t.innerText = msg;
  document.body.appendChild(t);

  setTimeout(()=> t.classList.add("show"),50);
  setTimeout(()=> {
    t.classList.remove("show");
    setTimeout(()=> t.remove(),300);
  }, 3000);
}
