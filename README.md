# Perfect Wheels 

Welcome to **Perfect Wheels**, a complete full-stack vehicle rental platform. I built this project to solve common pain points in vehicle rentals—specifically around managing security deposits, handling late returns, and providing a clean, modern user experience.

## Overview
Perfect Wheels allows users to browse a fleet of vehicles, view detailed specifications, and book them on a daily or hourly basis. Behind the scenes, it uses a custom wallet system to handle security deposits securely. If there are any late returns or damages, fines are automatically calculated and deducted before the deposit is refunded.

##  Key Features
*   **Wallet & Security Deposit System**: Handles top-ups, locks deposits during active trips, and efficiently manages refundable balances.
*   **Fine Management System**: Admins can add fines per booking. The system automatically handles the deduction logic from the security deposit without manual calculations.
*   **Complete Admin Control**: A dedicated admin panel to manage the vehicle fleet, monitor active bookings, approve or reject withdrawal requests, and issue fines.
*   **Comprehensive User Dashboard**: Users can track their bookings, view booking invoices, check wallet balances, and see pending deductions.
*   **Review System**: Users can rate and review vehicles after completing their trip.

## 🛠 Tech Stack
*   **Frontend**: Next.js, React, Tailwind CSS (Responsive Dark Theme UI)
*   **Backend**: Django, Django REST Framework (DRF), PostgreSQL
*   **APIs**: Token-based RESTful APIs

## 🔌 Third-Party Integrations
*   **Razorpay**: Used for securely processing wallet top-ups and checkout payments.
*   **Google Authentication**: Simplifies the sign-up and login process via OAuth2.

## 🏗 System Architecture
The system follows a decoupled client-server architecture:
*   The **Frontend (Next.js)** acts as the presentation layer, handling UI routing, state management, and user interactions.
*   The **Backend (Django)** serves as the single source of truth. It exposes REST APIs for the frontend to consume. The backend strictly manages database transactions, especially around the wallet and fine deduction flow, ensuring no double-deductions or race conditions occur.

## 📂 Folder Structure
```text
perfect-wheels/
├── apps/               # Django backend apps (bookings, wallet, fines, etc.)
├── config/             # Django core configuration and main URL routing
├── frontend/           # Next.js frontend application
└── manage.py           # Django entry point
```

##  Installation Steps

### Backend Setup
1. Open your terminal and navigate to the project root.
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run database migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the backend development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```


## 🔗 Documentation Links
*   [Frontend Documentation](./frontend/README.md)
*   [Backend Documentation](./backend/README.md)
