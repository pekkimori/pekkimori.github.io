import { useEffect, useRef, useState } from "react";

export type VideoHandle = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (t: number, allow: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setVolume: (v: number) => void;
  destroy: () => void;
};
type YouTubeAPI = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      host: string;
      playerVars: Record<string, number | string>;
      events: {
        onReady: (e: { target: VideoHandle }) => void;
        onStateChange: (e: { data: number }) => void;
        onError: () => void;
      };
    }
  ) => VideoHandle;
};
let apiPromise: Promise<YouTubeAPI> | undefined;
function loadAPI() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YouTubeAPI>((resolve, reject) => {
    const ytWindow = window as typeof window & {
      YT?: YouTubeAPI;
      onYouTubeIframeAPIReady?: () => void;
    };
    if (ytWindow.YT?.Player) {
      resolve(ytWindow.YT);
      return;
    }
    const previous = ytWindow.onYouTubeIframeAPIReady;
    ytWindow.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (ytWindow.YT) resolve(ytWindow.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => {
      apiPromise = undefined;
      reject(new Error("Player unavailable"));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}
export default function YouTubePlayer({
  videoId,
  title,
  lang,
  autoplay = true,
  paused = false,
  pauseSignal = 0,
  onReady,
  onState,
  onEnded,
  onError,
}: {
  videoId: string;
  title: string;
  lang: "en" | "pt";
  autoplay?: boolean;
  paused?: boolean;
  pauseSignal?: number;
  onReady?: (p: VideoHandle | null) => void;
  onState?: (state: number) => void;
  onEnded?: () => void;
  onError?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const playerRef = useRef<VideoHandle | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  useEffect(() => {
    if (paused) playerRef.current?.pauseVideo();
  }, [paused]);
  useEffect(() => {
    playerRef.current?.pauseVideo();
  }, [pauseSignal]);
  const callbacks = useRef({ onReady, onState, onEnded, onError });
  callbacks.current = { onReady, onState, onEnded, onError };
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let player: VideoHandle | undefined;
    setError(false);
    const timeout = window.setTimeout(() => {
      setError(true);
      callbacks.current.onError?.();
    }, 15000);
    loadAPI()
      .then(api => {
        if (cancelled || !host.current) return;
        const mount = document.createElement("div");
        host.current.replaceChildren(mount);
        player = new api.Player(mount, {
          videoId,
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: e => {
              clearTimeout(timeout);
              if (!cancelled) {
                setError(false);
                playerRef.current = e.target;
                if (pausedRef.current) e.target.pauseVideo();
                host.current
                  ?.querySelector("iframe")
                  ?.setAttribute("title", title);
                callbacks.current.onReady?.(e.target);
              }
            },
            onStateChange: e => {
              if (!cancelled) {
                if (e.data === 1 && pausedRef.current) {
                  playerRef.current?.pauseVideo();
                  return;
                }
                callbacks.current.onState?.(e.data);
                if (e.data === 0) callbacks.current.onEnded?.();
              }
            },
            onError: () => {
              clearTimeout(timeout);
              if (!cancelled) {
                setError(true);
                callbacks.current.onError?.();
              }
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          callbacks.current.onError?.();
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      callbacks.current.onReady?.(null);
      playerRef.current = null;
      player?.destroy();
    };
  }, [videoId, autoplay, title]);
  return (
    <div className="youtube-player">
      <div className="youtube-host" ref={host} />
      {error && (
        <p className="media-playback-error" role="status">
          {lang === "pt"
            ? "Este vídeo está indisponível neste reprodutor."
            : "This video is unavailable in this player."}
        </p>
      )}
    </div>
  );
}
