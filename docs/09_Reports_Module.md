# 09. Reports & Analytics Module

## 📊 Overview
The **Reports Module** provides data-driven insights into the business health of Perfect Wheels. It allows the management team to understand rental trends, revenue inflows, and fleet efficiency.

---

## 📈 Revenue Reports
Admins can track income across multiple channels:
1.  **Rental Revenue**: Total amount earned from base rental fees (excluding deposits).
2.  **Fine Revenue**: Money collected from late returns and vehicle damages.
3.  **Gross Income**: Total funds processed by Razorpay.
4.  **Net Income**: Calculated by subtracting refunds (returned deposits) from the gross income.

---

## 🚗 Fleet Usage Reports
Admins can monitor the performance of their vehicles:
*   **Most Popular Models**: Which vehicles (Cars, Bikes, Scooters) are being booked most frequently.
*   **Fleet Utilization Rate**: Percentage of the fleet currently out on trips vs. those sitting in the garage.
*   **Maintenance Downtime**: Tracking how much time vehicles spend in "Maintenance" status and how it impacts revenue.

---

## 📅 Booking Trends
Analysis of customer behavior over time:
*   **Daily/Weekly Bookings**: Monitoring peak rental periods (weekends vs weekdays).
*   **Average Trip Duration**: Understanding if customers prefer short-term daily rentals or multi-day trips.
*   **Booking Success Rate**: Ratio of `CONFIRMED` bookings vs `CANCELLED` (due to payment failure or date conflicts).

---

## 💸 Fine & Penalty Reports
Insight into overdue rentals and vehicle care:
*   **Top Late-Returners**: Identifying users who frequently return vehicles past the `end_date`.
*   **Damage Summary**: Total costs associated with repairs found after returns.
*   **Fine-to-Deposit Ratio**: Understanding how often the security deposit is being used to cover penalties.

---

## 👤 User Analytics
Review of the register customer base:
*   **Active Users**: Customers who have made at least one successful booking.
*   **Verification Status**: Percentage of users who have completed their profile and license details.
*   **Wallet Balances**: Total refundable deposits currently held by the system.

---

## 📑 Generating Reports
For professional audit and review:
*   **Admin Dashboard Summary**: Real-time visual cards for quick decision-making.
*   **Exporting Data (Future Scope)**: The system is designed to allow exporting these reports into CSV or Excel for deeper accounting review.
