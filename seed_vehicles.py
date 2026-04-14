import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.vehicles.models import Vehicle

def seed_vehicles():
    vehicles = [
        {
            'name': 'Pulsar RS200',
            'brand': 'BAJAJ',
            'type': 'BIKE',
            'price_per_day': 800,
            'color': 'Racing Red',
            'vehicle_number': 'KA-01-EQ-4521',
            'condition': 'Excellent',
            'description': 'A premium sports bike perfect for thrill seekers and city commutes.'
        },
        {
            'name': 'X5 M-Sport',
            'brand': 'BMW',
            'type': 'SUV',
            'price_per_day': 6000,
            'color': 'Carbon Black',
            'vehicle_number': 'MH-12-AB-9012',
            'condition': 'Premium',
            'description': 'Luxury SUV with unparalleled comfort and high-end performance.'
        },
        {
            'name': 'Harrier Dark',
            'brand': 'TATA',
            'type': 'SUV',
            'price_per_day': 3500,
            'color': 'Obsidian Black',
            'vehicle_number': 'DL-04-XY-7777',
            'condition': 'Good',
            'description': 'Robust SUV with a bold design and powerful presence.'
        },
        {
            'name': 'Apache RR310',
            'brand': 'TVS',
            'type': 'BIKE',
            'price_per_day': 1200,
            'color': 'Phantom Black',
            'vehicle_number': 'TN-09-CD-3456',
            'condition': 'Excellent',
            'description': 'High-performance race-ready motorcycle with advanced aerodynamics.'
        },
        {
            'name': 'Thar 4x4',
            'brand': 'MAHINDRA',
            'type': 'SUV',
            'price_per_day': 3000,
            'color': 'Mystic Copper',
            'vehicle_number': 'RJ-14-GH-1234',
            'condition': 'Excellent',
            'description': 'The ultimate off-roader for your adventurous getaways.'
        }
    ]

    print("Seeding vehicles...")
    for v_data in vehicles:
        vehicle, created = Vehicle.objects.get_or_create(
            vehicle_number=v_data['vehicle_number'],
            defaults=v_data
        )
        if created:
            print(f"Created: {vehicle}")
        else:
            print(f"Already exists: {vehicle}")

if __name__ == '__main__':
    seed_vehicles()
