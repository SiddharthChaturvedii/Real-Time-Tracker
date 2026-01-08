"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { socket } from "@/lib/socket";

interface LocationPayload {
  id: string;
  username: string;
  latitude: number;
  longitude: number;
}

const markers: Record<string, L.Marker> = {};
let centered = false;

function hashColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = ["red", "blue", "green", "gold", "violet", "orange"];
  return colors[Math.abs(hash) % colors.length];
}

function getIcon(color: string) {
  return L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    shadowSize: [41, 41],
  });
}

export default function LiveMap() {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    // 🗺 CREATE MAP
    const map = L.map("map", { attributionControl: false }).setView([20, 0], 3);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    // 📍 GPS TRACKING
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (!centered) {
          centered = true;
          map.setView([lat, lng], 16);
        }

        drawMarker(socket.id!, "You", lat, lng);

        socket.emit("send-location", {
          latitude: lat,
          longitude: lng,
        });
      });
    }

    // 🌍 RECEIVE OTHERS
    socket.on("receive-location", (data: LocationPayload) => {
      drawMarker(data.id, data.username, data.latitude, data.longitude);
    });

    socket.on("user-disconnected", (id: string) => {
      if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
      }
    });

    return () => {
      socket.off("receive-location");
      socket.off("user-disconnected");
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div id="map" className="h-full w-full" />;
}

function drawMarker(
  id: string,
  name: string,
  lat: number,
  lng: number
) {
  const color = hashColor(id);
  const jitter = id === socket.id ? 0 : (Math.random() - 0.5) * 0.00025;

  const finalLat = lat + jitter;
  const finalLng = lng + jitter;

  if (!markers[id]) {
    markers[id] = L.marker([finalLat, finalLng], {
      icon: getIcon(color),
    }).addTo(mapRefSafe());
    markers[id].bindTooltip(
      id === socket.id ? `You (${name})` : name
    );
  } else {
    markers[id].setLatLng([finalLat, finalLng]);
  }
}

function mapRefSafe(): L.Map {
  const el = document.getElementById("map") as any;
  return (el && (el as any)._leaflet_map) || (window as any)._leaflet_map;
}
