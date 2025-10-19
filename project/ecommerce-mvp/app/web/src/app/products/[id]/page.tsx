'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api
      .getProduct(productId)
      .then((data) => {
        setProduct(data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product.id, product.name, product.price, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.message}>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={styles.container}>
        <p style={styles.error}>Error: {error || 'Product not found'}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.productContainer}>
        <div style={styles.imageContainer}>
          <img
            src={product.imageUrl || '/placeholder-product.jpg'}
            alt={product.name}
            style={styles.image}
          />
        </div>
        <div style={styles.details}>
          <h1 style={styles.name}>{product.name}</h1>
          <p style={styles.price}>${product.price.toFixed(2)}</p>
          <p style={styles.description}>{product.description}</p>
          <p style={styles.stock}>
            {product.stock > 0
              ? `${product.stock} in stock`
              : 'Out of stock'}
          </p>

          {product.stock > 0 && (
            <div style={styles.actions}>
              <div style={styles.quantityControl}>
                <label htmlFor="quantity" style={styles.label}>
                  Quantity:
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  style={styles.input}
                />
              </div>
              <button onClick={handleAddToCart} style={styles.button}>
                {added ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
            </div>
          )}
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
  productContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '3rem',
  },
  imageContainer: {
    width: '100%',
    height: '400px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #333',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  name: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  price: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#3498db',
  },
  description: {
    fontSize: '1.1rem',
    color: '#ccc',
    lineHeight: '1.6',
  },
  stock: {
    fontSize: '1rem',
    color: '#888',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1rem',
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  label: {
    fontSize: '1rem',
    color: '#ccc',
  },
  input: {
    width: '80px',
    padding: '0.5rem',
    fontSize: '1rem',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '4px',
  },
  button: {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600',
    transition: 'opacity 0.2s',
  },
  message: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#888',
    marginTop: '3rem',
  },
  error: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#e74c3c',
    marginTop: '3rem',
  },
};
