-- CreateTable
CREATE TABLE "episode_watches" (
    "episode_watch_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tmdb_id" BIGINT NOT NULL,
    "season" INTEGER NOT NULL,
    "episode" INTEGER NOT NULL,
    "watched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "episode_watches_pkey" PRIMARY KEY ("episode_watch_id")
);

-- CreateIndex
CREATE INDEX "episode_watches_user_id_tmdb_id_idx" ON "episode_watches"("user_id", "tmdb_id");

-- CreateIndex
CREATE UNIQUE INDEX "episode_watches_user_id_tmdb_id_season_episode_key" ON "episode_watches"("user_id", "tmdb_id", "season", "episode");

-- AddForeignKey
ALTER TABLE "episode_watches" ADD CONSTRAINT "episode_watches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
