export interface Episode {
  title: string;
  file: string;
  download:string;
  
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

export interface Serie {
  id: string;
  title: string;
  year: number;
  description: string;
  trailer: string;
  thumbnail: string;
  genre: string;
  seasons: Season[];
  isNew:boolean
}