"use client";
import { useState, useEffect } from "react";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
};

type ApiResponse = {
  msg: string;
  items: Product[];
};

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/data");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const jsonData: ApiResponse = await res.json();
        console.log("Fetched Data:", jsonData);
        setData(jsonData);
      } catch (err) {
        console.error("Error fetching data: ", err);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold">Frontend (Next.js)</h1>
      {data ? (
        <div>
          <p>{data.msg}</p>
          <ul>
            {data.items.map((item) => (
              <li key={item.id} className="text-blue-500">
                <strong>{item.name}</strong> - {item.description} (${item.price}
                )
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
