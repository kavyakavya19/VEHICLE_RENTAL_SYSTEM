# Perfect Wheels - Frontend

## Overview
This is the front-facing part of the Perfect Wheels vehicle rental platform. It handles everything the user interacts with—from browsing vehicles and completing bookings to managing their wallet balance. I went with a modern, responsive, and dark-themed design to give the platform a premium feel.

##  Features
*   **Vehicle Listing & Filtering**: Users can view the entire fleet and quickly filter by brand.
*   **Vehicle Detail Pages**: Highly detailed pages displaying exact specifications (mileage, engine type, fuel, seats) to help users make quick decisions.
*   **Booking Flow UI**: A seamless step-by-step checkout process for both daily and hourly rentals.
*   **User Dashboard**: A central hub where users can view their active bookings, profile, and wallet.
*   **Wallet UI**: Clearly shows the user's current balance, locked refundable balance, and any pending fine deductions for full transparency.
*   **Booking History & Invoices**: Users have a log of past trips and can download corresponding invoices.
*   **Post-Trip Reviews**: A clean UI prompting users to rate and review their experience after a trip ends.
*   **Dark Mode UI**: Sleek, eye-friendly layout built entirely with Tailwind CSS utility classes.

##  Pages & Routes
*   `/` - Landing page
*   `/vehicles` - Main fleet listing with filters
*   `/vehicle/[id]` - Read-only vehicle specification and summary page
*   `/booking/[id]` - Checkout and booking flow
*   `/dashboard` - User control panel
*   `/wallet` - Detailed wallet financials and withdrawal requests
*   `/booking-history` - Past trips and invoice downloads

##  Tech Stack
*   **Framework**: Next.js / React
*   **Styling**: Tailwind CSS
*   **HTTP Client**: Axios (for API communication)
*   **Icons**: Lucide React

##  API Configuration
The frontend communicates directly with the Django backend. The base URL needs to be configured in your environment variables. 

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## 📂 Folder Structure
```text
frontend/
├── app/                  # Next.js App Router (pages and layouts)
├── components/           # Reusable UI components (Buttons, Cards, Modals)
├── context/              # React Context (Auth state, etc.)
├── public/               # Static assets (images, icons)
└── utils/                # Helper functions and Axios interceptors
```

##  Setup Instructions
1. Ensure Node.js is installed.
2. Clone the repository and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up your `.env.local` file as shown above.
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open `http://localhost:3000` in your browser.
