import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  fallbackIcon?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-24 h-24'
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6', 
  xl: 'w-8 h-8',
  '2xl': 'w-12 h-12'
};

// Build a Google avatar URL with an explicit size to reduce dynamic resizing/rate-limits
const buildGoogleAvatarUrl = (url: string, size: 'sm' | 'md' | 'lg' | 'xl' | '2xl'): string => {
  if (!url.includes('googleusercontent.com')) return url;
  const pixelSize = size === 'sm' ? 64 : size === 'md' ? 96 : size === 'lg' ? 128 : size === 'xl' ? 192 : 256;
  const cleanUrl = url.split('=')[0];
  return `${cleanUrl}=s${pixelSize}-c`;
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

    const finalUrl = buildGoogleAvatarUrl(src, size);
    setProcessedSrc(finalUrl);
    setImageLoading(false);
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
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
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
