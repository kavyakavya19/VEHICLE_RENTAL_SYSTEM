# 11. API Documentation (REST endpoints)

## 🔑 Authentication APIs
These endpoints are used for user account management and security.
*   **POST `/api/users/register/`**: Register a new user account.
*   **POST `/api/users/login/`**: Authenticate user and receive JWT tokens.
*   **GET `/api/users/profile/`**: Retrieve the profile of the logged-in user.
*   **PUT `/api/users/complete-profile/`**: Update user license information and image.

---

## 🚗 Vehicle APIs
Used to browse and manage the rental fleet.
*   **GET `/api/vehicles/`**: List all available vehicles for rental.
*   **GET `/api/vehicles/{id}/`**: Get detailed information for a specific vehicle.
*   **POST `/api/vehicles/` (Admin only)**: Register a new vehicle to the fleet.
*   **PUT/PATCH `/api/vehicles/{id}/` (Admin only)**: Update vehicle details or maintenance status.
*   **DELETE `/api/vehicles/{id}/` (Admin only)**: Remove a vehicle from the system.

---

## 📅 Booking APIs
The core endpoints for trip management.
*   **POST `/api/bookings/`**: Create a new `PENDING` booking.
*   **POST `/api/bookings/check-availability/`**: Verifies if a vehicle is free for the given `start_date` and `end_date`.
*   **GET `/api/bookings/my-bookings/`**: List all bookings for the logged-in customer.
*   **POST `/api/bookings/{id}/start-trip/`**: Move booking status from `CONFIRMED` $\rightarrow$ `ONGOING`.
*   **POST `/api/bookings/{id}/end-trip/`**: Move status from `ONGOING` $\rightarrow$ `PENDING_APPROVAL` or `COMPLETED`.
*   **POST `/api/bookings/{id}/approve-return/` (Admin only)**: Confirm late fines and finalize trips.
*   **POST `/api/bookings/{id}/complete-trip-admin/` (Admin only)**: Calculate damage charges and initiate a security deposit refund.

---

## 💳 Payment & Wallet APIs
Financial endpoints for Razorpay and in-app funds.
*   **POST `/api/payments/create-order/`**: Generates a unique Razorpay Order ID for a booking.
*   **POST `/api/payments/verify/`**: Verifies the Razorpay signature and confirms the booking.
*   **GET `/api/payments/wallet/`**: Returns current wallet balance and total inflow/outflow.
*   **GET `/api/payments/transactions/`**: List all wallet credit and debit history.

---

## 🖨️ Invoice API
Document generation endpoint.
*   **GET `/api/bookings/{id}/invoice/`**: Generates and returns a professional PDF invoice for a finalized booking.

---

## 🎟️ Coupon API
Marketing and discount endpoints.
*   **POST `/api/coupons/apply/`**: Validates a promo code and returns the discount amount.

---

## 🛡️ API Protection & Security
1.  **JWT Authentication**: All endpoints (except Register and Login) require a valid `Authorization: Bearer <TOKEN>` header.
2.  **Role-Based Access**: Administrative APIs return a **403 Forbidden** error if accessed by standard users.
3.  **Ownership Logic**: Users can only query or modify bookings that belong to their account.
