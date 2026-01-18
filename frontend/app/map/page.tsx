"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("./LiveMap"), {
  ssr: false,
});

interface PartyUser {
  id: string;
  username: string;
}

interface PartyJoinedPayload {
  partyCode: string;
  users: PartyUser[];
}

export default function MapPage() {
  const [partyCode, setPartyCode] = useState("");
  const [members, setMembers] = useState<PartyUser[]>([]);
  const [selfId, setSelfId] = useState("");
  const [username, setUsername] = useState("");

  /* ---------- USERNAME ---------- */
  useEffect(() => {
    let name = sessionStorage.getItem("username");
    if (!name) {
      name = prompt("Enter your name") || "Guest";
      sessionStorage.setItem("username", name);
    }
    setUsername(name);
    socket.emit("register-user", name);
  }, []);

  /* ---------- SOCKET ---------- */
  useEffect(() => {
    socket.on("connect", () => {
      setSelfId(socket.id || "");
    });

    socket.on("partyJoined", ({ partyCode, users }: PartyJoinedPayload) => {
      setPartyCode(partyCode);
      setMembers(users);
    });

    socket.on("userJoined", (user: PartyUser) => {
      setMembers((prev) => [...prev, user]);
    });

    socket.on("user-disconnected", (id: string) => {
      setMembers((prev) => prev.filter((u) => u.id !== id));
    });

    return () => {
      socket.off("connect");
      socket.off("partyJoined");
      socket.off("userJoined");
      socket.off("user-disconnected");
    };
  }, []);

  return (
    <div className="relative h-screen w-screen bg-black text-white">
      {/* 🗺 MAP */}
      {partyCode && (
        <div className="absolute inset-0 z-0">
          <LiveMap username={username} />
        </div>
      )}

      {/* 🧭 NAVBAR */}
      <div className="absolute top-0 left-0 right-0 z-20 h-14 bg-black/70 backdrop-blur flex items-center px-4 gap-4 border-b border-white/10">
        <h1 className="font-semibold">LiveTrack</h1>

        <span className="text-xs px-2 py-1 rounded bg-green-600/20 text-green-400">
          {partyCode ? "IN PARTY" : "NOT IN PARTY"}
        </span>

        <span className="text-xs font-mono text-white/80">
          {partyCode ? `Code: ${partyCode}` : ""}
        </span>

        {!partyCode && (
          <>
            <button
              className="ml-4 bg-white text-black px-3 py-1 rounded text-sm"
              onClick={() => socket.emit("createParty", username)}
            >
              Create
            </button>

            <button
              className="bg-white text-black px-3 py-1 rounded text-sm"
              onClick={() => {
                const code = prompt("Enter party code");
                if (code) {
                  socket.emit("joinParty", {
                    partyCode: code.trim().toUpperCase(),
                    username,
                  });
                }
              }}
            >
              Join
            </button>
          </>
        )}

        {partyCode && (
          <button
            className="ml-auto bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
            onClick={() => socket.emit("leaveParty")}
          >
            Leave
          </button>
        )}
      </div>
    </div>
  );
}
