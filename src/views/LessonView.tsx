import { useState, type FormEvent } from "react";
import { Picture, sceneForGroup } from "../components/Picture";
import { Stars } from "../components/Stars";
import {
  COLORS,
  LEVELS,
  cleanUrl,
  formatDay,
  studentsFor,
  uid,
  upsertRating,
  type FigureLevel,
  type Lesson,
} from "../model";
import { useCarnet } from "../store";

export function LessonView({ id }: { id: string }) {
  const { carnet, update } = useCarnet();
  const lesson = carnet.lessons.find((item) => item.id === id);
  const [figureName, setFigureName] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  if (!lesson) {
    return (
      <div className="page">
        <p>Cette séance n'est plus dans le carnet.</p>
        <a className="cta" href="#/semaine">
          Retour à la semaine
        </a>
      </div>
    );
  }

  const session = lesson;
  const discipline = carnet.disciplines.find((item) => item.id === session.disciplineId);
  const students = studentsFor(carnet, session.disciplineId);

  function patch(partial: Partial<Lesson>) {
    update((current) => ({
      ...current,
      lessons: current.lessons.map((item) => (item.id === session.id ? { ...item, ...partial } : item)),
    }));
  }

  function patchLive(fn: (item: Lesson) => Lesson) {
    update((current) => ({
      ...current,
      lessons: current.lessons.map((item) => (item.id === session.id ? fn(item) : item)),
    }));
  }

  function addCatalog(catalogId: string) {
    const figure = discipline?.figures.find((item) => item.id === catalogId);
    if (!figure || session.figures.some((item) => item.catalogId === figure.id)) return;
    patch({
      figures: [
        ...session.figures,
        { id: uid(), catalogId: figure.id, name: figure.name, group: figure.group, hint: figure.hint, level: "vu" },
      ],
    });
  }

  function addCustom(event: FormEvent) {
    event.preventDefault();
    const name = figureName.trim();
    if (!name) return;
    patch({
      figures: [...session.figures, { id: uid(), name, group: "Figures", hint: "", level: "vu" }],
    });
    setFigureName("");
  }

  function addLink(event: FormEvent) {
    event.preventDefault();
    const url = cleanUrl(linkUrl);
    if (!url) return;
    patch({
      links: [...session.links, { id: uid(), label: linkLabel.trim() || url, url }],
    });
    setLinkLabel("");
    setLinkUrl("");
  }

  function remove() {
    if (!window.confirm("Retirer cette séance du carnet ?")) return;
    update((current) => ({ ...current, lessons: current.lessons.filter((item) => item.id !== session.id) }));
    location.hash = `#/semaine/${session.date}`;
  }

  const grouped = new Map<string, NonNullable<typeof discipline>["figures"]>();
  for (const figure of discipline?.figures ?? []) {
    const list = grouped.get(figure.group) ?? [];
    list.push(figure);
    grouped.set(figure.group, list);
  }

  return (
    <div className="page">
      <a className="textish back" href={`#/semaine/${session.date}`}>
        Semaine
      </a>
      <header className="page-head lesson-hero">
        <Picture scene={sceneForGroup(session.figures[0]?.group ?? "Figures")} size={84} />
        <div>
          <p className="kicker">{formatDay(session.date)}</p>
          <input
            className="title-input"
            aria-label="Titre de la séance"
            value={session.title}
            onChange={(event) => patch({ title: event.target.value })}
          />
          <label className="field slim">
            <span>Discipline</span>
            <select value={session.disciplineId} onChange={(event) => patch({ disciplineId: event.target.value })}>
              {carnet.disciplines.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="lesson-layout">
        <div className="stack">
          <section className="panel">
            <p className="kicker">Pas et figures</p>
            <h2>Ce qui est travaillé</h2>
            {session.figures.length === 0 && <p className="muted">Choisis une figure du catalogue, ou ajoute la tienne.</p>}
            <ul className="figure-list">
              {session.figures.map((figure) => (
                <li key={figure.id}>
                  <Picture scene={sceneForGroup(figure.group)} size={48} />
                  <div>
                    <b>{figure.name}</b>
                    {figure.hint && <small>{figure.hint}</small>}
                    <div className="pills">
                      {LEVELS.map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          className={figure.level === level.id ? "pill on" : "pill"}
                          onClick={() =>
                            patchLive((item) => ({
                              ...item,
                              figures: item.figures.map((entry) =>
                                entry.id === figure.id ? { ...entry, level: level.id as FigureLevel } : entry,
                              ),
                            }))
                          }
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="textish"
                    onClick={() => patchLive((item) => ({ ...item, figures: item.figures.filter((entry) => entry.id !== figure.id) }))}
                  >
                    Retirer
                  </button>
                </li>
              ))}
            </ul>
            {[...grouped.entries()].map(([group, figures]) => (
              <div key={group} className="catalog-row">
                <p>{group}</p>
                <div className="pills">
                  {figures.map((figure) => {
                    const on = session.figures.some((item) => item.catalogId === figure.id);
                    return (
                      <button key={figure.id} type="button" className={on ? "pill on" : "pill"} onClick={() => addCatalog(figure.id)}>
                        {figure.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <form className="inline-form" onSubmit={addCustom}>
              <input value={figureName} onChange={(event) => setFigureName(event.target.value)} placeholder="Autre figure" />
              <button type="submit" className="ghost">
                Ajouter
              </button>
            </form>
          </section>

          <section className="panel">
            <label className="field">
              <span>Ce qui a été appris</span>
              <textarea
                rows={4}
                value={session.learned}
                placeholder="Le groupe tient le pas de base. Le frein en T arrive encore tard."
                onChange={(event) => patch({ learned: event.target.value })}
              />
            </label>
            <label className="field">
              <span>Devoir</span>
              <textarea
                rows={3}
                value={session.homework}
                placeholder="Dix minutes de roulage, puis le croisé devant sur huit temps."
                onChange={(event) => patch({ homework: event.target.value })}
              />
            </label>
            <label className="field">
              <span>Appréciation du cours</span>
              <textarea
                rows={3}
                value={session.appreciation}
                placeholder="Séance claire. Garder le même tempo la prochaine fois."
                onChange={(event) => patch({ appreciation: event.target.value })}
              />
            </label>
          </section>

          <section className="panel">
            <p className="kicker">Liens</p>
            <h2>Morceau, vidéo, fiche</h2>
            <ul className="link-list">
              {session.links.map((link) => (
                <li key={link.id}>
                  <Picture scene="book" size={42} />
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                  <button
                    type="button"
                    className="textish"
                    onClick={() => patchLive((item) => ({ ...item, links: item.links.filter((entry) => entry.id !== link.id) }))}
                  >
                    Retirer
                  </button>
                </li>
              ))}
            </ul>
            <form className="form" onSubmit={addLink}>
              <label className="field">
                <span>Nom</span>
                <input value={linkLabel} onChange={(event) => setLinkLabel(event.target.value)} placeholder="Démo du tour simple" />
              </label>
              <label className="field">
                <span>Adresse</span>
                <input value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://" required />
              </label>
              <button type="submit" className="ghost">
                Ajouter le lien
              </button>
            </form>
          </section>
        </div>

        <aside className="panel ratings">
          <p className="kicker">Étoiles</p>
          <h2>Le cours et les élèves</h2>
          <p className="muted">Eux notent la séance. Toi, tu notes la maîtrise.</p>
          {students.length === 0 && (
            <a className="cta" href="#/eleves">
              Ajouter des élèves
            </a>
          )}
          <ul className="people">
            {students.map((student) => {
              const theirs = session.classRatings.find((item) => item.studentId === student.id);
              const mine = session.studentRatings.find((item) => item.studentId === student.id);
              return (
                <li key={student.id}>
                  <b>{student.name}</b>
                  <label>
                    Avis sur le cours
                    <Stars
                      label={`Avis de ${student.name} sur le cours`}
                      value={theirs?.stars ?? 0}
                      onChange={(stars) =>
                        patchLive((item) => ({ ...item, classRatings: upsertRating(item.classRatings, student.id, { stars }) }))
                      }
                    />
                  </label>
                  <label>
                    Ma note
                    <Stars
                      label={`Ma note pour ${student.name}`}
                      value={mine?.stars ?? 0}
                      onChange={(stars) =>
                        patchLive((item) => ({ ...item, studentRatings: upsertRating(item.studentRatings, student.id, { stars }) }))
                      }
                    />
                  </label>
                  <input
                    value={mine?.comment ?? ""}
                    placeholder="Un mot sur la maîtrise"
                    onChange={(event) =>
                      patchLive((item) => ({
                        ...item,
                        studentRatings: upsertRating(item.studentRatings, student.id, { comment: event.target.value }),
                      }))
                    }
                  />
                </li>
              );
            })}
          </ul>
          {discipline && (
            <p className="swatch-line">
              <i style={{ background: COLORS[discipline.color] }} />
              {discipline.name}
            </p>
          )}
        </aside>
      </div>
      <button type="button" className="textish danger" onClick={remove}>
        Retirer cette séance
      </button>
    </div>
  );
}
