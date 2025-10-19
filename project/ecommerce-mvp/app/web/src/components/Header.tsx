'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const { user, signout } = useAuth();
  const { totalItems } = useCart();

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link href="/" style={styles.logo}>
          E-Commerce MVP
        </Link>

        <nav style={styles.nav}>
          <Link href="/products" style={styles.link}>
            Products
          </Link>
          <Link href="/cart" style={styles.cartLink}>
            Cart {totalItems > 0 && <span style={styles.badge}>{totalItems}</span>}
          </Link>
          {user ? (
            <>
              <span style={styles.email}>{user.email}</span>
              <button onClick={signout} style={styles.button}>
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth/signin" style={styles.link}>
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    backgroundColor: '#1a1a1a',
    borderBottom: '1px solid #333',
    padding: '1rem 0',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#fff',
    textDecoration: 'none',
  },
  nav: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  link: {
    color: '#ccc',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  cartLink: {
    color: '#ccc',
    textDecoration: 'none',
    position: 'relative',
    transition: 'color 0.2s',
  },
  badge: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    borderRadius: '50%',
    padding: '0.2rem 0.5rem',
    fontSize: '0.75rem',
    marginLeft: '0.5rem',
  },
  email: {
    color: '#888',
    fontSize: '0.9rem',
  },
  button: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
};
