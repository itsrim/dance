import { useState, type FormEvent } from "react";
import { Picture, sceneForGroup } from "../components/Picture";
import { COLORS, TEMPLATES, disciplineFromTemplate, uid, type ColorName } from "../model";
import { useCarnet } from "../store";

export function StudioView() {
  const { carnet, update, wipe } = useCarnet();
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("roller-dance");
  const [figureName, setFigureName] = useState("");
  const [targetId, setTargetId] = useState(carnet.disciplines[0]?.id ?? "");

  function addDiscipline(event: FormEvent) {
    event.preventDefault();
    const created =
      templateId === "vide"
        ? {
            id: uid(),
            name: name.trim() || "Nouvelle discipline",
            color: "teal" as ColorName,
            pitch: "Figures, séances, étoiles et contrôles, sur le même carnet.",
            rhythm: ["Échauffement", "Reprise", "Figure nouvelle", "Enchaînement", "Devoir"],
            figures: [],
          }
        : disciplineFromTemplate(templateId, name);
    if (!created) return;
    update((current) => ({ ...current, disciplines: [...current.disciplines, created] }));
    setName("");
    setTargetId(created.id);
  }

  function addFigure(event: FormEvent) {
    event.preventDefault();
    const trimmed = figureName.trim();
    if (!trimmed || !targetId) return;
    update((current) => ({
      ...current,
      disciplines: current.disciplines.map((discipline) =>
        discipline.id === targetId
          ? {
              ...discipline,
              figures: [...discipline.figures, { id: uid(), name: trimmed, group: "Figures", hint: "" }],
            }
          : discipline,
      ),
    }));
    setFigureName("");
  }

  return (
    <div className="page">
      <header className="page-head">
        <div className="hero-art" aria-hidden="true">
          <span className="emoji">🕺</span>
          <span className="emoji">💃</span>
          <span className="emoji">🪩</span>
        </div>
        <p className="kicker">Atelier</p>
        <h1>Les disciplines</h1>
        <p className="lede">Chaque discipline a ses figures. Le carnet, les étoiles et les contrôles restent les mêmes.</p>
      </header>

      <div className="discipline-grid">
        {carnet.disciplines.map((discipline) => (
          <article key={discipline.id} className="card">
            <header className="card-title">
              <Picture scene={discipline.name.toLowerCase().includes("salsa") ? "music" : "dance"} size={64} />
              <div>
                <p className="swatch-line">
                  <i style={{ background: COLORS[discipline.color] }} />
                  {discipline.name}
                </p>
                <h2>{discipline.figures.length} figures</h2>
              </div>
            </header>
            <p>{discipline.pitch}</p>
            <ol className="rhythm">
              {discipline.rhythm.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className="group-block">
              {[...new Set(discipline.figures.map((figure) => figure.group))].map((group) => (
                <section key={group}>
                  <p>
                    <Picture scene={sceneForGroup(group)} size={28} />
                    {group}
                  </p>
                  <ul>
                    {discipline.figures
                      .filter((figure) => figure.group === group)
                      .map((figure) => (
                        <li key={figure.id}>
                          <b>{figure.name}</b>
                          {figure.hint && <small>{figure.hint}</small>}
                        </li>
                      ))}
                  </ul>
                </section>
              ))}
            </div>
            <button
              type="button"
              className="textish danger"
              onClick={() =>
                update((current) => ({
                  ...current,
                  disciplines: current.disciplines.filter((item) => item.id !== discipline.id),
                  slots: current.slots.filter((slot) => slot.disciplineId !== discipline.id),
                }))
              }
            >
              Retirer la discipline
            </button>
          </article>
        ))}
      </div>

      <section className="panel">
        <p className="kicker">Ajouter</p>
        <h2>Une autre discipline</h2>
        <form className="form" onSubmit={addDiscipline}>
          <label className="field">
            <span>Nom</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Rock, tango, jazz…" />
          </label>
          <label className="field">
            <span>Modèle de figures</span>
            <select value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
              <option value="roller-dance">Roller dance</option>
              <option value="salsa">Salsa</option>
              <option value="vide">Catalogue vide</option>
            </select>
          </label>
          <button type="submit" className="cta">
            Créer la discipline
          </button>
        </form>
        <form className="inline-form" onSubmit={addFigure}>
          <select value={targetId} onChange={(event) => setTargetId(event.target.value)} aria-label="Discipline">
            {carnet.disciplines.map((discipline) => (
              <option key={discipline.id} value={discipline.id}>
                {discipline.name}
              </option>
            ))}
          </select>
          <input value={figureName} onChange={(event) => setFigureName(event.target.value)} placeholder="Nouvelle figure" />
          <button type="submit" className="ghost">
            Ajouter au catalogue
          </button>
        </form>
        {templateId !== "vide" && TEMPLATES[templateId] && (
          <p className="muted">{TEMPLATES[templateId].pitch}</p>
        )}
      </section>

      <section className="panel quiet">
        <h2>Vider le carnet</h2>
        <p className="muted">Les séances, les élèves, les notes et les créneaux quittent cet appareil. Le modèle Roller dance revient.</p>
        <button type="button" className="danger-btn" onClick={wipe}>
          Vider le carnet
        </button>
      </section>
    </div>
  );
}
