// Integrasi Nominatim (OpenStreetMap) untuk geocoding
// PRD: "Hormati batas wajar Nominatim (debounce ketikan ~500ms, sertakan header/identitas sesuai ToS, jangan spam request)"

export interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
}

export async function searchAddressNominatim(query: string): Promise<GeocodeResult[]> {
  if (!query || query.trim().length < 3) return [];

  // Parse if coordinate was pasted directly: "lat, lng"
  const coordMatch = query.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
  if (coordMatch) {
    return [
      {
        display_name: `Coordinate: ${coordMatch[1]}, ${coordMatch[3]}`,
        lat: coordMatch[1],
        lon: coordMatch[3]
      }
    ];
  }

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.append('q', query);
  url.searchParams.append('format', 'json');
  url.searchParams.append('limit', '5');
  url.searchParams.append('countrycodes', 'id');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Accept-Language': 'id',
        'User-Agent': 'HomeID-Pro-Prototype/1.0 (prototype@example.com)' // Sesuai ToS
      }
    });

    if (!response.ok) throw new Error('Nominatim error');
    return await response.json();
  } catch (error) {
    console.error("Geocoding failed:", error);
    return [];
  }
}
