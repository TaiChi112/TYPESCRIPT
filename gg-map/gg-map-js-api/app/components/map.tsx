"use client";

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

declare global {
    interface Window {
        initMap?: () => void;
    }
}

const IconMarker: React.FC<{ text: String }> = ({ text }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
            <rect x="5" y="5" width="40" height="30" fill="#1AA3E8" rx="8" ry="8" />
            <text
                x="50%"
                y="50%"
                fontSize="12"
                text-anchor="middle"
                alignment-baseline="middle"
                fill="white">
                ${text}
            </text>
        </svg>
    )
}
const getMarkerIcon = (text: string) => {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
            <rect x="5" y="6" width="40" height="30" fill="#1AA3E8" rx="8" ry="8" />
            <text 
                y="50%" 
                x="50%" 
                text-anchor="middle" 
                fontSize="12" 
                fill="white">
                alignment-baseline="middle"  
                </text>
            ${text}
        </svg>
        `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

const Map: React.FC = () => {
    useEffect(() => {
        const initMap = (): void => {
            const bangkok = { lat: 13.736717, lng: 100.523186 };

            const map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
                zoom: 15,
                center: bangkok,
            });

            const iconUrl = getMarkerIcon("112k");

            const marker = new google.maps.Marker({
                position: bangkok,
                map: map,
                title: 'Bangkok',
                icon: {
                    url: iconUrl,
                    scaledSize: new google.maps.Size(50, 50),
                }
            });

            const infoWindow = new google.maps.InfoWindow({
                content: '<div style="color: black;"><h1>Bangkok</h1><p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque quibusdam porro eum, rem deleniti quae sit consequuntur vitae ipsa in optio fugit accusamus dolores! Minima quibusdam tenetur dignissimos. Veniam, placeat?</p></div>', // ข้อความที่ต้องการแสดงใน InfoWindow
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA2HZHq7JxcYuvaq-KNGo4jn26mqYLPKYs&callback=initMap`; // แทนที่ YOUR_API_KEY ด้วย API Key ของคุณ
        script.async = true;
        script.defer = true;
        window.initMap = initMap;
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
            window.initMap = undefined;
        };
    }, []);

    return (
        <div>
            <div id="map" style={{ minHeight: '100vh', width: '100%' }}></div>
        </div>
    );
};

export default Map;
