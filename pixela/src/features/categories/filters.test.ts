import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTERS,
  countActiveFilters,
  readFilters,
  toDiscoverParams,
  writeFilters,
  type CatalogFilters,
} from "./filters";

const roundTrip = (filters: CatalogFilters) => {
  const params = new URLSearchParams();
  writeFilters(params, filters);
  return readFilters(params);
};

describe("filtros en la URL", () => {
  it("ida y vuelta sin perder nada", () => {
    const filters: CatalogFilters = {
      familia: true,
      misPlataformas: true,
      edad: "12",
      duracion: 90,
      idioma: "ko",
      decada: 1990,
      votos: 1000,
    };
    expect(roundTrip(filters)).toEqual(filters);
  });

  it("sin filtros no escribe nada", () => {
    const params = new URLSearchParams();
    writeFilters(params, EMPTY_FILTERS);
    expect(params.toString()).toBe("");
  });

  it("descarta valores que no están en la lista", () => {
    const filters = readFilters(new URLSearchParams("edad=18&idioma=xx&decada=1993&votos=7"));
    expect(filters).toEqual(EMPTY_FILTERS);
    expect(countActiveFilters(filters)).toBe(0);
  });
});

describe("parámetros de TMDB", () => {
  it("«Para ver en familia» en películas: géneros, edad y duración", () => {
    const params = toDiscoverParams({ ...EMPTY_FILTERS, familia: true }, "movies", { platformIds: [] });
    expect(params).toMatchObject({
      with_genres: "10751|16",
      certification_country: "ES",
      "certification.lte": "7",
      "with_runtime.lte": "110",
    });
  });

  it("con un género elegido, la familia no añade géneros", () => {
    const params = toDiscoverParams({ ...EMPTY_FILTERS, familia: true }, "movies", {
      genreId: 27,
      platformIds: [],
    });
    expect(params.with_genres).toBe("27");
  });

  it("la edad no se manda en series: TMDB no la admite", () => {
    const params = toDiscoverParams({ ...EMPTY_FILTERS, edad: "12" }, "series", { platformIds: [] });
    expect(params["certification.lte"]).toBeUndefined();
  });

  it("década con el campo de fecha de cada tipo", () => {
    expect(
      toDiscoverParams({ ...EMPTY_FILTERS, decada: 1990 }, "movies", { platformIds: [] }),
    ).toMatchObject({ "primary_release_date.gte": "1990-01-01", "primary_release_date.lte": "1999-12-31" });
    expect(
      toDiscoverParams({ ...EMPTY_FILTERS, decada: 1990 }, "series", { platformIds: [] }),
    ).toMatchObject({ "first_air_date.gte": "1990-01-01", "first_air_date.lte": "1999-12-31" });
  });

  it("mis plataformas: solo si hay alguna elegida", () => {
    const on = { ...EMPTY_FILTERS, misPlataformas: true };
    expect(toDiscoverParams(on, "movies", { platformIds: [] }).with_watch_providers).toBeUndefined();
    expect(toDiscoverParams(on, "movies", { platformIds: [8, 337] })).toMatchObject({
      with_watch_providers: "8|337",
      watch_region: "ES",
    });
  });
});
