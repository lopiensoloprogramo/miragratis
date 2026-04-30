export interface Opcion {
  title: string;
  file: string;
   download:string;
   
}


export interface Movie{
  id: string;
  title: string;
  year: number;
  description: string;
  trailer: string;
  thumbnail: string;
  genre: string;
  opcion:Opcion[]

}