'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const router = useRouter();

  useEffect(() => {
    if (!orderId) {
      router.push('/products');
    }
  }, [orderId, router]);

  if (!orderId) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.icon}>✓</div>
        <h1 style={styles.title}>Order Confirmed!</h1>
        <p style={styles.message}>
          Thank you for your purchase. Your order has been successfully placed.
        </p>
        <p style={styles.orderId}>
          Order ID: <strong>{orderId}</strong>
        </p>
        <div style={styles.actions}>
          <Link href="/products" style={styles.primaryButton}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: 'calc(100vh - 80px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem 1rem',
  },
  content: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '3rem',
    maxWidth: '500px',
    textAlign: 'center',
  },
  icon: {
    width: '80px',
    height: '80px',
    backgroundColor: '#27ae60',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '3rem',
    color: '#fff',
    margin: '0 auto 2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#fff',
  },
  message: {
    fontSize: '1.1rem',
    color: '#ccc',
    marginBottom: '1.5rem',
    lineHeight: '1.6',
  },
  orderId: {
    fontSize: '1rem',
    color: '#888',
    marginBottom: '2rem',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  primaryButton: {
    display: 'inline-block',
    backgroundColor: '#3498db',
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontWeight: '600',
  },
};
