'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}

function CheckoutContent() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Create payment intent
      const { clientSecret } = await api.createPaymentIntent(items);

      // Mock payment confirmation (in real app, use Stripe.js)
      const mockPaymentIntentId = 'pi_test_' + Math.random().toString(36).slice(2);

      // Confirm order
      const order = await api.confirmOrder(mockPaymentIntentId);

      // Clear cart
      clearCart();

      // Redirect to confirmation
      router.push(`/orders/confirmation?orderId=${order.id}`);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Checkout</h1>
        <p style={styles.emptyText}>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Checkout</h1>
      <div style={styles.checkoutContainer}>
        <div style={styles.leftSection}>
          <h2 style={styles.sectionTitle}>Order Summary</h2>
          <div style={styles.items}>
            {items.map((item) => (
              <div key={item.productId} style={styles.item}>
                <div style={styles.itemInfo}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <p style={styles.itemDetails}>
                    ${item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <p style={styles.itemTotal}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Total:</span>
            <span style={styles.totalAmount}>${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div style={styles.rightSection}>
          <h2 style={styles.sectionTitle}>Payment Information</h2>
          <p style={styles.testNote}>
            📝 Test Mode: Use card <strong>4242 4242 4242 4242</strong>
          </p>
          {error && <p style={styles.error}>{error}</p>}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label htmlFor="cardNumber" style={styles.label}>
                Card Number
              </label>
              <input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.row}>
              <div style={styles.field}>
                <label htmlFor="expiry" style={styles.label}>
                  Expiry (MM/YY)
                </label>
                <input
                  id="expiry"
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="12/25"
                  maxLength={5}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label htmlFor="cvc" style={styles.label}>
                  CVC
                </label>
                <input
                  id="cvc"
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="123"
                  maxLength={4}
                  required
                  style={styles.input}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
            </button>
          </form>
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
  emptyText: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#888',
    marginTop: '3rem',
  },
  checkoutContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  leftSection: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '2rem',
  },
  rightSection: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    color: '#fff',
  },
  testNote: {
    backgroundColor: '#2a2a2a',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1.5rem',
    color: '#ccc',
    fontSize: '0.9rem',
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1rem',
    borderBottom: '1px solid #333',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  itemDetails: {
    fontSize: '0.9rem',
    color: '#888',
  },
  itemTotal: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#3498db',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '1.5rem',
    borderTop: '2px solid #444',
  },
  totalLabel: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  totalAmount: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#27ae60',
  },
  error: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    color: '#ccc',
    fontWeight: '600',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
  },
  button: {
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    padding: '1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600',
    marginTop: '0.5rem',
  },
};
