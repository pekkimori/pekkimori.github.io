import type { CSSProperties, ReactNode } from "react";
import { Search } from "lucide-react";
import "./media.css";

export type Lang = "en" | "pt";
export const tones = ["#b77156", "#819a93", "#a18bb2", "#b8a16c", "#8198b5"];
export function MediaHeader({
  path,
  title,
  description,
  count,
  unit,
  href,
  profile,
}: {
  path: string;
  title: string;
  description: string;
  count: number;
  unit: string;
  href: string;
  profile: string;
}) {
  return (
    <header className="media-heading">
      <div className="media-eyebrow">
        ~/collection/{path}{" "}
        <span>
          {String(count).padStart(2, "0")} {unit}
        </span>
      </div>
      <div className="media-heading-row">
        <h2>{title}</h2>
        <a
          className="media-profile"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {profile} ↗
        </a>
      </div>
      <p>{description}</p>
    </header>
  );
}
export function MediaSearch({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children?: ReactNode;
}) {
  return (
    <div className="media-toolbar">
      <label className="media-search">
        <Search size={14} aria-hidden="true" />
        <input
          type="search"
          value={value}
          onChange={e => onChange(e.target.value)}
          aria-label={label}
          placeholder={label}
        />
      </label>
      {children}
    </div>
  );
}
export function MediaObject({
  kind,
  title,
  subtitle,
  index,
  selected,
  onClick,
  motif,
  showCaption = true,
}: {
  kind: "tape" | "cartridge" | "record";
  title: string;
  subtitle: string;
  index: number;
  selected?: boolean;
  onClick: () => void;
  motif?: string;
  showCaption?: boolean;
}) {
  return (
    <button
      className={`media-item media-${kind} ${selected ? "is-loaded" : ""}`}
      onClick={onClick}
      aria-pressed={!!selected}
      aria-label={showCaption ? undefined : `${title} — ${subtitle}`}
      style={{ "--media-tone": tones[index % tones.length] } as CSSProperties}
    >
      <span className="media-object" aria-hidden="true">
        {kind === "record" && (
          <span className="record-vinyl">
            <span>{String(index + 1).padStart(2, "0")}</span>
          </span>
        )}
        <span className="media-object-front">
          <span className="object-catalog">
            {kind === "tape"
              ? "VHS / HI-FI"
              : kind === "cartridge"
                ? "PEKKI / SOFT"
                : "PEKKI RECORDS"}
            <span>{String(index + 1).padStart(2, "0")}</span>
          </span>
          {kind === "tape" ? (
            <>
              <span className="tape-window">
                <i />
                <span>SP · STEREO</span>
                <i />
              </span>
              <span className="tape-paper">
                <strong>{title}</strong>
                <small>{subtitle}</small>
              </span>
              <span className="tape-foot">
                ◀ REWIND <span>120</span> ▷ PLAY
              </span>
            </>
          ) : (
            <>
              <span className={`object-art art-${motif ?? index % 5}`}>
                <span />
                <span />
                <span />
                <span />
              </span>
              <span className="object-title">{title}</span>
              <span className="object-subtitle">{subtitle}</span>
              {kind === "cartridge" && <span className="cartridge-grip" />}
            </>
          )}
        </span>
      </span>
      {showCaption && (
        <span className="media-item-caption">
          <strong>{title}</strong>
          <small>{subtitle}</small>
          <span className="media-item-action">{selected ? "●" : "↗"}</span>
        </span>
      )}
    </button>
  );
}
export function ShelfLabel({
  children,
  count,
}: {
  children: ReactNode;
  count: number;
}) {
  return (
    <div className="media-shelf-label">
      <span>{children}</span>
      <span>{String(count).padStart(2, "0")}</span>
    </div>
  );
}
