import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>Welcome to Our Store</h1>
        <p style={styles.subtitle}>
          Discover amazing products at great prices
        </p>
        <Link href="/products" style={styles.ctaButton}>
          Browse Products
        </Link>
      </section>

      <section style={styles.features}>
        <div style={styles.feature}>
          <h3 style={styles.featureTitle}>🚀 Fast Delivery</h3>
          <p style={styles.featureText}>
            Get your products delivered quickly and safely
          </p>
        </div>
        <div style={styles.feature}>
          <h3 style={styles.featureTitle}>💳 Secure Payment</h3>
          <p style={styles.featureText}>
            Test mode payments powered by Stripe
          </p>
        </div>
        <div style={styles.feature}>
          <h3 style={styles.featureTitle}>✨ Quality Products</h3>
          <p style={styles.featureText}>
            Carefully curated selection of items
          </p>
        </div>
      </section>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  hero: {
    textAlign: 'center',
    padding: '4rem 1rem',
    marginBottom: '3rem',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#fff',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#888',
    marginBottom: '2rem',
  },
  ctaButton: {
    display: 'inline-block',
    backgroundColor: '#3498db',
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    padding: '2rem 0',
  },
  feature: {
    backgroundColor: '#1a1a1a',
    padding: '2rem',
    borderRadius: '8px',
    border: '1px solid #333',
    textAlign: 'center',
  },
  featureTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#fff',
  },
  featureText: {
    color: '#888',
    lineHeight: '1.6',
  },
};
