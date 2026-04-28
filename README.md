# Pocket Ledger

Pocket Ledger is a mobile-first budget tracker built with React and Firebase. Users sign in with email/password, and each account stores its own transactions, goals, bills, and profile data in Firestore.

## Local Development

In the project directory, run:

```bash
npm install
npm start
```

The app will open in development mode on the first free port.

## Firebase Setup

1. In Firebase Console, open Authentication.
2. Enable the Email/Password sign-in provider.
3. In Firestore Database, create the database if you have not already.
4. Deploy the Firestore rules in [firestore.rules](firestore.rules).

If you use Firebase CLI, run:

```bash
firebase login
firebase use finance-app-58a6d
firebase deploy --only firestore:rules
```

## Data Model

All user data is stored under this Firestore path structure:

```text
users/{uid}/meta/profile
users/{uid}/transactions/{transactionId}
users/{uid}/goals/{goalId}
users/{uid}/bills/{billId}
```

The bundled rules only allow the authenticated user to read and write their own subtree.

## Verification

Use these commands to validate the app:

```bash
npm test -- --watchAll=false
npm run build
```
