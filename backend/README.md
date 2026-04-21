# Perfect Wheels - Backend

## Overview
This is the core engine behind Perfect Wheels. Built with Django and Django REST Framework, the backend takes care of all business logic, securely manages the wallet and fine deduction systems, and provides robust APIs for the frontend.

##  Features
*   **Complex Booking Logic**: Handles both hourly and daily booking rules, preventing overlapping schedules.
*   **Wallet Management**: Manages user funds distinctly between accessible balance, locked security deposits, and pending deductions.
*   **Automated Fine Deductions**: Provides an interface for admins to apply fines (for late returns or damages), which the system automatically subtracts from the specific user's locked deposit safely.
*   **Atomic Transactions**: Heavily utilizes database transaction blocks to ensure no double-spending or race conditions occur during payments or refunds.
*   **Review System**: Links reviews directly to completed bookings to ensure authenticity.

##  Modules
*   **`bookings`**: Orchestrates scheduling, booking states (Pending, Confirmed, Completed), and pricing logic.
*   **`payments` (Wallet system)**: Handles Razorpay top-ups, withdrawal requests, and internal wallet accounting.
*   **`fines`**: Tracks user penalties, associated reasons, and their statuses (deducted vs. pending).
*   **`reviews`**: Allows users to leave feedback strictly on vehicles they have successfully rented.
*   **`vehicles`**: Manages the fleet catalog and specifications.
*   **`users`**: Controls authentication, Google OAuth integrations, and profile data.

##  Key API Endpoints
*   `POST /api/auth/google/` - Google login/signup
*   `GET /api/vehicles/` - Fetch available fleet
*   `POST /api/bookings/` - Create a new booking
*   `POST /api/payments/` - Initiate a Razorpay payment/top-up
*   `POST /api/payments/withdrawals/` - Request a wallet refund
*   `POST /api/fines/` - (Admin) Log a new fine

##  System Flow

### Booking Flow
1. User requests to book a vehicle for a specific time frame.
2. System calculates total cost (Rental Price + Required Security Deposit).
3. System checks user's wallet balance.
4. If sufficient, funds are locked (transferred to `security_deposit` state) and booking is marked `CONFIRMED`.

### Wallet & Fine Deduction Flow
1. User completes a trip.
2. Admin inspects the vehicle. If returned late or damaged, admin creates a `Fine` record.
3. System totals the fines and cross-references the locked security deposit.
4. The fine amount is deducted from the deposit.
5. The remaining deposit is safely moved to the user's `refundable_balance`.
6. User can request a withdrawal of their `refundable_balance` to their bank account.

## 🛠 Tech Stack
*   **Framework**: Django & Django REST Framework (DRF)
*   **Database**: MySQL
*   **Authentication**: JWT (JSON Web Tokens)
*   **Payments**: Razorpay SDK

##  Setup Instructions
1. Navigate to the project root directory.
2. Ensure you have Python and MySQL installed.
3. Create and activate your virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
4. Install all required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Set up the `.env` file in the root with your database credentials and API keys (Razorpay, Google).
6. Run database migrations:
   ```bash
   python manage.py migrate
   ```
7. Start the local server:
   ```bash
   python manage.py runserver
   ```
