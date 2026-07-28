import { useEffect, useState } from "react";

export type Route = "landing" | "builder";

function readRoute(): Route {
  return window.location.hash === "#/builder" ? "builder" : "landing";
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(readRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (next: Route) => {
    window.location.hash = next === "builder" ? "#/builder" : "#/";
  };

  return { route, navigate };
}
