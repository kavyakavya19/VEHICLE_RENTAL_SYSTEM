'use client';

import { useAuth } from '../../context/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Card } from '../../components/Card';
import { User, Phone, IdCard, Mail, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../../components/Button';

function ProfileContent() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '120px', paddingBottom: '80px', paddingLeft: '20px', paddingRight: '20px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0' }}>Profile Settings</h1>
            <p style={{ color: '#A1A1AA', marginTop: '8px', fontSize: '16px' }}>View and manage your account details.</p>
        </div>
        {!user.is_profile_complete && (
            <Link href="/complete-profile">
               <Button variant="primary">Complete Profile</Button>
            </Link>
        )}
      </div>
      
      <Card style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '48px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #EF3E42 0%, #B92B2E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', border: '4px solid rgba(255,255,255,0.05)', boxShadow: '0 8px 32px rgba(239, 62, 66, 0.3)' }}>
            {user.name ? user.name.charAt(0).toUpperCase() : <User size={48} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0' }}>{user.name || 'User'}</h2>
                {user.is_verified ? (
                     <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                         <ShieldCheck size={14} /> Verified
                     </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                         <AlertCircle size={14} /> Unverified
                     </div>
                )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A1A1AA', fontSize: '15px' }}>
              <Mail size={18} /> <span>{user.email}</span>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
           <User size={20} color="#EF3E42" /> Personal Details
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <div>
             <label style={{ fontSize: '14px', color: '#A1A1AA', display: 'block', marginBottom: '12px' }}>Phone Number</label>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ background: 'rgba(239, 62, 66, 0.1)', padding: '10px', borderRadius: '10px' }}>
                    <Phone size={20} color="#EF3E42" />
                </div>
                <span style={{ fontSize: '16px', fontWeight: '500' }}>{user.phone || 'Not provided'}</span>
             </div>
          </div>
          <div>
             <label style={{ fontSize: '14px', color: '#A1A1AA', display: 'block', marginBottom: '12px' }}>Licence Number</label>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ background: 'rgba(239, 62, 66, 0.1)', padding: '10px', borderRadius: '10px' }}>
                    <IdCard size={20} color="#EF3E42" />
                </div>
                <span style={{ fontSize: '16px', fontWeight: '500' }}>{user.licence_number || 'Not provided'}</span>
             </div>
          </div>
        </div>
        
        <div style={{ marginTop: '40px', background: 'rgba(239,62,66,0.05)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(239,62,66,0.1)' }}>
           <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="#EF3E42" /> Verification Status
           </h4>
           <p style={{ color: '#A1A1AA', lineHeight: '1.6', marginBottom: 0 }}>
             {user.is_verified ? 'Your account has been fully verified by our team. You are all set to book premium vehicles!' : (user.is_profile_complete ? 'Your profile is complete! Please wait while our team verifies your documents.' : 'Please complete your profile by providing your phone number and driving licence to get verified.')}
           </p>
        </div>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return <ProtectedRoute><ProfileContent /></ProtectedRoute>;
}
