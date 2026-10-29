import { STEAM_PROFILE_URL } from "@/data/about";
import { MediaProfileTag } from "./MediaShelf";
import PhysicalMediaCollection, {
  type PhysicalCollectionProps,
} from "./PhysicalMediaCollection";
import { mediaCatalog } from "./media-catalog";

export default function GameArchive(
  props: Omit<PhysicalCollectionProps, "kind">
) {
  return (
    <div className="media-archive game-archive">
      <MediaProfileTag
        href={STEAM_PROFILE_URL}
        avatar="https://avatars.fastly.steamstatic.com/ae540d37eef3cfcff194166b7325340a698fe0e0_medium.jpg"
        name="PEKKIモリ"
        detail={
          props.lang === "pt"
            ? "Steam · Desde 2014"
            : "Steam · Member since 2014"
        }
      />
      <PhysicalMediaCollection
        {...props}
        kind="games"
        items={mediaCatalog("games", props.lang)}
      />
    </div>
  );
}
