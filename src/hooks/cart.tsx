import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const response = await AsyncStorage.getItem('@GoMarketplace:products');
      if (response) {
        setProducts(JSON.parse(response));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    id => {
      const listOfProducts = products.map(product => {
        if (product.id === id) {
          const newerProduct = { ...product, quantity: product?.quantity + 1 };
          return newerProduct;
        }
        return product;
      });

      AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(listOfProducts),
      );
      setProducts(listOfProducts);
    },
    [products],
  );

  const decrement = useCallback(
    id => {
      const listOfProducts = products.map(product => {
        if (product.id === id) {
          const newerProduct = { ...product, quantity: product?.quantity - 1 };
          return newerProduct;
        }
        return product;
      });

      AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(listOfProducts),
      );
      setProducts(listOfProducts);
    },
    [products],
  );

  const addToCart = useCallback(
    product => {
      const productExists = products.find(element => element.id === product.id);

      if (productExists) {
        increment(productExists.id);
        return;
      }

      const newProduct: Product = {
        ...product,
        quantity: 1,
      };

      if (products) {
        const updatedProducts = [...products, newProduct];
        AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(updatedProducts),
        );
        setProducts(updatedProducts);
        return;
      }

      AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify([newProduct]),
      );
      setProducts([newProduct]);
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
