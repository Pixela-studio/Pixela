-- CreateTable
CREATE TABLE "diary_entries" (
    "diary_entry_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "item_type" "ItemType" NOT NULL,
    "tmdb_id" BIGINT NOT NULL,
    "watched_on" DATE NOT NULL,
    "rating" DECIMAL(3,1),
    "note" VARCHAR(500),
    "rewatch" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diary_entries_pkey" PRIMARY KEY ("diary_entry_id")
);

-- CreateIndex
CREATE INDEX "diary_entries_user_id_watched_on_idx" ON "diary_entries"("user_id", "watched_on");

-- CreateIndex
CREATE INDEX "diary_entries_user_id_item_type_tmdb_id_idx" ON "diary_entries"("user_id", "item_type", "tmdb_id");

-- AddForeignKey
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
