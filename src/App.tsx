import { LanguageProvider, useLanguage } from "./i18n/LanguageContext";
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
    </LanguageProvider>
  );
}

export default App;
