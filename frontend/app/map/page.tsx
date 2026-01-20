"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("./LiveMap"), { ssr: false });

interface PartyUser {
  id: string;
  username: string;
}

interface PartyJoinedPayload {
  partyCode: string;
  users: PartyUser[];
}

export default function MapPage() {
  const [partyCode, setPartyCode] = useState<string | null>(null);
  const [members, setMembers] = useState<PartyUser[]>([]);
  const [username, setUsername] = useState("");

  /* ---------- USERNAME (CLIENT ONLY, SAFE) ---------- */
  useEffect(() => {
    let name = sessionStorage.getItem("username");
    if (!name) {
      name = prompt("Enter your name") || "Guest";
      sessionStorage.setItem("username", name);
    }
    setUsername(name);
    socket.emit("register-user", name);
  }, []);

  /* ---------- SOCKET EVENTS ---------- */
  useEffect(() => {
    const onPartyJoined = ({ partyCode, users }: PartyJoinedPayload) => {
      setPartyCode(partyCode);
      setMembers(users);
    };

    const onUserJoined = (user: PartyUser) => {
      setMembers((prev) => [...prev, user]);
    };

    const onUserDisconnected = (id: string) => {
      setMembers((prev) => prev.filter((u) => u.id !== id));
    };

    socket.on("partyJoined", onPartyJoined);
    socket.on("userJoined", onUserJoined);
    socket.on("user-disconnected", onUserDisconnected);

    return () => {
      socket.off("partyJoined", onPartyJoined);
      socket.off("userJoined", onUserJoined);
      socket.off("user-disconnected", onUserDisconnected);
    };
  }, []);

  const inParty = Boolean(partyCode);

  /* ---------- LEAVE (HARD RESET, NO GHOST STATE) ---------- */
  function leaveParty() {
    socket.emit("leaveParty");
    setPartyCode(null);
    setMembers([]);
  }

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col">
      {/* 🧭 NAVBAR */}
      <div className="h-14 flex-shrink-0 bg-black/70 backdrop-blur flex items-center px-4 gap-4 border-b border-white/10 z-10">
        <h1 className="font-semibold">LiveTrack</h1>

        <span className="text-xs px-2 py-1 rounded bg-green-600/20 text-green-400">
          {inParty ? "IN PARTY" : "NOT IN PARTY"}
        </span>

        <span className="text-xs font-mono text-white/80">
          {inParty ? `Code: ${partyCode}` : ""}
        </span>

        {!inParty && (
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

        {inParty && (
          <button
            className="ml-auto bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
            onClick={leaveParty}
          >
            Leave
          </button>
        )}
      </div>

      {/* 🗺 MAP — ALWAYS MOUNTED */}
      <div className="flex-1 relative">
        <LiveMap username={username} />
      </div>
    </div>
  );
}
