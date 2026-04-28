import { useEffect, useMemo, useState } from "react";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function billDeadlineText(dueDate) {
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [year, month, day] = dueDate.split("-").map(Number);
  const due = new Date(year, month - 1, day);
  const days = Math.ceil((due.getTime() - startToday.getTime()) / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return `${Math.abs(days)} days overdue`;
  }
  if (days === 0) {
    return "Due today";
  }
  return `Due in ${days} days`;
}

function Bills({ finance }) {
  const { bills, profile, addBill, deleteBill, toggleBillPaid } = finance;
  const partnerOne = profile.partnerOneName || "Partner 1";
  const partnerTwo = profile.partnerTwoName || "Partner 2";

  const partnerOptions = useMemo(
    () => [partnerOne, partnerTwo].filter(Boolean),
    [partnerOne, partnerTwo]
  );

  const [billForm, setBillForm] = useState({
    name: "",
    amount: "",
    dueDate: new Date().toISOString().slice(0, 10),
    responsiblePartner: partnerOptions[0] || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setBillForm((previous) => ({
      ...previous,
      responsiblePartner: previous.responsiblePartner || partnerOptions[0] || "",
    }));
  }, [partnerOptions]);

  const submitBill = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await addBill({
        name: billForm.name.trim(),
        amount: Number(billForm.amount),
        dueDate: billForm.dueDate,
        responsiblePartner: billForm.responsiblePartner,
      });
      setBillForm((previous) => ({ ...previous, name: "", amount: "" }));
    } catch (err) {
      setError(err.message || "Could not add bill.");
    } finally {
      setSubmitting(false);
    }
  };

  const totals = bills.reduce(
    (acc, bill) => {
      if (bill.paid) {
        return acc;
      }

      const amount = Number(bill.amount || 0);
      acc.combined += amount;

      if ((bill.responsiblePartner || "") === partnerOne) {
        acc.partnerOne += amount;
      } else if ((bill.responsiblePartner || "") === partnerTwo) {
        acc.partnerTwo += amount;
      }

      return acc;
    },
    { partnerOne: 0, partnerTwo: 0, combined: 0 }
  );

  return (
    <section className="page-stack">
      <article className="surface-card rise-in">
        <div className="row-space">
          <h2>Monthly Bills</h2>
          <span className="pill pill-warning">{bills.filter((bill) => !bill.paid).length} unpaid</span>
        </div>
      </article>

      {/* ── Add Bill Form ── */}
      <article className="surface-card rise-in delay-1">
        <h3>Add a Bill</h3>
        <form className="stack-form" onSubmit={submitBill}>
          <label htmlFor="billName">Bill name</label>
          <input
            id="billName"
            type="text"
            placeholder="e.g. Electricity"
            value={billForm.name}
            onChange={(event) =>
              setBillForm((previous) => ({ ...previous, name: event.target.value }))
            }
            required
          />

          <div className="two-col-inputs">
            <div>
              <label htmlFor="billAmount">Amount</label>
              <input
                id="billAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 1200"
                value={billForm.amount}
                onChange={(event) =>
                  setBillForm((previous) => ({ ...previous, amount: event.target.value }))
                }
                required
              />
            </div>
            <div>
              <label htmlFor="billDueDate">Due date</label>
              <input
                id="billDueDate"
                type="date"
                value={billForm.dueDate}
                onChange={(event) =>
                  setBillForm((previous) => ({ ...previous, dueDate: event.target.value }))
                }
                required
              />
            </div>
          </div>

          <label htmlFor="billPartner">Responsible partner</label>
          <select
            id="billPartner"
            value={billForm.responsiblePartner}
            onChange={(event) =>
              setBillForm((previous) => ({ ...previous, responsiblePartner: event.target.value }))
            }
            required
          >
            {partnerOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Bill"}
          </button>
        </form>
        {error ? <p className="status-banner error">{error}</p> : null}
      </article>

      <div className="metric-grid rise-in delay-1">
        <article className="metric-card">
          <p>{partnerOne} unpaid bills</p>
          <h3>{formatCurrency(totals.partnerOne)}</h3>
        </article>
        <article className="metric-card">
          <p>{partnerTwo} unpaid bills</p>
          <h3>{formatCurrency(totals.partnerTwo)}</h3>
        </article>
      </div>

      <article className="surface-card rise-in delay-1">
        <div className="row-space">
          <h3>Combined Unpaid Total</h3>
          <strong>{formatCurrency(totals.combined)}</strong>
        </div>
      </article>

      <div className="list-stack">
        {bills.map((bill, index) => (
          <article key={bill.id} className={`list-card rise-in delay-${Math.min(index + 1, 3)}`}>
            <div>
              <h3>
                {bill.name} {bill.paid ? "• Paid" : "• Open"}
              </h3>
              <small>
                {(bill.responsiblePartner || "Unassigned") + " • " + billDeadlineText(bill.dueDate)}
              </small>
            </div>
            <div className="row-actions">
              <strong>{formatCurrency(bill.amount)}</strong>
              <button
                type="button"
                className="text-button"
                onClick={() => toggleBillPaid(bill.id, !bill.paid)}
              >
                {bill.paid ? "Mark open" : "Mark paid"}
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => deleteBill(bill.id)}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
        {bills.length === 0 && (
          <article className="surface-card">
            <p className="muted">No bills yet. Add your first bill above.</p>
          </article>
        )}
      </div>
    </section>
  );
}

export default Bills;