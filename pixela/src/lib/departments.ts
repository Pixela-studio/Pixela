/** Oficios de TMDB (`known_for_department`) en castellano. */
export const DEPARTMENTS: Record<string, string> = {
  Acting: "Interpretación",
  Directing: "Dirección",
  Writing: "Guion",
  Production: "Producción",
  Camera: "Fotografía",
  Editing: "Montaje",
  Sound: "Sonido",
  Art: "Dirección de arte",
  "Costume & Make-Up": "Vestuario y maquillaje",
  "Visual Effects": "Efectos visuales",
  Crew: "Equipo",
  Lighting: "Iluminación",
  Creator: "Creación",
};

/** Oficio en castellano; si TMDB añade uno nuevo, se muestra tal cual. */
export const departmentName = (department: string | undefined): string =>
  department ? DEPARTMENTS[department] ?? department : "";

/** Puestos concretos de `crew` en castellano. */
const JOBS: Record<string, string> = {
  Director: "Dirección",
  "Co-Director": "Codirección",
  Screenplay: "Guion",
  Writer: "Guion",
  Teleplay: "Guion",
  Story: "Argumento",
  Novel: "Novela original",
  Characters: "Personajes",
  Creator: "Creación",
  Producer: "Producción",
  "Executive Producer": "Producción ejecutiva",
  "Co-Producer": "Coproducción",
  "Director of Photography": "Fotografía",
  Editor: "Montaje",
  "Original Music Composer": "Música",
  Music: "Música",
  "Casting Director": "Casting",
  "Production Design": "Diseño de producción",
  "Costume Design": "Vestuario",
};

export const jobName = (job: string | undefined): string => (job ? JOBS[job] ?? job : "");
