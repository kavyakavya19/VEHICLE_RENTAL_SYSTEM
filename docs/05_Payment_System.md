# 05. Payment System

## 💰 Overview
The system uses **Razorpay** to process all external financial transactions. It is designed to handle multiple payment scenarios securely and transparently.

---

## 💳 Razorpay Integration
The system implements a **Secure Two-Step Verification** for every payment:
1.  **Frontend Order Request**: When the user clicks "Pay", the frontend requests a unique `order_id` from the Django backend.
2.  **Razorpay Checkout Overlay**: The user completes the payment via the Razorpay UI (Credit Card, UPI, etc.).
3.  **Backend Verification**: Once payment is done, Razorpay returns a `payment_id` and `signature`. The backend **MUST** verify this signature using the Razorpay SDK before marking the booking as `CONFIRMED`.

---

## 💵 External Payments (Razorpay)
### 1. Booking Payment & Security Deposit
Every booking requires a single upfront payment that covers:
*   **Rental Amount**: Total cost for the selected days.
*   **Security Deposit**: A refundable deposit which depends on the vehicle type.
*   **Coupon Discount**: Subtraction from the rental portion (if applicable).
*   **Final Total**: `(Rental - Coupon) + Security Deposit`.

### 2. Fine Payment (Direct)
If a user is fined for a late return, they can pay the fine directly using the same Razorpay checkout experience from their **Booking History** page.

---

## 💰 Internal Payments (Wallet)
### 1. Security Deposit Refund
Once a trip is completed and the admin approves the return:
*   **Net Refund** = `Deposit Paid` - `Late Fine` - `Damage Charges`.
*   The balance is instantly credited to the user's **In-App Wallet**.
*   This refund is handled internally and does not go back to the original bank account (allowing users to use it for future bookings).

---

## 🔄 Payment Status Flow
The `Payment` record in the database tracks every attempt:
*   **`PENDING`**: Payment initiated, user is currently in the Razorpay gateway.
*   **`SUCCESS`**: Payment verified and funds received.
*   **`FAILED`**: User cancelled the payment, or it was declined by the bank.

---

## 🔐 Security & Integrity
*   **Atomic Transactions**: All payment verification logic is wrapped in `db.transaction.atomic()`. This ensures that either both the `Payment` and `Booking` records are updated or neither is — preventing "phantom" payments where money is taken but the booking remains pending.
*   **Ownership Check**: The backend verifies that the user currently logged in is the same user who created the booking before accepting any payment.
*   **Signature Matching**: Razorpay's HMAC signature is matched against the backend's secret key for tamper-proof verification.
