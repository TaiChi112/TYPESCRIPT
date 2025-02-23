import GoogleMap from "../components/GoogleMap";

const MapPage = () => {
    const locations = [
        { lat: 13.7563, lng: 100.5018, title: 'Grand Palace', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem illo doloribus eaque molestiae vitae ab ut eos consequatur fugit obcaecati quis sunt repellat, explicabo itaque tempora amet consectetur, id beatae." },          // พระบรมมหาราชวัง
        { lat: 13.7467, lng: 100.5350, title: 'Siam Paragon', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem illo doloribus eaque molestiae vitae ab ut eos consequatur fugit obcaecati quis sunt repellat, explicabo itaque tempora amet consectetur, id beatae." },          // สยามพารากอน
        { lat: 13.7246, lng: 100.4932, title: 'Wat Arun', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem illo doloribus eaque molestiae vitae ab ut eos consequatur fugit obcaecati quis sunt repellat, explicabo itaque tempora amet consectetur, id beatae." },              // วัดอรุณราชวราราม
        { lat: 13.7659, lng: 100.5382, title: 'Chatuchak Market', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem illo doloribus eaque molestiae vitae ab ut eos consequatur fugit obcaecati quis sunt repellat, explicabo itaque tempora amet consectetur, id beatae." },      // ตลาดนัดจตุจักร
        { lat: 13.6899, lng: 100.7501, title: 'Suvarnabhumi Airport', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem illo doloribus eaque molestiae vitae ab ut eos consequatur fugit obcaecati quis sunt repellat, explicabo itaque tempora amet consectetur, id beatae." },  // สนามบินสุวรรณภูมิ
        { lat: 13.7279, lng: 100.5241, title: 'Wat Pho', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem illo doloribus eaque molestiae vitae ab ut eos consequatur fugit obcaecati quis sunt repellat, explicabo itaque tempora amet consectetur, id beatae." },                 // วัดโพธิ์
        { lat: 13.7527, lng: 100.4932, title: 'Khaosan Road', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem illo doloribus eaque molestiae vitae ab ut eos consequatur fugit obcaecati quis sunt repellat, explicabo itaque tempora amet consectetur, id beatae." },            // ถนนข้าวสาร
        { lat: 13.7631, lng: 100.5371, title: 'Victory Monument', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem illo doloribus eaque molestiae vitae ab ut eos consequatur fugit obcaecati quis sunt repellat, explicabo itaque tempora amet consectetur, id beatae." },        // อนุสาวรีย์ชัยสมรภูมิ
        { lat: 13.7460, lng: 100.5308, title: 'MBK Center', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem illo doloribus eaque molestiae vitae ab ut eos consequatur fugit obcaecati quis sunt repellat, explicabo itaque tempora amet consectetur, id beatae." },              // เอ็มบีเคเซ็นเตอร์
        { lat: 13.7563, lng: 100.5653, title: 'Lumphini Park', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem illo doloribus eaque molestiae vitae ab ut eos consequatur fugit obcaecati quis sunt repellat, explicabo itaque tempora amet consectetur, id beatae." },           // สวนลุมพินี
        { lat: 13.7456, lng: 100.5323, title: 'Jim Thompson House', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem illo doloribus eaque molestiae vitae ab ut eos consequatur fugit obcaecati quis sunt repellat, explicabo itaque tempora amet consectetur, id beatae." },      // บ้านจิม ทอมป์สัน
        { lat: 13.6904, lng: 100.5204, title: 'Asiatique The Riverfront', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem illo doloribus eaque molestiae vitae ab ut eos consequatur fugit obcaecati quis sunt repellat, explicabo itaque tempora amet consectetur, id beatae." },// เอเชียทีค เดอะ ริเวอร์ฟร้อนท์
        { lat: 13.7218, lng: 100.5266, title: 'Museum Siam', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem illo doloribus eaque molestiae vitae ab ut eos consequatur fugit obcaecati quis sunt repellat, explicabo itaque tempora amet consectetur, id beatae." },             // มิวเซียมสยาม
        { lat: 13.7650, lng: 100.5368, title: 'Chatuchak Park', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem illo doloribus eaque molestiae vitae ab ut eos consequatur fugit obcaecati quis sunt repellat, explicabo itaque tempora amet consectetur, id beatae." },          // สวนจตุจักร
        { lat: 13.7451, lng: 100.5340, title: 'CentralWorld', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem illo doloribus eaque molestiae vitae ab ut eos consequatur fugit obcaecati quis sunt repellat, explicabo itaque tempora amet consectetur, id beatae." },            // เซ็นทรัลเวิลด์

    ];

    return (
        <div>
            <GoogleMap locations={locations} />
        </div>
    );
};

export default MapPage;


