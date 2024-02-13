import { MapContainer, TileLayer, Marker, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Iss.css";
import markerIcon from "./44606.png"; // ikona ISS
import { useEffect, useState, useRef } from "react";
import { Button, Spinner } from "reactstrap";

const Iss = () => {
  const url = "https://api.wheretheiss.at/v1/satellites/25544"; //ISS Api
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [time, setTime] = useState("");
  const [zoom, setZoom] = useState(3);
  const mapRef = useRef();

  //pripojeni a ziskavani dat z API
  const connectApiIss = async () => {
    const response = await fetch(url);
    const data = await response.json();
    setLatitude(parseFloat(data["latitude"]));
    setLongitude(parseFloat(data["longitude"]));
    setVelocity(parseFloat(data["velocity"]));
    //datum
    let datum = new Date(parseFloat(data["timestamp"]) * 1000);
    datum.setHours(datum.getHours() + 1);
    setTime(datum.toISOString().slice(0, 19).replace("T", " "));
  };
  const position = [latitude, longitude];
  // pri prvnim nacteni stranky se nacte interval a nasledne se vola API ISS
  useEffect(() => {
    const intervalId = setInterval(connectApiIss, 3000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      // Při změně polohy ISS, se nastavi pohled uprostred
      mapRef.current.setView([latitude, longitude], zoom);
    }
  }, [latitude, longitude, zoom]);

  // Vytvoření vlastního ikonu pro marker
  const customIcon = new L.Icon({
    iconUrl: markerIcon,
    iconSize: [50, 50],
    iconAnchor: [26, 24],
    popupAnchor: [0, 50],
  });

  return (
    <div className="map-container">
      {/* udaje o stanici */}
      <div className="iss-info-panel">
        <p>
          šířka: {latitude.toFixed(5)} <br />
          délka: {longitude.toFixed(5)}
          <br />
          rychlost: {velocity.toFixed(2)} km/h
          <br />
          frekvence obnovení: 3s <br />
        </p>
        <p className="text-center">
          {time ? time : <Spinner>Loading...</Spinner>}
        </p>
      </div>

      {/* tlacitka zoomu */}
      <div className="map-zoom">
        <Button
          className="map-zoom-btn"
          disabled={zoom === 13}
          onClick={() => setZoom(zoom + 1)}
        >
          +
        </Button>
        <br />
        <Button
          className="map-zoom-btn"
          disabled={zoom === 1}
          onClick={() => setZoom(zoom - 1)}
        >
          -
        </Button>
      </div>
      <MapContainer
        ref={mapRef}
        zoom={1}
        zoomControl={false}
        center={position}
        scrollWheelZoom={false}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} icon={customIcon}>
          {/* kruh kolem ikony stanice */}
          <CircleMarker center={position} radius={30} />
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Iss;
