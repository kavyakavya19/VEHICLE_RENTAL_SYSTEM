import API from '../utils/api';

export const dashboardService = {
  getSummary: async () => {
    const res = await API.get('bookings/summary/');
    return res.data;
  },
  
  getVerificationStatus: async () => {
    try {
      const res = await API.get('users/verification-status/');
      return res.data;
    } catch {
      return null;
    }
  },

  performBookingAction: async (bookingId, action) => {
    const res = await API.post(`bookings/${bookingId}/${action}/`);
    return res.data;
  }
};
