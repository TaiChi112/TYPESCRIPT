'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const uxuiList = [
  { name: 'UXUI 1', id: 'ux_ui_app1' },
  { name: 'UXUI 2', id: 'ux_ui_app2' },
  { name: 'Default', id: 'default' },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedUXUI, setSelectedUXUI] = useState<string>('ux_ui_app1');

  const handleSelect = (uxuiId: string) => {
    setSelectedUXUI(uxuiId);
    router.push(`/${uxuiId}`);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">🎨 Select UXUI Design</h1>

      <div className="space-y-4">
        {uxuiList.map((uxui) => (
          <label
            key={uxui.id}
            className="flex items-center space-x-4 cursor-pointer p-4 rounded bg-white shadow"
          >
            <input
              type="radio"
              name="uxui"
              value={uxui.id}
              checked={selectedUXUI === uxui.id}
              onChange={() => handleSelect(uxui.id)}
              className="w-5 h-5"
            />
            <span className="text-lg">{uxui.name}</span>
          </label>
        ))}
      </div>
    </main>
  );
}
