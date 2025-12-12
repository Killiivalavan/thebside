import { Link } from "react-router-dom";

interface AlbumCardProps {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  type?: "album" | "playlist";
}

export const AlbumCard = ({ id, title, artist, artistId, imageUrl, size = "md", type = "album" }: AlbumCardProps) => {
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-48 h-48"
  };

  const linkPath = type === 'playlist' ? `/playlist/${id}` : `/album/${id}`;

  return (
    <div className="group min-w-0">
      <Link to={linkPath} className="block">
        <div className={`${sizeClasses[size]} bg-muted border-2 border-border rounded-lg mb-2 overflow-hidden transition-all hover:border-primary/50 mx-auto`}>
          {imageUrl ? (
            <img src={imageUrl} alt={`${title} by ${artist}`} className="w-full h-full object-cover object-center" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-xs">No Cover</span>
            </div>
          )}
        </div>
      </Link>

      {size !== "sm" && (
        <div className="text-sm min-w-0 text-center">
          <Link
            to={linkPath}
            className="font-medium text-foreground hover:text-primary transition-colors block truncate"
          >
            {title}
          </Link>
          {artistId ? (
            <Link
              to={`/artist/${artistId}`}
              className="text-muted-foreground hover:text-foreground transition-colors block truncate"
            >
              {artist}
            </Link>
          ) : (
            <span className="text-muted-foreground block truncate">
              {artist}
            </span>
          )}
        </div>
      )}
    </div>
  );
};