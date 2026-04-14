# 06. Wallet System

## 👛 Overview
The **Wallet System** is an in-app feature that allows users to manage their funds within the Perfect Wheels ecosystem. It is primarily used to receive security deposit refunds and settle late fines.

---

## 🏗️ Wallet Architecture
*   **One-to-One Relationship**: Every registered user in the system is automatically assigned a single **Wallet** upon their first transaction or when they view their dashboard.
*   **Balance Monitoring**: The wallet balance is stored as a `DecimalField` in the `Wallets` table for high financial precision.
*   **Transactional Ledger**: Every time the wallet balance changes, a record is created in the `WalletTransactions` table (Audit Trail).

---

## 🔄 Wallet Actions

### 1. Security Deposit Refund
1.  **Trip End**: User returns the vehicle.
2.  **Admin Review**: Admin inspects the vehicle and calculates damages/fines.
3.  **Refund Process**: The remaining portion of the deposit is automatically credited to the User's Wallet.
4.  **Notification**: The user sees the updated balance on their dashboard.

### 2. Pay Booking from Wallet (Future Scope)
*   The system is architected to allow users to use their existing wallet balance to pay for new bookings.
*   This is handled by a `PAYMENT` transaction type.

### 3. Pay Fine from Wallet
*   Late return fines can be directly deducted from the security deposit before the refund is issued, or paid directly from the wallet if there is a sufficient balance.

---

## 📜 Wallet Transaction History (Ledger)
Users can view a detailed list of every wallet event:
*   **`REFUND` (+ Amount)**: Received from a completed trip.
*   **`PAYMENT` (- Amount)**: Funds used for a new booking.
*   **`FINE_DEDUCTION` (- Amount)**: Penalty for late return or vehicle damage.

Every transaction record includes:
*   **Related Booking ID**: Links the money to a specific vehicle rental.
*   **Message**: Detailed description (e.g., "Partial refund for Booking #105 after ₹300 damage fee").
*   **Timestamp**: Date and time of the transaction.

---

## 📊 Dashboard Display
The User Dashboard features a **Wallet Card** that shows:
*   **Current Balance**: Real-time available funds.
*   **Total Amount Credited**: Total money received via refunds.
*   **Total Amount Spent**: Fines or payments deducted from the wallet.

---

## 🛑 Balance Safeguards
*   **Atomic Updates**: Wallet balance increments and decrements are performed within a database transaction.
*   **No Negative Balances**: The system prevents transactions that would overdraw the wallet (balance cannot fall below zero).
