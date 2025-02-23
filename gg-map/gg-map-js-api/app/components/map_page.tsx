import GoogleMap from "./GoogleMap";

export default function MapPage() {
    // ข้อมูลตำแหน่งของ Marker ที่ต้องการแสดง
    const locations = [
        { lat: 13.7563, lng: 100.5018, title: 'Bangkok' }, // ตำแหน่งในกรุงเทพ
        { lat: 14.0583, lng: 108.2772, title: 'Vietnam' },  // ตำแหน่งในเวียดนาม
        { lat: 1.3521, lng: 103.8198, title: 'Singapore' }, // ตำแหน่งในสิงคโปร์
    ];

    return (
        <div>
            <h1>My Google Map</h1>
            <GoogleMap locations={locations} />
        </div>
    );
}
