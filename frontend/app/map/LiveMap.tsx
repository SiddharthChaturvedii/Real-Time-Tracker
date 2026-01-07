"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function LiveMap() {

  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) {

      // Create map
      mapRef.current = L.map("map", {
        center: [20, 0],
        zoom: 3
      });

      // Tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(mapRef.current);
    }

    return () => {
      mapRef.current?.remove();
    };

  }, []);

  return (
    <div id="map" style={{ height: "100%", width: "100%" }} />
  );

}
