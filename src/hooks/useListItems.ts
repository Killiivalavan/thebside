import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

type GetListItemsInput = { list_id: string; page?: number; limit?: number };
type AddListItemInput = { list_id: string; item_id: string; item_type: 'album' | 'track' | 'artist' };
type RemoveListItemInput = { list_id: string; item_id: string; item_type: 'album' | 'track' | 'artist' };

async function invoke<T>(fn: string, body?: any): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) throw new Error(error.message);
  return data as T;
}

export function useListItems(list_id: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['list-items', list_id, page, limit],
    queryFn: () => invoke<{ items: any[]; total: number; page: number; limit: number }>('get-list-items', { list_id, page, limit }),
    enabled: !!list_id,
  });
}

export function useAddListItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddListItemInput) => invoke<{ item: any }>('add-list-item', input),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['list-items', vars.list_id] });
      qc.invalidateQueries({ queryKey: ['my-lists'] });
    },
  });
}

export function useRemoveListItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RemoveListItemInput) => invoke<{ success: boolean }>('remove-list-item', input),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['list-items', vars.list_id] });
      qc.invalidateQueries({ queryKey: ['my-lists'] });
    },
  });
}


