"use client";

import { useEffect } from "react";
import io from "socket.io-client";

export default function ClientRoot() {
  useEffect(() => {
    // ----- Leaflet Fix -----
    import("leaflet").then((L) => {
      const leaflet = L.default;
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;

      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
    });

    // ----- Socket Fix -----
    if (!(window as any).__livetrack_socket__) {
      (window as any).__livetrack_socket__ = io("http://localhost:3000", {
        transports: ["websocket"],
        autoConnect: true,
      });

      console.log("🟢 LiveTrack socket initialized");
    }
  }, []);

  return null;
}
