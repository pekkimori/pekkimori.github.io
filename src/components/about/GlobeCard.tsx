import { useState, useRef, useEffect, useCallback } from "react";
import { geoOrthographic, geoPath, geoGraticule } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, Objects } from "topojson-specification";
import type { GeoPermissibleObjects } from "d3-geo";
import type { AtlasPlace } from "@/data/about";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const WIDTH = 380;
const HEIGHT = 380;
const SCALE = 175;

type Tooltip = { place: AtlasPlace; x: number; y: number };
type Props = { places: AtlasPlace[] };

// Dot product of a geographic point with the current view direction.
// Returns 1 = dead center, 0 = horizon, -1 = fully behind.
function depth(lng: number, lat: number, rotation: [number, number, number]): number {
  const φ1 = (-rotation[1]) * (Math.PI / 180);
  const φ2 = lat * (Math.PI / 180);
  const Δλ = (lng + rotation[0]) * (Math.PI / 180);
  return Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ);
}

export default function GlobeCard({ places }: Props) {
  const [countries, setCountries] = useState<GeoPermissibleObjects | null>(null);
  const [rotation, setRotation] = useState<[number, number, number]>([20, -20, 0]);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetch(GEO_URL)
      .then(r => r.json())
      .then((topo: Topology<Objects>) => {
        const obj = topo.objects[Object.keys(topo.objects)[0]];
        setCountries(feature(topo, obj) as unknown as GeoPermissibleObjects);
      });
  }, []);

  // Clipped projection — used for country/graticule paths
  const proj = geoOrthographic()
    .scale(SCALE)
    .translate([WIDTH / 2, HEIGHT / 2])
    .rotate(rotation)
    .clipAngle(90);

  // Unclipped projection — used to get SVG coords of back-hemisphere markers
  const projFull = geoOrthographic()
    .scale(SCALE)
    .translate([WIDTH / 2, HEIGHT / 2])
    .rotate(rotation);

  const pathGen = geoPath(proj);
  const graticule = geoGraticule()();

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setTooltip(null);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setRotation(([λ, φ, γ]) => [
      λ + dx * 0.4,
      Math.max(-90, Math.min(90, φ - dy * 0.4)),
      γ,
    ]);
    setTooltip(null);
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const markers = places.map(place => {
    const d = depth(place.lng, place.lat, rotation);
    const coords = projFull([place.lng, place.lat]);
    const blurPx = d < 0 ? Math.min(5, -d * 7) : 0;
    const opacity = d < 0 ? Math.max(0.12, 1 + d * 1.8) : 1;
    return { place, coords, d, blurPx, opacity };
  });

  // Sort: back-hemisphere markers render first (under the globe edge)
  markers.sort((a, b) => a.d - b.d);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ display: "block", cursor: isDragging.current ? "grabbing" : "grab" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <defs>
          {/* Clip everything to the sphere circle */}
          <clipPath id="globe-clip">
            <circle cx={WIDTH / 2} cy={HEIGHT / 2} r={SCALE} />
          </clipPath>
        </defs>

        {/* Transparent globe face — just the border ring */}
        <circle
          cx={WIDTH / 2}
          cy={HEIGHT / 2}
          r={SCALE}
          fill="transparent"
          stroke="var(--color-border)"
          strokeWidth={1}
        />

        <g clipPath="url(#globe-clip)">
          {/* Graticule */}
          <path
            d={pathGen(graticule) ?? ""}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={0.35}
            strokeOpacity={0.5}
          />

          {/* Country outlines */}
          {countries && (
            <path
              d={pathGen(countries) ?? ""}
              fill="none"
              stroke="var(--color-foreground)"
              strokeWidth={0.55}
              strokeOpacity={0.35}
            />
          )}
        </g>

        {/* Markers — drawn outside clip so blur bleeds naturally */}
        {markers.map(({ place, coords, blurPx, opacity }) => {
          if (!coords) return null;
          const key = place.code + place.city;
          const isHovered = hoveredKey === key;
          const isLived = place.kind === "lived";
          const r = isHovered ? (isLived ? 9 : 7) : isLived ? 7 : 5;
          const isFront = blurPx === 0;

          return (
            <circle
              key={key}
              cx={coords[0]}
              cy={coords[1]}
              r={r}
              fill={isHovered ? "var(--color-foreground)" : isLived ? "var(--color-accent)" : "var(--color-muted)"}
              stroke="var(--color-background)"
              strokeWidth={1.5}
              opacity={opacity}
              style={{
                filter: blurPx > 0 ? `blur(${blurPx.toFixed(1)}px)` : undefined,
                cursor: isFront ? "pointer" : "default",
                transition: "r 0.1s",
                pointerEvents: isFront ? "auto" : "none",
              }}
              onMouseEnter={e => {
                if (isDragging.current || !isFront) return;
                const svgEl = svgRef.current;
                if (!svgEl) return;
                const rect = svgEl.getBoundingClientRect();
                const scale = rect.width / WIDTH;
                setHoveredKey(key);
                setTooltip({ place, x: coords[0] * scale, y: coords[1] * scale });
              }}
              onMouseLeave={() => {
                setHoveredKey(null);
                setTooltip(null);
              }}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 min-w-[120px] rounded-lg border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur-sm"
          style={{ left: tooltip.x + 14, top: tooltip.y - 48 }}
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

      {/* Legend */}
      <div className="mt-1 flex gap-4 font-mono text-[10px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
          lived
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-muted" />
          visited
        </span>
        <span className="ml-auto opacity-50">drag to rotate</span>
      </div>
    </div>
  );
}
