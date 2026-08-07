import { useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { LanguageProvider } from "./i18n/LanguageContext";
import { useLanguage } from "./i18n/useLanguage";
import { useHashRoute } from "./hooks/useHashRoute";
import { LandingPage } from "./pages/LandingPage";
import { BuilderPage } from "./pages/BuilderPage";

function AppShell() {
  const { route, navigate } = useHashRoute();
  const { dictionary, language, setLanguage } = useLanguage();
  const [autoOpenCvisor, setAutoOpenCvisor] = useState(false);

  if (route === "builder") {
    return (
      <BuilderPage
        dictionary={dictionary}
        language={language}
        onLanguageChange={setLanguage}
        onGoHome={() => navigate("landing")}
        autoOpenCvisor={autoOpenCvisor}
      />
    );
  }

  return (
    <LandingPage
      dictionary={dictionary}
      language={language}
      onLanguageChange={setLanguage}
      onStart={() => {
        setAutoOpenCvisor(false);
        navigate("builder");
      }}
      onStartWithCvisor={() => {
        setAutoOpenCvisor(true);
        navigate("builder");
      }}
    />
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppShell />
      <Analytics />
      <SpeedInsights />
    </LanguageProvider>
  );
}

export default App;
