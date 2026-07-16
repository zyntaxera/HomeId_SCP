import { FAT, Port, Provider, ServiceabilityResult, ServiceabilityProviderResult, ProviderLevel } from './types';

// Haversine formula to calculate distance between two coordinates in meters
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Radius of the Earth in meters
  const toRad = (value: number) => value * Math.PI / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return Math.round(R * c);
}

export function checkServiceability(
  lat: number,
  lng: number,
  providers: Provider[],
  fats: FAT[],
  ports: Port[]
): ServiceabilityResult {
  const activeProviders = providers.filter(p => p.status_aktif);
  const daftar_provider: ServiceabilityProviderResult[] = [];

  for (const provider of activeProviders) {
    const providerFats = fats.filter(f => f.id_provider === provider.id_provider);
    if (providerFats.length === 0) continue;

    // 1 & 2. Hitung jarak ke setiap FAT dan cari yang terdekat
    let nearestFat: FAT | null = null;
    let minDistance = Infinity;

    for (const fat of providerFats) {
      const distance = calculateDistance(lat, lng, fat.latitude, fat.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearestFat = fat;
      }
    }

    if (!nearestFat) continue;

    // Hitung port kosong di FAT terdekat
    const fatPorts = ports.filter(p => p.id_fat === nearestFat!.id_fat);
    const portKosong = fatPorts.filter(p => p.status_port === 'Tersedia').length;

    // 3. Klasifikasi level provider
    let level: ProviderLevel = 'Belum Terjangkau';
    
    if (minDistance <= nearestFat.radius_layanan_m) {
      if (portKosong > 0) {
        level = 'Dalam Jangkauan'; // Hijau
      } else {
        level = 'Penuh'; // Kuning
      }
    } else if (minDistance <= nearestFat.radius_layanan_m * 1.2) {
      level = 'Perlu Survei'; // Kuning
    } else {
      level = 'Belum Terjangkau'; // Merah
    }

    daftar_provider.push({
      provider,
      fat_terdekat: nearestFat,
      jarak_m: minDistance,
      port_kosong: portKosong,
      level
    });
  }

  // 4. VONIS Keseluruhan
  let vonis: ServiceabilityResult['vonis'] = 'Belum Terjangkau';
  
  const adaDalamJangkauan = daftar_provider.some(p => p.level === 'Dalam Jangkauan');
  const adaKuning = daftar_provider.some(p => p.level === 'Penuh' || p.level === 'Perlu Survei');

  if (adaDalamJangkauan) {
    vonis = 'Siap Pasang';
  } else if (adaKuning) {
    vonis = 'Perlu Survei';
  }

  return {
    vonis,
    daftar_provider: daftar_provider.sort((a, b) => a.jarak_m - b.jarak_m),
    titik: { lat, lng }
  };
}
