-- Lists Schema Updates and RLS Policies
-- Adds constraints, indexes, and RLS policies for the lists feature

-- Add unique constraint on list names per user
ALTER TABLE lists ADD CONSTRAINT lists_user_id_name_unique UNIQUE (user_id, name);

-- Add unique constraint to prevent duplicate items in same list
ALTER TABLE list_items ADD CONSTRAINT list_items_list_item_unique UNIQUE (list_id, item_id, item_type);

-- Add indexes for performance
CREATE INDEX idx_lists_user_created ON lists (user_id, created_at DESC);
CREATE INDEX idx_list_items_list_added ON list_items (list_id, added_at DESC);

-- RLS Policies for lists table
-- Everyone can read all lists (public lists)
CREATE POLICY "Users can read all lists" ON lists FOR SELECT USING (true);

-- Only owners can create, update, or delete their own lists
CREATE POLICY "Users can manage own lists" ON lists FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for list_items table
-- Everyone can read all list items (public lists)
CREATE POLICY "Users can read all list items" ON list_items FOR SELECT USING (true);

-- Only list owners can create, update, or delete items in their lists
CREATE POLICY "Users can manage own list items" ON list_items FOR ALL USING (
  auth.uid() = (SELECT user_id FROM lists WHERE id = list_id)
);
