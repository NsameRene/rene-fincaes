# Rene Finance

> **Understand your money. Control your future.**

Rene Finance is a premium, 100% offline personal finance and cash-flow management application. Built with React, TypeScript, Tailwind CSS, and designed to package seamlessly into a standalone Android APK with Capacitor.

---

## Key Features

- **100% Offline by Design**: No cloud accounts, remote APIs, external servers, or ads. All financial records reside strictly on your local device.
- **Authoritative Multi-Account Tracking**:
  - Cash in Hand
  - MTN Mobile Money (MoMo)
  - Orange Money (OM)
  - Bank Accounts & Checking
  - Dedicated Savings Accounts
- **Atomic Transfers**: Move money between accounts (e.g. Bank to MTN Mobile Money) with atomic balance updates without distorting income and expense totals.
- **Income & Expenditure Management**:
  - Categorization, custom tags, and recurring indicators
  - Search, sort by amount and date, and multi-criteria filtering
  - Transaction detail drawer with edit and delete capabilities
- **Budgets & Local Alerting**:
  - Overall monthly limits & category-specific budgets
  - Real-time progress bars with configurable 75%, 90%, and 100% threshold indicators
  - End-of-month projected spending calculations
- **Savings Goals & Milestones**:
  - Goal tracking with target dates and linked accounts
  - Deposit and withdrawal contribution logs with celebration feedback
- **Deterministic Rule-Based Analytics**:
  - 7-day spending trend curve with interactive SVG tooltips
  - Month-over-month comparisons (e.g. *"Transport spending is 18% higher than last month"*)
  - Category breakdown ring and daily average spending
- **Local Backup & CSV Export**:
  - Full versioned JSON backup and restore with structure validation
  - Export transaction activity to standard CSV spreadsheet
- **Device-Native Biometric Authentication**:
  - Secure Fingerprint and Face ID authentication powered by native Capacitor biometric plugin (`@aparajita/capacitor-biometric-auth`)
  - Guaranteed 4-digit Fallback PIN protection if biometrics fail or hardware is not enrolled
  - Configurable Inactivity Auto-Lock (Instant on app minimize, 1 min, 2 min, 5 min)
  - Sensitive section authorization guarding database backups and data reset operations
  - Quick eye toggle to obscure balance numbers in public places
- **Native Android APK Ready**:
  - Configured with package ID `com.rene.finance`, viewport safe-areas, and splash styling

---

## Architecture & Storage Layer

Rene Finance uses a clean repository abstraction layer (`IFinanceRepository`):
- **Web & PWA Mode**: Backed by `rene_finance_db` via browser `IndexedDB` with full schema parity and ACID transactions.
- **Native Android Mode**: When packaged using Capacitor, data persistence is maintained locally on the device file system without external telemetry.

### Entities:
- `settings`: Theme, default currency (XAF default), user name, security PIN hash.
- `accounts`: Account metadata, opening balance, current computed balance.
- `categories`: Income and expense categorization with color badges.
- `transactions`: Typed records (`income`, `expense`, `transfer`) with atomic balance triggers.
- `budgets`: Spending limits with alert thresholds and projections.
- `savings_goals` & `savings_contributions`: Milestone progress tracking.

---

## Development & Testing Commands

### Run Development Server
```bash
npm run dev
```

### Run Automated Unit Tests
```bash
npm test
```

### Compile & Build Production Bundle
```bash
npm run build
```

---

## Packaging into an Android APK

1. Build the production web bundle:
   ```bash
   npm run build
   ```

2. Initialize and add the Android platform (first-time setup):
   ```bash
   npx cap add android
   ```

3. Synchronize assets and plugins to the native Android directory:
   ```bash
   npx cap sync android
   ```

4. Open the project in Android Studio:
   ```bash
   npx cap open android
   ```

5. In Android Studio:
   - Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**
   - The generated APK will be output to `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Offline Testing Instructions

1. Install `app-debug.apk` on a physical Android device or emulator.
2. Turn on **Airplane Mode** (disable Wi-Fi and Mobile Data).
3. Open **Rene Finance**:
   - Complete first-launch setup or load demo records.
   - Record new income and expense entries.
   - Execute an account transfer.
   - Check the Analytics and Budgets tabs.
   - Close the app completely (swipe away from recent apps).
   - Reopen Rene Finance in airplane mode: all balances and transactions remain immediately available.

---

## License

Apache-2.0
