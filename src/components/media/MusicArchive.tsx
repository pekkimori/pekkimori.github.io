import { useState } from "react";
import { FAVORITE_ARTISTS, FAVORITE_SONGS, SPOTIFY_URL } from "@/data/about";
import { RECORDS } from "@/data/media";
import {
  MediaHeader,
  MediaObject,
  MediaSearch,
  ShelfLabel,
  type Lang,
} from "./MediaShelf";
export default function MusicArchive({
  lang,
  selected,
  onSelect,
}: {
  lang: Lang;
  selected: number | null;
  onSelect: (index: number) => void;
}) {
  const pt = lang === "pt",
    [query, setQuery] = useState("");
  const terms = query
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .split(/\s+/)
    .filter(Boolean);
  const songs = FAVORITE_SONGS.map((song, index) => ({
    ...song,
    index,
    ...RECORDS[index],
  })).filter(song => {
    const text = `${song.title} ${song.artist} ${song.album}`
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
    return terms.every(term => text.includes(term));
  });
  return (
    <div className="media-archive music-archive">
      <MediaHeader
        path="music"
        title={pt ? "A trilha sonora." : "The soundtrack."}
        description={
          pt
            ? "Pegue um disco, coloque para tocar e continue explorando."
            : "Pull out a record, put it on, and keep exploring."
        }
        count={FAVORITE_SONGS.length}
        unit={pt ? "discos" : "records"}
        href={SPOTIFY_URL}
        profile="Spotify"
      />
      <MediaSearch
        value={query}
        onChange={setQuery}
        label={
          pt
            ? "Buscar música, artista ou álbum…"
            : "Find a song, artist, or album…"
        }
      >
        <span className="media-eyebrow">33⅓ RPM / STEREO</span>
      </MediaSearch>
      <ShelfLabel count={songs.length}>
        {pt ? "01 / Na minha rotação" : "01 / In my rotation"}
      </ShelfLabel>
      <div className="media-shelf record-shelf">
        {songs.map(song => (
          <MediaObject
            key={song.title}
            kind="record"
            title={song.title}
            subtitle={song.artist}
            index={song.index}
            selected={selected === song.index}
            onClick={() => onSelect(song.index)}
          />
        ))}
      </div>
      {!songs.length && (
        <p className="media-empty" role="status">
          {pt
            ? "Nenhum disco encontrado. Tente outro nome."
            : "No records found. Try another name."}
        </p>
      )}
      <div className="music-listening-note">
        <span aria-hidden="true">♫</span>
        <p>
          {pt
            ? "A música continua ao minimizar ou fechar esta estante. Use o toca-discos no canto para controlar a reprodução."
            : "Music keeps playing when you minimize or close this shelf. Use the turntable in the corner to control playback."}
        </p>
      </div>
      <section className="music-artists">
        <ShelfLabel count={FAVORITE_ARTISTS.length}>
          {pt ? "02 / Sempre por perto" : "02 / Always close by"}
        </ShelfLabel>
        <p>{FAVORITE_ARTISTS.join(" · ")}</p>
      </section>
    </div>
  );
}
