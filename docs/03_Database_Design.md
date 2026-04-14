# 03. Database Design

## 🗄️ Database: MySQL
The system uses a relational **MySQL** database for storing data. It ensures data consistency and supports complex queries for vehicle availability.

---

## 🏗️ Table Structures & Fields

### 1. `Users` Table (Custom AbstractUser)
Extends the default Django User model for profile management.
*   `email` (PK, Unique) - Primary identifier for login.
*   `name`, `phone` - Display and contact details.
*   `licence_number`, `licence_image` - Required for verification.
*   `role` - ENUM ('ADMIN', 'USER').
*   `is_verified`, `is_profile_complete` - Account status flags.

### 2. `Vehicles` Table
Stores details of the fleet.
*   `id` (PK)
*   `name`, `brand`, `type` - Car/Bike categorization.
*   `vehicle_number` (Unique) - Plate number.
*   `price_per_day` - Base rental fee.
*   `late_fee_per_day` - Fine charged for overdue returns.
*   `security_deposit` - Refundable deposit amount.
*   `availability_status` (BOOL) - If the car is currently out on a trip.
*   `maintenance_status` (BOOL) - If the car is in the garage.

### 3. `Bookings` Table
The heart of the system.
*   `id` (PK)
*   `user_id`, `vehicle_id` (FK) - Relational links.
*   `start_date`, `end_date` - Scheduled dates.
*   `rental_amount`, `security_deposit`, `total_price` - Cost breakdown.
*   `booking_status` - PENDING, CONFIRMED, ONGOING, PENDING_APPROVAL, COMPLETED, REFUNDED, CANCELLED.
*   `actual_return_date` - When the user clicked "End Trip".
*   `late_days`, `fine_amount`, `damage_charge` - Overdue costs.
*   `refund_amount` - Deposit minus fines and damages.
*   `deposit_paid`, `deposit_refunded` (BOOL) - Status flags.

### 4. `Payments` Table
Stores transaction data from **Razorpay**.
*   `id` (PK)
*   `booking_id` (OneToOneFK) - Linked to a specific booking.
*   `razorpay_order_id`, `razorpay_payment_id` - IDs from Razorpay.
*   `amount` - Actual paid amount.
*   `payment_status` - PENDING, SUCCESS, FAILED.

### 5. `Wallets` Table
Supports in-app fund storage (for security deposit refunds).
*   `id` (PK)
*   `user_id` (OneToOneFK) - One wallet per user.
*   `balance` - Current available funds.

### 6. `WalletTransactions` Table
Audit ledger for every wallet activity.
*   `id` (PK)
*   `wallet_id` (FK) - Link to wallet.
*   `booking_id` (FK, Nullable) - Reason for the credit/debit.
*   `amount`, `tx_type` - REFUND, PAYMENT, FINE_DEDUCTION.
*   `message` - Description (e.g., "Refund for booking #102").

### 7. `Coupons` Table
Marketing tool for discounts.
*   `id` (PK)
*   `code` (Unique) - e.g., 'SAVE10'.
*   `discount_type` - PERCENT, FIXED.
*   `value` - Discount numeric value.
*   `expiry_date`, `is_active` - Status flags.

---

## 🔗 Relationships & Entity Relationship (ER) Summary
*   **User $\rightarrow$ Booking**: One-to-Many (A user can have many bookings).
*   **Vehicle $\rightarrow$ Booking**: One-to-Many (A vehicle can be booked many times over different dates).
*   **Booking $\rightarrow$ Payment**: One-to-One (Each booking has exactly one payment attempt/record).
*   **User $\rightarrow$ Wallet**: One-to-One (Each user has a single persistent wallet).
*   **Wallet $\rightarrow$ Transaction**: One-to-Many (A wallet has a history of many transactions).
*   **Booking $\rightarrow$ Review**: many-to-One (Users can review a vehicle after completing a booking).

---

## ⚡ Data Consistency (Constraints)
*   **Unique Platenumbers**: Prevents duplicate vehicle entry.
*   **One-to-One Wallet**: Ensures a single balance source for each customer.
*   **Cascade Deletion Policies**: Designed to maintain record integrity even if accounts are modified.
