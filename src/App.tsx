import { Analytics } from "@vercel/analytics/react";
import { LanguageProvider } from "./i18n/LanguageContext";
import { useLanguage } from "./i18n/useLanguage";
import { useHashRoute } from "./hooks/useHashRoute";
import { LandingPage } from "./pages/LandingPage";
import { BuilderPage } from "./pages/BuilderPage";

function AppShell() {
  const { route, navigate } = useHashRoute();
  const { dictionary, language, setLanguage } = useLanguage();

  if (route === "builder") {
    return (
      <BuilderPage
        dictionary={dictionary}
        language={language}
        onLanguageChange={setLanguage}
        onGoHome={() => navigate("landing")}
      />
    );
  }

  return (
    <LandingPage
      dictionary={dictionary}
      language={language}
      onLanguageChange={setLanguage}
      onStart={() => navigate("builder")}
    />
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppShell />
      <Analytics />
    </LanguageProvider>
  );
}

export default App;
