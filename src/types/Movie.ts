export interface Episode {
  title: string;
  file: string;
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  description: string;
  trailer: string;
  thumbnail: string;
  genre: string;
  seasons: Season[];
}