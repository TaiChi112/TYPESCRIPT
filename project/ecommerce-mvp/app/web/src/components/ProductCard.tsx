import Link from 'next/link';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div style={styles.card}>
      <Link href={`/products/${product.id}`} style={styles.link}>
        <div style={styles.imageContainer}>
          <img
            src={product.imageUrl || '/placeholder-product.jpg'}
            alt={product.name}
            style={styles.image}
          />
        </div>
        <div style={styles.info}>
          <h3 style={styles.name}>{product.name}</h3>
          <p style={styles.price}>${product.price.toFixed(2)}</p>
          <p style={styles.stock}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
        </div>
      </Link>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #333',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
  imageContainer: {
    width: '100%',
    height: '200px',
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  info: {
    padding: '1rem',
  },
  name: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#fff',
  },
  price: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: '0.5rem',
  },
  stock: {
    fontSize: '0.9rem',
    color: '#888',
  },
};
