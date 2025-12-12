-- Add 'playlist' to item_type enum to allow reviewing playlists
ALTER TYPE public.item_type ADD VALUE IF NOT EXISTS 'playlist';

-- Add 'playlist' to list_item_type enum to allow adding playlists to lists
ALTER TYPE public.list_item_type ADD VALUE IF NOT EXISTS 'playlist';
