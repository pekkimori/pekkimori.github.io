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

export default function GlobeCard({ places }: Props) {
  const [countries, setCountries] = useState<GeoPermissibleObjects | null>(null);
  const [rotation, setRotation] = useState<[number, number, number]>([20, -20, 0]);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [hoveredPlace, setHoveredPlace] = useState<string | null>(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const containerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetch(GEO_URL)
      .then(r => r.json())
      .then((topo: Topology<Objects>) => {
        const obj = topo.objects[Object.keys(topo.objects)[0]];
        setCountries(feature(topo, obj) as unknown as GeoPermissibleObjects);
      });
  }, []);

  const projection = geoOrthographic()
    .scale(SCALE)
    .translate([WIDTH / 2, HEIGHT / 2])
    .rotate(rotation)
    .clipAngle(90);

  const pathGen = geoPath(projection);
  const graticule = geoGraticule()();

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setTooltip(null);
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging.current) {
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        setRotation(([λ, φ, γ]) => [
          λ + dx * 0.4,
          Math.max(-90, Math.min(90, φ - dy * 0.4)),
          γ,
        ]);
        setTooltip(null);
      }
    },
    []
  );

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const markerData = places.map(place => {
    const proj = projection([place.lng, place.lat]);
    return { place, proj };
  });

  return (
    <div ref={containerRef as unknown as React.RefObject<HTMLDivElement>} className="relative">
      <svg
        ref={containerRef as unknown as React.RefObject<SVGSVGElement>}
        width="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ cursor: isDragging.current ? "grabbing" : "grab", display: "block" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Ocean */}
        <circle
          cx={WIDTH / 2}
          cy={HEIGHT / 2}
          r={SCALE}
          fill="#0b0f14"
          stroke="#3a5068"
          strokeWidth={1}
        />

        {/* Graticule */}
        <path
          d={pathGen(graticule) ?? ""}
          fill="none"
          stroke="#1e2d3d"
          strokeWidth={0.4}
        />

        {/* Countries */}
        {countries && (
          <path
            d={pathGen(countries) ?? ""}
            fill="none"
            stroke="#3a5068"
            strokeWidth={0.7}
          />
        )}

        {/* Place markers */}
        {markerData.map(({ place, proj }) => {
          if (!proj) return null;
          const isLived = place.kind === "lived";
          const isHovered = hoveredPlace === place.code + place.city;
          return (
            <circle
              key={place.code + place.city}
              cx={proj[0]}
              cy={proj[1]}
              r={isHovered ? (isLived ? 9 : 7) : isLived ? 7 : 5}
              fill={isHovered ? "#ffffff" : isLived ? "#7dd3fc" : "#f97316"}
              stroke="#0b0f14"
              strokeWidth={1.5}
              style={{ cursor: "pointer", transition: "r 0.1s, fill 0.1s" }}
              onMouseEnter={e => {
                if (isDragging.current) return;
                const svgEl = containerRef.current as unknown as SVGSVGElement;
                if (!svgEl) return;
                const rect = svgEl.getBoundingClientRect();
                const scaleX = rect.width / WIDTH;
                setHoveredPlace(place.code + place.city);
                setTooltip({
                  place,
                  x: proj[0] * scaleX,
                  y: proj[1] * scaleX,
                });
              }}
              onMouseLeave={() => {
                setHoveredPlace(null);
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
          style={{ left: tooltip.x + 14, top: tooltip.y - 44 }}
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
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#7dd3fc]" />
          lived
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#f97316]" />
          visited
        </span>
        <span className="ml-auto opacity-50">drag to rotate</span>
      </div>
    </div>
  );
}
