# 01. Project Overview

## 🚗 What is Perfect Wheels?
**Perfect Wheels** is a comprehensive, full-stack **Vehicle Rental Management System** designed to streamline the process of renting vehicles (cars, bikes, scooters) while ensuring financial safety for owners and convenience for customers. 

The system handles everything from customer registration and vehicle browsing to electronic payments, security deposits, late return fines, and automated PDF invoicing.

---

## 🎯 Purpose of the System
The primary goal of the system is to automate the traditional vehicle rental business. It solves several key problems:
1.  **Availability Tracking**: Real-time checking of vehicle availability to prevent double-booking.
2.  **Financial Security**: Automatic collection of security deposits and calculation of late return fines/damages.
3.  **Transparency**: Users can view their full booking history, download invoices, and track their wallet balance.
4.  **Admin Control**: A centralized dashboard for owners to manage their fleet and finalize returns.

---

## 👥 System Users
### 1. Customer (User)
*   Register and log in to the portal.
*   Complete profile with driver's license details.
*   Search and filter available vehicles based on dates.
*   Book vehicles by paying the rental amount + a refundable security deposit.
*   Start and end trips via the mobile-friendly dashboard.
*   Pay fines (if applicable) and receive security deposit refunds to an in-app wallet.
*   Download professional PDF invoices.

### 2. Administrator (Admin)
*   Manage vehicle fleet (Add, Edit, Delete, Maintenance status).
*   Review all system bookings.
*   **Finalize Returns**: Inspect returned vehicles, calculate damages, and initiate refunds.
*   Monitor revenue and system analytics.

---

## 🛠️ Technology Stack
The project is built using modern, industry-standard technologies:
*   **Frontend**: React.js (with Vite) for a fast, responsive user interface.
*   **Backend**: Django & Django REST Framework (DRF) for a robust API-driven architecture.
*   **Database**: MySQL for reliable relational data storage.
*   **Payments**: Razorpay Integration for secure online transactions.
*   **Imaging/PDF**: ReportLab for generating dynamic PDF invoices.
*   **Styling**: Vanilla CSS with modern glassmorphism and animations.

---

## 🏗️ System Architecture Overview
The system follows a **Decoupled Architecture** (Separate Frontend and Backend):

1.  **Frontend (React)**: Communicates with the backend via **REST APIs**. It handles user interaction, state management, and the Razorpay checkout overlay.
2.  **Backend (Django)**: Processes business logic (availability checks, fine calculations, pricing). It manages the database and coordinates with external services (Razorpay).
3.  **Database (MySQL)**: Stores users, vehicles, bookings, payments, and wallet transactions.
4.  **Payment Gateway (Razorpay)**: Securely processes credit card, UPI, and net banking payments.
5.  **Media Storage**: Stores vehicle images, driver's licenses, and generated PDF invoices.

---

### End-to-End Flow Summary:
`Browser` $\rightarrow$ `React App` $\rightarrow$ `Axios (JWT)` $\rightarrow$ `Django API` $\rightarrow$ `MySQL Database` $\rightarrow$ `Response`
