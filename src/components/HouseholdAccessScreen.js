import { useState } from "react";

function HouseholdAccessScreen({ finance }) {
  const [mode, setMode] = useState("create");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Step 1 Create: couple names
  const [coupleForm, setCoupleForm] = useState({
    coupleName: "",
    partnerOneName: "",
    partnerTwoName: "",
  });
  // After step 1 create completes
  const [createdHousehold, setCreatedHousehold] = useState(null);

  // Step 1 Join: invite code lookup
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  // After step 1 join completes
  const [foundHousehold, setFoundHousehold] = useState(null);

  // Step 2: who you are
  const [selectedPartner, setSelectedPartner] = useState("");

  // Step 3: personal finances
  const [financesForm, setFinancesForm] = useState({
    monthlyIncome: "",
  });

  const partnerOptions =
    mode === "create"
      ? [coupleForm.partnerOneName, coupleForm.partnerTwoName].filter(Boolean)
      : foundHousehold
      ? [foundHousehold.profile.partnerOneName, foundHousehold.profile.partnerTwoName].filter(Boolean)
      : [];

  const switchMode = (newMode) => {
    setMode(newMode);
    setStep(1);
    setError("");
    setCreatedHousehold(null);
    setFoundHousehold(null);
    setSelectedPartner("");
    setFinancesForm({ monthlyIncome: "" });
  };

  // Step 1 Create: create the couple profile (no finances yet)
  const handleCoupleSetup = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await finance.createHouseholdProfile({
        coupleName: coupleForm.coupleName.trim(),
        partnerOneName: coupleForm.partnerOneName.trim(),
        partnerTwoName: coupleForm.partnerTwoName.trim(),
      });
      setCreatedHousehold(result);
      setStep(2);
    } catch (err) {
      setError(err.message || "Could not create couple space.");
    } finally {
      setSubmitting(false);
    }
  };

  // Step 1 Join: look up the invite code
  const handleInviteLookup = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await finance.lookupInvite(inviteCodeInput.trim().toUpperCase());
      setFoundHousehold(result);
      setStep(2);
    } catch (err) {
      setError(err.message || "Invite code not found. Check the code and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: confirm identity, move to step 3
  const handleIdentityNext = (event) => {
    event.preventDefault();
    if (!selectedPartner) {
      setError("Please choose which partner you are.");
      return;
    }
    setError("");
    setStep(3);
  };

  // Step 3: save member finances + write membership → app loads
  const handleCompleteSetup = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const householdId =
        mode === "create" ? createdHousehold.householdId : foundHousehold.householdId;
      await finance.completeMemberSetup(householdId, selectedPartner, {
        monthlyIncome: Number(financesForm.monthlyIncome),
      });
      // membership write triggers re-subscription in useFinanceData → screen unmounts automatically
    } catch (err) {
      setError(err.message || "Could not complete setup.");
      setSubmitting(false);
    }
  };

  const coupleDisplayName =
    mode === "create"
      ? coupleForm.coupleName
      : foundHousehold?.profile?.coupleName || "";

  return (
    <section className="setup-screen rise-in">
      <article className="setup-card">

        {/* ── Step 1 ── */}
        {step === 1 && (
          <>
            <p className="eyebrow">Couple Access</p>
            <h2>{mode === "create" ? "Create shared couple space" : "Join your partner"}</h2>
            <p className="muted auth-copy">
              Each partner has their own account. Both connect to one shared budget.
            </p>

            <div className="auth-toggle" role="tablist" aria-label="Household access mode">
              <button
                type="button"
                className={mode === "create" ? "auth-toggle-active" : "auth-toggle-button"}
                onClick={() => switchMode("create")}
              >
                Create
              </button>
              <button
                type="button"
                className={mode === "join" ? "auth-toggle-active" : "auth-toggle-button"}
                onClick={() => switchMode("join")}
              >
                Join
              </button>
            </div>

            {mode === "create" ? (
              <form className="stack-form" onSubmit={handleCoupleSetup}>
                <label htmlFor="coupleName">Couple name</label>
                <input
                  id="coupleName"
                  type="text"
                  placeholder="e.g. The Smiths"
                  value={coupleForm.coupleName}
                  onChange={(event) =>
                    setCoupleForm((previous) => ({ ...previous, coupleName: event.target.value }))
                  }
                  required
                />

                <div className="two-col-inputs">
                  <div>
                    <label htmlFor="partnerOneName">Partner one name</label>
                    <input
                      id="partnerOneName"
                      type="text"
                      placeholder="e.g. Gareth"
                      value={coupleForm.partnerOneName}
                      onChange={(event) =>
                        setCoupleForm((previous) => ({ ...previous, partnerOneName: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="partnerTwoName">Partner two name</label>
                    <input
                      id="partnerTwoName"
                      type="text"
                      placeholder="e.g. Sarah"
                      value={coupleForm.partnerTwoName}
                      onChange={(event) =>
                        setCoupleForm((previous) => ({ ...previous, partnerTwoName: event.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Next: Choose your identity →"}
                </button>
              </form>
            ) : (
              <form className="stack-form" onSubmit={handleInviteLookup}>
                <label htmlFor="inviteCode">Invite code</label>
                <input
                  id="inviteCode"
                  type="text"
                  placeholder="6-character code from your partner"
                  value={inviteCodeInput}
                  onChange={(event) =>
                    setInviteCodeInput(event.target.value.toUpperCase())
                  }
                  required
                />

                <button type="submit" disabled={submitting}>
                  {submitting ? "Looking up..." : "Next: Choose your identity →"}
                </button>
              </form>
            )}
          </>
        )}

        {/* ── Step 2: Who are you? ── */}
        {step === 2 && (
          <>
            <p className="eyebrow">Step 2 of 3</p>
            <h2>Who are you in this couple?</h2>
            {coupleDisplayName ? (
              <p className="muted auth-copy">
                Welcome to <strong>{coupleDisplayName}</strong>. Select your name below.
              </p>
            ) : null}

            <form className="stack-form" onSubmit={handleIdentityNext}>
              <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                <legend style={{ fontWeight: 600, marginBottom: "0.75rem" }}>I am…</legend>
                {partnerOptions.map((name) => (
                  <label
                    key={name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 1rem",
                      border: `2px solid ${selectedPartner === name ? "var(--accent)" : "var(--surface-2)"}`,
                      borderRadius: "0.5rem",
                      marginBottom: "0.5rem",
                      cursor: "pointer",
                      background: selectedPartner === name ? "var(--accent-faint, #f0f4ff)" : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      name="partnerIdentity"
                      value={name}
                      checked={selectedPartner === name}
                      onChange={() => setSelectedPartner(name)}
                    />
                    <span style={{ fontWeight: 600 }}>{name}</span>
                  </label>
                ))}
              </fieldset>

              <button type="submit">
                Next: Add your finances →
              </button>
            </form>
          </>
        )}

        {/* ── Step 3: Personal finances ── */}
        {step === 3 && (
          <>
            <p className="eyebrow">Step 3 of 3</p>
            <h2>Your finances, {selectedPartner}</h2>
            <p className="muted auth-copy">
              Enter your salary. You can add your individual bills in the Bills tab once you're in.
            </p>

            <form className="stack-form" onSubmit={handleCompleteSetup}>
              <label htmlFor="myMonthlyIncome">Your monthly take-home salary</label>
              <input
                id="myMonthlyIncome"
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 25000"
                value={financesForm.monthlyIncome}
                onChange={(event) =>
                  setFinancesForm((previous) => ({ ...previous, monthlyIncome: event.target.value }))
                }
                required
              />

              <button type="submit" disabled={submitting}>
                {submitting
                  ? mode === "create"
                    ? "Creating..."
                    : "Joining..."
                  : mode === "create"
                  ? "Create & Enter App"
                  : "Join & Enter App"}
              </button>
            </form>
          </>
        )}

        {error ? <p className="status-banner error auth-feedback">{error}</p> : null}
      </article>
    </section>
  );
}

export default HouseholdAccessScreen;
