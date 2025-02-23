"use client";
import { useEffect, useRef } from 'react';


const customMarker = {
  path: "M -4,0  L 4,0 Q 5,0 5,1 L 5,3 Q 5,4 4,4 L -4,4 Q -5,4 -5,3 L -5,1 Q -5,0 -4,0 Z", // สร้าง rectangle ขนาดเล็กที่มีมุมโค้ง
  fillColor: '#FFFFFF',   // พื้นหลังสีขาว
  fillOpacity: 1,         // ความทึบแสง
  strokeWeight: 0,        // ไม่มีเส้นขอบ
  scale: 5,              // ขนาด rectangle
  labelOrigin: new google.maps.Point(0, 2), // กำหนดตำแหน่งของ text ให้อยู่กลาง rectangle
};

interface Location {
  lat: number;
  lng: number;
  title: string;
  desc?: string;
}

interface GoogleMapProps {
  locations: Location[];
}

const GoogleMap: React.FC<GoogleMapProps> = ({ locations }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 13.736717, lng: 100.523186 },
      zoom: 10,
    });


    locations.forEach((location) => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.title,
        // icon: customMarker,
        // label: {
        //   text: '112k', // ข้อความที่ต้องการ
        //   color: '#FF0000', // สีของข้อความเป็นสีแดง
        //   fontSize: '14px', // ขนาดตัวอักษร
        //   fontWeight: 'bold', // น้ำหนักตัวอักษร
        // }
      });
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<h1 style="color: black;" >${location.desc}</h1>`,
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      })
    });
  }, [locations]);

  return <div ref={mapRef} style={{ width: '100%', minHeight: '100vh' }} />;

};

export default GoogleMap;
