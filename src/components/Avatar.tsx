import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackIcon?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6', 
  xl: 'w-8 h-8'
};

// Cache for processed avatar URLs
const avatarCache = new Map<string, string>();

// Process Google avatar URL to be less likely to be rate-limited
const processGoogleAvatarUrl = (url: string): string => {
  if (!url.includes('googleusercontent.com')) return url;
  
  // Remove size parameters and add proper ones
  const cleanUrl = url.split('=')[0];
  const size = sizeClasses.sm.includes('w-6') ? '96' : '128';
  return `${cleanUrl}=s${size}-c`;
};

// Download and cache avatar to prevent repeated requests
const downloadAndCacheAvatar = async (url: string): Promise<string> => {
  if (avatarCache.has(url)) {
    return avatarCache.get(url)!;
  }

  try {
    const processedUrl = processGoogleAvatarUrl(url);
    const response = await fetch(processedUrl, {
      mode: 'cors',
      cache: 'force-cache'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch avatar');
    }
    
    const blob = await response.blob();
    const cachedUrl = URL.createObjectURL(blob);
    avatarCache.set(url, cachedUrl);
    return cachedUrl;
  } catch (error) {
    console.warn('Failed to cache avatar:', error);
    return url; // Fall back to original URL
  }
};

export const Avatar = ({ 
  src, 
  alt = 'User', 
  size = 'md', 
  className = '', 
  fallbackIcon = true 
}: AvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setProcessedSrc(null);
      setImageError(false);
      setImageLoading(false);
      return;
    }

    setImageLoading(true);
    setImageError(false);

    // For Google URLs, try to cache them
    if (src.includes('googleusercontent.com')) {
      downloadAndCacheAvatar(src)
        .then(cachedUrl => {
          setProcessedSrc(cachedUrl);
          setImageLoading(false);
        })
        .catch(() => {
          setProcessedSrc(src);
          setImageLoading(false);
        });
    } else {
      setProcessedSrc(src);
      setImageLoading(false);
    }
  }, [src]);

  // If no src or image failed to load, show fallback
  if (!processedSrc || imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-muted border border-border flex items-center justify-center ${className}`}>
        {fallbackIcon && <User className={`${iconSizes[size]} text-muted-foreground`} />}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
      <img
        src={processedSrc}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        style={{ display: imageLoading ? 'none' : 'block' }}
      />
      {imageLoading && (
        <div className="w-full h-full bg-muted border border-border flex items-center justify-center">
          <User className={`${iconSizes[size]} text-muted-foreground`} />
        </div>
      )}
    </div>
  );
};
