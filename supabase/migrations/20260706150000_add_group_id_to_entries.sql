ALTER TABLE entries ADD COLUMN group_id uuid NULL;
CREATE INDEX entries_group_id_idx ON entries(group_id);
