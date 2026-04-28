# Pocket Ledger

Pocket Ledger is a mobile-first couples budget tracker built with React and Firebase. Two partners sign in with their own email/password accounts, create or join a shared household, and manage joint finances together. All transactions, bills, goals, budgets, and settings are shared in real-time via Firestore.

## Features

- **Couple Onboarding**: One partner creates a household and generates an invite code; the other joins with that code
- **Shared Finances**: Both partners see and edit all transactions, bills, budgets, and goals in real-time
- **Income Tracking**: Set base salary and optional extra income per partner
- **Bills Management**: Track recurring bills with due dates and responsible partner assignment
- **Transactions**: Log spending with category assignment and budget tracking
- **Budgets**: Set category budgets and view spending vs. limit with visual progress
- **Recurring Transactions**: Auto-populate monthly recurring transactions
- **Savings Goals**: Set a target amount and date; app calculates monthly savings needed
- **Responsive Design**: Mobile-first UI optimized for phone and tablet use

## Live Demo

Visit the app at: **https://itzgazz-it.github.io/couples-app/**

(Note: Requires Firebase authentication setup—see Firebase Setup below)

## Local Development

In the project directory, run:

```bash
npm install
npm start
```

The app will open in development mode on the first free port (typically http://localhost:3000/couples-app).

## Firebase Setup

1. In [Firebase Console](https://console.firebase.google.com), open **Authentication**.
2. Enable the **Email/Password** sign-in provider.
3. Open **Firestore Database** and create the database if you haven't already.
4. Deploy the Firestore security rules from [firestore.rules](firestore.rules).

To deploy rules with Firebase CLI:

```bash
firebase login
firebase use finance-app-58a6d
firebase deploy --only firestore:rules
```

## Data Model

Pocket Ledger uses a household-based data model where two partners share a household:

```
households/{householdId}/
  ├── meta/profile          (couple name, partner names, savings target, invite code)
  ├── members/{memberId}    (each partner's income and finances)
  ├── transactions/         (shared transaction log)
  ├── budgets/              (category-month budgets, e.g., "Groceries-2026-04")
  ├── goals/                (savings goals)
  └── bills/                (recurring bills)

users/{uid}/
  ├── meta/membership       (householdId pointer)
  └── (other user-specific data)

invites/{inviteCode}        (one-time join links)
```

Security rules ensure:
- Only household members can read/write household data
- Each user can only modify their own member finances during onboarding
- The household creator can set up initial profile and sub-documents before the second partner joins

## Build & Test

Validate the app with:

```bash
npm test -- --watchAll=false
npm run build
npm run deploy
```

## Deployment

The app is deployed to GitHub Pages at https://itzgazz-it.github.io/couples-app/.

To deploy updates:

```bash
npm run deploy
```

This builds the app and pushes the `build/` folder to the `gh-pages` branch.

