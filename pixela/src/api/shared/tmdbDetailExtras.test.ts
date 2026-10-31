import { describe, expect, it } from "vitest";
import {
  countryNames,
  crewOf,
  directorsOf,
  languageName,
  mapRegionProviders,
  mapVideos,
  movieCertification,
  seriesStatus,
  tvCertification,
} from "./tmdbDetailExtras";

describe("plataformas", () => {
  it("rellena el tipo y no mezcla alquiler con compra", () => {
    const { proveedores, proveedoresUrl } = mapRegionProviders({
      link: "https://www.themoviedb.org/movie/550/watch?locale=ES",
      flatrate: [{ provider_id: 8, provider_name: "Netflix", logo_path: "/n.jpg" }],
      rent: [{ provider_id: 2, provider_name: "Apple TV", logo_path: null }],
      buy: [{ provider_id: 2, provider_name: "Apple TV", logo_path: null }],
    });
    expect(proveedores.map((p) => `${p.nombre}:${p.tipo}`)).toEqual([
      "Netflix:flatrate",
      "Apple TV:rent",
      "Apple TV:buy",
    ]);
    expect(proveedores[0].logo).toContain("/w92/");
    expect(proveedoresUrl).toContain("themoviedb.org");
  });

  it("sin datos de España, lista vacía", () => {
    expect(mapRegionProviders(undefined).proveedores).toEqual([]);
  });
});

describe("edad recomendada", () => {
  it("prefiere la de cine y normaliza «A» a «TP»", () => {
    expect(
      movieCertification({
        results: [
          { iso_3166_1: "US", release_dates: [{ certification: "R", type: 3 }] },
          { iso_3166_1: "ES", release_dates: [{ certification: "", type: 1 }, { certification: "18", type: 3 }] },
        ],
      }),
    ).toBe("18");
    expect(tvCertification({ results: [{ iso_3166_1: "ES", rating: "A" }] })).toBe("TP");
    expect(tvCertification({ results: [] })).toBeUndefined();
  });
});

describe("equipo", () => {
  const crew = [
    { id: 1, name: "Joel Coen", job: "Director" },
    { id: 2, name: "Ethan Coen", job: "Director" },
    { id: 1, name: "Joel Coen", job: "Screenplay" },
    { id: 3, name: "Roger Deakins", job: "Director of Photography" },
  ];

  it("todos los directores, sin repetir", () => {
    expect(directorsOf(crew).map((d) => d.nombre)).toEqual(["Joel Coen", "Ethan Coen"]);
  });

  it("ficha técnica por oficio en castellano", () => {
    expect(crewOf(crew)).toEqual([
      { id: 1, nombre: "Joel Coen", oficio: "Guion" },
      { id: 3, nombre: "Roger Deakins", oficio: "Fotografía" },
    ]);
  });
});

describe("vídeos", () => {
  it("castellano primero, VO etiquetada y solo YouTube", () => {
    const videos = mapVideos(
      [
        { key: "a", site: "YouTube", type: "Trailer", iso_639_1: "en", name: "Trailer" },
        { key: "b", site: "YouTube", type: "Trailer", iso_639_1: "es", name: "Tráiler" },
        { key: "c", site: "Vimeo", type: "Trailer", iso_639_1: "es" },
      ],
      "en",
    );
    expect(videos.map((v) => `${v.key}:${v.idioma}`)).toEqual(["b:Castellano", "a:VO"]);
  });
});

describe("idioma, país y estado", () => {
  it("en castellano", () => {
    expect(languageName("ja")).toBe("japonés");
    expect(languageName("xx")).toBeUndefined();
    expect(countryNames(["US", "DE", "US"])).toEqual(["Estados Unidos", "Alemania"]);
    expect(seriesStatus("Ended")).toBe("Finalizada");
  });
});
