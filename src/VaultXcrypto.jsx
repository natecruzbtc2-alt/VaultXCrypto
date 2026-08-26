import { PriceProvider, AppProvider, useApp } from "./AppContext";
import { LandingPage, LoginPage, RegisterPage } from "./AuthPages";
import { Dashboard, AdminPanel } from "./Layouts";
import { Modals, Toast } from "./Modals";
import DraggableChat from "./DraggableChat";
import { AboutPage, ContactPage, TermsPage, PrivacyPage } from "./Pages";
import { SettingsPage } from "./Settings";

function App() {
  const { view } = useApp();
  return (
    <>
      {view === "landing"   && <LandingPage />}
      {view === "login"     && <LoginPage />}
      {view === "register"  && <RegisterPage />}
      {view === "dashboard" && <Dashboard />}
      {view === "admin"     && <AdminPanel />}
      {view === "about"     && <AboutPage />}
      {view === "contact"   && <ContactPage />}
      {view === "terms"     && <TermsPage />}
      {view === "privacy"   && <PrivacyPage />}
      {view === "settings"  && <SettingsPage />}
      <Modals />
      <Toast />
      <DraggableChat />
    </>
  );
}

export default function VaultXCrypto() {
  return (
    <AppProvider>
      <PriceProvider>
        <App />
      </PriceProvider>
    </AppProvider>
  );
}
