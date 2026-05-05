import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { BedDouble, Ambulance, Stethoscope, Brain, Phone, Navigation } from 'lucide-react';

const mapContainerStyle = { width: '100%', height: '100%' };

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e3a5f' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c1a2e' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1a2744' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
];

function ResourceBadge({ icon: Icon, value, color }) {
  return (
    <div className={'flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 ' + color}>
      <Icon size={10} />
      <span>{value}</span>
    </div>
  );
}

function NoKeyPlaceholder({ hospitals, height }) {
  return (
    <div className="w-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden relative" style={{ height }}>
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,170,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,1) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="text-4xl">🗺️</div>
        <div className="text-white font-semibold">Google Maps Preview</div>
        <div className="text-slate-400 text-sm text-center max-w-xs">
          Add <code className="bg-slate-800 px-1.5 py-0.5 rounded text-teal-400">VITE_GOOGLE_MAPS_KEY</code> to <code className="bg-slate-800 px-1.5 py-0.5 rounded text-teal-400">client/.env</code>
        </div>
        {hospitals.length > 0 && (
          <div className="text-xs text-slate-500 mt-1">{hospitals.length} hospitals ready to display</div>
        )}
      </div>
      {hospitals.slice(0, 4).map((h, i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: (15 + i * 20) + '%', top: (25 + (i % 2) * 25) + '%' }}
        >
          <div className="w-8 h-8 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center text-xs text-white font-bold shadow-lg">
            H
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HospitalMap({ hospitals = [], userLocation = null, height = '400px' }) {
  const [selected, setSelected] = useState(null);
  const mapRef = useRef(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places'],
  });

  const defaultCenter = userLocation || { lat: 23.7957, lng: 86.4304 };
  const onLoad = useCallback(map => { mapRef.current = map; }, []);

  const handleDirections = (hospital) => {
    const lat = hospital.location?.coordinates?.[1];
    const lng = hospital.location?.coordinates?.[0];
    if (lat && lng) {
      window.open('https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng, '_blank');
    } else {
      window.open('https://www.google.com/maps/search/' + encodeURIComponent(hospital.name + ' ' + hospital.city), '_blank');
    }
  };

  if (!apiKey) return <NoKeyPlaceholder hospitals={hospitals} height={height} />;

  if (loadError) {
    return (
      <div className="w-full bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center" style={{ height }}>
        <div className="text-center text-slate-500 text-sm">Map failed to load. Check API key.</div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center" style={{ height }}>
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading map...</span>
        </div>
      </div>
    );
  }

  const selectedLat = selected?.location?.coordinates?.[1];
  const selectedLng = selected?.location?.coordinates?.[0];

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/10 relative" style={{ height }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={12}
        onLoad={onLoad}
        options={{
          styles: darkMapStyles,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {userLocation && (
          <Circle
            center={userLocation}
            radius={5000}
            options={{
              fillColor: '#00d4aa',
              fillOpacity: 0.05,
              strokeColor: '#00d4aa',
              strokeOpacity: 0.3,
              strokeWeight: 1,
            }}
          />
        )}

        {hospitals.map((hospital, i) => {
          const lat = hospital.location?.coordinates?.[1];
          const lng = hospital.location?.coordinates?.[0];
          if (!lat || !lng) return null;
          return (
            <Marker
              key={hospital.id || i}
              position={{ lat, lng }}
              onClick={() => setSelected(hospital)}
            />
          );
        })}

        {selected && selectedLat && selectedLng && (
          <InfoWindow
            position={{ lat: selectedLat, lng: selectedLng }}
            onCloseClick={() => setSelected(null)}
          >
            <div style={{ background: '#0f172a', color: 'white', padding: '12px', borderRadius: '12px', minWidth: '200px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{selected.name}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>{selected.address}, {selected.city}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', color: '#2dd4bf' }}>🛏 {selected.resources?.availableBeds ?? 0} beds</span>
                <span style={{ fontSize: '11px', color: '#a78bfa' }}>🧠 {selected.resources?.availableIcuBeds ?? 0} ICU</span>
                <span style={{ fontSize: '11px', color: '#fb923c' }}>🚑 {selected.resources?.availableAmbulances ?? 0} amb</span>
                <span style={{ fontSize: '11px', color: '#34d399' }}>👨‍⚕️ {selected.resources?.availableDoctors ?? 0} docs</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={'tel:' + selected.phone}
                  style={{ flex: 1, padding: '6px', background: '#0d9488', color: 'white', fontSize: '11px', textAlign: 'center', borderRadius: '8px', textDecoration: 'none' }}
                >
                  📞 Call
                </a>
                <button
                  onClick={() => handleDirections(selected)}
                  style={{ flex: 1, padding: '6px', background: '#7c3aed', color: 'white', fontSize: '11px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                >
                  🧭 Directions
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass rounded-xl p-2.5 flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" /> Available
        </span>
        <span className="flex items-center gap-1 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Full
        </span>
      </div>
    </div>
  );
}