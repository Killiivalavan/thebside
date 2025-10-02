import { useParams, Link } from 'react-router-dom';
import { useListById } from '@/hooks/useLists';
import { useListItems } from '@/hooks/useListItems';

const ListPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: listData, isLoading: listLoading, error: listError } = useListById(id || '');
  const { data: itemsData, isLoading: itemsLoading, error: itemsError } = useListItems(id || '', 1, 20);

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
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">{list.name}</h1>
        {list.description && (
          <p className="text-muted-foreground mt-2">{list.description}</p>
        )}
      </div>

      <div className="text-sm text-muted-foreground">by {list.users?.username || 'user'}</div>

      <div className="space-y-4">
        {itemsLoading ? (
          <div className="text-center text-muted-foreground">Loading items...</div>
        ) : itemsError ? (
          <div className="text-center text-red-500">Failed to load items</div>
        ) : (itemsData?.items?.length ?? 0) > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {itemsData!.items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <div className="w-12 h-12 bg-muted rounded-lg" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground capitalize">{item.item_type}</div>
                  <div className="text-foreground">{item.item_id}</div>
                </div>
                {item.item_type === 'album' && (
                  <Link to={`/album/${item.item_id}`} className="text-xs text-primary">open</Link>
                )}
                {item.item_type === 'artist' && (
                  <Link to={`/artist/${item.item_id}`} className="text-xs text-primary">open</Link>
                )}
                {item.item_type === 'track' && (
                  <Link to={`/track/${item.item_id}`} className="text-xs text-primary">open</Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">No music added</div>
        )}
      </div>
    </div>
  );
};

export default ListPage;


