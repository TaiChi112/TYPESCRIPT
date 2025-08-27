import Link from 'next/link';
import axios from 'axios'; 


interface Items {
  id: number;
  name: string;
  description: string;
}

async function get_items(): Promise<Items[]> {
  try {
    const res = await axios.get("http://localhost:8080/items", {
      timeout: 10000, 
    });
    return res.data as Items[]; 
  } catch (error) {
    console.error('Error fetching items:', error);
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