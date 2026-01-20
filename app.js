const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3001",
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

  // remove user from party list
  parties[code] = parties[code].filter(u => u.id !== socket.id);

  // notify others
  io.to(code).emit("user-disconnected", socket.id);

  // cleanup
  socket.leave(code);
  delete userParty[socket.id];
  delete userLocations[socket.id];

  // delete party if empty
  if (parties[code].length === 0) {
    delete parties[code];
  }
}

// =============================
// SOCKET
// =============================
io.on("connection", (socket) => {
  users[socket.id] = "Guest";

  socket.on("register-user", (username) => {
    users[socket.id] = username || "Guest";
  });

  // ---------- CREATE PARTY ----------
  socket.on("createParty", (username) => {
    const partyCode = uuidv4().slice(0, 6).toUpperCase();

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
    if (!parties[partyCode]) {
      socket.emit("partyError", "Party does not exist");
      return;
    }

    const user = { id: socket.id, username };
    parties[partyCode].push(user);
    userParty[socket.id] = partyCode;

    socket.join(partyCode);

    // send party info
    socket.emit("partyJoined", {
      partyCode,
      users: parties[partyCode],
    });

    // notify others
    socket.to(partyCode).emit("userJoined", user);

    // 🔥 SEND EXISTING USERS' LOCATIONS TO NEW USER
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
  socket.on("send-location", ({ latitude, longitude }) => {
    const code = userParty[socket.id];
    if (!code) return;

    // store latest location
    userLocations[socket.id] = { latitude, longitude };

    // broadcast to everyone in party
    io.to(code).emit("receive-location", {
       id: socket.id,
       username: data.username || users[socket.id],
       latitude: data.latitude,
       longitude: data.longitude,
      });
    });
     

  // ---------- LEAVE PARTY ----------
  socket.on("leaveParty", () => {
    removeUserFromParty(socket);
  });

  // ---------- DISCONNECT ----------
  socket.on("disconnect", () => {
    removeUserFromParty(socket);
    delete users[socket.id];
  });
});

server.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
