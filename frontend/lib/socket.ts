"use client";
import io from "socket.io-client";

export const socket = io("https://real-time-tracker-0qge.onrender.com", {
  transports: ["websocket"],
  autoConnect: true,
});
