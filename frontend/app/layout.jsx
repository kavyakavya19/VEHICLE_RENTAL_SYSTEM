import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import Script from 'next/script';
import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata = {
  title: 'Perfect Wheels - Premium Vehicle Rentals',
  description: 'Browse and book premium vehicles across the country with Perfect Wheels.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your_google_client_id_here'}>
          {/* Razorpay SDK — loaded globally so it's available on all payment pages */}
          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="lazyOnload"
          />
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
