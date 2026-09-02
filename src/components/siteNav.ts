import type { Dictionary } from "../i18n/translations";
import type { Route } from "../hooks/useHashRoute";
import type { SiteNavItem } from "./SiteHeader";

export function buildSiteNav(
  dictionary: Dictionary,
  route: Route,
  navigate: (route: Exclude<Route, "public-cv">) => void,
): SiteNavItem[] {
  return [
    { key: "home", label: dictionary.siteNav.home, onClick: () => navigate("landing"), active: route === "landing" },
    { key: "scan", label: dictionary.siteNav.scan, onClick: () => navigate("ats"), active: route === "ats" },
    {
      key: "build",
      label: dictionary.siteNav.build,
      onClick: () => navigate("builder"),
      active: route === "builder",
      emphasis: true,
    },
  ];
}
