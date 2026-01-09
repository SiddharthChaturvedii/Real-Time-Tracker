const express = require("express");
const app = express();
const http = require("http");
const { v4: uuidv4 } = require("uuid");

const server = http.createServer(app);

// ✅ FIXED: Socket.IO with CORS
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// =============================
// USERS + PARTY STORAGE
// =============================
const users = {};       // socket.id -> username
const parties = {};     // CODE -> [{ id, username }]
const userParty = {};   // socket.id -> partyCode

// =============================
// SOCKET HANDLERS
// =============================
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // default name
  users[socket.id] = "Guest";

  // REGISTER USER NAME
  socket.on("register-user", (username) => {
    users[socket.id] = username || "Guest";
  });

  // CREATE PARTY
  socket.on("createParty", (username) => {
    const partyCode = uuidv4().slice(0, 6).toUpperCase();

    parties[partyCode] = [];

    const user = { id: socket.id, username };

    parties[partyCode].push(user);
    userParty[socket.id] = partyCode;

    socket.join(partyCode);

    // 🔴 IMPORTANT: use partyJoined (same as joiner)
    socket.emit("partyJoined", {
      partyCode,
      users: parties[partyCode],
    });
  });

  // JOIN PARTY
  socket.on("joinParty", ({ partyCode, username }) => {
    if (!parties[partyCode]) {
      socket.emit("partyError", "Party does not exist ❌");
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

  // LOCATION SHARING
  socket.on("send-location", (data) => {
    const code = userParty[socket.id];
    if (!code) return;

    io.to(code).emit("receive-location", {
      id: socket.id,
      username: users[socket.id],
      ...data,
    });
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    const code = userParty[socket.id];

    if (code && parties[code]) {
      parties[code] = parties[code].filter(
        (u) => u.id !== socket.id
      );

      io.to(code).emit("user-disconnected", socket.id);

      if (parties[code].length === 0) {
        delete parties[code];
      }
    }

    delete users[socket.id];
    delete userParty[socket.id];
  });
});

// =============================
server.listen(3000, () =>
  console.log("Backend running on http://localhost:3000")
);
// =============================

app.get("/", (req, res) => {
  res.send("Backend running — UI is Next.js");
});
