# Perfect Wheels 

Welcome to **Perfect Wheels**, a complete full-stack vehicle rental platform.  This project is designed to solve common  problems in vehicle rentals—specifically around managing security deposits, handling late returns, and providing a clean, modern user experience.

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
*   **Backend**: Django, Django REST Framework (DRF), MySQL
*   **APIs**: Token-based RESTful APIs

## 🔌 Third-Party Integrations
*   **Razorpay**: Used for securely processing wallet top-ups and checkout payments.
*   **Google Authentication**: Simplifies the sign-up and login process via OAuth2.
*   **Cloudinary**: Stores and serves all media properties ensuring high-performance global delivery.

### Cloudinary Integration

When deploying to ephemeral environments like Render, saving images locally inside a `/media/` folder leads to major issues. Every time the server restarts or deploys a new update, the disk is wiped clean, breaking all your image links. 

To solve this, we migrated our image storage to **Cloudinary**. This completely separates our media assets from the backend server filesystem.

**Key Benefits:**
- **Zero File Loss:** Images are safely stored in the cloud and survive any backend deployments or restarts.
- **Lightning Fast CDN:** Cloudinary acts as a global CDN, meaning vehicle images load much faster for users on the frontend.
- **No Extra Cost:** We are utilizing Cloudinary’s generous free tier.
- **Auto-Optimization:** Cloudinary automatically handles compression and serves modern formats (like WebP) on the fly, saving bandwidth without writing extra code.

---

### Features Implemented

- **Seamless Admin Uploads:** You still upload vehicle and brand images directly through the Django Admin panel just like before.
- **Direct Cloud Storage:** Media files bypass the local disk and are securely pushed straight into the Cloudinary bucket.
- **Clean Frontend Delivery:** The React frontend receives an absolute URL and drops it straight into an `<img>` tag without the need for routing hacks or `/api/media/` prefixes.

---

### Backend Setup

If you're running this project locally for the first time, getting Cloudinary set up is straightforward.

**Installation:**
Make sure you have installed the required dependencies:
```bash
pip install cloudinary django-cloudinary-storage
```

**Settings (`settings.py`):**
In your Django settings, swap your default file storage backend to point to Cloudinary instead of the local disk:
```python
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
```

**Models (`models.py`):**
Instead of the default Django `ImageField`, we inject Cloudinary's native field into our models:
```python
from cloudinary.models import CloudinaryField

class VehicleImage(models.Model):
    # ...
    image = CloudinaryField('image', folder='vehicles')
```

---

### Environment Variables

To make the integration work, grab your API credentials from your Cloudinary dashboard.

In your local `.env` file, configure the following variables:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
*Note: Make sure you also add these exact variables in your production environment (e.g., inside your Render dashboard).*

---

### How It Works (The Upload Flow)

1. **Admin Upload**: You upload an image via the Django Admin GUI.
2. **Backend Intercept**: Django intercepts the file and opens a secure pipeline using your `.env` credentials.
3. **Cloudinary Upload**: The image is pushed into the remote Cloudinary bucket.
4. **URL Storage**: Cloudinary responds with a fully qualified HTTPS link (e.g., `https://res.cloudinary.com/.../vehicle.jpg`), which Django saves natively in MySQL.
5. **Frontend Display**: The Next.js frontend fetches the data and puts the clean absolute URL directly into the image source. 

---

### ⚠️ Important Notes

* **Local Files Won't Work:** Any old image data stored in the database as `/media/vehicles/...` will result in a 404 broken image on production.  
* **Re-Upload Required:** After moving to Cloudinary, you must delete the old image values in your database and re-upload the images via the Admin panel.
* **Keep It Absolute:** Always use the raw absolute `vehicle.image` URL handed to you by the API. Do not attempt to append any custom backend routes to it on the frontend.
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
