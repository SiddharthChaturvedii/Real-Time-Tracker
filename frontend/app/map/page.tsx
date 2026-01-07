"use client";

import { PartySidebar } from "@/components/ui/party-sidebar";
import io from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("http://localhost:3000");

// ---- Types ----
export interface PartyUser {
  id: string;
  username: string;
}

interface PartyJoinedPayload {
  partyCode: string;
  users: PartyUser[];
}

// ---- Page ----
export default function MapPage() {
  const [partyCode, setPartyCode] = useState<string>("");
  const [selfId, setSelfId] = useState<string>("");
  const [members, setMembers] = useState<PartyUser[]>([]);

  useEffect(() => {
    setSelfId(socket.id);

    socket.on(
      "partyJoined",
      ({ partyCode, users }: PartyJoinedPayload) => {
        setPartyCode(partyCode);
        setMembers(users);
      }
    );

    socket.on("userJoined", (user: PartyUser) => {
      setMembers(prev => [...prev, user]);
    });

    socket.on("user-disconnected", (id: string) => {
      setMembers(prev => prev.filter(u => u.id !== id));
    });

    return () => {
      socket.off("partyJoined");
      socket.off("userJoined");
      socket.off("user-disconnected");
    };
  }, []);

  function hashColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);

  const colors = ["red", "blue", "green", "gold", "violet", "orange"];
  return colors[Math.abs(hash) % colors.length];
}


  return (
    <div className="flex">
      <PartySidebar
        partyCode={partyCode}
        members={members}
        selfId={selfId}
        onLeave={() => socket.disconnect()}
      />

      <div className="flex-1 bg-black text-white p-6">
        Map coming soon 🙂
      </div>
    </div>
  );
}
