import { Link } from "react-router-dom";

interface AlbumCardProps {
  id: string;
  title: string;
  artist: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
}

export const AlbumCard = ({ id, title, artist, imageUrl, size = "md" }: AlbumCardProps) => {
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-48 h-48"
  };

  return (
    <div className="group">
      <Link to={`/album/${id}`} className="block">
        <div className={`${sizeClasses[size]} bg-muted border-2 border-border rounded-lg mb-2 overflow-hidden transition-all hover:border-primary/50`}>
          {imageUrl ? (
            <img src={imageUrl} alt={`${title} by ${artist}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-xs">No Cover</span>
            </div>
          )}
        </div>
      </Link>
      
      {size !== "sm" && (
        <div className="text-sm">
          <Link 
            to={`/album/${id}`} 
            className="font-medium text-foreground hover:text-primary transition-colors block truncate"
          >
            {title}
          </Link>
          <Link 
            to={`/artist/${artist.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-muted-foreground hover:text-foreground transition-colors block truncate"
          >
            {artist}
          </Link>
        </div>
      )}
    </div>
  );
};