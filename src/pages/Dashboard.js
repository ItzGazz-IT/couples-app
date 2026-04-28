import { useMemo } from "react";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function getDaysUntil(dateString) {
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [year, month, day] = dateString.split("-").map(Number);
  const dueDate = new Date(year, month - 1, day);
  const ms = dueDate.getTime() - startToday.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function Dashboard({ finance }) {
  const { profile, allMembers, transactions, goals, bills } = finance;

  const metrics = useMemo(() => {
    const partnerOne = profile.partnerOneName || "Partner 1";
    const partnerTwo = profile.partnerTwoName || "Partner 2";

    // Per-partner income from the independent member docs
    const memberOne = allMembers.find((m) => m.partnerName === partnerOne);
    const memberTwo = allMembers.find((m) => m.partnerName === partnerTwo);
    const incomeOne = Number(memberOne?.monthlyIncome || 0);
    const incomeTwo = Number(memberTwo?.monthlyIncome || 0);
    const extraIncomeOne = Number(memberOne?.monthlyExtraIncome || 0);
    const extraIncomeTwo = Number(memberTwo?.monthlyExtraIncome || 0);

    // Fixed costs are derived from individual bills (all bills, regardless of paid status)
    const fixedOne = bills
      .filter((b) => b.responsiblePartner === partnerOne)
      .reduce((sum, b) => sum + Number(b.amount || 0), 0);
    const fixedTwo = bills
      .filter((b) => b.responsiblePartner === partnerTwo)
      .reduce((sum, b) => sum + Number(b.amount || 0), 0);

    const combinedIncome = incomeOne + incomeTwo + extraIncomeOne + extraIncomeTwo;
    const combinedFixed = fixedOne + fixedTwo;
    const baseAfterFixedCosts = combinedIncome - combinedFixed;

    const incomeTransactions = transactions
      .filter((entry) => entry.type === "income")
      .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

    const spendingTransactions = transactions
      .filter((entry) => entry.type === "expense")
      .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

    const partnerOneSpent = transactions
      .filter((entry) => entry.type === "expense" && entry.partner === partnerOne)
      .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

    const partnerTwoSpent = transactions
      .filter((entry) => entry.type === "expense" && entry.partner === partnerTwo)
      .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

    const available = baseAfterFixedCosts + incomeTransactions - spendingTransactions;

    // Calculate monthly savings needed based on target date
    let monthlySavingsNeeded = 0;
    let monthsRemaining = 0;
    let savingsProgress = 0;
    if (profile.savingsTarget && profile.savingsTargetDate) {
      const today = new Date();
      const targetDate = new Date(profile.savingsTargetDate);
      const msRemaining = targetDate.getTime() - today.getTime();
      monthsRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24 * 30.44)));
      monthlySavingsNeeded = monthsRemaining > 0 ? profile.savingsTarget / monthsRemaining : profile.savingsTarget;
      savingsProgress = profile.savingsTarget > 0 ? Math.min((Math.max(available, 0) / profile.savingsTarget) * 100, 100) : 0;
    }

    const topGoal = goals
      .map((goal) => {
        const targetAmount = Number(goal.targetAmount || 0);
        const currentAmount = Number(goal.currentAmount || 0);
        const progress = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
        return { ...goal, progress };
      })
      .sort((a, b) => b.progress - a.progress)[0];

    const nextBill = bills
      .filter((bill) => !bill.paid)
      .map((bill) => ({ ...bill, days: getDaysUntil(bill.dueDate) }))
      .sort((a, b) => a.days - b.days)[0];

    return {
      spendingTransactions,
      partnerOneSpent,
      partnerTwoSpent,
      baseAfterFixedCosts,
      available,
      monthlySavingsNeeded,
      monthsRemaining,
      savingsProgress,
      savingsTarget: profile.savingsTarget,
      savingsTargetDate: profile.savingsTargetDate,
      topGoal,
      nextBill,
    };
  }, [
    allMembers,
    bills,
    goals,
    profile.partnerOneName,
    profile.partnerTwoName,
    profile.savingsTarget,
    profile.savingsTargetDate,
    transactions,
  ]);

  const recentTransactions = transactions.slice(0, 3);

  return (
    <section className="page-stack">
      <article className="hero-card rise-in">
        <p className="hero-label">Left this month for {profile.coupleName}</p>
        <h2>{formatCurrency(metrics.available)}</h2>
        <p className="hero-subtext">
          {profile.partnerOneName} and {profile.partnerTwoName} — combined after fixed costs
        </p>
      </article>

      <div className="metric-grid rise-in delay-1">
        <article className="metric-card">
          <p>After fixed costs</p>
          <h3>{formatCurrency(metrics.baseAfterFixedCosts)}</h3>
        </article>
        <article className="metric-card">
          <p>Combined extra expenses</p>
          <h3>{formatCurrency(metrics.spendingTransactions)}</h3>
        </article>
      </div>

      <div className="metric-grid rise-in delay-2">
        <article className="metric-card">
          <p>{profile.partnerOneName} spent</p>
          <h3>{formatCurrency(metrics.partnerOneSpent)}</h3>
        </article>
        <article className="metric-card">
          <p>{profile.partnerTwoName} spent</p>
          <h3>{formatCurrency(metrics.partnerTwoSpent)}</h3>
        </article>
      </div>

      {(allMembers.find((m) => m.partnerName === profile.partnerOneName)?.monthlyExtraIncome || allMembers.find((m) => m.partnerName === profile.partnerTwoName)?.monthlyExtraIncome) && (
        <div className="metric-grid rise-in delay-2">
          <article className="metric-card">
            <p>{profile.partnerOneName} extra income</p>
            <h3>{formatCurrency(allMembers.find((m) => m.partnerName === profile.partnerOneName)?.monthlyExtraIncome || 0)}</h3>
          </article>
          <article className="metric-card">
            <p>{profile.partnerTwoName} extra income</p>
            <h3>{formatCurrency(allMembers.find((m) => m.partnerName === profile.partnerTwoName)?.monthlyExtraIncome || 0)}</h3>
          </article>
        </div>
      )}

      <article className="surface-card rise-in delay-2">
        <p className="muted tiny-text">
          Salary and fixed bill values are managed in the Settings menu so your tracking screens stay clean.
        </p>
      </article>

      <article className="surface-card rise-in delay-2">
        <div className="row-space">
          <h3>Couple Savings Target</h3>
          <span className="pill">{Math.round(metrics.savingsProgress)}%</span>
        </div>
        {metrics.savingsTargetDate ? (
          <>
            <p>
              Target: {formatCurrency(metrics.savingsTarget)} by {new Date(metrics.savingsTargetDate).toLocaleDateString()}
            </p>
            <p className="muted tiny-text">
              Monthly savings needed: {formatCurrency(metrics.monthlySavingsNeeded)} ({metrics.monthsRemaining} months remaining)
            </p>
          </>
        ) : (
          <p className="muted">Set a savings target amount and date in Settings.</p>
        )}
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${metrics.savingsProgress}%` }} />
        </div>
      </article>

      <article className="surface-card rise-in delay-2">
        <div className="row-space">
          <h3>Top Goal</h3>
          <span className="pill">
            {metrics.topGoal ? `${Math.round(metrics.topGoal.progress)}% complete` : "No goals yet"}
          </span>
        </div>
        <p>{metrics.topGoal ? metrics.topGoal.name : "Create your first goal in the Goals tab."}</p>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${metrics.topGoal ? Math.round(metrics.topGoal.progress) : 0}%` }}
          />
        </div>
        <small>
          {metrics.topGoal
            ? `${formatCurrency(metrics.topGoal.currentAmount)} / ${formatCurrency(metrics.topGoal.targetAmount)}`
            : "No goal amount to show yet."}
        </small>
      </article>

      <article className="surface-card rise-in delay-3">
        <div className="row-space">
          <h3>Upcoming Bill</h3>
          <span className="pill pill-warning">
            {metrics.nextBill
              ? metrics.nextBill.days >= 0
                ? `${metrics.nextBill.days} days`
                : "Overdue"
              : "No unpaid bills"}
          </span>
        </div>
        <p>{metrics.nextBill ? metrics.nextBill.name : "Your bill list is clear."}</p>
        <strong>{metrics.nextBill ? formatCurrency(metrics.nextBill.amount) : formatCurrency(0)}</strong>
      </article>

      <article className="surface-card rise-in delay-3">
        <div className="row-space">
          <h3>Recent Activity</h3>
          <span className="pill">{recentTransactions.length}</span>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="mini-list">
            {recentTransactions.map((entry) => (
              <div key={entry.id} className="mini-row">
                <span>{entry.title}</span>
                <strong>{formatCurrency(entry.amount)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Add your first transaction to start tracking trends.</p>
        )}
      </article>
    </section>
  );
}

export default Dashboard;