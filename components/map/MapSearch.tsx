import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { searchAddressNominatim, GeocodeResult } from '../../lib/geocode';

interface MapSearchProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

export function MapSearch({ onLocationSelect }: MapSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3) {
        setIsSearching(true);
        const data = await searchAddressNominatim(query);
        setResults(data);
        setIsOpen(true);
        setIsSearching(false);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: GeocodeResult) => {
    setQuery(item.display_name);
    setIsOpen(false);
    onLocationSelect(parseFloat(item.lat), parseFloat(item.lon), item.display_name);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center bg-white rounded-xl shadow-lg border border-slate-200 p-1">
        <div className="pl-3 pr-2 text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari alamat atau 'lat, lng'..."
          className="w-full py-2.5 pr-4 text-sm outline-none font-medium text-slate-700 bg-transparent"
        />
        {isSearching && (
          <div className="absolute right-3 text-indigo-500">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
          {results.map((res, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(res)}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-start gap-3 transition-colors"
            >
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                {res.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
