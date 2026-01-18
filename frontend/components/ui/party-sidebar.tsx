"use client";

import { Sidebar, SidebarItem, SidebarSection } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";

export interface Member {
  id: string;
  username: string;
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
      <SidebarSection title="Party Code">
        <div className="font-mono text-white">
          {partyCode || "—"}
        </div>
      </SidebarSection>

      <SidebarSection title="Members">
        {members.length === 0 ? (
          <p className="text-sm text-neutral-400">No members</p>
        ) : (
          <ul className="space-y-1">
            {members.map((m) => (
              <li
                key={m.id}
                className="text-sm text-white"
              >
                {m.username}
                {m.id === selfId && " (You)"}
              </li>
            ))}
          </ul>
        )}
      </SidebarSection>

      <div className="mt-auto pt-4">
        <SidebarItem danger onClick={onLeave}>
          <LogOut size={16} />
          Leave Party
        </SidebarItem>
      </div>
    </Sidebar>
  );
}
