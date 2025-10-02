import { Link } from "react-router-dom";
import { Play } from "lucide-react";

interface TrackItemProps {
  id: string;
  title: string;
  // legacy single-artist props (backward compat):
  artist?: string;
  artistId?: string;
  // new multi-artist prop:
  artists?: { id: string; name: string }[];
  duration: string;
  albumId?: string;
}

export const TrackItem = ({ id, title, artist, artistId, artists, duration, albumId }: TrackItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors group">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
          <Play className="w-4 h-4 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <Link 
            to={`/track/${id}`}
            className="font-medium text-foreground hover:text-primary transition-colors block w-full max-w-full truncate"
          >
            {title}
          </Link>
          {Array.isArray(artists) && artists.length > 0 ? (
            <div className="text-sm text-muted-foreground w-full max-w-full truncate">
              {artists.map((a, idx) => (
                <span key={a.id || `${a.name}-${idx}`}>
                  {idx > 0 && <span>, </span>}
                  {a.id ? (
                    <Link
                      to={`/artist/${a.id}`}
                      aria-label={`View artist ${a.name}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {a.name}
                    </Link>
                  ) : (
                    <span>{a.name}</span>
                  )}
                </span>
              ))}
            </div>
          ) : artistId ? (
            <Link 
              to={`/artist/${artistId}`}
              aria-label={`View artist ${artist || 'Artist'}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors block w-full max-w-full truncate"
            >
              {artist}
            </Link>
          ) : artist ? (
            <span className="text-sm text-muted-foreground block w-full max-w-full truncate">
              {artist}
            </span>
          ) : null}
        </div>
      </div>
      
      <span className="text-sm text-muted-foreground">{duration}</span>
    </div>
  );
};