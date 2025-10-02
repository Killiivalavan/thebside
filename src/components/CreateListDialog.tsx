import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateList } from "@/hooks/useLists";
import { useAddListItem } from "@/hooks/useListItems";

type AutoAddItem = { item_id: string; item_type: "album" | "track" | "artist" };

interface CreateListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (list: any) => void;
  initialName?: string;
  initialDescription?: string;
  autoAddItem?: AutoAddItem;
}

export default function CreateListDialog({ open, onOpenChange, onCreated, initialName = "", initialDescription = "", autoAddItem }: CreateListDialogProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState<string | null>(null);

  const createList = useCreateList();
  const addItem = useAddListItem();

  useEffect(() => {
    if (open) {
      setName(initialName);
      setDescription(initialDescription);
      setError(null);
    }
  }, [open, initialName, initialDescription]);

  const handleCreate = async () => {
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("List name is required");
      return;
    }
    try {
      const { list } = await createList.mutateAsync({ name: trimmedName, description: description.trim() || undefined } as any);
      if (autoAddItem) {
        await addItem.mutateAsync({ list_id: list.id, item_id: autoAddItem.item_id, item_type: autoAddItem.item_type });
      }
      onCreated?.(list);
      onOpenChange(false);
    } catch (e: any) {
      setError(e?.message || "Failed to create list");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new list</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="List name" value={name} onChange={(e) => setName(e.target.value)} className="bg-transparent" />
          <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-transparent" />
          {error && <div className="text-sm text-red-500">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={createList.isPending || addItem.isPending}>Cancel</Button>
          <Button onClick={handleCreate} disabled={createList.isPending || addItem.isPending || !name.trim()}>
            {createList.isPending || addItem.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


