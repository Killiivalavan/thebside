import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

type Item = { item_id: string; item_type: string };
type ItemOutput = { item_id: string; item_type: string; name: string; image_url?: string; primary_artist?: string };

export function useItemsMetadata(items: Item[]) {
  return useQuery({
    queryKey: ['items-metadata', items?.map(i => `${i.item_type}:${i.item_id}`).sort().join('|')],
    queryFn: async () => {
      if (!items || items.length === 0) return new Map<string, ItemOutput>();
      const { data, error } = await supabase.functions.invoke('get-items-metadata', {
        body: { items },
      });
      if (error) throw new Error(error.message);
      const map = new Map<string, ItemOutput>();
      for (const it of (data?.data || []) as ItemOutput[]) {
        map.set(`${it.item_type}:${it.item_id}`, it);
      }
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });
}


