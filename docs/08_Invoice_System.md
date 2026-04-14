# 08. Automated Invoice System

## 🖨️ Overview
The system features an **Automated PDF Invoice Generator** built with the **ReportLab** library. It ensures that every single booking is backed by a professional, downloadable digital receipt.

---

## 🗂️ Invoice Technology (ReportLab)
*   **Dynamic Generation**: Invoices are not stored as pre-made files. Instead, the backend generates them in real-time when a user clicks "Download".
*   **Caching**: Once an invoice is generated for a specific booking, it is saved in the `media/invoices/` folder. Subsequent requests for the same invoice are served instantly from the disk to save server resources.
*   **Binary Response**: The Django API returns the PDF as a `FileResponse`, which the React frontend handles using a **Blob URL** to trigger a browser download.

---

## 📄 Invoice Contents & Fields
Every PDF invoice is professionally branded with the **Perfect Wheels** logo and includes:
1.  **Header**: Company name and "Vehicle Rental Invoice" title.
2.  **Identifiers**: Unique Booking ID, Razorpay Payment ID, and Invoice Date.
3.  **Customer Details**: Name, Email, and Phone Number of the driver.
4.  **Vehicle Information**: Brand, Model, and Vehicle Plate Number.
5.  **Booking Dates**: Start and end dates for the rental.
6.  **Pricing Breakdown (Table)**:
    *   **Rental Rate**: Price per day.
    *   **Number of Days**: Duration of the trip.
    *   **Subtotal**: Rental rate x days.
    *   **Late Fine**: Any penalty for overdue return (if applicable).
    *   **Security Deposit**: (Optional depending on business needs).
7.  **Total Amount Paid**: The final sum settled via Razorpay + Fines.
8.  **Footer**: Professional thank-you note and legal disclaimer.

---

## 🕒 When is an Invoice Generated?
Invoices are available for download as soon as a booking reaches a finalized financial state:
1.  **`CONFIRMED`**: User has paid the rental amount + deposit.
2.  **`ONGOING`**: Trip is currently in progress.
3.  **`COMPLETED`**: Trip ended on time.
4.  **`REFUNDED`**: Admin finalized the trip and settled the deposit refund.

**Note**: Invoices are **NOT** available for `PENDING` or `CANCELLED` bookings.

---

## 📥 How Users Download Invoices
1.  **Navigate**: User goes to their **Booking History** page.
2.  **Action**: Finds a finalized booking and clicks the **📄 Download Invoice** button.
3.  **Download**: The browser automatically saves the file as `invoice_booking_{id}.pdf`.

---

## 🔒 Security
The backend enforces a strict access check for invoices:
*   Standard users can **only** download invoices for bookings that belong to them.
*   Admin users can download any invoice in the system for auditing purposes.
*   Any unauthorized attempt to download another user's invoice returns a **403 Forbidden** error.
