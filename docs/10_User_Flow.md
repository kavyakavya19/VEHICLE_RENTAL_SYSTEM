# 10. User Journey Step-by-Step

## 🚶 Overview
The user journey at Perfect Wheels is designed to be as frictionless as possible. Users complete their booking and return their vehicle in 6 simple phases.

---

## 🏗️ Phase 1: Registration & Profile (Once)
1.  **Register**: Sign up with name, email, and password.
2.  **Login**: Securely log in using the credentials.
3.  **Complete Profile**: Navigate to the "Complete Profile" page to input **Driver's License Number** and upload a clear **License Image**.
4.  **Verification**: Wait for the system to verify the license (standard protocol before first booking).

---

## 🔍 Phase 2: Browse & Select
1.  **Home Page**: Explore the top category car/bike options.
2.  **Filter**: Browse all vehicles in the "Vehicles" tab.
3.  **View Detail**: Click a vehicle to see its description, price per day, security deposit, and late fee.
4.  **Select Dates**: Use a date picker to specify the rental start and end.
5.  **Availability Check**: Click "Check Availability". The system confirms if the vehicle is free for those dates.

---

## 💳 Phase 3: Booking & Payment
1.  **Review Order**: The "Checkout" page displays the total breakdown: `Rental + Refundable Deposit`.
2.  **Apply Coupon**: Input any promo code (like 'SAVE20') for a discount on the rental portion.
3.  **Pay via Razorpay**: Use the secure popup to pay via Card, UPI, or Net Banking.
4.  **Confirm**: Booking status moves to `CONFIRMED`.

---

## 🚗 Phase 4: The Trip
1.  **Start Trip**: On the scheduled start date, go to the dashboard and click **"Start Trip"**.
2.  **Use Vehicle**: Perfect Wheels records the trip as `ONGOING`.
3.  **Return Vehicle**: On or before the scheduled end date, return the vehicle to the designated location.
4.  **End Trip**: Go to the dashboard and click **"End Trip"**.

---

## 🏁 Phase 5: Finalization (Refund/Fine)
1.  **On-Time Return**:
    *   Booking moves to `COMPLETED`.
    *   Security deposit is automatically refunded to the **User Wallet**.
2.  **Late Return / Damage**:
    *   Booking moves to `PENDING_APPROVAL`.
    *   Admin reviews late days and any vehicle damage.
    *   Admin finalizes the fine $\rightarrow$ Balance is refunded to the **User Wallet**.
    *   Booking status $\rightarrow$ `REFUNDED`.

---

## 📄 Phase 6: Post-Trip Actions
1.  **Download Invoice**: Find the booking in "Booking History" and click **"📄 Download Invoice"**. 
2.  **Review Vehicle (Future Scope)**: Rate your experience and leave a review for other customers.
3.  **Next Booking**: Use your Wallet balance or Razorpay to book another ride!
