import { useState } from "react";
import { SPOTIFY_URL } from "@/data/about";
import { MediaProfileTag, MediaSearch } from "./MediaShelf";
import PhysicalMediaCollection, {
  type PhysicalCollectionProps,
} from "./PhysicalMediaCollection";
import { mediaCatalog, searchMedia } from "./media-catalog";

export default function MusicArchive(
  props: Omit<PhysicalCollectionProps, "kind">
) {
  const [query, setQuery] = useState("");
  const pt = props.lang === "pt";
  const songs = mediaCatalog("music", props.lang).filter(song =>
    searchMedia(song, query)
  );
  return (
    <div className="media-archive music-archive">
      <MediaProfileTag
        href={SPOTIFY_URL}
        avatar="https://i.scdn.co/image/ab6775700000ee8565cb4a1d81ab0158b3103d24"
        name="PacWaffle"
        detail="Spotify"
      />
      <MediaSearch
        value={query}
        onChange={setQuery}
        label={
          pt
            ? "Buscar música, artista ou álbum…"
            : "Find a song, artist, or album…"
        }
      />
      <PhysicalMediaCollection {...props} kind="music" items={songs} />
      {!songs.length && (
        <p className="media-empty" role="status">
          {pt
            ? "Nenhum disco encontrado. Tente outro nome."
            : "No discs found. Try another name."}
        </p>
      )}
    </div>
  );
}
