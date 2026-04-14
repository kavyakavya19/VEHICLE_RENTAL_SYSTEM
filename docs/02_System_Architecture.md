# 02. System Architecture

## 🏛️ Overall Architecture
The Perfect Wheels Vehicle Rental System is built as a **Decoupled Architecture**, splitting the user-facing interface (Frontend) from the business logic and data storage (Backend). They communicate via a strictly specified **REST API**.

---

## 💻 Frontend Architecture (React)
The frontend is a single-page application (SPA) built with **React.js**.
*   **State Management**: Uses `useState`, `useEffect`, and `useLocation` for dynamic data fetching and navigation.
*   **Routing**: Uses `react-router-dom` to manage page navigation without reloading the browser.
*   **Authentication**: Implemented with **JWT (JSON Web Tokens)**. Tokens are stored in `localStorage` and sent with every Axios request.
*   **API Interaction**: Uses a centralized `api.js` service with `axios`.
*   **Components**: Modular design (Reusable buttons, inputs, cards, and a dynamic navbar).

---

## ⚙️ Backend Architecture (Django)
The backend is a powerful **REST API** built with **Django REST Framework (DRF)**.
*   **Modular Design**: The project is split into separate apps (`users`, `vehicles`, `bookings`, `payments`, `fines`, `coupons`).
*   **Services Layer**: Business logic (availability checks, pricing, fine calculations, wallet settlements) is extracted into specialized **Service Classes** (`BookingService`, `PaymentService`) for better maintainability and testing.
*   **Security**: Uses **JWT Authentication** (djangorestframework-simplejwt) to secure endpoints.
*   **Permissions**: Implemented as **RBAC (Role-Based Access Control)** — Admins can perform management tasks, while Users can only access their own data.
*   **PDF Engine**: Uses **ReportLab** to generate dynamic PDF invoices from data in real-time.

---

## 🗄️ Database Architecture (MySQL)
**MySQL** is the primary relational database. It ensures data consistency and handles complex queries for vehicle availability.
*   **Relationships**: Heavy use of ForeignKeys to link bookings to users and vehicles.
*   **Integrity**: Uses **Atomic Transactions** (`@transaction.atomic`) for payment verifications and fine settlements to prevent data corruption.
*   **Normalization**: Data is structured to prevent redundancy (e.g., separate tables for Bookings, Payments, and Wallet Transactions).

---

## 🔄 Core Data Flows
### 1. Authentication Flow (JWT)
1.  **User Login** $\rightarrow$ Sends credentials to `/api/users/login/`.
2.  **Backend** $\rightarrow$ Verifies credentials and returns `Access` and `Refresh` tokens.
3.  **Frontend** $\rightarrow$ Saves tokens. Subsequent requests include `Authorization: Bearer <access_token>`.

### 2. Vehicle Booking Flow
1.  **Customer Browser** $\rightarrow$ Inputs dates $\rightarrow$ API checks availability.
2.  **Availability Logic** $\rightarrow$ Queries `Bookings` table for overlaps in the selected date range.
3.  **Checkout** $\rightarrow$ User selects vehicle $\rightarrow$ `Booking` record created as `PENDING`.
4.  **Payment** $\rightarrow$ User pays via Razorpay $\rightarrow$ Backend verifies signature $\rightarrow$ Status becomes `CONFIRMED`.

### 3. Trip Lifecycle & Refund Flow
1.  **Start Trip** $\rightarrow$ User clicks "Start" $\rightarrow$ Status moves from `CONFIRMED` to `ONGOING`.
2.  **End Trip** $\rightarrow$ User clicks "End" $\rightarrow$ Status moves to `PENDING_APPROVAL` (if late) or `COMPLETED`.
3.  **Admin Review** $\rightarrow$ Admin inputs damages/fines $\rightarrow$ Backend calculates: `Refund = Deposit - Fine - Damages`.
4.  **Wallet Settlement** $\rightarrow$ Refund amount is credited to the User's **In-App Wallet**.
5.  **Final Status** $\rightarrow$ Booking becomes `REFUNDED`.

---

### 💸 Payment & Wallet Flow
The system supports two types of funds:
*   **Inflow (External)**: Direct payment for bookings via **Razorpay**.
*   **Inflow (Internal)**: Refunds from security deposits credited to the **User Wallet**.
*   **Usage**: Users can view their **Wallet Transaction History** (Ledger) to track every credit and deduction.
