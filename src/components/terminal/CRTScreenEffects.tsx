export default function CRTScreenEffects({
  viewport = false,
}: {
  viewport?: boolean;
}) {
  return (
    <div
      className={viewport ? "crt-surface crt-viewport" : "crt-surface"}
      aria-hidden="true"
    >
      <div className="crt-raster" />
      <div className="crt-beam" />
      <div className="crt-glass" />
    </div>
  );
}
