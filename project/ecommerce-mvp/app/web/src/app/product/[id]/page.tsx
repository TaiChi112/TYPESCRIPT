export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Product Detail</h1>
      <p>Product ID: {params.id}</p>
      <p>Product detail page placeholder</p>
    </div>
  );
}
