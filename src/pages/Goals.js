import { useState } from "react";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function Goals({ finance }) {
  const { goals, addGoal, updateGoalAmount, deleteGoal } = finance;
  const [form, setForm] = useState({ name: "", targetAmount: "", currentAmount: "" });
  const [contributions, setContributions] = useState({});

  const submitForm = async (event) => {
    event.preventDefault();
    await addGoal(form);
    setForm({ name: "", targetAmount: "", currentAmount: "" });
  };

  const applyContribution = async (goal) => {
    const contributionAmount = Number(contributions[goal.id] || 0);
    if (contributionAmount <= 0) {
      return;
    }
    const nextAmount = Number(goal.currentAmount || 0) + contributionAmount;
    await updateGoalAmount(goal.id, nextAmount);
    setContributions((previous) => ({ ...previous, [goal.id]: "" }));
  };

  return (
    <section className="page-stack">
      <article className="surface-card rise-in">
        <h2>Shared Goals</h2>
        <p className="muted">Set targets and keep funding them in real time.</p>
      </article>

      <article className="surface-card rise-in delay-1">
        <form className="stack-form" onSubmit={submitForm}>
          <label htmlFor="goalName">Goal name</label>
          <input
            id="goalName"
            type="text"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />

          <div className="two-col-inputs">
            <div>
              <label htmlFor="goalTarget">Target amount</label>
              <input
                id="goalTarget"
                type="number"
                min="1"
                step="0.01"
                value={form.targetAmount}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, targetAmount: event.target.value }))
                }
                required
              />
            </div>
            <div>
              <label htmlFor="goalCurrent">Starting amount</label>
              <input
                id="goalCurrent"
                type="number"
                min="0"
                step="0.01"
                value={form.currentAmount}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, currentAmount: event.target.value }))
                }
              />
            </div>
          </div>

          <button type="submit">Create Goal</button>
        </form>
      </article>

      <div className="list-stack">
        {goals.map((goal, index) => {
          const currentAmount = Number(goal.currentAmount || 0);
          const targetAmount = Number(goal.targetAmount || 0);
          const progress = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;

          return (
            <article key={goal.id} className={`surface-card rise-in delay-${Math.min(index + 1, 3)}`}>
              <div className="row-space">
                <h3>{goal.name}</h3>
                <span className="pill">{Math.round(progress)}%</span>
              </div>

              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>

              <small>
                {formatCurrency(currentAmount)} / {formatCurrency(targetAmount)}
              </small>

              <div className="row-actions space-top">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Add amount"
                  value={contributions[goal.id] || ""}
                  onChange={(event) =>
                    setContributions((previous) => ({
                      ...previous,
                      [goal.id]: event.target.value,
                    }))
                  }
                />
                <button type="button" onClick={() => applyContribution(goal)}>
                  Add
                </button>
                <button type="button" className="text-button" onClick={() => deleteGoal(goal.id)}>
                  Delete
                </button>
              </div>
            </article>
          );
        })}
        {goals.length === 0 && (
          <article className="surface-card">
            <p className="muted">No goals yet. Add one above to start tracking progress.</p>
          </article>
        )}
      </div>
    </section>
  );
}

export default Goals;