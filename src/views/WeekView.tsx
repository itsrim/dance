import { useEffect, useState, type FormEvent } from "react";
import { Picture } from "../components/Picture";
import {
  COLORS,
  WEEKDAYS,
  addMonths,
  blankLesson,
  defaultCourseSlots,
  formatDay,
  formatMonth,
  isoDate,
  mondayIndex,
  parseISODate,
  startOfMonth,
  uid,
  type Slot,
} from "../model";
import { useCarnet } from "../store";

const HEADS = ["L", "M", "M", "J", "V", "S", "D"];

export function WeekView({ weekIso }: { weekIso?: string }) {
  const { carnet, update } = useCarnet();
  const parsed = weekIso ? parseISODate(weekIso) : new Date();
  const anchor = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const month = startOfMonth(anchor);
  const today = isoDate(new Date());
  const [selected, setSelected] = useState(today);
  const [openSlot, setOpenSlot] = useState(false);
  const [label, setLabel] = useState("Cours");
  const [weekday, setWeekday] = useState(3);
  const [start, setStart] = useState("18:30");
  const [end, setEnd] = useState("20:00");
  const [disciplineId, setDisciplineId] = useState(carnet.disciplines[0]?.id ?? "");

  useEffect(() => {
    const discipline = carnet.disciplines[0];
    if (!discipline || carnet.slots.length > 0) return;
    const slots = defaultCourseSlots(discipline.id);
    update((current) => (current.slots.length > 0 ? current : { ...current, slots }));
  }, [carnet.disciplines, carnet.slots.length, update]);

  function go(next: Date) {
    location.hash = `#/semaine/${isoDate(startOfMonth(next))}`;
  }

  function openLesson(date: string, slot?: Slot) {
    if (slot) {
      const existing = carnet.lessons.find((lesson) => lesson.date === date && lesson.slotId === slot.id);
      if (existing) {
        location.hash = `#/cours/${existing.id}`;
        return;
      }
    }
    const discipline = carnet.disciplines.find((item) => item.id === (slot?.disciplineId ?? disciplineId)) ?? carnet.disciplines[0];
    if (!discipline) {
      location.hash = "#/atelier";
      return;
    }
    const lesson = blankLesson({
      date,
      disciplineId: discipline.id,
      title: slot?.label ?? "Cours",
      slotId: slot?.id,
    });
    update((current) => ({ ...current, lessons: [...current.lessons, lesson] }));
    location.hash = `#/cours/${lesson.id}`;
  }

  function addSlot(event: FormEvent) {
    event.preventDefault();
    const discipline = carnet.disciplines.find((item) => item.id === disciplineId) ?? carnet.disciplines[0];
    if (!discipline || !label.trim()) return;
    const slot: Slot = {
      id: uid(),
      disciplineId: discipline.id,
      weekday,
      start,
      end,
      label: label.trim(),
    };
    update((current) => ({ ...current, slots: [...current.slots, slot] }));
    setOpenSlot(false);
  }

  const courseDays = new Set(carnet.slots.map((slot) => slot.weekday));
  if (courseDays.size === 0) {
    courseDays.add(3);
    courseDays.add(5);
  }
  const lead = mondayIndex(month);
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= count; day += 1) cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  while (cells.length % 7 !== 0) cells.push(null);

  const picked = cells.find((date) => date && isoDate(date) === selected) ? selected : "";
  const pickedDate = picked ? parseISODate(picked) : null;
  const pickedLessons = picked ? carnet.lessons.filter((lesson) => lesson.date === picked) : [];
  const pickedSlots = pickedDate
    ? carnet.slots.filter((slot) => slot.weekday === mondayIndex(pickedDate)).sort((a, b) => a.start.localeCompare(b.start))
    : [];
  const filled = new Set(pickedLessons.map((lesson) => lesson.slotId).filter(Boolean));

  return (
    <div className="page">
      <header className="page-head">
        <div className="hero-art" aria-hidden="true">
          <Picture scene="calendar" size={72} />
          <Picture scene="dance" size={72} />
          <Picture scene="music" size={72} />
        </div>
        <p className="kicker">Calendrier</p>
        <h1>{formatMonth(month)}</h1>
        <div className="row">
          <button type="button" className="ghost" onClick={() => go(addMonths(month, -1))}>
            Mois précédent
          </button>
          <button type="button" className="ghost" onClick={() => go(new Date())}>
            Aujourd'hui
          </button>
          <button type="button" className="ghost" onClick={() => go(addMonths(month, 1))}>
            Mois suivant
          </button>
        </div>
      </header>

      <div className="month" role="grid" aria-label={formatMonth(month)}>
        {HEADS.map((name, index) => (
          <span key={`${name}-${index}`} className="month-name">
            {name}
          </span>
        ))}
        {cells.map((date, index) => {
          if (!date) return <span key={`pad-${index}`} className="cell pad" />;
          const iso = isoDate(date);
          const hasLesson = carnet.lessons.some((lesson) => lesson.date === iso);
          const isCourse = courseDays.has(mondayIndex(date));
          const className = ["cell", iso === today ? "today" : "", iso === picked ? "on" : ""].filter(Boolean).join(" ");
          return (
            <button key={iso} type="button" className={className} onClick={() => setSelected(iso)}>
              {date.getDate()}
              {(hasLesson || isCourse) && <i className="dot" />}
            </button>
          );
        })}
      </div>

      {picked && (
        <section className="panel">
          <p className="kicker">{formatDay(picked)}</p>
          <h2>{pickedLessons.length > 0 ? "Séances" : "Jour de cours"}</h2>
          {pickedLessons.map((lesson) => {
            const color = COLORS[carnet.disciplines.find((item) => item.id === lesson.disciplineId)?.color ?? "ink"];
            return (
              <a key={lesson.id} className="lesson-chip" href={`#/cours/${lesson.id}`} style={{ borderColor: color }}>
                <b>{lesson.title}</b>
                <small>
                  {lesson.figures.length} figure{lesson.figures.length > 1 ? "s" : ""}
                </small>
              </a>
            );
          })}
          {pickedSlots
            .filter((slot) => !filled.has(slot.id))
            .map((slot) => (
              <button key={slot.id} type="button" className="slot-chip" onClick={() => openLesson(picked, slot)}>
                <b>
                  {slot.start}–{slot.end} {slot.label}
                </b>
                <small>Préparer la séance</small>
              </button>
            ))}
          {pickedLessons.length === 0 && pickedSlots.length === 0 && (
            <button type="button" className="textish" onClick={() => openLesson(picked)}>
              Nouvelle séance
            </button>
          )}
        </section>
      )}

      <section className="panel">
        <header className="panel-head">
          <div>
            <p className="kicker">Créneaux habituels</p>
            <h2>Jeudi et samedi.</h2>
          </div>
          <button type="button" className="cta" onClick={() => setOpenSlot((value) => !value)}>
            Ajouter un créneau
          </button>
        </header>
        <ul className="slot-list">
          {carnet.slots
            .slice()
            .sort((a, b) => a.weekday - b.weekday || a.start.localeCompare(b.start))
            .map((slot) => (
              <li key={slot.id}>
                <Picture scene="calendar" size={42} />
                <span>
                  <b>
                    {WEEKDAYS[slot.weekday]} · {slot.start}–{slot.end}
                  </b>
                  <small>
                    {slot.label} · {carnet.disciplines.find((item) => item.id === slot.disciplineId)?.name ?? "Discipline retirée"}
                  </small>
                </span>
                <button
                  type="button"
                  className="textish"
                  onClick={() => update((current) => ({ ...current, slots: current.slots.filter((item) => item.id !== slot.id) }))}
                >
                  Retirer
                </button>
              </li>
            ))}
        </ul>
        {openSlot && (
          <form className="form" onSubmit={addSlot}>
            <label className="field">
              <span>Nom</span>
              <input value={label} onChange={(event) => setLabel(event.target.value)} required />
            </label>
            <label className="field">
              <span>Discipline</span>
              <select value={disciplineId} onChange={(event) => setDisciplineId(event.target.value)}>
                {carnet.disciplines.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Jour</span>
              <select value={weekday} onChange={(event) => setWeekday(Number(event.target.value))}>
                {WEEKDAYS.map((name, index) => (
                  <option key={name} value={index}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Début</span>
              <input type="time" value={start} onChange={(event) => setStart(event.target.value)} required />
            </label>
            <label className="field">
              <span>Fin</span>
              <input type="time" value={end} onChange={(event) => setEnd(event.target.value)} required />
            </label>
            <button type="submit" className="cta">
              Enregistrer le créneau
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
