export const getVehicleImage = (vehicle) => {
  if (vehicle && vehicle.image) {
    // Cloudinary returns the full absolute URL, so we can use it directly
    return vehicle.image;
  }

  const type = (vehicle?.vehicle_type || vehicle?.type || '').toUpperCase();
  const name = (vehicle?.name || '').toUpperCase();
  const brand = (vehicle?.brand || '').toUpperCase();

  // Bikes
  if (type === 'BIKE' || type === 'MOTORCYCLE' || name.includes('APACHE') || name.includes('PULSAR') || brand === 'BAJAJ' || brand === 'TVS') {
    return 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80'; // sports bike
  }

  // SUVs
  if (type === 'SUV' || name.includes('THAR') || name.includes('HARRIER') || name.includes('SCORPIO') || brand === 'MAHINDRA') {
    if (name.includes('THAR')) {
      return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80'; // rugged offroad look
    }
    if (name.includes('HARRIER') || brand === 'TATA') {
      return 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80'; // sleek dark suv
    }
    return 'https://images.unsplash.com/photo-1568844293986-8d0400bc4745?auto=format&fit=crop&q=80'; // modern generic suv
  }

  // Sedans
  if (type === 'SEDAN' || name.includes('CITY') || brand === 'HONDA') {
    return 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80'; // sedan
  }

  // Luxury / BMW
  if (brand === 'BMW' || type === 'LUXURY') {
    return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80'; // BMW
  }

  // Default fallback for any generic car
  return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80';
};
