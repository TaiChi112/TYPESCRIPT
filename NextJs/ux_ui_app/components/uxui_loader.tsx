import dynamic from 'next/dynamic';

export default function UXUILoader({ uxuiName }: { uxuiName: string }) {
  let Component;

  try {
    Component = dynamic(() => import(`@/src/uxuis/${uxuiName}`));
  } catch {
    Component = dynamic(() => import('@/src/uxuis/default'));
  }

  return (
    <section className="p-8">
      <Component />
    </section>
  );
}
