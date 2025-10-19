import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome to E-Commerce MVP</h1>
      <p>Landing page placeholder</p>
      <nav style={{ marginTop: '2rem' }}>
        <Link href="/catalog" style={{ marginRight: '1rem' }}>
          Browse Catalog
        </Link>
        <Link href="/cart" style={{ marginRight: '1rem' }}>
          View Cart
        </Link>
        <Link href="/auth/sign-in">Sign In</Link>
      </nav>
    </div>
  );
}
