"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { provinces } from "@/lib/data";
import { humanize } from "@/lib/utils";

const maxPop = Math.max(...provinces.map((p) => p.total_citizens));

export default function NationalMap() {
  return (
    <MapContainer
      center={[28.3, 84.0]}
      zoom={7}
      scrollWheelZoom={false}
      style={{ height: "560px", width: "100%", borderRadius: "0.75rem" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {provinces.map((p) => {
        const radius = 12 + (p.total_citizens / maxPop) * 24;
        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={radius}
            pathOptions={{ color: "#b91c1c", fillColor: "#dc2626", fillOpacity: 0.55 }}
          >
            <Tooltip direction="top">{p.name}</Tooltip>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{p.name} Province</p>
                <p>Population: {p.total_citizens.toLocaleString("en-IN")}</p>
                <p>Municipalities: {p.municipalities}</p>
                <p>Top employment: {humanize(p.top_employment)}</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
