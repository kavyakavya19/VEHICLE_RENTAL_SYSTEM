import os
from django.conf import settings
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from datetime import datetime

class InvoiceGenerator:
    @staticmethod
    def generate_invoice_pdf(booking):
        """
        Generates a PDF invoice for a given booking.
        Saves it in media/invoices/ and returns the relative path.
        """
        # 1. Define paths
        filename = f"invoice_booking_{booking.id}.pdf"
        directory = os.path.join(settings.MEDIA_ROOT, 'invoices')
        if not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
        
        filepath = os.path.join(directory, filename)
        
        # 2. Setup document
        doc = SimpleDocTemplate(filepath, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
        styles = getSampleStyleSheet()
        elements = []

        # 3. Custom Styles
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor("#EF3E42"), # Company Red
            alignment=1, # Center
            spaceAfter=20
        )
        subtitle_style = ParagraphStyle(
            'SubtitleStyle',
            parent=styles['Normal'],
            fontSize=14,
            textColor=colors.grey,
            alignment=1,
            spaceAfter=30
        )
        header_style = ParagraphStyle(
            'HeaderStyle',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.black,
            spaceBefore=12,
            spaceAfter=6
        )

        # 4. Content
        elements.append(Paragraph("PERFECT WHEELS", title_style))
        elements.append(Paragraph("Vehicle Rental Invoice", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.lightgrey, spaceAfter=20))

        # Date & ID Row
        invoice_date = datetime.now().strftime("%d %B %Y")
        elements.append(Paragraph(f"<b>Invoice Date:</b> {invoice_date}", styles['Normal']))
        elements.append(Paragraph(f"<b>Booking ID:</b> #{booking.id}", styles['Normal']))
        
        payment = getattr(booking, 'payment', None)
        if payment:
            elements.append(Paragraph(f"<b>Payment ID:</b> {payment.razorpay_payment_id or 'N/A'}", styles['Normal']))
        
        elements.append(Spacer(1, 20))

        # Customer & Vehicle Details Table
        data1 = [
            [Paragraph("<b>CUSTOMER DETAILS</b>", header_style), Paragraph("<b>VEHICLE DETAILS</b>", header_style)],
            [f"Name: {booking.user.name}", f"Vehicle: {booking.vehicle.brand} {booking.vehicle.name}"],
            [f"Email: {booking.user.email}", f"Number: {booking.vehicle.vehicle_number}"],
            [f"Phone: {booking.user.phone}", f"Condition: {booking.vehicle.condition}"],
        ]
        
        t1 = Table(data1, colWidths=[8*cm, 8*cm])
        t1.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ]))
        elements.append(t1)
        elements.append(Spacer(1, 20))

        # Booking / Pricing Table
        num_days = (booking.end_date - booking.start_date).days
        subtotal = float(booking.total_price) - float(booking.fine_amount)
        
        data2 = [
            ["Start Date", "End Date", "Price/Day", "Days", "Subtotal"],
            [str(booking.start_date), str(booking.end_date), f"₹{booking.vehicle.price_per_day}", str(num_days), f"₹{subtotal:.2f}"]
        ]
        
        t2 = Table(data2, colWidths=[3.2*cm, 3.2*cm, 3.2*cm, 3.2*cm, 3.2*cm])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8f9fa")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.black),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
        ]))
        elements.append(t2)
        elements.append(Spacer(1, 20))

        # Extra Charges & Total
        fine_amount = float(booking.fine_amount)
        total_paid = float(booking.total_price)
        
        summary_data = [
            ["", "Subtotal:", f"₹{subtotal:.2f}"],
            ["", "Late Fine:", f"₹{fine_amount:.2f}"],
            ["", Paragraph("<b>Total Amount Paid:</b>", styles['Normal']), Paragraph(f"<b>₹{total_paid:.2f}</b>", styles['Normal'])],
        ]
        
        t_sum = Table(summary_data, colWidths=[10*cm, 3*cm, 3*cm])
        t_sum.setStyle(TableStyle([
            ('ALIGN', (1,0), (1,-1), 'RIGHT'),
            ('ALIGN', (2,0), (2,-1), 'LEFT'),
        ]))
        elements.append(t_sum)
        
        elements.append(Spacer(1, 40))
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.lightgrey, spaceAfter=20))
        
        # Footer
        footer_style = ParagraphStyle('FooterStyle', parent=styles['Normal'], fontSize=9, textColor=colors.grey, alignment=1)
        elements.append(Paragraph("Thank you for choosing Perfect Wheels. Ride safe!", footer_style))
        elements.append(Paragraph("This is a computer-generated invoice and doesn't require a signature.", footer_style))

        # 5. Build
        doc.build(elements)
        
        return f"invoices/{filename}"
