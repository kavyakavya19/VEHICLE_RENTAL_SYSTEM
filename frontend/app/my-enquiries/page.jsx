'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import API from '../../utils/api';
import { useRouter } from 'next/navigation';

export default function MyEnquiriesPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const res = await API.get('enquiries/my/');
        setEnquiries(res.data);
      } catch (err) {
        console.error('Failed to fetch enquiries:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  const StatusBadge = ({ status }) => {
    const color = status === 'RESOLVED' ? '#10B981' : '#F59E0B';
    const bg = status === 'RESOLVED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)';
    return (
      <span style={{ 
        background: bg, color: color, padding: '4px 10px', borderRadius: '6px', 
        fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' 
      }}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="page-container" style={{ paddingTop: '120px', textAlign: 'center', color: '#A1A1AA' }}>Loading Enquiries...</div>;

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800' }}>My Enquiries</h1>
          <p style={{ color: '#A1A1AA' }}>Track the status of your support questions.</p>
        </div>
        <Button variant="primary" onClick={() => router.push('/enquiry')}>New Enquiry</Button>
      </div>

      {enquiries.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#A1A1AA', fontSize: '18px', marginBottom: '20px' }}>You haven't submitted any enquiries yet.</p>
          <Button variant="secondary" onClick={() => router.push('/enquiry')}>Submit Your First Enquiry</Button>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {enquiries.map((enq) => (
            <Card key={enq.id} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>Enquiry #{enq.id}</h3>
                  <p style={{ fontSize: '13px', color: '#52525B' }}>Submitted on {new Date(enq.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={enq.status} />
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                <p style={{ color: '#A1A1AA', fontSize: '13px', marginBottom: '8px', fontWeight: '600' }}>Your Message:</p>
                <p style={{ fontSize: '15px', lineHeight: '1.6' }}>{enq.message}</p>
              </div>

              {enq.admin_reply ? (
                <div style={{ borderLeft: '4px solid #6366F1', padding: '16px', background: 'rgba(99,102,241,0.05)', borderRadius: '0 12px 12px 0' }}>
                  <p style={{ color: '#6366F1', fontSize: '13px', marginBottom: '8px', fontWeight: '700' }}>Admin Response:</p>
                  <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#E4E4E7' }}>{enq.admin_reply}</p>
                </div>
              ) : (
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: '#52525B', fontStyle: 'italic' }}>Awaiting response from our support team...</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
