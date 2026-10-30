import { MAL_URL } from "@/data/about";
import { MediaProfileTag } from "./MediaShelf";
import PhysicalMediaCollection, {
  type PhysicalCollectionProps,
} from "./PhysicalMediaCollection";
import { mediaCatalog } from "./media-catalog";

export default function AnimeArchive(
  props: Omit<PhysicalCollectionProps, "kind">
) {
  return (
    <div className="media-archive anime-archive">
      <PhysicalMediaCollection
        {...props}
        profile={
          <MediaProfileTag
            href={MAL_URL}
            avatar="https://cdn.myanimelist.net/s/common/userimages/2d156ed4-a2c7-404c-8237-9e3e17ad6b97_225w?s=209842a80b1919fcd1ea40dbf2e6ad08"
            name="PEKKIMORI_"
            detail="MyAnimeList"
          />
        }
        kind="anime"
        items={mediaCatalog("anime", props.lang)}
      />
    </div>
  );
}
