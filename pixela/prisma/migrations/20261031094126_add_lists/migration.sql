-- CreateEnum
CREATE TYPE "ListVisibility" AS ENUM ('PRIVATE', 'LINK', 'PUBLIC');

-- CreateTable
CREATE TABLE "lists" (
    "list_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" VARCHAR(500),
    "visibility" "ListVisibility" NOT NULL DEFAULT 'PRIVATE',
    "share_id" VARCHAR(24) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lists_pkey" PRIMARY KEY ("list_id")
);

-- CreateTable
CREATE TABLE "list_items" (
    "list_item_id" SERIAL NOT NULL,
    "list_id" INTEGER NOT NULL,
    "item_type" "ItemType" NOT NULL,
    "tmdb_id" BIGINT NOT NULL,
    "position" INTEGER NOT NULL,
    "note" VARCHAR(280),
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "list_items_pkey" PRIMARY KEY ("list_item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lists_share_id_key" ON "lists"("share_id");

-- CreateIndex
CREATE INDEX "lists_user_id_idx" ON "lists"("user_id");

-- CreateIndex
CREATE INDEX "list_items_list_id_position_idx" ON "list_items"("list_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "list_items_list_id_item_type_tmdb_id_key" ON "list_items"("list_id", "item_type", "tmdb_id");

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("list_id") ON DELETE CASCADE ON UPDATE CASCADE;
