'use client';

import React from 'react';
import { Card } from '../../components/Card';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '120px' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '16px', textAlign: 'center' }}>Contact Us</h1>
      <p style={{ color: '#A1A1AA', fontSize: '16px', textAlign: 'center', marginBottom: '50px' }}>We are always here to help you get on the road.</p>

      <div className="grid-responsive grid-responsive-3" style={{ gap: '30px', maxWidth: '1000px', margin: '0 auto' }}>
        
        <Card hoverEffect style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(239, 62, 66, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
            <Phone size={32} color="#EF3E42" />
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Phone Number</h3>
          <p style={{ color: '#A1A1AA', fontSize: '16px' }}>+91 987 654 3210<br />+91 123 456 7890</p>
        </Card>

        <Card hoverEffect style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(239, 62, 66, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
            <Mail size={32} color="#EF3E42" />
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Email Address</h3>
          <p style={{ color: '#A1A1AA', fontSize: '16px' }}>support@perfectwheels.in<br />info@perfectwheels.in</p>
        </Card>

        <Card hoverEffect style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(239, 62, 66, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
            <MapPin size={32} color="#EF3E42" />
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Office Address</h3>
          <p style={{ color: '#A1A1AA', fontSize: '16px' }}>123 Perfect Wheels HQ,<br />Tech Park Avenue, Bangalore, 560001</p>
        </Card>

      </div>
    </div>
  );
}
