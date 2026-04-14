# 04. Booking System & Trip Lifecycle

## 📅 Booking Process
The Perfect Wheels booking system is designed for maximum reliability. Users follow a specific journey:
1.  **Browse Vehicles**: Users can see all vehicles in the fleet.
2.  **Date Selection**: Users choose their `start_date` and `end_date`.
3.  **Availability Check**: The system queries the database to see if the vehicle has any other **PENDING**, **CONFIRMED**, **ONGOING**, or **PENDING_APPROVAL** bookings that overlap with the selected dates.
4.  **Pricing Calculation**: Rental price = `Vehicle Price / Day` x `Total Days`. Any **Coupon** is applied to the **Rental Amount** only.
5.  **Security Deposit**: A refundable deposit is automatically added to the **Total Price**.
6.  **Checkout**: User confirms the summary and initiates payment.

---

## 🚦 Booking Status Flow (Lifecycle)
The booking evolves through several distinct states:
*   **`PENDING`**: Booking created, awaiting payment from the user.
*   **`CONFIRMED`**: Payment verified (via Razorpay). Dates are locked for other users.
*   **`ONGOING`**: User starts the trip. Vehicle is marked as unavailable.
*   **`PENDING_APPROVAL`**: User ends the trip. If returned late or damaged, the admin must review the vehicle and finalize the fine/damage charges.
*   **`COMPLETED`**: Trip ended on time with no issues or fine confirmed.
*   **`REFUNDED`**: Admin finalized damages/fines, and the security deposit refund was credited to the user's wallet.
*   **`CANCELLED`**: Payment failed or user cancelled before starting the trip.

---

## 🕒 Trip Management
Users manage their active trips directly from their **Dashboard**.
### 🏁 Start Trip
*   **Action**: Clicking "Start Trip" on the dashboard.
*   **Logic**: Only allowed on or after the `start_date` and if the status is `CONFIRMED`.
*   **Outcome**: Status $\rightarrow$ `ONGOING`. Vehicle $\rightarrow$ `availability_status = False`.

### 🛑 End Trip
*   **Action**: Clicking "End Trip" on the dashboard.
*   **Logic**: The system compares the current date with the `end_date` in the record.
*   **Outcome**:
    *   **On-Time**: Status $\rightarrow$ `COMPLETED`. Vehicle becomes available for other users.
    *   **Late**: Status $\rightarrow$ `PENDING_APPROVAL`. Late fines are automatically calculated.

---

## 💸 Late Return & Fine Logic
If the user returns the vehicle after the scheduled `end_date`, the system applies a penalty:
1.  **Formula**: `Late Days` = (Actual Date - End Date).
2.  **Fine**: `Fine Amount` = `Late Days` x `Vehicle Late Fee / Day`.
3.  **Settlement**:
    *   Admin reviews the late return in the **Admin Panel**.
    *   Admin can adjust the fine or add **Damage Charges**.
    *   The total penalty is deducted from the user's **Security Deposit**.
    *   The remaining balance is refunded to the **User Wallet**.

---

## 🛡️ Booking Restrictions
To ensure financial reliability, the system enforces a strict rule:
*   **Unpaid Fines**: If a user has any booking in `PENDING_APPROVAL` with an outstanding fine, they are strictly **blocked** from creating any new bookings until the previous issue is settled.
*   **Profile Mandatory**: Users cannot book without a verified profile (license number and image).
