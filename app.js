const express = require("express");
const http = require("http");
const partyManager = require("./managers/PartyManager");
const logger = require("./utils/logger");
const { isValidUsername, isValidPartyCode, isValidLocation, isValidWaypoint } = require("./utils/validation");

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
    // whether to skip middlewares upon successful recovery
    skipMiddlewares: true,
  },
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
// SOCKET
// =============================
// Note: All state (users, parties, locations) is managed by PartyManager.
// Do not introduce local maps (like users = {}) here to avoid desync.
io.on("connection", (socket) => {
  if (socket.recovered) {
    logger.info(`Socket recovered: ${socket.id}`);
    // recovery successful, socket.id, socket.rooms and socket.data are restored
  } else {
    logger.info(`Socket connected: ${socket.id}`);
    partyManager.registerUser(socket.id, "Guest");
  }

  socket.on("register-user", (username) => {
    if (!isValidUsername(username)) return;
    partyManager.registerUser(socket.id, username);
  });

  // ---------- CREATE PARTY ----------
  socket.on("createParty", (username) => {
    if (!isValidUsername(username)) {
      socket.emit("partyError", "Invalid username");
      return;
    }

    const { partyCode, users, creator } = partyManager.createParty(socket.id, username);
    socket.join(partyCode);

    socket.emit("partyJoined", {
      partyCode,
      users,
      creator
    });
  });

  // ---------- JOIN PARTY ----------
  socket.on("joinParty", ({ partyCode, username }) => {
    if (!isValidPartyCode(partyCode) || !isValidUsername(username)) {
      socket.emit("partyError", "Invalid input");
      return;
    }

    const result = partyManager.joinParty(socket.id, username, partyCode);

    if (result.error) {
      logger.warn(`Join failed: ${result.error}`);
      socket.emit("partyError", result.error);
      return;
    }

    const { users, creator } = result;

    socket.join(partyCode);

    // Notify SELF
    socket.emit("partyJoined", {
      partyCode,
      users, // Full list including self
      creator,
      sosUsers: partyManager.getSOSUsers(partyCode),
      waypoints: partyManager.getWaypoints(partyCode)
    });

    // Notify OTHERS
    socket.to(partyCode).emit("userJoined", { id: socket.id, username });

    // Send existing locations to NEW USER (Iterate users in party and send their cached locs)
    // NOTE: PartyManager has userLocations.
    users.forEach(u => {
      const loc = partyManager.userLocations[u.id];
      if (loc) {
        socket.emit("receive-location", {
          id: u.id,
          username: u.username,
          latitude: loc.latitude,
          longitude: loc.longitude
        });
      }
    });

    // ✅ BROADCAST JOINER'S LOCATION TO OTHERS
    // (This ensures the creator sees the joiner's marker immediately)
    const joinerLoc = partyManager.userLocations[socket.id];
    if (joinerLoc) {
      io.to(partyCode).emit("receive-location", {
        id: socket.id,
        username: username,
        latitude: joinerLoc.latitude,
        longitude: joinerLoc.longitude
      });
    }
  });

  // ---------- LOCATION ----------
  socket.on("send-location", ({ latitude, longitude, username }) => {
    if (!isValidLocation(latitude, longitude)) return;

    const partyCode = partyManager.updateLocation(socket.id, latitude, longitude);

    if (partyCode) {
      // Broadcast to EVERYONE in party (including sender - helpful for debugging, though frontend ignores self)
      // Note: We use partyManager.getUser(socket.id) to prevent client-side name spoofing
      io.to(partyCode).emit("receive-location", {
        id: socket.id,
        username: partyManager.getUser(socket.id),
        latitude,
        longitude,
      });
    }
  });

  // ---------- LEAVE ----------
  socket.on("leaveParty", () => {
    logger.info(`[LEAVE] Socket ${socket.id} requested to leave party`);
    const result = partyManager.leaveParty(socket.id);

    if (result && result.partyCode) {
      socket.leave(result.partyCode);
      socket.emit("partyLeft"); // Notify SELF

      // Notify others
      socket.to(result.partyCode).emit("user-disconnected", socket.id);

      if (result.partyClosed) {
        socket.to(result.partyCode).emit("partyClosed");
      }
    }
  });

  // ---------- KICK ----------
  socket.on("kick-user", ({ userId, partyCode }) => {
    // Note: userId passed from frontend is the socket.id of the target
    const result = partyManager.kickUser(socket.id, userId);

    if (result.error) {
      socket.emit("partyError", result.error);
      return;
    }

    if (result.success && result.partyCode) {
      // Find the target socket by ID
      const targetSocket = io.sockets.sockets.get(userId);

      // Notify the kicked user (if they are still connected)
      io.to(userId).emit("partyLeft");
      io.to(userId).emit("partyError", "You were kicked from the party");

      if (targetSocket) {
        targetSocket.leave(result.partyCode);
      }

      // Notify others in the party that user is gone
      io.to(result.partyCode).emit("user-disconnected", userId);
      logger.info(`User ${userId} was successfully kicked from ${result.partyCode}`);
    }
  });

  // ---------- SOS ----------
  socket.on("sos-signal", () => {
    const result = partyManager.setSOS(socket.id, true);
    if (result) {
      const username = partyManager.getUser(socket.id);
      logger.info(`🚨 SOS SIGNAL (PERSISTENT) from ${username} in party ${result.partyCode}`);
      io.to(result.partyCode).emit("sos-alert", {
        id: socket.id,
        username,
        sosUsers: result.sosUsers
      });
    }
  });

  socket.on("clear-sos", () => {
    const result = partyManager.setSOS(socket.id, false);
    if (result) {
      const username = partyManager.getUser(socket.id);
      logger.info(`✅ SOS CLEARED by ${username} in party ${result.partyCode}`);
      io.to(result.partyCode).emit("sos-cleared", {
        id: socket.id,
        sosUsers: result.sosUsers
      });
    }
  });

  // ---------- WAYPOINTS ----------
  socket.on("drop-waypoint", ({ lat, lng, label }) => {
    if (!isValidWaypoint(lat, lng, label)) return;

    const result = partyManager.addWaypoint(socket.id, lat, lng, label);
    if (result) {
      logger.info(`📍 WAYPOINT dropped by ${partyManager.getUser(socket.id)} in ${result.partyCode}`);
      io.to(result.partyCode).emit("waypoint-dropped", result.waypoint);
    }
  });

  socket.on("clear-waypoints", () => {
    const partyCode = partyManager.getUserParty(socket.id);
    if (!partyCode) return;

    // Security: Only host can clear waypoints
    const party = partyManager.parties[partyCode];
    if (party && party.creator === partyManager.getUser(socket.id)) {
      partyManager.clearWaypoints(socket.id);
      logger.info(`扫 WAYPOINTS cleared by host ${party.creator} in ${partyCode}`);
      io.to(partyCode).emit("waypoints-cleared");
    } else {
      socket.emit("partyError", "Only the host can clear waypoints");
    }
  });

  // ---------- DISCONNECT ----------
  socket.on("disconnect", () => {
    logger.info(`[DISCONNECT] Socket disconnected: ${socket.id}`);
    const result = partyManager.handleDisconnect(socket.id);

    if (result && result.partyCode) {
      // Notify others
      socket.to(result.partyCode).emit("user-disconnected", socket.id);

      if (result.partyClosed) {
        socket.to(result.partyCode).emit("partyClosed");
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});

