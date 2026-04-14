# 12 — Installation Guide

## 12.1 Prerequisites

Ensure the following are installed on your system before proceeding:

| Software | Version | Download |
|----------|---------|---------|
| Python | 3.10+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| MySQL Server | 8.0+ | https://dev.mysql.com |
| Git | Any | https://git-scm.com |
| pip | Latest | (included with Python) |

---

## 12.2 Step 1 — Clone the Repository

```bash
git clone https://github.com/yourusername/vehicle-rental.git
cd vehicle-rental
```

Or if using local source, navigate to the project folder:
```
cd "C:\Users\KARTHIK\OneDrive\Documents\SourceSys Technologies\project\Vehicle_Rental"
```

---

## 12.3 Step 2 — Set Up MySQL Database

1. Open MySQL and log in:
   ```bash
   mysql -u root -p
   ```

2. Create the database:
   ```sql
   CREATE DATABASE vehicle_rental_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

---

## 12.4 Step 3 — Backend Setup (Django)

### Create Virtual Environment
```bash
python -m venv venv
```

### Activate Virtual Environment
**Windows:**
```bash
venv\Scripts\activate
```
**Mac/Linux:**
```bash
source venv/bin/activate
```

### Install Python Dependencies
```bash
pip install -r requirements.txt
```

The `requirements.txt` includes:
- `django`
- `djangorestframework`
- `djangorestframework-simplejwt`
- `django-cors-headers`
- `drf-spectacular`
- `django-filter`
- `mysqlclient` (or `PyMySQL`)
- `python-dotenv`
- `razorpay`
- `Pillow` (for image uploads)

---

## 12.5 Step 4 — Configure Environment Variables

Create a `.env` file in the project root:
```
SECRET_KEY=your-django-secret-key-here
DEBUG=True
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

To generate a Django secret key:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## 12.6 Step 5 — Configure Database in `settings.py`

The database settings are in `config/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'vehicle_rental_db',
        'USER': 'root',
        'PASSWORD': 'your_mysql_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```
Update `USER` and `PASSWORD` to match your MySQL credentials.

---

## 12.7 Step 6 — Run Django Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

This creates all tables in `vehicle_rental_db`.

---

## 12.8 Step 7 — Create Admin User

```bash
python manage.py createsuperuser
```
Follow the prompts. After creation, promote to ADMIN role:
```bash
python manage.py shell
```
```python
from apps.users.models import User
u = User.objects.get(username='your_superuser_name')
u.role = 'ADMIN'
u.is_profile_complete = True
u.save()
```

---

## 12.9 Step 8 — (Optional) Load Sample Vehicle Data

If a seed file is provided:
```bash
python seed_vehicles.py
```

Or add vehicles manually via Django admin at `http://127.0.0.1:8000/admin/`.

---

## 12.10 Step 9 — Start the Django Backend

```bash
venv\Scripts\python manage.py runserver
```

Backend is now running at: `http://127.0.0.1:8000`

- API root: `http://127.0.0.1:8000/api/`
- Admin panel: `http://127.0.0.1:8000/admin/`
- Swagger docs: `http://127.0.0.1:8000/api/docs/`

---

## 12.11 Step 10 — Frontend Setup (React)

Open a **new terminal** (keep Django running):

```bash
cd frontend
npm install
```

---

## 12.12 Step 11 — Start the React Frontend

```bash
npm run dev
```

Frontend is now running at: `http://localhost:5173`

---

## 12.13 Step 12 — Configure Razorpay Keys

1. Sign up at https://razorpay.com and get your Test Mode API keys.
2. Add them to `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
   ```
3. Restart the Django server.

The React frontend automatically receives the Razorpay key from the backend on each `/create-order/` call — no frontend `.env` file needed.

---

## 12.14 Quick Start Summary

```bash
# 1. Clone
git clone <repository_url>
cd vehicle-rental

# 2. Backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
# (set up .env and settings.py database)
python manage.py migrate
python manage.py runserver

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 12.15 Troubleshooting

| Problem | Solution |
|---------|---------|
| `ModuleNotFoundError: razorpay` | Run: `venv\Scripts\pip install razorpay` |
| MySQL connection error | Check MySQL is running; verify credentials in `settings.py` |
| CORS errors in browser | Ensure `CORS_ALLOW_ALL_ORIGINS = True` in `settings.py` |
| 401 Unauthorized in API | Include `Authorization: Bearer <token>` header |
| Razorpay checkout not opening | Check browser network; ensure Razorpay script loads from `checkout.razorpay.com` |
| `venv\Scripts\activate` not found | Create venv first: `python -m venv venv` |

---

*Previous: [11 End-to-End Workflow](./11_Project_Workflow_End_to_End.md) | Next: [13 User Guide →](./13_User_Guide.md)*
