import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const PROFILE_DEFAULTS = {
  coupleName: "",
  partnerOneName: "",
  partnerTwoName: "",
  savingsTarget: 0,
  savingsTargetDate: "",
  inviteCode: "",
};

const MEMBERSHIP_DEFAULTS = {
  householdId: "",
  partnerName: "",
};

const MEMBER_FINANCES_DEFAULTS = {
  monthlyIncome: 0,
  monthlyExtraIncome: 0,
};

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function useFinanceData(user) {
  const userId = user?.uid || "";
  const [membership, setMembership] = useState(MEMBERSHIP_DEFAULTS);
  const [profile, setProfile] = useState(PROFILE_DEFAULTS);
  const [allMembers, setAllMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Resolve membership first
  useEffect(() => {
    if (!userId) {
      setMembership(MEMBERSHIP_DEFAULTS);
      setProfile(PROFILE_DEFAULTS);
      setAllMembers([]);
      setTransactions([]);
      setGoals([]);
      setBills([]);
      setError("");
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const membershipRef = doc(db, "users", userId, "meta", "membership");

    return onSnapshot(
      membershipRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setMembership({ ...MEMBERSHIP_DEFAULTS, ...snapshot.data() });
        } else {
          setMembership(MEMBERSHIP_DEFAULTS);
        }
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      }
    );
  }, [userId]);

  const householdId = membership.householdId;
  const householdPath = useMemo(() => (householdId ? ["households", householdId] : []), [householdId]);

  // Subscribe to household data once membership is resolved
  useEffect(() => {
    if (!householdId) {
      setProfile(PROFILE_DEFAULTS);
      setAllMembers([]);
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setBills([]);
      return undefined;
    }

    setLoading(true);
    setError("");

    const profileRef = doc(db, ...householdPath, "meta", "profile");
    const membersRef = collection(db, ...householdPath, "members");
    const transactionsRef = collection(db, ...householdPath, "transactions");
    const budgetsRef = collection(db, ...householdPath, "budgets");
    const goalsRef = collection(db, ...householdPath, "goals");
    const billsRef = collection(db, ...householdPath, "bills");

    let pendingSnapshots = 6;
    const resolveLoading = () => {
      pendingSnapshots -= 1;
      if (pendingSnapshots <= 0) setLoading(false);
    };

    const unsubProfile = onSnapshot(
      profileRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setProfile({
            ...PROFILE_DEFAULTS,
            ...data,
            savingsTarget: Number(data.savingsTarget || 0),
            savingsTargetDate: data.savingsTargetDate || "",
          });
        } else {
          setProfile(PROFILE_DEFAULTS);
        }
        resolveLoading();
      },
      (snapshotError) => {
        setError(snapshotError.message);
        resolveLoading();
      }
    );

    const unsubMembers = onSnapshot(
      membersRef,
      (snapshot) => {
        setAllMembers(
          snapshot.docs.map((entry) => ({
            uid: entry.id,
            monthlyIncome: 0,
            monthlyExtraIncome: 0,
            ...entry.data(),
          }))
        );
        resolveLoading();
      },
      (snapshotError) => {
        setError(snapshotError.message);
        resolveLoading();
      }
    );

    const unsubTransactions = onSnapshot(
      query(transactionsRef, orderBy("date", "desc")),
      (snapshot) => {
        setTransactions(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
        resolveLoading();
      },
      (snapshotError) => {
        setError(snapshotError.message);
        resolveLoading();
      }
    );

    const unsubBudgets = onSnapshot(
      budgetsRef,
      (snapshot) => {
        setBudgets(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
        resolveLoading();
      },
      (snapshotError) => {
        setError(snapshotError.message);
        resolveLoading();
      }
    );

    const unsubGoals = onSnapshot(
      query(goalsRef, orderBy("createdAt", "desc")),
      (snapshot) => {
        setGoals(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
        resolveLoading();
      },
      (snapshotError) => {
        setError(snapshotError.message);
        resolveLoading();
      }
    );

    const unsubBills = onSnapshot(
      query(billsRef, orderBy("dueDate", "asc")),
      (snapshot) => {
        setBills(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
        resolveLoading();
      },
      (snapshotError) => {
        setError(snapshotError.message);
        resolveLoading();
      }
    );

    return () => {
      unsubProfile();
      unsubMembers();
      unsubTransactions();
      unsubBudgets();
      unsubGoals();
      unsubBills();
    };
  }, [householdId, householdPath]);

  // Current user's own member finances doc (derived from allMembers)
  const myFinances = useMemo(() => {
    const found = allMembers.find((m) => m.uid === userId);
    return found ? { monthlyIncome: Number(found.monthlyIncome || 0), monthlyExtraIncome: Number(found.monthlyExtraIncome || 0) } : MEMBER_FINANCES_DEFAULTS;
  }, [allMembers, userId]);

  const requireUser = useCallback(() => {
    if (!userId) throw new Error("You must be signed in to manage your budget data.");
  }, [userId]);

  const requireHousehold = useCallback(() => {
    if (!householdId) throw new Error("Join or create a household first.");
  }, [householdId]);

  // â”€â”€ Step 1 Create: create household profile + invite (no membership yet) â”€â”€
  const createHouseholdProfile = useCallback(
    async (payload) => {
      requireUser();

      const householdRef = await addDoc(collection(db, "households"), {
        createdBy: userId,
        createdAt: serverTimestamp(),
      });

      const inviteCode = generateInviteCode();

      await setDoc(doc(db, "households", householdRef.id, "meta", "profile"), {
        coupleName: payload.coupleName,
        partnerOneName: payload.partnerOneName,
        partnerTwoName: payload.partnerTwoName,
        savingsTarget: 0,
        savingsTargetDate: "",
        inviteCode,
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, "invites", inviteCode), {
        householdId: householdRef.id,
        createdBy: userId,
        createdAt: serverTimestamp(),
      });

      return {
        householdId: householdRef.id,
        inviteCode,
        partnerOneName: payload.partnerOneName,
        partnerTwoName: payload.partnerTwoName,
      };
    },
    [requireUser, userId]
  );

  // â”€â”€ Step 1 Join: look up invite + return household profile (no writes) â”€â”€
  const lookupInvite = useCallback(
    async (inviteCode) => {
      requireUser();

      const normalized = String(inviteCode || "").trim().toUpperCase();
      if (!normalized) throw new Error("Invite code is required.");

      const inviteSnap = await getDoc(doc(db, "invites", normalized));
      if (!inviteSnap.exists()) throw new Error("Invite code not found.");

      const { householdId: foundId } = inviteSnap.data();
      const profileSnap = await getDoc(doc(db, "households", foundId, "meta", "profile"));
      if (!profileSnap.exists()) throw new Error("Household data missing. Contact your partner.");

      return { householdId: foundId, profile: { ...PROFILE_DEFAULTS, ...profileSnap.data() } };
    },
    [requireUser]
  );

  // â”€â”€ Step 3 (shared for create + join): write membership + personal finances â”€â”€
  const completeMemberSetup = useCallback(
    async (targetHouseholdId, partnerName, finances) => {
      requireUser();

      // Save personal finances under households/{id}/members/{uid}
      await setDoc(doc(db, "households", targetHouseholdId, "members", userId), {
        partnerName,
        monthlyIncome: Number(finances.monthlyIncome) || 0,
        joinedAt: serverTimestamp(),
      });

      // Write membership last â€” this triggers the subscription in useFinanceData â†’ app loads
      await setDoc(doc(db, "users", userId, "meta", "membership"), {
        householdId: targetHouseholdId,
        partnerName,
      });
    },
    [requireUser, userId]
  );

  // â”€â”€ Settings: update couple-level profile (names, savings goal) â”€â”€
  const updateProfileSettings = useCallback(
    async (payload) => {
      requireUser();
      requireHousehold();
      const profileRef = doc(db, ...householdPath, "meta", "profile");
      await setDoc(
        profileRef,
        {
          coupleName: payload.coupleName,
          partnerOneName: payload.partnerOneName,
          partnerTwoName: payload.partnerTwoName,
          savingsTarget: Number(payload.savingsTarget) || 0,
          savingsTargetDate: payload.savingsTargetDate || "",
        },
        { merge: true }
      );
    },
    [householdPath, requireHousehold, requireUser]
  );

  // â”€â”€ Settings: update this user's personal finances â”€â”€
  const updateMemberFinances = useCallback(
    async (payload) => {
      requireUser();
      requireHousehold();
      await setDoc(
        doc(db, ...householdPath, "members", userId),
        {
          monthlyIncome: Number(payload.monthlyIncome) || 0,
          monthlyExtraIncome: Number(payload.monthlyExtraIncome) || 0,
        },
        { merge: true }
      );
    },
    [householdPath, requireHousehold, requireUser, userId]
  );

  const addTransaction = useCallback(
    async (payload) => {
      requireUser();
      requireHousehold();
      const transactionsRef = collection(db, ...householdPath, "transactions");
      await addDoc(transactionsRef, {
        title: payload.title,
        category: payload.category,
        partner: membership.partnerName || payload.partner,
        amount: Number(payload.amount),
        type: payload.type,
        date: payload.date,
        isRecurring: payload.isRecurring || false,
        createdAt: serverTimestamp(),
      });
    },
    [householdPath, membership.partnerName, requireHousehold, requireUser]
  );

  const deleteTransaction = useCallback(
    async (transactionId) => {
      requireUser();
      requireHousehold();
      await deleteDoc(doc(db, ...householdPath, "transactions", transactionId));
    },
    [householdPath, requireHousehold, requireUser]
  );

  const addGoal = useCallback(
    async (payload) => {
      requireUser();
      requireHousehold();
      await addDoc(collection(db, ...householdPath, "goals"), {
        name: payload.name,
        targetAmount: Number(payload.targetAmount),
        currentAmount: Number(payload.currentAmount) || 0,
        createdAt: serverTimestamp(),
      });
    },
    [householdPath, requireHousehold, requireUser]
  );

  const updateGoalAmount = useCallback(
    async (goalId, nextAmount) => {
      requireUser();
      requireHousehold();
      await updateDoc(doc(db, ...householdPath, "goals", goalId), {
        currentAmount: Number(nextAmount) || 0,
      });
    },
    [householdPath, requireHousehold, requireUser]
  );

  const deleteGoal = useCallback(
    async (goalId) => {
      requireUser();
      requireHousehold();
      await deleteDoc(doc(db, ...householdPath, "goals", goalId));
    },
    [householdPath, requireHousehold, requireUser]
  );

  const addBill = useCallback(
    async (payload) => {
      requireUser();
      requireHousehold();
      await addDoc(collection(db, ...householdPath, "bills"), {
        name: payload.name,
        responsiblePartner: payload.responsiblePartner,
        amount: Number(payload.amount),
        dueDate: payload.dueDate,
        paid: false,
        createdAt: serverTimestamp(),
      });
    },
    [householdPath, requireHousehold, requireUser]
  );

  const toggleBillPaid = useCallback(
    async (billId, paid) => {
      requireUser();
      requireHousehold();
      await updateDoc(doc(db, ...householdPath, "bills", billId), { paid });
    },
    [householdPath, requireHousehold, requireUser]
  );

  const deleteBill = useCallback(
    async (billId) => {
      requireUser();
      requireHousehold();
      await deleteDoc(doc(db, ...householdPath, "bills", billId));
    },
    [householdPath, requireHousehold, requireUser]
  );

  // Budget management
  const setBudgetLimit = useCallback(
    async (category, limitAmount, month = null) => {
      requireUser();
      requireHousehold();
      const targetMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM format
      const budgetId = `${category}-${targetMonth}`;
      await setDoc(
        doc(db, ...householdPath, "budgets", budgetId),
        {
          category,
          limit: Number(limitAmount),
          month: targetMonth,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [householdPath, requireHousehold, requireUser]
  );

  const deleteBudget = useCallback(
    async (budgetId) => {
      requireUser();
      requireHousehold();
      await deleteDoc(doc(db, ...householdPath, "budgets", budgetId));
    },
    [householdPath, requireHousehold, requireUser]
  );

  // Populate recurring transactions for current month
  const populateRecurringTransactions = useCallback(
    async () => {
      requireUser();
      requireHousehold();
      const recurringTxns = transactions.filter((t) => t.isRecurring);
      const today = new Date();
      const currentMonth = today.toISOString().slice(0, 7);

      for (const txn of recurringTxns) {
        // Check if already exists for this month
        const existingForMonth = transactions.find(
          (t) =>
            t.title === txn.title &&
            t.date.startsWith(currentMonth) &&
            t.isRecurring === false
        );
        if (!existingForMonth) {
          // Create new non-recurring copy for this month
          const newDate = new Date(today);
          newDate.setDate(parseInt(txn.date.split("-")[2]) || 1);
          await addDoc(collection(db, ...householdPath, "transactions"), {
            title: txn.title,
            category: txn.category,
            partner: txn.partner,
            amount: txn.amount,
            type: txn.type,
            date: newDate.toISOString().slice(0, 10),
            isRecurring: false,
            sourceRecurringId: txn.id,
            createdAt: serverTimestamp(),
          });
        }
      }
    },
    [householdPath, requireHousehold, requireUser, transactions]
  );

  return {
    userId,
    loading,
    error,
    householdId,
    membership,
    profile,
    allMembers,
    myFinances,
    transactions,
    budgets,
    goals,
    bills,
    createHouseholdProfile,
    lookupInvite,
    completeMemberSetup,
    updateProfileSettings,
    updateMemberFinances,
    addTransaction,
    deleteTransaction,
    setBudgetLimit,
    deleteBudget,
    populateRecurringTransactions,
    addGoal,
    updateGoalAmount,
    deleteGoal,
    addBill,
    toggleBillPaid,
    deleteBill,
  };
}
