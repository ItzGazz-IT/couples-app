import { useMemo, useState } from "react";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function Transactions({ finance }) {
  const { transactions, budgets, profile, membership, addTransaction, deleteTransaction, populateRecurringTransactions } = finance;
  const partnerOptions = useMemo(
    () => [profile.partnerOneName || "Partner 1", profile.partnerTwoName || "Partner 2"],
    [profile.partnerOneName, profile.partnerTwoName]
  );
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Essentials",
    type: "expense",
    date: new Date().toISOString().slice(0, 10),
    isRecurring: false,
  });

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, entry) => {
        const amount = Number(entry.amount || 0);
        if (entry.type === "income") {
          acc.income += amount;
        } else {
          acc.expense += amount;
        }

        if (entry.type === "expense" && entry.partner === partnerOptions[0]) {
          acc.partnerOneExpense += amount;
        }

        if (entry.type === "expense" && entry.partner === partnerOptions[1]) {
          acc.partnerTwoExpense += amount;
        }

        return acc;
      },
      { income: 0, expense: 0, partnerOneExpense: 0, partnerTwoExpense: 0 }
    );
  }, [partnerOptions, transactions]);

  const submitForm = async (event) => {
    event.preventDefault();
    await addTransaction(form);
    setForm((previous) => ({ ...previous, title: "", amount: "" }));
  };

  return (
    <section className="page-stack">
      <article className="surface-card rise-in">
        <div className="row-space">
          <h2>Transactions</h2>
          <span className="pill">{transactions.length} records</span>
        </div>
        <p className="muted">Every entry is saved by {membership.partnerName} in your shared couple space.</p>
      </article>

      <article className="surface-card rise-in delay-1">
        <form className="stack-form" onSubmit={submitForm}>
          <label htmlFor="txTitle">Description</label>
          <input
            id="txTitle"
            type="text"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />

          <div className="two-col-inputs">
            <div>
              <label htmlFor="txAmount">Amount</label>
              <input
                id="txAmount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                required
              />
            </div>
            <div>
              <label htmlFor="txDate">Date</label>
              <input
                id="txDate"
                type="date"
                value={form.date}
                onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                required
              />
            </div>
          </div>

          <div className="two-col-inputs">
            <div>
              <label htmlFor="txCategory">Category</label>
              <select
                id="txCategory"
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              >
                <option>Essentials</option>
                <option>Transport</option>
                <option>Lifestyle</option>
                <option>Health</option>
                <option>Savings</option>
              </select>
            </div>
            <div>
              <label>Uploaded by</label>
              <input type="text" value={membership.partnerName} readOnly />
            </div>
          </div>

          <div className="two-col-inputs">
            <div>
              <label htmlFor="txType">Type</label>
              <select
                id="txType"
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(event) => setForm((prev) => ({ ...prev, isRecurring: event.target.checked }))}
                />
                {" "}Recurring monthly?
              </label>
            </div>
          </div>

          <button type="submit">Add Transaction</button>
        </form>
      </article>

      {transactions.some((t) => t.isRecurring) && (
        <article className="surface-card rise-in delay-1">
          <button
            type="button"
            onClick={populateRecurringTransactions}
            style={{ backgroundColor: "var(--accent)", color: "white", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", fontWeight: 600 }}
          >
            Populate Recurring Transactions for This Month
          </button>
          <p className="muted tiny-text" style={{ marginTop: "0.5rem" }}>
            Click to auto-add all your recurring transactions for {new Date().toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}
          </p>
        </article>
      )}

      {budgets.length > 0 && (
        <article className="surface-card rise-in delay-1">
          <h3>Budget Summary (This Month)</h3>
          <div className="list-stack" style={{ marginTop: "1rem" }}>
            {budgets.map((budget) => {
              const spent = transactions
                .filter((t) => t.category === budget.category && t.type === "expense" && t.date.startsWith(budget.month))
                .reduce((sum, t) => sum + Number(t.amount || 0), 0);
              const percentUsed = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
              const isOverBudget = spent > budget.limit;
              return (
                <article key={budget.id} className="list-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3>{budget.category}</h3>
                    <small>{formatCurrency(spent)} / {formatCurrency(budget.limit)}</small>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <strong style={{ color: isOverBudget ? "#dc2626" : "inherit" }}>
                      {Math.round(percentUsed)}%
                    </strong>
                    <div className="progress-track" style={{ marginTop: "0.5rem", width: "100px" }}>
                      <div className="progress-fill" style={{ width: `${Math.min(percentUsed, 100)}%`, backgroundColor: isOverBudget ? "#dc2626" : "var(--accent)" }} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </article>
      )}

      <div className="metric-grid rise-in delay-2">
        <article className="metric-card">
          <p>{partnerOptions[0]} expenses</p>
          <h3>{formatCurrency(totals.partnerOneExpense)}</h3>
        </article>
        <article className="metric-card">
          <p>{partnerOptions[1]} expenses</p>
          <h3>{formatCurrency(totals.partnerTwoExpense)}</h3>
        </article>
      </div>

      <div className="metric-grid rise-in delay-2">
        <article className="metric-card">
          <p>Combined income</p>
          <h3>{formatCurrency(totals.income)}</h3>
        </article>
        <article className="metric-card">
          <p>Combined expense</p>
          <h3>{formatCurrency(totals.expense)}</h3>
        </article>
      </div>

      <div className="list-stack">
        {transactions.map((item, index) => (
          <article key={item.id} className={`list-card rise-in delay-${Math.min(index + 1, 3)}`}>
            <div>
              <h3>
                {item.title}
                {item.isRecurring && <span style={{ marginLeft: "0.5rem", fontSize: "0.85em", backgroundColor: "var(--accent)", color: "white", padding: "0.25rem 0.5rem", borderRadius: "0.25rem" }}>Recurring</span>}
              </h3>
              <small>
                {item.partner || "Unassigned"} • {item.category} • {item.date}
              </small>
            </div>
            <div className="row-actions">
              <strong>{formatCurrency(item.amount)}</strong>
              <button
                type="button"
                className="text-button"
                onClick={() => deleteTransaction(item.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
        {transactions.length === 0 && (
          <article className="surface-card">
            <p className="muted">No transactions yet. Add one above to get started.</p>
          </article>
        )}
      </div>
    </section>
  );
}

export default Transactions;