import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useUpdateList, useDeleteList } from '@/hooks/useLists';
import { useItemsMetadata } from '@/hooks/useItemsMetadata';
import { useMemo } from 'react';
import { useListById } from '@/hooks/useLists';
import { useListItems } from '@/hooks/useListItems';

const ListPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: listData, isLoading: listLoading, error: listError } = useListById(id || '');
  const { data: itemsData, isLoading: itemsLoading, error: itemsError } = useListItems(id || '', 1, 20);
  const updateList = useUpdateList();
  const deleteList = useDeleteList();

  const itemsForMetadata = useMemo(() => {
    const list = itemsData?.items || [];
    return list.map((it: any) => ({ item_id: it.item_id, item_type: it.item_type }));
  }, [itemsData]);
  const { data: metadataMap } = useItemsMetadata(itemsForMetadata as any);

  if (!id) {
    return <div className="text-center text-red-500">List not found</div>;
  }

  if (listLoading) {
    return (
      <div className="text-center text-muted-foreground">Loading list...</div>
    );
  }

  if (listError || !listData?.list) {
    return <div className="text-center text-red-500">List not found</div>;
  }

  const list = listData.list;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div className="text-center flex-1">
          <h1 className="text-2xl font-semibold text-foreground">{list.name}</h1>
          {list.description && (
            <p className="text-muted-foreground mt-2">{list.description}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="List menu">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={async () => {
              const nextName = window.prompt('Rename list', list.name)?.trim();
              if (!nextName) return;
              try { await updateList.mutateAsync({ list_id: list.id, name: nextName }); } catch {}
            }}>Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={async () => {
              const ok = window.confirm('Delete this list?');
              if (!ok) return;
              try { await deleteList.mutateAsync({ list_id: list.id }); window.history.back(); } catch {}
            }}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="text-sm text-muted-foreground">by {list.users?.username || 'user'}</div>

      <div className="space-y-4">
        {itemsLoading ? (
          <div className="text-center text-muted-foreground">Loading items...</div>
        ) : itemsError ? (
          <div className="text-center text-red-500">Failed to load items</div>
        ) : (itemsData?.items?.length ?? 0) > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {itemsData!.items.map((item: any) => {
              const href = item.item_type === 'album' ? `/album/${item.item_id}` : item.item_type === 'artist' ? `/artist/${item.item_id}` : `/track/${item.item_id}`;
              const meta = metadataMap?.get(`${item.item_type}:${item.item_id}`);
              return (
                <Link key={item.id} to={href} className="group border border-border rounded-lg hover:border-primary/50 transition-colors flex items-center gap-3 p-3 md:block md:p-2 md:pb-3">
                  <div className="w-12 h-12 md:w-full md:h-40 bg-muted rounded-lg overflow-hidden md:mb-2">
                    {meta?.image_url && <img src={meta.image_url} alt={meta?.name || item.item_type} className="w-full h-full object-contain" />}
                  </div>
                  <div className="flex-1 min-w-0 md:text-center">
                    <div className="text-xs text-muted-foreground capitalize">{item.item_type}</div>
                    <div className="text-foreground truncate">{meta?.name || item.item_id}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">No music added</div>
        )}
      </div>
    </div>
  );
};

export default ListPage;


