'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Shopping Cart</h1>
        <div style={styles.empty}>
          <p style={styles.emptyText}>Your cart is empty</p>
          <Link href="/products" style={styles.link}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Shopping Cart</h1>
      <div style={styles.cartContainer}>
        <div style={styles.items}>
          {items.map((item) => (
            <div key={item.productId} style={styles.item}>
              <div style={styles.itemInfo}>
                <h3 style={styles.itemName}>{item.name}</h3>
                <p style={styles.itemPrice}>${item.price.toFixed(2)}</p>
              </div>
              <div style={styles.itemActions}>
                <div style={styles.quantityControl}>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    style={styles.quantityButton}
                  >
                    -
                  </button>
                  <span style={styles.quantity}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    style={styles.quantityButton}
                  >
                    +
                  </button>
                </div>
                <p style={styles.itemTotal}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(item.productId)}
                  style={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={styles.summary}>
          <h2 style={styles.summaryTitle}>Order Summary</h2>
          <div style={styles.summaryRow}>
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div style={styles.summaryRow}>
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Total</span>
            <span style={styles.totalAmount}>${totalPrice.toFixed(2)}</span>
          </div>
          <Link href="/checkout" style={styles.checkoutButton}>
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    color: '#fff',
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 1rem',
  },
  emptyText: {
    fontSize: '1.2rem',
    color: '#888',
    marginBottom: '2rem',
  },
  link: {
    display: 'inline-block',
    backgroundColor: '#3498db',
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  cartContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  item: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  itemInfo: {
    flex: '1 1 200px',
  },
  itemName: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.5rem',
  },
  itemPrice: {
    fontSize: '1rem',
    color: '#888',
  },
  itemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#2a2a2a',
    borderRadius: '4px',
    padding: '0.25rem',
  },
  quantityButton: {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    width: '30px',
    height: '30px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  quantity: {
    padding: '0 0.75rem',
    fontSize: '1rem',
    color: '#fff',
  },
  itemTotal: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#3498db',
    minWidth: '80px',
    textAlign: 'right',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  summary: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '2rem',
    height: 'fit-content',
  },
  summaryTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    color: '#fff',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    color: '#ccc',
    fontSize: '1rem',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #333',
  },
  totalLabel: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  totalAmount: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#3498db',
  },
  checkoutButton: {
    display: 'block',
    width: '100%',
    backgroundColor: '#27ae60',
    color: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    textAlign: 'center',
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontWeight: '600',
    marginTop: '1.5rem',
  },
};
