'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, XCircle, Clock, Info, 
  MapPin, Calendar, Tag, CreditCard, Play, StopCircle 
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { Button } from '../../components/Button';
import StatsGrid from './components/StatsGrid';
import WalletDetailedCard from './components/WalletDetailedCard';
import ActiveBookingCard from './components/ActiveBookingCard';
import ProgressTracker from './components/ProgressTracker';
import DashboardAlerts from './components/DashboardAlerts';
import QuickActions from './components/QuickActions';
import WithdrawalHistory from './components/WithdrawalHistory';
import FinesHistory from './components/FinesHistory';
import { ProtectedRoute } from '../../components/ProtectedRoute';

function DashboardContent() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [verificationData, setVerificationData] = useState(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [summaryResponse, verificationResponse] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getVerificationStatus()
      ]);
      setDashboardData(summaryResponse);
      if (verificationResponse) {
        setVerificationData(verificationResponse);
      }
    } catch (err) {
      setError('Could not load dashboard data. Please refresh.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleBookingAction = async (bookingId, action) => {
    setActionLoading(true);
    try {
      await dashboardService.performBookingAction(bookingId, action);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ paddingTop: '120px', textAlign: 'center' }}>
        <p style={{ color: '#A1A1AA' }}>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ paddingTop: '120px', textAlign: 'center' }}>
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', color: '#EF4444', padding: '24px', borderRadius: '16px', maxWidth: '400px', margin: '0 auto' }}>
          <p>{error}</p>
          <Button variant="secondary" onClick={fetchDashboardData} style={{ marginTop: '16px' }}>Try Again</Button>
        </div>
      </div>
    );
  }

  const { wallet, stats, active_booking, alerts } = dashboardData;
  const hasPending = active_booking?.booking_status === 'PENDING';

  const getStatusIcon = (status) => {
    if (status === 'APPROVED') return <CheckCircle2 size={24} color="#10B981" />;
    if (status === 'REJECTED') return <XCircle size={24} color="#EF4444" />;
    return <Clock size={24} color="#F59E0B" />;
  };

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="text-h2" style={{ fontWeight: '800', marginBottom: '8px' }}>Dashboard Overview</h1>
        <p className="text-body" style={{ color: '#A1A1AA' }}>Welcome back! Here's what's happening with your rentals today.</p>
      </div>

      <DashboardAlerts alerts={alerts} />

      {verificationData && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: '24px', borderRadius: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              background: verificationData.status === 'APPROVED' ? '#10B98115' : verificationData.status === 'REJECTED' ? '#EF444415' : '#F59E0B15',
              padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
               {getStatusIcon(verificationData.status)}
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Driving License: 
                <span style={{ 
                  color: verificationData.status === 'APPROVED' ? '#10B981' : verificationData.status === 'REJECTED' ? '#EF4444' : verificationData.status === 'PENDING' ? '#F59E0B' : '#A1A1AA',
                  textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.5px'
                }}>
                  {verificationData.status || 'NOT SUBMITTED'}
                </span>
              </h3>
              <p style={{ color: '#A1A1AA', fontSize: '14px', marginTop: '4px' }}>
                {verificationData.status === 'APPROVED' 
                  ? 'Your license is verified. You are clear to book any vehicle.' 
                  : verificationData.status === 'REJECTED' 
                    ? `Reason: ${verificationData.remarks || 'Document unclear.'}`
                    : verificationData.status === 'PENDING'
                      ? 'We are currently reviewing your documents. This usually takes 24 hours.'
                      : 'Please upload your driving license to enable vehicle bookings.'}
              </p>
            </div>
          </div>
          {verificationData.status !== 'APPROVED' && (
            <Button className="w-full-mobile" variant="primary" onClick={() => router.push('/verify-license')} style={{ background: verificationData.status === 'REJECTED' ? '#EF4444' : verificationData.status === 'PENDING' ? '#F59E0B' : '#EF3E42' }}>
              {verificationData.status === 'REJECTED' ? 'Re-upload License' : verificationData.status === 'PENDING' ? 'Check Status' : 'Upload License'}
            </Button>
          )}
        </div>
      )}

      <StatsGrid stats={stats} />

      <div className="grid-responsive grid-sidebar-layout" style={{ alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: '32px' }}>
          <ActiveBookingCard 
            booking={active_booking} 
            onAction={handleBookingAction} 
          />
          {active_booking && (
            <ProgressTracker 
              status={active_booking.booking_status} 
              vehicleName={`${active_booking.vehicle_brand} ${active_booking.vehicle_name}`} 
            />
          )}

          {!active_booking && stats.total === 0 && (
            <div className="glass-card" style={{ padding: '80px 40px', textAlign: 'center', borderStyle: 'shadow' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '500' }}>No adventures yet? Explore our premium fleet and start your journey.</p>
              <Button variant="primary" onClick={() => router.push('/vehicles')} style={{ marginTop: '32px', padding: '16px 40px', borderRadius: '16px', fontWeight: '800' }}>Browse Vehicles</Button>
            </div>
          )}
          <QuickActions hasPending={hasPending} />
        </div>

        <div style={{ display: 'grid', gap: '32px' }}>
          <WalletDetailedCard 
            wallet={wallet} 
            onUpdate={fetchDashboardData} 
            onWithdrawalSuccess={() => setHistoryRefresh(prev => prev + 1)}
          />
          <WithdrawalHistory refreshTrigger={historyRefresh} />
          <FinesHistory />
        </div>
      </div>

      {actionLoading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#18181B', padding: '24px 40px', borderRadius: '16px', fontWeight: '600' }}>Processing...</div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return <ProtectedRoute><DashboardContent /></ProtectedRoute>;
}
