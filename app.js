const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://real-time-tracker-0qge.onrender.com",
      "https://real-time-tracker-three.vercel.app",
    ],
    methods: ["GET", "POST"],
  },
});

// =============================
// STATE (SINGLE SOURCE OF TRUTH)
// =============================
const users = {};          // socket.id -> username
const parties = {};        // partyCode -> [{ id, username }]
const userParty = {};      // socket.id -> partyCode
const userLocations = {};  // socket.id -> { latitude, longitude }

// =============================
// HELPERS
// =============================
function removeUserFromParty(socket) {
  const code = userParty[socket.id];
  if (!code || !parties[code]) return;

  console.log(`[PARTY] Removing user ${socket.id} from party ${code}`);

  // 1️⃣ Remove user from party list
  parties[code] = parties[code].filter(u => u.id !== socket.id);

  // 2️⃣ Remove socket from room
  socket.leave(code);

  // 3️⃣ Cleanup user mappings
  delete userParty[socket.id];
  delete userLocations[socket.id];

  // 4️⃣ Notify remaining users
  io.to(code).emit("user-disconnected", socket.id);

  // 5️⃣ DESTROY PARTY if 0 left (Empty)
  if (parties[code].length === 0) {
    console.log(`[PARTY] Closing party ${code} (empty)`);
    delete parties[code];
  } else {
    // If users remain, just tell them someone left
    // (We already did this in step 4, so we are good)
  }
}


// =============================
// SOCKET
// =============================
io.on("connection", (socket) => {
  console.log(`[CONNECT] Socket connected: ${socket.id}`);
  users[socket.id] = "Guest";

  socket.on("register-user", (username) => {
    console.log(`[REGISTER] User registered: ${username} (${socket.id})`);
    users[socket.id] = username || "Guest";
  });

  // ---------- CREATE PARTY ----------
  socket.on("createParty", (username) => {
    const partyCode = uuidv4().slice(0, 6).toUpperCase();
    console.log(`[CREATE] User ${username} (${socket.id}) created party ${partyCode}`);

    parties[partyCode] = [{ id: socket.id, username }];
    userParty[socket.id] = partyCode;

    socket.join(partyCode);

    socket.emit("partyJoined", {
      partyCode,
      users: parties[partyCode],
    });
  });

  // ---------- JOIN PARTY ----------
  socket.on("joinParty", ({ partyCode, username }) => {
    console.log(`[JOIN] User ${username} (${socket.id}) attempting to join party ${partyCode}`);
    if (!parties[partyCode]) {
      console.log(`[JOIN_ERROR] Party ${partyCode} does not exist`);
      socket.emit("partyError", "Party does not exist");
      return;
    }

    const user = { id: socket.id, username };
    parties[partyCode].push(user);
    userParty[socket.id] = partyCode;

    socket.join(partyCode);

    socket.emit("partyJoined", {
      partyCode,
      users: parties[partyCode],
    });

    socket.to(partyCode).emit("userJoined", user);

    // send existing locations
    parties[partyCode].forEach((u) => {
      if (userLocations[u.id]) {
        socket.emit("receive-location", {
          id: u.id,
          username: users[u.id],
          latitude: userLocations[u.id].latitude,
          longitude: userLocations[u.id].longitude,
        });
      }
    });
  });

  // ---------- LOCATION ----------
  socket.on("send-location", ({ latitude, longitude, username }) => {
    // ✅ ALWAYS store latest location
    userLocations[socket.id] = { latitude, longitude };

    const code = userParty[socket.id];
    if (!code || !parties[code]) return; // ⛔ no broadcast if not in party

    // ✅ broadcast ONLY to party
    io.to(code).emit("receive-location", {
      id: socket.id,
      username: username || users[socket.id],
      latitude,
      longitude,
    });
  });

  // ---------- LEAVE ----------
  socket.on("leaveParty", () => {
    console.log(`[LEAVE] Socket ${socket.id} requested to leave party`);
    removeUserFromParty(socket);
  });

  // ---------- DISCONNECT ----------
  socket.on("disconnect", () => {
    console.log(`[DISCONNECT] Socket disconnected: ${socket.id}`);
    removeUserFromParty(socket);
    delete users[socket.id];
  });
});

server.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});

