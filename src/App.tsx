import { useEffect, useState } from "react";
import { Picture } from "./components/Picture";
import { CarnetProvider } from "./store";
import { BulletinView } from "./views/BulletinView";
import { LessonView } from "./views/LessonView";
import { PeopleView } from "./views/PeopleView";
import { StudioView } from "./views/StudioView";
import { WeekView } from "./views/WeekView";

type Route =
  | { name: "week"; weekIso?: string }
  | { name: "lesson"; id: string }
  | { name: "people" }
  | { name: "studio" }
  | { name: "bulletin" };

function readRoute(): Route {
  const hash = location.hash.replace(/^#/, "") || "/semaine";
  const lesson = hash.match(/^\/cours\/([^/]+)/);
  if (lesson) return { name: "lesson", id: decodeURIComponent(lesson[1]) };
  const week = hash.match(/^\/semaine\/(\d{4}-\d{2}-\d{2})/);
  if (hash.startsWith("/eleves")) return { name: "people" };
  if (hash.startsWith("/atelier")) return { name: "studio" };
  if (hash.startsWith("/bulletin")) return { name: "bulletin" };
  return { name: "week", weekIso: week?.[1] };
}

const LINKS = [
  { href: "#/semaine", name: "week" as const, label: "Semaine" },
  { href: "#/bulletin", name: "bulletin" as const, label: "Notes" },
  { href: "#/eleves", name: "people" as const, label: "Élèves" },
  { href: "#/atelier", name: "studio" as const, label: "Atelier" },
];

function Shell() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div className="shell">
      <div className="blob" aria-hidden="true" />
      <div className="blob second" aria-hidden="true" />
      <header className="top">
        <a className="brand" href="#/semaine">
          <Picture scene="dance" size={46} />
          <span>
            <small>Carnet</small>
            Dance
          </span>
        </a>
      </header>
      <nav className="nav" role="tablist" aria-label="Sections">
        {LINKS.map((link) => {
          const on = (route.name === "lesson" ? "week" : route.name) === link.name;
          return (
            <a key={link.name} href={link.href} role="tab" aria-selected={on} className={on ? "on" : ""}>
              {link.label}
            </a>
          );
        })}
      </nav>
      {route.name === "week" && <WeekView weekIso={route.weekIso} />}
      {route.name === "lesson" && <LessonView id={route.id} />}
      {route.name === "people" && <PeopleView />}
      {route.name === "studio" && <StudioView />}
      {route.name === "bulletin" && <BulletinView />}
    </div>
  );
}

export function App() {
  return (
    <CarnetProvider>
      <Shell />
    </CarnetProvider>
  );
}
