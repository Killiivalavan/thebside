import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

type CreateListInput = { name: string; description?: string | null };
type UpdateListInput = { list_id: string; name?: string; description?: string | null };
type DeleteListInput = { list_id: string };

async function invoke<T>(fn: string, body?: any): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) throw new Error(error.message);
  return data as T;
}

export function useMyLists(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['my-lists', page, limit],
    queryFn: () => invoke<{ lists: any[]; total: number; page: number; limit: number }>('get-my-lists', { page, limit }),
  });
}

export function useListById(list_id: string) {
  return useQuery({
    queryKey: ['list', list_id],
    queryFn: () => invoke<{ list: any }>('get-list', { list_id }),
    enabled: !!list_id,
  });
}

export function useCreateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateListInput) => invoke<{ list: any }>('create-list', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-lists'] });
    },
  });
}

export function useUpdateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateListInput) => invoke<{ list: any }>('update-list', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-lists'] });
    },
  });
}

export function useDeleteList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteListInput) => invoke<{ success: boolean }>('delete-list', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-lists'] });
    },
  });
}


