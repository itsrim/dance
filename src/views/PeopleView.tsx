import { useState, type FormEvent } from "react";
import { Picture } from "../components/Picture";
import { StarReadout } from "../components/Stars";
import { average } from "../model";
import { useCarnet } from "../store";

export function PeopleView() {
  const { carnet, update } = useCarnet();
  const [name, setName] = useState("");

  function add(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    update((current) => ({
      ...current,
      students: [...current.students, { id: crypto.randomUUID(), name: trimmed, disciplineIds: [] }],
    }));
    setName("");
  }

  return (
    <div className="page">
      <header className="page-head">
        <Picture scene="people" size={76} />
        <p className="kicker">Élèves</p>
        <h1>Le groupe</h1>
      </header>
      <form className="inline-form" onSubmit={add}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Prénom" required />
        <button type="submit" className="cta">
          Ajouter
        </button>
      </form>
      {carnet.students.length === 0 && <p className="muted">Ajoute les élèves pour pouvoir poser des étoiles.</p>}
      <ul className="cards">
        {carnet.students.map((student) => {
          const mine = carnet.lessons.flatMap((lesson) =>
            lesson.studentRatings.filter((rating) => rating.studentId === student.id).map((rating) => rating.stars),
          );
          const theirs = carnet.lessons.flatMap((lesson) =>
            lesson.classRatings.filter((rating) => rating.studentId === student.id).map((rating) => rating.stars),
          );
          return (
            <li key={student.id} className="card person">
              <Picture scene="star" size={56} />
              <div>
                <input
                  className="name-input"
                  aria-label={`Nom de ${student.name}`}
                  value={student.name}
                  onChange={(event) =>
                    update((current) => ({
                      ...current,
                      students: current.students.map((item) => (item.id === student.id ? { ...item, name: event.target.value } : item)),
                    }))
                  }
                />
                <p className="stat-line">
                  Ma moyenne <StarReadout value={average(mine)} />
                </p>
                <p className="stat-line">
                  Avis sur les cours <StarReadout value={average(theirs)} />
                </p>
                <div className="pills">
                  {carnet.disciplines.map((discipline) => {
                    const on = student.disciplineIds.includes(discipline.id);
                    return (
                      <button
                        key={discipline.id}
                        type="button"
                        className={on ? "pill on" : "pill"}
                        onClick={() =>
                          update((current) => ({
                            ...current,
                            students: current.students.map((item) => {
                              if (item.id !== student.id) return item;
                              const disciplineIds = on
                                ? item.disciplineIds.filter((id) => id !== discipline.id)
                                : [...item.disciplineIds, discipline.id];
                              return { ...item, disciplineIds };
                            }),
                          }))
                        }
                      >
                        {discipline.name}
                      </button>
                    );
                  })}
                </div>
                <small className="muted">Sans pastille, l'élève apparaît dans toutes les disciplines.</small>
              </div>
              <button
                type="button"
                className="textish danger"
                onClick={() => {
                  if (!window.confirm(`Retirer ${student.name} et ses notes ?`)) return;
                  update((current) => ({
                    ...current,
                    students: current.students.filter((item) => item.id !== student.id),
                    lessons: current.lessons.map((lesson) => ({
                      ...lesson,
                      classRatings: lesson.classRatings.filter((rating) => rating.studentId !== student.id),
                      studentRatings: lesson.studentRatings.filter((rating) => rating.studentId !== student.id),
                    })),
                    exams: current.exams.map((exam) => ({
                      ...exam,
                      grades: exam.grades.filter((grade) => grade.studentId !== student.id),
                    })),
                  }));
                }}
              >
                Retirer
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
