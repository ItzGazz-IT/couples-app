import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./services/useAuth", () => ({
  useAuth: () => ({
    user: { email: "demo@example.com", uid: "user-1" },
    loading: false,
    error: "",
    clearError: jest.fn(),
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

jest.mock("./services/useFinanceData", () => ({
  useFinanceData: () => ({
    userId: "user-1",
    householdId: "household-1",
    membership: { householdId: "household-1", partnerName: "A" },
    loading: false,
    error: "",
    profile: {
      coupleName: "Demo Couple",
      partnerOneName: "A",
      partnerTwoName: "B",
      savingsTarget: 50000,
      savingsTargetDate: "2026-12-31",
      inviteCode: "ABC123",
    },
    allMembers: [
      { uid: "user-1", partnerName: "A", monthlyIncome: 25000, monthlyExtraIncome: 0 },
    ],
    myFinances: { monthlyIncome: 25000, monthlyExtraIncome: 0 },
    transactions: [],
    budgets: [],
    createHouseholdProfile: jest.fn(),
    lookupInvite: jest.fn(),
    completeMemberSetup: jest.fn(),
    updateProfileSettings: jest.fn(),
    updateMemberFinances: jest.fn(),
    addTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
    setBudgetLimit: jest.fn(),
    deleteBudget: jest.fn(),
    populateRecurringTransactions: jest.fn(),
    addGoal: jest.fn(),
    updateGoalAmount: jest.fn(),
    deleteGoal: jest.fn(),
    addBill: jest.fn(),
    toggleBillPaid: jest.fn(),
    deleteBill: jest.fn(),
  }),
}));

test("renders budget tracker heading", () => {
  render(<App />);
  const heading = screen.getByText(/budget tracker/i);
  expect(heading).toBeInTheDocument();
});
