import { Link } from "react-router-dom";
import { Play } from "lucide-react";

interface TrackItemProps {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  duration: string;
  albumId?: string;
}

export const TrackItem = ({ id, title, artist, artistId, duration, albumId }: TrackItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-accent transition-colors group">
      <div className="flex items-center space-x-3 flex-1">
        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
          <Play className="w-4 h-4 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <Link 
            to={`/track/${id}`}
            className="font-medium text-foreground hover:text-primary transition-colors block truncate"
          >
            {title}
          </Link>
          {artistId ? (
            <Link 
              to={`/artist/${artistId}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors block truncate"
            >
              {artist}
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground block truncate">
              {artist}
            </span>
          )}
        </div>
      </div>
      
      <span className="text-sm text-muted-foreground">{duration}</span>
    </div>
  );
};