import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearCarnet, freshCarnet, loadCarnet, saveCarnet, type Carnet } from "./model";

type Api = {
  carnet: Carnet;
  update: (fn: (carnet: Carnet) => Carnet) => void;
  wipe: () => void;
};

const CarnetContext = createContext<Api | null>(null);

export function CarnetProvider({ children }: { children: ReactNode }) {
  const [carnet, setCarnet] = useState(loadCarnet);

  useEffect(() => {
    saveCarnet(carnet);
  }, [carnet]);

  const update = useCallback((fn: (current: Carnet) => Carnet) => {
    setCarnet(fn);
  }, []);

  const wipe = useCallback(() => {
    const ok = window.confirm(
      "Effacer les séances, les élèves, les notes et les créneaux ? Le modèle Roller dance sera remis.",
    );
    if (!ok) return;
    clearCarnet();
    setCarnet(freshCarnet());
  }, []);

  const api = useMemo(() => ({ carnet, update, wipe }), [carnet, update, wipe]);
  return <CarnetContext.Provider value={api}>{children}</CarnetContext.Provider>;
}

export function useCarnet(): Api {
  const api = useContext(CarnetContext);
  if (!api) throw new Error("Carnet absent");
  return api;
}
