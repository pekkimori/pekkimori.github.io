import { SPOTIFY_URL } from "@/data/about";
import { MediaProfileTag } from "./MediaShelf";
import PhysicalMediaCollection, {
  type PhysicalCollectionProps,
} from "./PhysicalMediaCollection";
import { mediaCatalog } from "./media-catalog";

export default function MusicArchive(
  props: Omit<PhysicalCollectionProps, "kind">
) {
  return (
    <div className="media-archive music-archive">
      <PhysicalMediaCollection
        {...props}
        profile={
          <MediaProfileTag
            href={SPOTIFY_URL}
            avatar="https://i.scdn.co/image/ab6775700000ee8565cb4a1d81ab0158b3103d24"
            name="PacWaffle"
            detail="Spotify"
          />
        }
        kind="music"
        items={mediaCatalog("music", props.lang)}
      />
    </div>
  );
}
