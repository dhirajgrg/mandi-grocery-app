import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Navigation } from "lucide-react";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const FlyToLocation = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16);
    }
  }, [center, map]);
  return null;
};

const LocationPicker = ({ onLocationChange, initialAddress = "" }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState([27.7172, 85.324]); // Kathmandu default

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data.display_name) {
        setAddress(data.display_name);
        onLocationChange({ lat, lng, address: data.display_name });
      }
    } catch {
      onLocationChange({ lat, lng, address: address || "Selected location" });
    }
  };

  const handleLocationSelect = (lat, lng) => {
    setPosition([lat, lng]);
    setMapCenter([lat, lng]);
    reverseGeocode(lat, lng);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lon);
        setPosition([latNum, lngNum]);
        setMapCenter([latNum, lngNum]);
        setAddress(display_name);
        onLocationChange({ lat: latNum, lng: lngNum, address: display_name });
      }
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleLocationSelect(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        // permission denied or error
      }
    );
  };

  const handleAddressChange = (e) => {
    const val = e.target.value;
    setAddress(val);
    if (position) {
      onLocationChange({ lat: position[0], lng: position[1], address: val });
    } else {
      onLocationChange({ lat: 0, lng: 0, address: val });
    }
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="px-3 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
        >
          {searching ? "..." : "Search"}
        </button>
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all"
          title="Use my location"
        >
          <Navigation size={16} />
        </button>
      </form>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-border" style={{ height: "250px" }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          <FlyToLocation center={mapCenter} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>

      <p className="text-[10px] text-text-muted flex items-center gap-1">
        <MapPin size={10} /> Click on the map to select delivery location
      </p>

      {/* Address input */}
      <textarea
        value={address}
        onChange={handleAddressChange}
        placeholder="Delivery address will appear here, or type manually..."
        rows={2}
        className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
      />
    </div>
  );
};

export default LocationPicker;
