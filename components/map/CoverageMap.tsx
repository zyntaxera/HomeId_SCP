'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FAT, Capel, Demand, Provider } from '../../lib/types';
import { useStore } from '../../lib/store';

// Utility component to handle programmatic map flying
function MapFlyTo({ center, zoom }: { center: [number, number] | null, zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 16, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

interface CoverageMapProps {
  providers: Provider[];
  fats: FAT[];
  capels: Capel[];
  demands: Demand[];
  activeLayers: {
    providers: string[]; // array of id_provider
    showPelanggan: boolean;
    showProspek: boolean;
    showDemand: boolean;
  };
  centerPosition?: [number, number] | null;
  onMapClick?: (lat: number, lng: number) => void;
  activePin?: [number, number] | null;
}

export function CoverageMap({
  providers, fats, capels, demands, activeLayers, centerPosition, onMapClick, activePin
}: CoverageMapProps) {
  const [mounted, setMounted] = useState(false);
  const { selectedMapItemId, setSelectedMapItemId } = useStore();
  const [flyToCenter, setFlyToCenter] = useState<[number, number] | null>(centerPosition || null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (centerPosition) {
      setFlyToCenter(centerPosition);
    }
  }, [centerPosition]);

  // Reactive FlyTo based on selectedMapItemId from Store
  useEffect(() => {
    if (selectedMapItemId) {
      const fat = fats.find(f => f.id_fat === selectedMapItemId);
      if (fat) return setFlyToCenter([fat.latitude, fat.longitude]);

      const capel = capels.find(c => c.id_capel === selectedMapItemId);
      if (capel) return setFlyToCenter([capel.latitude, capel.longitude]);

      const demand = demands.find(d => d.id_demand === selectedMapItemId);
      if (demand) return setFlyToCenter([demand.latitude, demand.longitude]);
    }
  }, [selectedMapItemId, fats, capels, demands]);

  if (!mounted) return <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-400 font-bold">Memuat Peta...</div>;

  const getProviderIcon = (colorHex: string, isSelected: boolean) => {
    const scale = isSelected ? 1.5 : 1;
    const filter = isSelected ? 'drop-shadow(0px 0px 8px rgba(255,255,255,0.8))' : 'none';
    const svgIcon = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${colorHex}" width="${24 * scale}px" height="${24 * scale}px" style="filter: ${filter}">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `);
    return new L.Icon({
      iconUrl: `data:image/svg+xml;utf8,${svgIcon}`,
      iconSize: [32 * scale, 32 * scale],
      iconAnchor: [16 * scale, 32 * scale],
      popupAnchor: [0, -32 * scale]
    });
  };

  const activePinIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

  const MapEvents = () => {
    useMap().on('click', (e) => {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
      setSelectedMapItemId(null); // click empty map clears selection
    });
    return null;
  };

  const defaultCenter: [number, number] = [-6.9200, 107.6200];

  return (
    <MapContainer 
      center={flyToCenter || defaultCenter} 
      zoom={14} 
      style={{ height: '100%', width: '100%', zIndex: 1 }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap'
      />
      <MapFlyTo center={flyToCenter} />
      <MapEvents />

      {providers.filter(p => activeLayers.providers.includes(p.id_provider)).map(provider => {
        const providerFats = fats.filter(f => f.id_provider === provider.id_provider);
        return providerFats.map(fat => {
          const isSelected = selectedMapItemId === fat.id_fat;
          const icon = getProviderIcon(provider.warna_peta, isSelected);
          return (
            <React.Fragment key={fat.id_fat}>
              <Circle 
                center={[fat.latitude, fat.longitude]}
                radius={fat.radius_layanan_m}
                pathOptions={{ color: provider.warna_peta, fillColor: provider.warna_peta, fillOpacity: isSelected ? 0.3 : 0.1, weight: isSelected ? 2 : 1 }}
              />
              <Marker 
                position={[fat.latitude, fat.longitude]} 
                icon={icon}
                eventHandlers={{ click: () => setSelectedMapItemId(fat.id_fat) }}
              >
                <Popup>
                  <div className="text-xs">
                    <strong className="block text-sm" style={{color: provider.warna_peta}}>{fat.kode_fat}</strong>
                    <span className="text-slate-500">{provider.nama}</span>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        });
      })}

      {activeLayers.showPelanggan && capels.filter(c => c.status_prospek === 'Terpasang').map(capel => {
        const isSelected = selectedMapItemId === capel.id_capel;
        return (
          <CircleMarker 
            key={capel.id_capel} 
            center={[capel.latitude, capel.longitude]} 
            radius={isSelected ? 10 : 6} 
            pathOptions={{ color: '#10b981', fillOpacity: 0.8, weight: isSelected ? 3 : 1 }}
            eventHandlers={{ click: () => setSelectedMapItemId(capel.id_capel) }}
          >
            <Popup><strong className="text-xs">{capel.nama_lengkap}</strong><br/>Terpasang</Popup>
          </CircleMarker>
        );
      })}

      {activeLayers.showProspek && capels.filter(c => ['Prospek Terdaftar', 'Divalidasi', 'Proses Instalasi'].includes(c.status_prospek)).map(capel => {
        const isSelected = selectedMapItemId === capel.id_capel;
        return (
          <CircleMarker 
            key={capel.id_capel} 
            center={[capel.latitude, capel.longitude]} 
            radius={isSelected ? 10 : 6} 
            pathOptions={{ color: '#8b5cf6', fillOpacity: 0.8, weight: isSelected ? 3 : 1 }}
            eventHandlers={{ click: () => setSelectedMapItemId(capel.id_capel) }}
          >
            <Popup><strong className="text-xs">{capel.nama_lengkap}</strong><br/>{capel.status_prospek}</Popup>
          </CircleMarker>
        );
      })}

      {activeLayers.showDemand && demands.map(demand => {
        const isSelected = selectedMapItemId === demand.id_demand;
        return (
          <CircleMarker 
            key={demand.id_demand} 
            center={[demand.latitude, demand.longitude]} 
            radius={isSelected ? 8 : 5} 
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 1, weight: isSelected ? 3 : 1 }}
            eventHandlers={{ click: () => setSelectedMapItemId(demand.id_demand) }}
          >
            <Popup><strong className="text-xs">{demand.alamat}</strong><br/>Demand Belum Terjangkau</Popup>
          </CircleMarker>
        );
      })}

      {activePin && (
        <Marker position={activePin} icon={activePinIcon}>
           <Popup>Titik Pengecekan</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
