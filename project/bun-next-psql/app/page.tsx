import Link from 'next/link';
import axios from 'axios'; // ต้อง import axios เข้ามาก่อน


interface Items {
  id: number;
  name: string;
  description: string;
}


async function get_items(): Promise<Items[]> {
  try {
    const res = await axios.get("http://localhost:8080/items", {
      // Axios มีความสามารถในการกำหนด timeout ได้โดยตรง
      timeout: 10000, // ยกตัวอย่าง: กำหนด timeout 10 วินาที
      // การ revalidate (เช่น next: { revalidate: 10 }) เป็นฟีเจอร์เฉพาะของ Next.js
      // ซึ่ง Axios ไม่มีในตัว แต่สามารถจัดการได้ด้วยวิธีอื่นในฝั่ง client-side caching
      // หรือการกำหนด header cache control
    });

    // Axios จะ throw error โดยอัตโนมัติถ้า status code เป็น 4xx หรือ 5xx
    // เราจึงไม่จำเป็นต้องเช็ค res.ok เอง
    
    // Axios จะ return data ใน property .data เลย
    return res.data as Items[]; 
  } catch (error) {
    console.error('Error fetching items:', error);
    // Axios มีการจัดการ error ที่ดีกว่า เช่น error.response, error.request
    if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data ?? error.message);
    }
    return [];
  }
}

export default async function home_page() {
  const items = await get_items();
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Items list</h1>
      <Link href="/item/new" style={{ display: 'block', marginBottom: '20px', color: 'blue' }}>
        Add new item
      </Link>
      {items.length === 0 ? (
        <p>Item not found</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {items.map((item) => (
            <li key={item.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}>
              <h2>
                <Link href={`/items/${item.id}`} style={{ textDecoration: 'none', color: '#333' }}>
                  {item.name}
                </Link>
              </h2>
              {item.description && <p>{item.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>

  )

}