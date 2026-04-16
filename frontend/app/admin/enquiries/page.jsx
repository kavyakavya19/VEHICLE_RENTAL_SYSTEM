'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import API from '../../../utils/api';
import { ProtectedRoute } from '../../../components/ProtectedRoute';

function AdminEnquiriesContent() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEnquiries = async () => {
    try {
      const res = await API.get('enquiries/');
      setEnquiries(res.data);
    } catch (err) {
      console.error('Failed to fetch enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await API.patch(`enquiries/${selectedEnquiry.id}/`, {
        admin_reply: replyText,
        status: 'RESOLVED'
      });
      setSelectedEnquiry(null);
      setReplyText('');
      fetchEnquiries();
    } catch (err) {
      alert('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-container" style={{ paddingTop: '120px', textAlign: 'center', color: '#A1A1AA' }}>Loading Dashboard...</div>;

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>Enquiry Management</h1>
      <p style={{ color: '#A1A1AA', marginBottom: '40px' }}>Respond to customer queries and resolve tickets.</p>

      <div className={selectedEnquiry ? "grid-responsive grid-responsive-2" : "grid-responsive"} style={{ gap: '30px' }}>
        {/* Enquiries Table */}
        <Card style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '16px', fontSize: '14px', color: '#A1A1AA' }}>ID</th>
                  <th style={{ padding: '16px', fontSize: '14px', color: '#A1A1AA' }}>Customer</th>
                  <th style={{ padding: '16px', fontSize: '14px', color: '#A1A1AA' }}>Status</th>
                  <th style={{ padding: '16px', fontSize: '14px', color: '#A1A1AA' }}>Date</th>
                  <th style={{ padding: '16px', fontSize: '14px', color: '#A1A1AA' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enq) => (
                  <tr key={enq.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: selectedEnquiry?.id === enq.id ? 'rgba(99,102,241,0.05)' : 'transparent' }}>
                    <td style={{ padding: '16px', fontSize: '14px' }}>#{enq.id}</td>
                    <td style={{ padding: '16px' }}>
                      <p style={{ fontWeight: '600' }}>{enq.name}</p>
                      <p style={{ fontSize: '12px', color: '#A1A1AA' }}>{enq.email}</p>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                        background: enq.status === 'RESOLVED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: enq.status === 'RESOLVED' ? '#10B981' : '#F59E0B'
                      }}>{enq.status}</span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#A1A1AA' }}>{new Date(enq.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '16px' }}>
                      <Button variant="ghost" onClick={() => { setSelectedEnquiry(enq); setReplyText(enq.admin_reply || ''); }} style={{ fontSize: '12px' }}>View / Reply</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Reply Panel */}
        {selectedEnquiry && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Enquiry Details</h3>
                <button onClick={() => setSelectedEnquiry(null)} style={{ background: 'transparent', border: 'none', color: '#A1A1AA', cursor: 'pointer' }}>✕ Close</button>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', color: '#A1A1AA', display: 'block', marginBottom: '4px' }}>Message from {selectedEnquiry.name}:</span>
                <p style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', lineHeight: '1.6' }}>{selectedEnquiry.message}</p>
              </div>

              <form onSubmit={handleReply}>
                <label style={{ fontSize: '12px', color: '#A1A1AA', display: 'block', marginBottom: '8px' }}>Admin Response:</label>
                <textarea 
                  rows="6"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response here..."
                  required
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', padding: '16px', color: '#FFF', fontSize: '14px', outline: 'none', marginBottom: '20px'
                  }}
                />
                <Button variant="primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
                  {submitting ? 'Sending...' : selectedEnquiry.admin_reply ? 'Update Response' : 'Send & Resolve'}
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminEnquiriesPage() {
  return <ProtectedRoute><AdminEnquiriesContent /></ProtectedRoute>;
}
