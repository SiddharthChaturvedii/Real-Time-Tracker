const socket = io();

// username PER TAB ONLY
let username = sessionStorage.getItem("username") || "Guest";

function saveName() {
  username = document.getElementById("username").value || "Guest";
  sessionStorage.setItem("username", username);
  socket.emit("register-user", username);

  // update your own tooltip immediately if marker exists
  if (markers[socket.id]) {
    markers[socket.id].bindTooltip(`You (${username})`);
  }
}

// register immediately on load too
socket.emit("register-user", username);


// MAP
const map = L.map("map", { attributionControl: false }).setView([20, 0], 3);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19
}).addTo(map);


// COLORS — FIXED PER USER FOREVER
const iconColors = ["red", "blue", "green", "gold", "violet", "orange"];

function getColorFromId(id) {
  return iconColors[
    [...id].reduce((a, c) => a + c.charCodeAt(0), 0) % iconColors.length
  ];
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


const markers = {};
let firstUpdate = true;


// SEND YOUR LOCATION CONTINUOUSLY
if (navigator.geolocation) {
  navigator.geolocation.watchPosition((pos) => {
    socket.emit("send-location", {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    });
  });
}


// RECEIVE ALL LOCATIONS
socket.on("receive-location", (data) => {
  const { id, username, latitude, longitude } = data;

  const color = getColorFromId(id);

  if (!markers[id]) {
    markers[id] = L.marker([latitude, longitude], {
      icon: getIcon(color)
    }).addTo(map);

    markers[id].bindTooltip(
      id === socket.id ? `You (${username})` : username
    );
  } else {
    markers[id].setLatLng([latitude, longitude]);
  }

  if (id === socket.id && firstUpdate) {
    map.setView([latitude, longitude], 16);
    firstUpdate = false;
  }
});


// REMOVE MARKER ON DISCONNECT
socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
