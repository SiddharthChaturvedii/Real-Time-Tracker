const express = require("express");
const app = express();
const http = require("http");
const path = require("path");

const server = http.createServer(app);
const io = require("socket.io")(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const users = {};

io.on("connection", (socket) => {

  // default name
  users[socket.id] = "Guest";

  socket.on("register-user", (username) => {
    users[socket.id] = username || "Guest";
  });

  socket.on("send-location", (data) => {
    io.emit("receive-location", {
      id: socket.id,
      username: users[socket.id],
      ...data
    });
  });

  socket.on("disconnect", () => {
    io.emit("user-disconnected", socket.id);
    delete users[socket.id];
  });
});

server.listen(3000, () => console.log("Server running"));

app.get("/", (req, res) => {
  res.render("index");
});
