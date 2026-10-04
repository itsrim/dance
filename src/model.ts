export const STORAGE_KEY = "dance-carnet-v1";

export const COLORS = {
  clay: "#c4543a",
  teal: "#1f8a70",
  sky: "#3d7ea6",
  lilac: "#7c6bc4",
  gold: "#e0a106",
  ink: "#2a1420",
} as const;

export type ColorName = keyof typeof COLORS;

export type FigureLevel = "vu" | "cours" | "tenu";

export type CatalogFigure = {
  id: string;
  name: string;
  group: string;
  hint: string;
};

export type Discipline = {
  id: string;
  name: string;
  color: ColorName;
  pitch: string;
  rhythm: string[];
  figures: CatalogFigure[];
};

export type Student = {
  id: string;
  name: string;
  disciplineIds: string[];
};

export type Slot = {
  id: string;
  disciplineId: string;
  weekday: number;
  start: string;
  end: string;
  label: string;
};

export type LessonFigure = {
  id: string;
  catalogId?: string;
  name: string;
  group: string;
  hint: string;
  level: FigureLevel;
};

export type LinkItem = {
  id: string;
  label: string;
  url: string;
};

export type Rating = {
  studentId: string;
  stars: number;
  comment: string;
};

export type Lesson = {
  id: string;
  date: string;
  slotId?: string;
  disciplineId: string;
  title: string;
  figures: LessonFigure[];
  learned: string;
  homework: string;
  links: LinkItem[];
  appreciation: string;
  classRatings: Rating[];
  studentRatings: Rating[];
};

export type ExamKind = "controle" | "examen" | "passage";

export type Grade = {
  studentId: string;
  score: number | null;
  appreciation: string;
};

export type Exam = {
  id: string;
  disciplineId: string;
  date: string;
  title: string;
  kind: ExamKind;
  grades: Grade[];
};

export type Carnet = {
  disciplines: Discipline[];
  students: Student[];
  slots: Slot[];
  lessons: Lesson[];
  exams: Exam[];
};

export const LEVELS: { id: FigureLevel; label: string }[] = [
  { id: "vu", label: "Découvert" },
  { id: "cours", label: "En cours" },
  { id: "tenu", label: "Tenu" },
];

export const EXAM_KINDS: { id: ExamKind; label: string }[] = [
  { id: "controle", label: "Contrôle" },
  { id: "examen", label: "Examen" },
  { id: "passage", label: "Passage de figure" },
];

export const WEEKDAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

type Template = {
  name: string;
  color: ColorName;
  pitch: string;
  rhythm: string[];
  figures: Omit<CatalogFigure, "id">[];
};

export const TEMPLATES: Record<string, Template> = {
  "roller-dance": {
    name: "Roller dance",
    color: "clay",
    pitch: "Comme un cours de salsa, sur patins : un socle, des figures, puis la musique.",
    rhythm: [
      "Roulage et freins",
      "Reprise de la figure précédente",
      "Une figure nouvelle, lente puis sur le temps",
      "Un enchaînement court",
      "Un devoir de dix minutes ou une vidéo",
    ],
    figures: [
      { group: "Socle", name: "Posture", hint: "Genoux souples, regard loin, poids au milieu du patin." },
      { group: "Socle", name: "Poussée", hint: "Pousser sur le côté. On ne marche pas avec des patins." },
      { group: "Socle", name: "Roulage", hint: "Enchaîner sans à-coups, les deux pieds." },
      { group: "Socle", name: "Frein en T", hint: "Le patin libre se pose en travers, derrière." },
      { group: "Socle", name: "Frein en V", hint: "Les deux talons s'écartent, les pointes restent proches." },
      { group: "Socle", name: "Changement de pied", hint: "Passer le poids sans casser le roulage." },
      { group: "Figures", name: "Pas de base", hint: "L'équivalent du pas de base en salsa." },
      { group: "Figures", name: "Croisé devant", hint: "Le patin libre croise par l'avant." },
      { group: "Figures", name: "Croisé derrière", hint: "Le patin libre croise par l'arrière." },
      { group: "Figures", name: "Chassé", hint: "Un pied chasse l'autre, sur le côté." },
      { group: "Figures", name: "Pas de vigne", hint: "Croisé devant, ouvert, croisé derrière." },
      { group: "Figures", name: "Ouverture", hint: "Sortir de la ligne, comme un pas croisé." },
      { group: "Figures", name: "Pivot", hint: "Tourner sur place sans perdre l'équilibre." },
      { group: "Figures", name: "Tour simple", hint: "Un tour, puis reprendre le roulage." },
      { group: "Figures", name: "Stop et reprise", hint: "Freiner net, repartir sur le temps." },
      { group: "Figures", name: "Enchaînement", hint: "Quatre figures tenues sans arrêt." },
      { group: "Musique", name: "Tenir le temps", hint: "Le pas tombe sur le temps, pas à côté." },
      { group: "Musique", name: "Phrase de 8", hint: "Une figure occupe une phrase de huit temps." },
      { group: "Musique", name: "Break", hint: "Marquer l'arrêt ou l'accent de la phrase." },
      { group: "Partenaire", name: "Tenue de main", hint: "Garder le bras souple, sans tirer." },
      { group: "Partenaire", name: "Promenade", hint: "Avancer ensemble sur le même pas." },
      { group: "Partenaire", name: "Tour guidé", hint: "Conduire un tour, puis se retrouver." },
    ],
  },
  salsa: {
    name: "Salsa",
    color: "gold",
    pitch: "Le même carnet, avec les figures de salsa à la place des pas de patin.",
    rhythm: [
      "Échauffement et pas de base",
      "Reprise de la figure précédente",
      "Une figure nouvelle, seul puis à deux",
      "Enchaînement sur une phrase",
      "Devoir : répéter l'enchaînement sur un morceau",
    ],
    figures: [
      { group: "Pas", name: "Pas de base", hint: "Avant, replace, arrière, replace." },
      { group: "Pas", name: "Pas latéral", hint: "Le pas sur le côté, le temps reste le même." },
      { group: "Pas", name: "Mambo", hint: "L'accent tombe sur le temps faible." },
      { group: "Tours", name: "Tour à droite", hint: "Un tour complet, revenir dans le cadre." },
      { group: "Tours", name: "Tour à gauche", hint: "Préparer le bras avant de tourner." },
      { group: "Partenaire", name: "Pas croisé", hint: "Cross body : on échange les places." },
      { group: "Partenaire", name: "Enchufla", hint: "Tour sous le bras, puis on se retrouve." },
      { group: "Partenaire", name: "Dile que no", hint: "Demi-tour et retour dans le cadre." },
      { group: "Partenaire", name: "Sombrero", hint: "Le bras passe au-dessus, sans forcer." },
      { group: "Shine", name: "Shine", hint: "Variation solo, chacun sur le même temps." },
    ],
  },
};

export function uid(): string {
  return crypto.randomUUID();
}

export function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1);
}

export function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function startOfWeek(date: Date): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copy.setDate(copy.getDate() - mondayIndex(copy));
  return copy;
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function disciplineFromTemplate(templateId: string, name?: string): Discipline | null {
  const template = TEMPLATES[templateId];
  if (!template) return null;
  return {
    id: uid(),
    name: name?.trim() || template.name,
    color: template.color,
    pitch: template.pitch,
    rhythm: [...template.rhythm],
    figures: template.figures.map((figure) => ({ ...figure, id: uid() })),
  };
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

export function formatMonth(date: Date): string {
  const label = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function defaultCourseSlots(disciplineId: string): Slot[] {
  return [
    { id: uid(), disciplineId, weekday: 3, start: "18:30", end: "20:00", label: "Cours" },
    { id: uid(), disciplineId, weekday: 5, start: "10:30", end: "12:00", label: "Cours" },
  ];
}

export function freshCarnet(): Carnet {
  const roller = disciplineFromTemplate("roller-dance");
  return {
    disciplines: roller ? [roller] : [],
    students: [],
    slots: roller ? defaultCourseSlots(roller.id) : [],
    lessons: [],
    exams: [],
  };
}

export function loadCarnet(): Carnet {
  if (typeof localStorage === "undefined") return freshCarnet();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshCarnet();
    const parsed = JSON.parse(raw) as { version?: number; carnet?: Carnet };
    if (parsed.version !== 1 || !parsed.carnet?.disciplines) return freshCarnet();
    return parsed.carnet;
  } catch {
    return freshCarnet();
  }
}

export function saveCarnet(carnet: Carnet): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, carnet }));
}

export function clearCarnet(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function disciplineName(carnet: Carnet, id: string): string {
  return carnet.disciplines.find((item) => item.id === id)?.name ?? "Discipline retirée";
}

export function studentsFor(carnet: Carnet, disciplineId: string): Student[] {
  return carnet.students.filter(
    (student) => student.disciplineIds.length === 0 || student.disciplineIds.includes(disciplineId),
  );
}

export function blankLesson(input: {
  date: string;
  disciplineId: string;
  title: string;
  slotId?: string;
}): Lesson {
  return {
    id: uid(),
    date: input.date,
    slotId: input.slotId,
    disciplineId: input.disciplineId,
    title: input.title,
    figures: [],
    learned: "",
    homework: "",
    links: [],
    appreciation: "",
    classRatings: [],
    studentRatings: [],
  };
}

export function blankExam(input: { disciplineId: string; date: string }): Exam {
  return {
    id: uid(),
    disciplineId: input.disciplineId,
    date: input.date,
    title: "Contrôle de figures",
    kind: "controle",
    grades: [],
  };
}

export function upsertRating(list: Rating[], studentId: string, patch: Partial<Rating>): Rating[] {
  const current = list.find((item) => item.studentId === studentId);
  const next: Rating = {
    studentId,
    stars: patch.stars ?? current?.stars ?? 0,
    comment: patch.comment ?? current?.comment ?? "",
  };
  return [...list.filter((item) => item.studentId !== studentId), next];
}

export function upsertGrade(list: Grade[], studentId: string, patch: Partial<Grade>): Grade[] {
  const current = list.find((item) => item.studentId === studentId);
  const next: Grade = {
    studentId,
    score: patch.score === undefined ? (current?.score ?? null) : patch.score,
    appreciation: patch.appreciation ?? current?.appreciation ?? "",
  };
  return [...list.filter((item) => item.studentId !== studentId), next];
}

export function average(values: number[]): number {
  const used = values.filter((value) => value > 0);
  if (used.length === 0) return 0;
  return used.reduce((sum, value) => sum + value, 0) / used.length;
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function cleanUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const withProto = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withProto);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(parseISODate(iso));
}

export function formatWeek(start: Date): string {
  const end = addDays(start, 6);
  const left = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(start);
  const right = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(end);
  return `${left} – ${right}`;
}

export function formatScore(score: number): string {
  return score.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
}
