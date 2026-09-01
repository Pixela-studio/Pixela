import { fetchFromTmdb } from '@/lib/tmdb';

export interface ActorDetails {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  known_for_department: string;
  combined_credits?: {
    cast: {
      id: number;
      title?: string;
      name?: string;
      media_type: 'movie' | 'tv';
      character: string;
      poster_path: string | null;
      backdrop_path?: string | null;
      release_date?: string;
      first_air_date?: string;
      vote_average: number;
    }[];
  };
}

export async function getActorDetails(id: string): Promise<ActorDetails> {
  const data = await fetchFromTmdb<ActorDetails>(`person/${id}`, {
    append_to_response: 'combined_credits'
  });
  return data;
}
