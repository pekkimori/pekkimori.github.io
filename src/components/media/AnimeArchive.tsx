import { Play } from "lucide-react";
import { ANIME, MAL_URL } from "@/data/about";
import { ANIME_PT } from "@/data/about-pt";
import { ANIME_TAPES } from "@/data/media";
import { MediaProfileTag } from "./MediaShelf";
import PhysicalMediaCollection, {
  type PhysicalCollectionProps,
} from "./PhysicalMediaCollection";
import { mediaCatalog } from "./media-catalog";

export default function AnimeArchive(
  props: Omit<PhysicalCollectionProps, "kind">
) {
  const pt = props.lang === "pt",
    anime = pt ? ANIME_PT : ANIME;
  const item = props.deck.selected === null ? null : anime[props.deck.selected];
  const tape =
    props.deck.selected === null ? null : ANIME_TAPES[props.deck.selected];
  return (
    <div className="media-archive anime-archive">
      <MediaProfileTag
        href={MAL_URL}
        avatar="https://cdn.myanimelist.net/s/common/userimages/2d156ed4-a2c7-404c-8237-9e3e17ad6b97_225w?s=209842a80b1919fcd1ea40dbf2e6ad08"
        name="PEKKIMORI_"
        detail="MyAnimeList"
      />
      <PhysicalMediaCollection
        {...props}
        kind="anime"
        items={mediaCatalog("anime", props.lang)}
      />
      {item && tape && (
        <section className="anime-notes" key={item.title}>
          <div className="media-eyebrow">
            {pt ? "ANOTAÇÕES NA CAPA" : "NOTES ON THE SLEEVE"}
            <span>{pt ? "Contém spoilers" : "Contains spoilers"}</span>
          </div>
          <h3>{item.title}</h3>
          {[item.tagline].flat().map((quote, i) => (
            <blockquote
              key={quote}
              className={i === tape.quote ? "is-scene-quote" : ""}
            >
              <span className="quote-index">
                {String(i + 1).padStart(2, "0")}
                {i === tape.quote && (
                  <Play
                    size={10}
                    aria-label={pt ? "Citação da cena" : "Scene quote"}
                  />
                )}
              </span>
              <p>{quote}</p>
            </blockquote>
          ))}
        </section>
      )}
    </div>
  );
}
