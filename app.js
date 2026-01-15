const express = require("express");
const app = express();
const http = require("http");
const { v4: uuidv4 } = require("uuid");

const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

// =============================
// STATE
// =============================
const users = {};        // socket.id -> username
const parties = {};      // partyCode -> [{ id, username }]
const userParty = {};    // socket.id -> partyCode
const partySOS = {};     // partyCode -> socket.id

// =============================
// HELPERS
// =============================
function removeUserFromParty(socket) {
  const code = userParty[socket.id];
  if (!code || !parties[code]) return;

  // remove user
  parties[code] = parties[code].filter(u => u.id !== socket.id);
  socket.leave(code);
  delete userParty[socket.id];

  // clear SOS if that user was the one
  if (partySOS[code] === socket.id) {
    delete partySOS[code];
    io.to(code).emit("sosUpdate", { userId: null });
  }

  // notify party
  io.to(code).emit("user-disconnected", socket.id);

  // delete party if empty
  if (parties[code].length === 0) {
    delete parties[code];
    delete partySOS[code];
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

  socket.on("joinParty", ({ partyCode, username }) => {
    if (!parties[partyCode]) {
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
  });

  socket.on("leaveParty", () => {
    removeUserFromParty(socket);
  });

  socket.on("send-location", (data) => {
    const code = userParty[socket.id];
    if (!code) return;

    io.to(code).emit("receive-location", {
      id: socket.id,
      username: users[socket.id],
      latitude: data.latitude,
      longitude: data.longitude,
    });
  });

  // =============================
  // SOS SYSTEM (single source of truth)
  // =============================
  socket.on("sos", () => {
    const code = userParty[socket.id];
    if (!code) return;

    partySOS[code] = socket.id;

    io.to(code).emit("sosUpdate", {
      userId: socket.id,
      username: users[socket.id],
      time: Date.now(),
    });
  });

  socket.on("sos-clear", () => {
    const code = userParty[socket.id];
    if (!code) return;

    if (partySOS[code] === socket.id) {
      delete partySOS[code];
      io.to(code).emit("sosUpdate", { userId: null });
    }
  });

  socket.on("disconnect", () => {
    removeUserFromParty(socket);
    delete users[socket.id];
  });
});

server.listen(3000, () =>
  console.log("Backend running on http://localhost:3000")
);
