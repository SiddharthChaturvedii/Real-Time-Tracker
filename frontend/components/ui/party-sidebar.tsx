"use client";

import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Member {
  id: string;
  username: string;

}

export function PartySidebar({
  partyCode,
  members,
  selfId,
  onLeave,
}: {
  partyCode: string;
  members: Member[];
  selfId: string;
  onLeave: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex h-screen bg-neutral-900")}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="gap-6">

          <div>
            <h2 className="text-white font-bold text-lg">
              Party Code: {partyCode}
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            {members.map((m) => (
              <SidebarLink
                key={m.id}
                link={{
                  label: `${m.username}${m.id === selfId ? " (You)" : ""}`,
                  href: "#",
                  icon: (
                    <div
                      className="h-3 w-3 rounded-full bg-blue-400"
                      
                    />
                  ),
                }}
              />
            ))}
          </div>

          <div className="mt-auto">
            <SidebarLink
              link={{
                label: "Leave Party",
                href: "#",
                icon: <LogOut className="h-4 w-4 text-red-500" />,
              }}
              className="text-red-400"
            />
          </div>

        </SidebarBody>
      </Sidebar>
    </div>
  );
}
