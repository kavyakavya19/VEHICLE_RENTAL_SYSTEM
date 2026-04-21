import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.vehicles.models import Brand, Vehicle

def seed_fleet():
    fleet_data = {
        'BAJAJ': [
            {'name': 'Pulsar RS200', 'type': 'BIKE', 'price_per_day': 800, 'number': 'KA-01-EQ-1001', 'color': 'Racing Red'},
            {'name': 'Dominar 400', 'type': 'BIKE', 'price_per_day': 1200, 'number': 'KA-01-EQ-1002', 'color': 'Aurora Green'},
            {'name': 'Chetak Electric', 'type': 'BIKE', 'price_per_day': 500, 'number': 'KA-01-EQ-1003', 'color': 'Indigo Metallic'},
        ],
        'TVS': [
            {'name': 'Apache RR310', 'type': 'BIKE', 'price_per_day': 1100, 'number': 'TN-01-EQ-2001', 'color': 'Phantom Black'},
            {'name': 'Ronin', 'type': 'BIKE', 'price_per_day': 900, 'number': 'TN-01-EQ-2002', 'color': 'Magma Red'},
            {'name': 'Jupiter 125', 'type': 'BIKE', 'price_per_day': 400, 'number': 'TN-01-EQ-2003', 'color': 'Titanium Grey'},
        ],
        'BMW': [
            {'name': 'X5 M-Sport', 'type': 'SUV', 'price_per_day': 7500, 'number': 'MH-01-EQ-3001', 'color': 'Carbon Black'},
            {'name': '3 Series Gran Limousine', 'type': 'SEDAN', 'price_per_day': 6000, 'number': 'MH-01-EQ-3002', 'color': 'Portimao Blue'},
            {'name': 'G 310 RR', 'type': 'BIKE', 'price_per_day': 1500, 'number': 'MH-01-EQ-3003', 'color': 'Style Sport'},
        ],
        'TATA': [
            {'name': 'Harrier Dark', 'type': 'SUV', 'price_per_day': 3500, 'number': 'DL-01-EQ-4001', 'color': 'Oberon Black'},
            {'name': 'Nexon EV', 'type': 'SUV', 'price_per_day': 2500, 'number': 'DL-01-EQ-4002', 'color': 'Intense Teal'},
            {'name': 'Safari', 'type': 'SUV', 'price_per_day': 4000, 'number': 'DL-01-EQ-4003', 'color': 'Tropical Mist'},
        ],
        'HONDA': [
            {'name': 'City e:HEV', 'type': 'SEDAN', 'price_per_day': 2000, 'number': 'HR-01-EQ-5001', 'color': 'Radiant Red'},
            {'name': 'Hness CB350', 'type': 'BIKE', 'price_per_day': 1000, 'number': 'HR-01-EQ-5002', 'color': 'Precious Red Metallic'},
            {'name': 'Amaze', 'type': 'SEDAN', 'price_per_day': 1200, 'number': 'HR-01-EQ-5003', 'color': 'Meteoroid Grey'},
        ],
        'MAHINDRA': [
            {'name': 'Thar 4x4', 'type': 'SUV', 'price_per_day': 3000, 'number': 'RJ-01-EQ-6001', 'color': 'Mystic Copper'},
            {'name': 'XUV700', 'type': 'SUV', 'price_per_day': 4500, 'number': 'RJ-01-EQ-6002', 'color': 'Midnight Blue'},
            {'name': 'Scorpio-N', 'type': 'SUV', 'price_per_day': 3800, 'number': 'RJ-01-EQ-6003', 'color': 'Deep Forest'},
        ]
    }

    print("Seeding Fleet...")
    for brand_name, vehicles in fleet_data.items():
        brand, _ = Brand.objects.get_or_create(name=brand_name)
        for v in vehicles:
            Vehicle.objects.update_or_create(
                vehicle_number=v['number'],
                defaults={
                    'brand': brand,
                    'name': v['name'],
                    'type': v['type'],
                    'price_per_day': v['price_per_day'],
                    'color': v['color'],
                    'is_available': True,
                    'availability_status': True
                }
            )
            print(f"  - Configured {brand_name} {v['name']}")

    # Migrate any existing vehicles that might have brand_str but no brand FK
    print("\nSyncing existing vehicles...")
    for vehicle in Vehicle.objects.filter(brand__isnull=True, brand_str__isnull=False):
        b_name = vehicle.brand_str.upper()
        brand, _ = Brand.objects.get_or_create(name=b_name)
        vehicle.brand = brand
        vehicle.save()
        print(f"  - Linked {vehicle.name} to {brand.name}")

if __name__ == '__main__':
    seed_fleet()
