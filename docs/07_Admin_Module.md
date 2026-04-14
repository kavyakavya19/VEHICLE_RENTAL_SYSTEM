# 07. Admin Module

## 💼 Management Overview
The Perfect Wheels **Admin Module** provides a set of powerful tools for vehicle owners to monitor their business and fleet. The admin interface is restricted to users with the `ADMIN` role.

---

## 📊 Admin Dashboard
The dashboard provides a high-level overview of the entire rental system:
*   **Late Returns Section**: Lists all bookings that have been returned late or with potential damages.
*   **Fleet Status**: Monitoring how many vehicles are currently **Out (Ongoing)**, **In Maintenance**, or **Ready for Rental**.
*   **Revenue Reports**: High-level tracking of rental income and fine revenue.

---

## 🚗 Vehicle Management
Admins have full CRUD (Create, Read, Update, Delete) capability over the vehicle fleet:
*   **Add New Vehicle**: Input details like Brand, Name, Type, Plate Number, Price/Day, security deposit, and late fee.
*   **Edit Fleet**: Update pricing or images as needed.
*   **Maintenance Toggle**: Admins can mark a car as "Under Maintenance". Doing so **instantly hides** the vehicle from the user's booking portal to prevent customers from selecting it.

---

## 🏁 Late Return & Damage Approval (Finalizing Trip)
This is a critical admin responsibility:
1.  **Incoming Return**: When a user clicks "End Trip", it appears in the Admin Dashboard.
2.  **Inspection**: Admin inspects the vehicle for any new scratches or mechanical issues.
3.  **Data Entry**: Admin inputs **Late Fine Amount** and **Damage Charge**.
4.  **Finalize Trip**: Clicking "Finalize" triggers the backend to:
    *   Calculate the Final Refund.
    *   **Credit the Wallet**: Automatically move the deposit (minus fines) to the user's wallet.
    *   Modify the Booking status $\rightarrow$ `REFUNDED`.

---

## 📑 Booking Management
Admins can view and filter through every booking in the system:
*   **All Bookings**: Monitoring the lifecycle of all customer rentals.
*   **Payment Tracking**: Verifying which bookings are paid and which are pending/failed.
*   **Customer Verification**:Reviewing and confirming driver's license details for new users.

---

## 📈 Analytics & Reports
The Admin Panel allows for simple business review:
*   **Most Popular Vehicles**: Tracking which cars/bikes are being booked most frequently.
*   **Total Fine Income**: Monitoring revenue generated from late return penalties.
*   **Fleet Utilization**: Percentage of the fleet currently out on trips.
*   **Customer Base**: Reviewing all registered and verified users.

---

## 🔒 Security for Admins
Access to the Admin dashboard is protected by several layers:
1.  **Backend Permissions**: Any request to admin-only APIs without a valid `ADMIN` JWT token is rejected with a **403 Forbidden** error.
2.  **Frontend Routing**: The React app uses a **Protected Route** component that redirects non-admins away from the admin pages.
3.  **UI Hiding**: Admin links (like "Late Fines" or "Add Vehicle") are conditionally hidden in the navbar for standard users.
