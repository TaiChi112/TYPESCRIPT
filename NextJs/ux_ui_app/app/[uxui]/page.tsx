import UXUILoader from '@/components/uxui_loader';

export default async function UXUIPage({ params }: { params: { uxui: string } }) {
  const awaitedParams = await params;
  return <UXUILoader uxuiName={awaitedParams.uxui} />;
}
