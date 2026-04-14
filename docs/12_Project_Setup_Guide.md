# 12. Project Setup & Installation Guide

## 🚀 Getting Started
This guide explains how to set up the **Perfect Wheels Vehicle Rental System** on your local machine for development and testing.

---

## 🛠️ Prerequisites
Before installation, ensure you have the following installed:
*   **Python**: Version 3.8 or high.
*   **Node.js & npm**: Version 14 or high.
*   **MySQL Server**: Version 8.0 or high.
*   **Razorpay Account**: To get your API keys for testing.

---

## 🏗️ 1. Backend Setup (Django)
1.  **Clone the Repository**:
    ```ps1
    git clone https://github.com/YourUsername/Vehicle_Rental.git
    cd Vehicle_Rental
    ```
2.  **Create a Virtual Environment**:
    ```ps1
    python -m venv venv
    .\venv\Scripts\activate
    ```
3.  **Install Dependencies**:
    ```ps1
    pip install -r requirements.txt
    ```
4.  **Database Configuration**:
    *   Create a MySQL database named `vehicle_rental_db`.
    *   Update the `DATABASES` section in `core/settings.py` with your MySQL `USER` and `PASSWORD`.
5.  **Environment Variables (`.env`)**:
    Create a `.env` file in the `core/` folder with:
    ```env
    SECRET_KEY=your_django_secret_key
    DEBUG=True
    DB_NAME=vehicle_rental_db
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    RAZORPAY_KEY_ID=your_razorpay_key
    RAZORPAY_KEY_SECRET=your_razorpay_secret
    ```
6.  **Run Migrations**:
    ```ps1
    python manage.py makemigrations
    python manage.py migrate
    ```
7.  **Create Superuser (Admin)**:
    ```ps1
    python manage.py createsuperuser
    ```
8.  **Run Server**:
    ```ps1
    python manage.py runserver
    ```

---

## 💻 2. Frontend Setup (React)
1.  **Navigate to Frontend Folder**:
    ```ps1
    cd frontend
    ```
2.  **Install Dependencies**:
    ```ps1
    npm install
    ```
3.  **Environment Variables (`.env`)**:
    Create a `.env` file in the `frontend/` folder with:
    ```env
    VITE_API_BASE_URL=http://127.0.0.1:8000/api/
    VITE_RAZORPAY_KEY_ID=your_razorpay_key
    ```
4.  **Run Frontend Server**:
    ```ps1
    npm run dev
    ```

---

## 💳 3. Razorpay Setup
1.  Log in to the **Razorpay Dashboard**.
2.  Go to **Settings** $\rightarrow$ **API Keys**.
3.  Generate your **Key ID** and **Key Secret**.
4.  Ensure your account is in **Test Mode** for local development.

---

## 🗄️ 4. MySQL Setup
1.  Ensure the MySQL service is running.
2.  Open your MySQL Command Line or Workbench.
3.  Run the command: `CREATE DATABASE vehicle_rental_db;`.
4.  The Django migrations will automatically create all tables (`users`, `vehicles`, `bookings`, `payments`, `wallets`, etc.).

---

## ✅ 5. Running the Project
1.  Start the **Django Server** (`python manage.py runserver`).
2.  Start the **React App** (`npm run dev`).
3.  Open your browser and navigate to: `http://localhost:5173`.
4.  Log in as Admin to add your first set of vehicles!
