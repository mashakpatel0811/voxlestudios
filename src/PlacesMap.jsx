import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useT } from "./language";

// The middle of Los Angeles, used when there is nothing to show
const LA_CENTER = [34.05, -118.3];

// A round blue pin with the place's number in it (the same number as on its card).
function numberPin(number) {
  return L.divIcon({
    className: "", // no default Leaflet styling, my CSS (.pin) does it
    html: `<div class="pin">${number}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

// Zooms and moves the map so every pin is on screen. It runs again whenever the pins change.
function FitToPins({ pins }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length === 0) {
      map.setView(LA_CENTER, 9);
    } else if (pins.length === 1) {
      map.setView([pins[0].place.lat, pins[0].place.lng], 14);
    } else {
      map.fitBounds(
        pins.map((p) => [p.place.lat, p.place.lng]),
        { padding: [30, 30] },
      );
    }
  }, [pins, map]);
  return null;
}

// A map with one numbered pin for each place that has a latitude and longitude.
// places = the places that are showing in the list right now, in list order.
function PlacesMap({ places }) {
  const t = useT();
  // keep each place's number (its position in the list), then drop places with no coordinates
  const pins = places
    .map((place, i) => ({ place, number: i + 1 }))
    .filter((p) => p.place.lat !== undefined && p.place.lng !== undefined);
  const noPin = places.length - pins.length;

  return (
    <div className="map-wrap">
      <MapContainer
        className="map-box"
        center={LA_CENTER}
        zoom={9}
        scrollWheelZoom={false}
        aria-label={t("Map of the places in the list")}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToPins pins={pins} />
        {pins.map(({ place, number }) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={numberPin(number)}
          >
            <Popup>
              <strong>
                {number}. {place.name}
              </strong>
              <br />
              {place.address}
              <br />
              <a href={"tel:" + place.phone.replace(/\D/g, "")}>
                {t("Call {phone}", { phone: place.phone })}
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <p className="small muted">
        {t("{pins} of {total} places are on the map.", {
          pins: pins.length,
          total: places.length,
        })}
        {noPin > 0 &&
          " " +
            t(
              "The others help by phone or have no street address, so they have no pin. Pin positions are approximate.",
            )}
      </p>
    </div>
  );
}

export default PlacesMap;
