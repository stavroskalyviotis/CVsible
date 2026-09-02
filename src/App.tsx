import { useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { LanguageProvider } from "./i18n/LanguageContext";
import { useLanguage } from "./i18n/useLanguage";
import { AuthProvider } from "./auth/AuthContext";
import { useHashRoute } from "./hooks/useHashRoute";
import { LandingPage } from "./pages/LandingPage";
import { BuilderPage } from "./pages/BuilderPage";
import { AtsScanPage } from "./pages/AtsScanPage";
import { MyCvsPage } from "./pages/MyCvsPage";
import { PublicCvPage } from "./pages/PublicCvPage";
import { LegalPage } from "./legal/LegalPage";
import { PRIVACY_CONTENT, TERMS_CONTENT } from "./legal/legalContent";

function AppShell() {
  const { route, param, navigate } = useHashRoute();
  const { dictionary, language, setLanguage } = useLanguage();
  const [autoOpenCvisor, setAutoOpenCvisor] = useState(false);

  if (route === "builder") {
    return (
      <BuilderPage
        dictionary={dictionary}
        language={language}
        onLanguageChange={setLanguage}
        onGoHome={() => navigate("landing")}
        onOpenScan={() => navigate("ats")}
        onOpenMyCvs={() => navigate("my-cvs")}
        autoOpenCvisor={autoOpenCvisor}
      />
    );
  }

  if (route === "ats") {
    return (
      <AtsScanPage
        dictionary={dictionary}
        language={language}
        onLanguageChange={setLanguage}
        navigate={navigate}
      />
    );
  }

  if (route === "my-cvs") {
    return (
      <MyCvsPage
        dictionary={dictionary}
        language={language}
        onLanguageChange={setLanguage}
        navigate={navigate}
      />
    );
  }

  if (route === "privacy") {
    return (
      <LegalPage
        dictionary={dictionary}
        language={language}
        onLanguageChange={setLanguage}
        navigate={navigate}
        doc={PRIVACY_CONTENT[language]}
      />
    );
  }

  if (route === "terms") {
    return (
      <LegalPage
        dictionary={dictionary}
        language={language}
        onLanguageChange={setLanguage}
        navigate={navigate}
        doc={TERMS_CONTENT[language]}
      />
    );
  }

  if (route === "public-cv" && param) {
    return <PublicCvPage dictionary={dictionary} publicId={param} navigate={navigate} />;
  }

  return (
    <LandingPage
      dictionary={dictionary}
      language={language}
      onLanguageChange={setLanguage}
      navigate={navigate}
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
      <AuthProvider>
        <AppShell />
      </AuthProvider>
      <Analytics />
      <SpeedInsights />
    </LanguageProvider>
  );
}

export default App;
