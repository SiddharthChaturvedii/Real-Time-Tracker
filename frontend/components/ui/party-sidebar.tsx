"use client";

import { Sidebar, SidebarItem, SidebarSection } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";

export interface Member {
  id: string;
  username: string;
  color: string;
  online: boolean;
}

export function PartySidebar({
  open,
  onClose,
  partyCode,
  members,
  selfId,
  onLeave,
}: {
  open: boolean;
  onClose: () => void;
  partyCode: string;
  members: Member[];
  selfId: string;
  onLeave: () => void;
}) {
  return (
    <Sidebar open={open} onClose={onClose}>
      <SidebarSection title="Party">
        <div className="text-white font-mono text-sm">
          Code: {partyCode || "—"}
        </div>
      </SidebarSection>

      <SidebarSection title="Members">
        <div className="flex flex-col gap-1">
          {members.map(m => (
            <div
              key={m.id}
              className="flex items-center gap-2 px-2 py-1 text-sm text-white"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: m.color }}
              />
              <span>
                {m.username}
                {m.id === selfId && " (You)"}
              </span>
            </div>
          ))}
        </div>
      </SidebarSection>

      <div className="mt-auto">
        <SidebarItem danger onClick={onLeave}>
          <LogOut size={16} />
          Leave Party
        </SidebarItem>
      </div>
    </Sidebar>
  );
}
