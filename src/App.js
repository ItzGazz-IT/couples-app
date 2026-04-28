import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AuthScreen from "./components/AuthScreen";
import HouseholdAccessScreen from "./components/HouseholdAccessScreen";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Goals from "./pages/Goals";
import Bills from "./pages/Bills";
import Settings from "./pages/Settings";
import { useAuth } from "./services/useAuth";
import { useFinanceData } from "./services/useFinanceData";
import "./App.css";

function App() {
  const auth = useAuth();
  const finance = useFinanceData(auth.user);

  return (
    <Router>
      <div className="app-shell">
        <div className="bg-blob bg-blob-one" />
        <div className="bg-blob bg-blob-two" />

        <header className="app-header">
          <div className="header-row">
            <div>
              <p className="eyebrow">Pocket Ledger</p>
              <h1>Budget Tracker</h1>
            </div>
            {auth.user && (
              <button type="button" className="ghost-button" onClick={auth.logout}>
                Sign Out
              </button>
            )}
          </div>
          <p className="muted tiny-text">
            {auth.user
              ? finance.householdId
                ? `${finance.profile.coupleName} • ${finance.membership.partnerName} • ${auth.user.email}`
                : `Signed in as ${auth.user.email}`
              : "Sign in to save data to your account"}
          </p>
        </header>

        <main className="app-content">
          {auth.loading ? <p className="status-banner">Checking your account...</p> : null}
          {auth.user && finance.error ? <p className="status-banner error">Sync error: {finance.error}</p> : null}
          {auth.user && finance.loading ? <p className="status-banner">Syncing your wallet...</p> : null}

          {auth.user ? (
            finance.householdId ? (
              <Routes>
                <Route path="/" element={<Dashboard finance={finance} />} />
                <Route path="/transactions" element={<Transactions finance={finance} />} />
                <Route path="/goals" element={<Goals finance={finance} />} />
                <Route path="/bills" element={<Bills finance={finance} />} />
                <Route path="/settings" element={<Settings finance={finance} />} />
              </Routes>
            ) : (
              <HouseholdAccessScreen finance={finance} />
            )
          ) : (
            <AuthScreen auth={auth} />
          )}
        </main>

        {auth.user && finance.householdId ? <Navbar /> : null}
      </div>
    </Router>
  );
}

export default App;