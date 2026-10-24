-- CreateIndex
CREATE INDEX "reviews_item_type_tmdb_id_created_at_idx" ON "reviews"("item_type", "tmdb_id", "created_at" DESC);
