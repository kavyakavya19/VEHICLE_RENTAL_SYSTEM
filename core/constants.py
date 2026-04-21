

BOOKING_STATUS_CHOICES = (
    ('PENDING',   'Pending'),
    ('CONFIRMED', 'Confirmed'),
    ('ONGOING',   'Ongoing'),       # ← Trip in progress
    ('COMPLETED', 'Completed'),
    ('CANCELLED', 'Cancelled'),
)

PAYMENT_STATUS_CHOICES = (
    ('PENDING',  'Pending'),
    ('SUCCESS',  'Success'),
    ('FAILED',   'Failed'),
)

USER_ROLE_CHOICES = (
    ('ADMIN', 'Admin'),
    ('USER', 'User')
)

VEHICLE_AVAILABILITY_CHOICES = (
    ('AVAILABLE', 'Available'),
    ('BOOKED', 'Booked'),
    ('MAINTENANCE', 'Maintenance'),
)
