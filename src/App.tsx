import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { LanguageProvider } from "./i18n/LanguageContext";
import { useLanguage } from "./i18n/useLanguage";
import { AuthProvider } from "./auth/AuthContext";
import { useHashRoute } from "./hooks/useHashRoute";
import { LandingPage } from "./pages/LandingPage";
import { BuilderPage } from "./pages/BuilderPage";
import { AtsScanPage } from "./pages/AtsScanPage";
import { CvisorPage } from "./cvisor/CvisorPage";
import { MyCvsPage } from "./pages/MyCvsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PublicCvPage } from "./pages/PublicCvPage";
import { LegalPage } from "./legal/LegalPage";
import { PRIVACY_CONTENT, TERMS_CONTENT } from "./legal/legalContent";

function AppShell() {
  const { route, param, navigate } = useHashRoute();
  const { dictionary, language, setLanguage } = useLanguage();

  if (route === "builder") {
    return (
      <BuilderPage
        dictionary={dictionary}
        language={language}
        onLanguageChange={setLanguage}
        onGoHome={() => navigate("landing")}
        onOpenScan={() => navigate("ats")}
        onOpenMyCvs={() => navigate("my-cvs")}
        onOpenProfile={() => navigate("profile")}
        onOpenCvisor={() => navigate("cvisor")}
      />
    );
  }

  if (route === "cvisor") {
    return (
      <CvisorPage
        dictionary={dictionary}
        language={language}
        onLanguageChange={setLanguage}
        navigate={navigate}
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

  if (route === "profile") {
    return (
      <ProfilePage
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
      onStart={() => navigate("builder")}
      onStartWithCvisor={() => navigate("cvisor")}
    />
  );
}

/** Vercel serves the analytics and speed-insights scripts from /_vercel/… on a
 *  real deployment, and nowhere else. A production build opened locally — which
 *  is how the e2e suite checks the deployed security headers — has no such
 *  path, so mounting them there buys nothing and costs two 404s in the console.
 *  The packages already stand down during `npm run dev`; this covers the build. */
const isDeployed =
  typeof window !== "undefined" && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
      {isDeployed && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </LanguageProvider>
  );
}

export default App;
