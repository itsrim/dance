import { Picture } from "../components/Picture";
import { StarReadout } from "../components/Stars";
import {
  EXAM_KINDS,
  average,
  mean,
  blankExam,
  formatDay,
  formatScore,
  isoDate,
  studentsFor,
  upsertGrade,
  type ExamKind,
} from "../model";
import { useCarnet } from "../store";

export function BulletinView() {
  const { carnet, update } = useCarnet();

  function addExam() {
    const discipline = carnet.disciplines[0];
    if (!discipline) {
      location.hash = "#/atelier";
      return;
    }
    const exam = blankExam({ disciplineId: discipline.id, date: isoDate(new Date()) });
    update((current) => ({ ...current, exams: [exam, ...current.exams] }));
  }

  return (
    <div className="page">
      <header className="page-head">
        <Picture scene="book" size={76} />
        <p className="kicker">Bulletin</p>
        <h1>Notes et appréciations</h1>
        <p className="lede">Les étoiles suivent chaque séance. Le contrôle, toutes les quelques semaines, note un enchaînement sur 20.</p>
      </header>

      <ul className="cards">
        {carnet.students.map((student) => {
          const mine = carnet.lessons.flatMap((lesson) =>
            lesson.studentRatings.filter((rating) => rating.studentId === student.id).map((rating) => rating.stars),
          );
          const comments = carnet.lessons
            .map((lesson) => lesson.studentRatings.find((rating) => rating.studentId === student.id)?.comment ?? "")
            .filter(Boolean);
          return (
            <li key={student.id} className="card person">
              <Picture scene="star" size={56} />
              <div>
                <h2>{student.name}</h2>
                <p className="stat-line">
                  Ma moyenne <StarReadout value={average(mine)} />
                </p>
                {comments[0] && <p className="quote">{comments[comments.length - 1]}</p>}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="panel-head">
        <h2>Contrôles</h2>
        <button type="button" className="cta" onClick={addExam}>
          Nouveau contrôle
        </button>
      </div>
      {carnet.exams.length === 0 && (
        <p className="muted">Un passage de figure : quatre pas enchaînés, une note sur 20, une phrase d'appréciation.</p>
      )}
      <div className="stack">
        {carnet.exams.map((exam) => {
          const students = studentsFor(carnet, exam.disciplineId);
          const scores = exam.grades.map((grade) => grade.score).filter((score): score is number => score !== null);
          return (
            <article key={exam.id} className="panel">
              <div className="exam-head">
                <Picture scene="book" size={52} />
                <label className="field">
                  <span>Titre</span>
                  <input
                    value={exam.title}
                    onChange={(event) =>
                      update((current) => ({
                        ...current,
                        exams: current.exams.map((item) => (item.id === exam.id ? { ...item, title: event.target.value } : item)),
                      }))
                    }
                  />
                </label>
                <label className="field">
                  <span>Date</span>
                  <input
                    type="date"
                    value={exam.date}
                    onChange={(event) =>
                      update((current) => ({
                        ...current,
                        exams: current.exams.map((item) => (item.id === exam.id ? { ...item, date: event.target.value } : item)),
                      }))
                    }
                  />
                </label>
                <label className="field">
                  <span>Type</span>
                  <select
                    value={exam.kind}
                    onChange={(event) =>
                      update((current) => ({
                        ...current,
                        exams: current.exams.map((item) =>
                          item.id === exam.id ? { ...item, kind: event.target.value as ExamKind } : item,
                        ),
                      }))
                    }
                  >
                    {EXAM_KINDS.map((kind) => (
                      <option key={kind.id} value={kind.id}>
                        {kind.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Discipline</span>
                  <select
                    value={exam.disciplineId}
                    onChange={(event) =>
                      update((current) => ({
                        ...current,
                        exams: current.exams.map((item) => (item.id === exam.id ? { ...item, disciplineId: event.target.value } : item)),
                      }))
                    }
                  >
                    {carnet.disciplines.map((discipline) => (
                      <option key={discipline.id} value={discipline.id}>
                        {discipline.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="muted">
                {formatDay(exam.date)}
                {scores.length > 0 ? ` · moyenne ${formatScore(mean(scores))} / 20` : ""}
              </p>
              {students.length === 0 && (
                <a href="#/eleves" className="textish">
                  Ajoute des élèves pour saisir les notes.
                </a>
              )}
              <ul className="grade-list">
                {students.map((student) => {
                  const grade = exam.grades.find((item) => item.studentId === student.id);
                  return (
                    <li key={student.id}>
                      <b>{student.name}</b>
                      <label>
                        / 20
                        <input
                          type="number"
                          min={0}
                          max={20}
                          step={0.5}
                          value={grade?.score ?? ""}
                          onChange={(event) => {
                            const raw = event.target.value;
                            const score = raw === "" ? null : Math.min(20, Math.max(0, Number(raw)));
                            update((current) => ({
                              ...current,
                              exams: current.exams.map((item) =>
                                item.id === exam.id
                                  ? { ...item, grades: upsertGrade(item.grades, student.id, { score: Number.isNaN(score) ? null : score }) }
                                  : item,
                              ),
                            }));
                          }}
                        />
                      </label>
                      <input
                        value={grade?.appreciation ?? ""}
                        placeholder="Appréciation"
                        onChange={(event) =>
                          update((current) => ({
                            ...current,
                            exams: current.exams.map((item) =>
                              item.id === exam.id
                                ? { ...item, grades: upsertGrade(item.grades, student.id, { appreciation: event.target.value }) }
                                : item,
                            ),
                          }))
                        }
                      />
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                className="textish danger"
                onClick={() => update((current) => ({ ...current, exams: current.exams.filter((item) => item.id !== exam.id) }))}
              >
                Retirer ce contrôle
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
