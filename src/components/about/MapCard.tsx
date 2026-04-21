import { useState, useRef } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import type { AtlasPlace } from "@/data/about";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type Props = {
  places: AtlasPlace[];
};

type Tooltip = {
  place: AtlasPlace;
  x: number;
  y: number;
};

export default function MapCard({ places }: Props) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip(prev =>
      prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : null
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      onMouseMove={handleMouseMove}
    >
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 145, center: [15, 5] }}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: { fill: "none", stroke: "#3a5068", strokeWidth: 0.6, outline: "none" },
                  hover:   { fill: "none", outline: "none" },
                  pressed: { fill: "none", outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {places.map(place => (
          <Marker
            key={place.code + place.city}
            coordinates={[place.lng, place.lat]}
            onMouseEnter={(e: React.MouseEvent) => {
              if (!containerRef.current) return;
              const rect = containerRef.current.getBoundingClientRect();
              setTooltip({ place, x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            <circle
              r={place.kind === "lived" ? 7 : 5}
              fill={place.kind === "lived" ? "#7dd3fc" : "#f97316"}
              stroke="#0b0f14"
              strokeWidth={1.5}
              style={{ cursor: "pointer", transition: "fill 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.fill = "#ffffff")}
              onMouseLeave={e =>
                (e.currentTarget.style.fill =
                  place.kind === "lived" ? "#7dd3fc" : "#f97316")
              }
            />
          </Marker>
        ))}
      </ComposableMap>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 min-w-[120px] rounded-lg border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur-sm"
          style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
        >
          <div className="font-mono text-sm font-semibold text-foreground">
            {tooltip.place.city}
          </div>
          {tooltip.place.note && (
            <div className="font-mono text-[11px] text-muted">{tooltip.place.note}</div>
          )}
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-accent">
            {tooltip.place.kind}
          </div>
        </div>
      )}

      <div className="mt-2 flex gap-4 font-mono text-[10px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#7dd3fc]" />
          lived
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#f97316]" />
          visited
        </span>
      </div>
    </div>
  );
}
