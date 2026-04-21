'use client';

import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import API from '../utils/api';
import { Button } from './Button';

export const ReviewModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await API.post('reviews/', {
        booking: booking.id,
        rating,
        comment
      });
      onSuccess();
      onClose();
      // Reset state
      setRating(0);
      setComment('');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: 10000, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'rgba(0, 0, 0, 0.8)', 
      backdropFilter: 'blur(4px)' 
    }}>
      <div 
        className="animate-in fade-in zoom-in duration-200"
        style={{ 
          width: '90%', 
          maxWidth: '500px', 
          background: '#18181B', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          borderRadius: '20px', 
          padding: '30px', 
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#FFF' }}>Rate Your Experience</h2>
        <p style={{ color: '#A1A1AA', marginBottom: '24px', fontSize: '14px' }}>
          How was your ride with the <span style={{ color: '#EF3E42', fontWeight: '600' }}>{booking.vehicle_brand} {booking.vehicle_name}</span>?
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '30px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.1s' }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Star 
                  size={40} 
                  fill={(hover || rating) >= star ? '#FBBF24' : 'transparent'} 
                  color={(hover || rating) >= star ? '#FBBF24' : '#3F3F46'} 
                  style={{ transition: 'color 0.2s, fill 0.2s' }}
                />
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#A1A1AA', marginBottom: '8px' }}>
              Your Comment
            </label>
            <textarea
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked or how we can improve..."
              style={{ 
                width: '100%', 
                height: '120px', 
                background: '#09090B', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '12px', 
                padding: '15px', 
                color: '#FFF', 
                fontSize: '14px', 
                resize: 'none',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = '#EF3E42'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
              style={{ flex: 2, background: '#EF3E42', py: '14px' }}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
