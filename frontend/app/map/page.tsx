"use client";

import { PartySidebar, Member } from "@/components/ui/party-sidebar";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { socket } from "@/lib/socket";


const LiveMap = dynamic(() => import("./LiveMap"), { ssr: false });

interface PartyUser {
  id: string;
  username: string;
}

interface PartyJoinedPayload {
  partyCode: string;
  users: PartyUser[];
}

function hashColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["red", "blue", "green", "gold", "violet", "orange"];
  return colors[Math.abs(hash) % colors.length];
}

export default function MapPage() {
  const [partyCode, setPartyCode] = useState("");
  const [selfId, setSelfId] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState<string>("");

  /* ---------------- USERNAME (RESTORED) ---------------- */
  useEffect(() => {
    if (!username) {
      const name = prompt("Enter your name");
      if (name) {
        setUsername(name);
        socket.emit("setUsername", name);
      }
    }
  }, [username]);

  /* ---------------- SOCKET EVENTS ---------------- */
  useEffect(() => {
    socket.on("connect", () => {
      setSelfId(socket.id);
    });

    socket.on("partyJoined", ({ partyCode, users }: PartyJoinedPayload) => {
      setPartyCode(partyCode);
      setMembers(
        users.map(u => ({
          id: u.id,
          username: u.username,
          color: hashColor(u.id),
          online: true,
        }))
      );
    });

    socket.on("userJoined", (user: PartyUser) => {
      setMembers(prev => [
        ...prev,
        {
          id: user.id,
          username: user.username,
          color: hashColor(user.id),
          online: true,
        },
      ]);
    });

    socket.on("user-disconnected", (id: string) => {
      setMembers(prev => prev.filter(u => u.id !== id));
    });

    return () => {
      socket.off("connect");
      socket.off("partyJoined");
      socket.off("userJoined");
      socket.off("user-disconnected");
    };
  }, []);

  /* ---------------- UI ---------------- */
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">

      {/* 🗺 MAP — ALWAYS FULLSCREEN */}
      <div className="absolute inset-0 z-0">
        <LiveMap />
      </div>

      {/* 🧭 NAVBAR — GLOBAL ACTIONS */}
      <div className="absolute top-0 left-0 right-0 h-16 z-40 bg-[#0b1220] text-white flex items-center px-4 gap-4">

        {/* ☰ SIDEBAR TOGGLE */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-2xl leading-none"
        >
          ☰
        </button>

        <h1 className="font-extrabold text-lg">LiveTrack</h1>

        <span className="bg-red-700 px-3 py-1 rounded-md text-sm">
          {partyCode ? "In Party" : "Not in party"}
        </span>

        <span className="bg-black/40 px-3 py-1 rounded-md text-sm">
          Code: {partyCode || "—"}
        </span>

        {/* 🟢 CREATE / JOIN — WORKING */}
        {!partyCode && (
          <>
            <button
              className="bg-white text-black px-3 py-1 rounded-md text-sm"
              onClick={() => {
                if (!username) return alert("Enter name first");
                socket.emit("createParty");
              }}
            >
              Create Party
            </button>

            <button
              className="bg-white text-black px-3 py-1 rounded-md text-sm"
              onClick={() => {
                if (!username) return alert("Enter name first");
                const code = prompt("Enter party code");
                if (code) socket.emit("joinParty", code);
              }}
            >
              Join Party
            </button>
          </>
        )}

        <div className="ml-auto">
          <button className="bg-red-500 px-4 py-2 rounded-lg text-sm font-semibold">
            🚨 SOS
          </button>
        </div>
      </div>

      {/* 📦 SIDEBAR — PARTY INTERNALS ONLY */}
      <PartySidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        partyCode={partyCode}
        members={members}
        selfId={selfId}
        onLeave={() => {
          setSidebarOpen(false);
          socket.disconnect();
        }}
      />
    </div>
  );
}
