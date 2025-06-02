// components/Navbar.tsx
'use client';

import { useRouter} from 'next/navigation';
import { useState } from 'react';

const uxuiList = [
  { name: 'UXUI 1', id: 'ux_ui_app1' },
  { name: 'UXUI 2', id: 'ux_ui_app2' },
  { name: 'Default', id: 'default' },
];

export default function Navbar() {
  const router = useRouter();
  const [selected, setSelected] = useState('ux_ui_app1');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelected(selectedId);
    router.push(`/${selectedId}`);
  };

  return (
    <nav className="bg-white shadow p-4 flex items-center justify-between">
      <h1 className="text-xl font-bold">UXUI Switcher</h1>
      <select value={selected} onChange={handleChange} className="p-2 border rounded">
        {uxuiList.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </nav>
  );
}
