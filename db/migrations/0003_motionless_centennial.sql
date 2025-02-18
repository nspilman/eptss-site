-- Create sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS mailing_list_id_seq;

DO $$ BEGIN
 -- Only proceed if id is still a UUID
 IF EXISTS (
   SELECT 1
   FROM information_schema.columns
   WHERE table_name = 'mailing_list'
   AND column_name = 'id'
   AND data_type = 'uuid'
 ) THEN
   -- Add new bigint column
   ALTER TABLE "mailing_list" ADD COLUMN new_id bigint;
   
   -- Update new_id with row numbers
   UPDATE "mailing_list" SET new_id = t.row_num
   FROM (
     SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
     FROM "mailing_list"
   ) t
   WHERE "mailing_list".id = t.id;
   
   -- Drop the primary key constraint
   ALTER TABLE "mailing_list" DROP CONSTRAINT "mailing_list_pkey";
   
   -- Drop the old id column
   ALTER TABLE "mailing_list" DROP COLUMN id;
   
   -- Rename new_id to id
   ALTER TABLE "mailing_list" RENAME COLUMN new_id TO id;
   
   -- Make id the primary key
   ALTER TABLE "mailing_list" ADD PRIMARY KEY (id);
   
   -- Update sequence value and set default
   PERFORM setval('mailing_list_id_seq', COALESCE((SELECT MAX(id) FROM "mailing_list"), 1));
   ALTER TABLE "mailing_list" ALTER COLUMN id SET DEFAULT nextval('mailing_list_id_seq');
 END IF;
END $$;