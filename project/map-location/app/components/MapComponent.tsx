import React, { FC } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const MapComponent: FC = () => {
    const mapContainerStyle = { width: '100%', height: '400px' };
    const center = { lat: 13.7563, lng: 100.5018 };

    return (
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
            <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={10}>
                <Marker position={center} />
            </GoogleMap>
        </LoadScript>
    );
};

export default MapComponent;
