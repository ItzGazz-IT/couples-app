import { useEffect, useState } from "react";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function Settings({ finance }) {
  const {
    profile,
    myFinances,
    budgets,
    updateProfileSettings,
    updateMemberFinances,
    setBudgetLimit,
    deleteBudget,
  } = finance;

  // Ã¢â€â‚¬Ã¢â€â‚¬ Personal finances (per-member, only affects current user) Ã¢â€â‚¬Ã¢â€â‚¬
  const [financesForm, setFinancesForm] = useState({
    monthlyIncome: String(myFinances.monthlyIncome || ""),
    monthlyExtraIncome: String(myFinances.monthlyExtraIncome || ""),
  });
  const [financesMessage, setFinancesMessage] = useState("");

  useEffect(() => {
    setFinancesForm({
      monthlyIncome: String(myFinances.monthlyIncome || ""),
      monthlyExtraIncome: String(myFinances.monthlyExtraIncome || ""),
    });
  }, [myFinances]);

  const saveFinances = async (event) => {
    event.preventDefault();
    await updateMemberFinances({
      monthlyIncome: Number(financesForm.monthlyIncome),
      monthlyExtraIncome: Number(financesForm.monthlyExtraIncome),
    });
    setFinancesMessage("Your finances saved.");
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬ Couple profile (shared, affects both partners) Ã¢â€â‚¬Ã¢â€â‚¬
  const [profileForm, setProfileForm] = useState({
    coupleName: profile.coupleName || "",
    partnerOneName: profile.partnerOneName || "",
    partnerTwoName: profile.partnerTwoName || "",
    savingsTarget: String(profile.savingsTarget || ""),
    savingsTargetDate: profile.savingsTargetDate || "",
  });
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    setProfileForm({
      coupleName: profile.coupleName || "",
      partnerOneName: profile.partnerOneName || "",
      partnerTwoName: profile.partnerTwoName || "",
      savingsTarget: String(profile.savingsTarget || ""),
      savingsTargetDate: profile.savingsTargetDate || "",
    });
  }, [profile]);

  const saveProfile = async (event) => {
    event.preventDefault();
    await updateProfileSettings({
      coupleName: profileForm.coupleName.trim(),
      partnerOneName: profileForm.partnerOneName.trim(),
      partnerTwoName: profileForm.partnerTwoName.trim(),
      savingsTarget: Number(profileForm.savingsTarget) || 0,
      savingsTargetDate: profileForm.savingsTargetDate,
    });
    setProfileMessage("Couple settings saved.");
  };

  return (
    <section className="page-stack">
      <article className="surface-card rise-in">
        <h2>Settings</h2>
        <p className="muted">Manage your personal finances, couple settings, and bills.</p>
        <div className="invite-code-box">
          <small className="muted">Partner invite code Ã¢â‚¬â€ share this with your partner</small>
          <strong>{profile.inviteCode || "Not available"}</strong>
        </div>
      </article>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ My Finances (per-person, independent) Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <article className="surface-card rise-in delay-1">
        <h3>My Finances</h3>
        <p className="muted tiny-text">
          Only you can see and change these. Your partner manages their own independently.
        </p>
        <form className="stack-form" onSubmit={saveFinances}>
          <label htmlFor="myIncome">My monthly take-home salary</label>
          <input
            id="myIncome"
            type="number"
            min="0"
            step="0.01"
            value={financesForm.monthlyIncome}
            onChange={(event) =>
              setFinancesForm((previous) => ({ ...previous, monthlyIncome: event.target.value }))
            }
            required
          />

          <label htmlFor="myExtraIncome">My monthly extra income (optional)</label>
          <small className="muted">Bonuses, side gigs, freelance work</small>
          <input
            id="myExtraIncome"
            type="number"
            min="0"
            step="0.01"
            value={financesForm.monthlyExtraIncome}
            onChange={(event) =>
              setFinancesForm((previous) => ({ ...previous, monthlyExtraIncome: event.target.value }))
            }
          />

          <button type="submit">Save My Finances</button>
        </form>
        {financesMessage ? <p className="status-banner">{financesMessage}</p> : null}
      </article>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Couple Profile (shared) Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <article className="surface-card rise-in delay-2">
        <h3>Couple Profile</h3>
        <p className="muted tiny-text">These settings are shared and visible to both partners.</p>
        <form className="stack-form" onSubmit={saveProfile}>
          <label htmlFor="setCoupleName">Couple name</label>
          <input
            id="setCoupleName"
            type="text"
            value={profileForm.coupleName}
            onChange={(event) =>
              setProfileForm((previous) => ({ ...previous, coupleName: event.target.value }))
            }
            required
          />

          <div className="two-col-inputs">
            <div>
              <label htmlFor="setPartnerOne">Partner one</label>
              <input
                id="setPartnerOne"
                type="text"
                value={profileForm.partnerOneName}
                onChange={(event) =>
                  setProfileForm((previous) => ({ ...previous, partnerOneName: event.target.value }))
                }
                required
              />
            </div>
            <div>
              <label htmlFor="setPartnerTwo">Partner two</label>
              <input
                id="setPartnerTwo"
                type="text"
                value={profileForm.partnerTwoName}
                onChange={(event) =>
                  setProfileForm((previous) => ({ ...previous, partnerTwoName: event.target.value }))
                }
                required
              />
            </div>
          </div>

          <label htmlFor="setSavings">Couple savings target amount</label>
          <input
            id="setSavings"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 50000"
            value={profileForm.savingsTarget}
            onChange={(event) =>
              setProfileForm((previous) => ({ ...previous, savingsTarget: event.target.value }))
            }
          />

          <label htmlFor="setSavingsDate">Target date to reach this savings</label>
          <input
            id="setSavingsDate"
            type="date"
            value={profileForm.savingsTargetDate}
            onChange={(event) =>
              setProfileForm((previous) => ({ ...previous, savingsTargetDate: event.target.value }))
            }
          />

          <button type="submit">Save Couple Settings</button>
        </form>
        {profileMessage ? <p className="status-banner">{profileMessage}</p> : null}
      </article>

      {/* Budget Management */}
      <article className="surface-card rise-in delay-3">
        <h3>Monthly Budget by Category</h3>
        <p className="muted tiny-text">Set spending limits to track against actual expenses in the Transactions tab.</p>

        <div className="list-stack" style={{ marginTop: "1rem" }}>
          {budgets.map((budget) => (
            <div key={budget.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", border: "1px solid var(--surface-2)", borderRadius: "0.5rem" }}>
              <div>
                <strong>{budget.category}</strong>
                <p style={{ fontSize: "0.9em", color: "var(--text-muted)" }}>{new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(budget.limit)}</p>
              </div>
              <button
                type="button"
                onClick={() => deleteBudget(budget.id)}
                style={{ backgroundColor: "transparent", color: "var(--text-secondary)", border: "none", cursor: "pointer", fontSize: "0.9em" }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--surface-2)" }}>
          <h4>Add New Budget</h4>
          <div className="two-col-inputs" style={{ marginTop: "1rem" }}>
            <div>
              <label htmlFor="budgetCategory">Category</label>
              <select id="budgetCategory">
                <option>Essentials</option>
                <option>Transport</option>
                <option>Lifestyle</option>
                <option>Health</option>
                <option>Savings</option>
              </select>
            </div>
            <div>
              <label htmlFor="budgetLimit">Monthly Limit</label>
              <input id="budgetLimit" type="number" min="0" step="0.01" placeholder="e.g. 5000" />
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              const category = document.getElementById("budgetCategory").value;
              const limit = document.getElementById("budgetLimit").value;
              if (category && limit) {
                await setBudgetLimit(category, limit);
                document.getElementById("budgetLimit").value = "";
              }
            }}
            style={{ marginTop: "1rem" }}
          >
            Set Budget
          </button>
        </div>
      </article>

    </section>
  );
}

export default Settings;
