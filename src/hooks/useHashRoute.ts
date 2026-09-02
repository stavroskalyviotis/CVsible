import { useEffect, useState } from "react";

export type Route = "landing" | "builder" | "ats" | "my-cvs" | "privacy" | "terms" | "public-cv";

const ROUTES: Record<string, Route> = {
  "#/builder": "builder",
  "#/ats": "ats",
  "#/my-cvs": "my-cvs",
  "#/privacy": "privacy",
  "#/terms": "terms",
};

const HASHES: Record<Exclude<Route, "public-cv">, string> = {
  landing: "#/",
  builder: "#/builder",
  ats: "#/ats",
  "my-cvs": "#/my-cvs",
  privacy: "#/privacy",
  terms: "#/terms",
};

const PUBLIC_CV_HASH = /^#\/cv\/(.+)$/;

function readRoute(): { route: Route; param: string | null } {
  const hash = window.location.hash;
  const publicMatch = PUBLIC_CV_HASH.exec(hash);
  if (publicMatch) return { route: "public-cv", param: publicMatch[1] };
  return { route: ROUTES[hash] ?? "landing", param: null };
}

export function useHashRoute() {
  const [state, setState] = useState(readRoute);

  useEffect(() => {
    const onHashChange = () => setState(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (next: Exclude<Route, "public-cv">) => {
    window.location.hash = HASHES[next];
    window.scrollTo({ top: 0 });
  };

  return { route: state.route, param: state.param, navigate };
}
