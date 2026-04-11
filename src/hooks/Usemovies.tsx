import { useEffect, useState } from "react";

export const useMovies = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch(
      "https://archive.org/advancedsearch.php?q=mediatype:(movies)&output=json&rows=20"
    )
      .then(res => res.json())
      .then(data => {
        const mapped = data.response.docs.map((item: any) => ({
          id: item.identifier,
          title: item.title,
          year: item.year,
          description: item.description,
          videoUrl: `https://archive.org/download/${item.identifier}/${item.identifier}.mp4`,
          thumbnail: `https://archive.org/services/img/${item.identifier}`,
          genre: "Classic",
        }));

        setMovies(mapped);
      });
  }, []);

  return movies;
};