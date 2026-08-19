import { useEffect, useState } from 'react';
import { ref, onValue, query, orderByChild, limitToFirst } from 'firebase/database';
import { database } from '../config/firebase';

export interface Auction {
  id: string;
  productName: string;
  emoji: string;
  originalPrice: number;
  currentPrice: number;
  minPrice: number;
  priceDropPerMinute: number;
  startTime: number; // timestamp
  endTime: number; // timestamp (24 hours later)
  timeRemaining: number; // in seconds
  category: string;
  description?: string;
  sellerId?: string;
  sellerName?: string;
}

export const useAuctions = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Reference to auctions in database
      const auctionsRef = ref(database, 'auctions');
      const auctionsQuery = query(auctionsRef, limitToFirst(20));

      const unsubscribe = onValue(
        auctionsQuery,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const auctionsList: Auction[] = Object.entries(data).map(([id, auction]: any) => ({
              id,
              ...auction,
            }));
            setAuctions(auctionsList);
          } else {
            setAuctions([]);
          }
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
          // Fallback to mock data if no database
          setAuctions(getMockAuctions());
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load auctions';
      setError(message);
      setAuctions(getMockAuctions());
      setLoading(false);
    }
  }, []);

  // Update countdown timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setAuctions((prevAuctions) =>
        prevAuctions.map((auction) => {
          const now = Date.now();
          const timeRemaining = Math.max(0, auction.endTime - now);

          // Calculate current price based on elapsed time
          const totalTime = auction.endTime - auction.startTime;
          const elapsedTime = totalTime - timeRemaining;
          const minutesElapsed = elapsedTime / (1000 * 60);
          const priceDropped = minutesElapsed * auction.priceDropPerMinute;
          const currentPrice = Math.max(auction.minPrice, auction.originalPrice - priceDropped);

          return {
            ...auction,
            timeRemaining: Math.floor(timeRemaining / 1000), // convert to seconds
            currentPrice,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { auctions, loading, error };
};

// Mock data for development
function getMockAuctions(): Auction[] {
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  return [
    {
      id: '1',
      productName: 'iPhone 15 Pro',
      emoji: '📱',
      originalPrice: 5000,
      currentPrice: 3500,
      minPrice: 2500,
      priceDropPerMinute: 1,
      startTime: now - 10 * 60 * 1000, // started 10 minutes ago
      endTime: now + (24 * 60 - 10) * 60 * 1000, // 24 hours from start
      timeRemaining: (24 * 60 - 10) * 60,
      category: 'Electronics',
      description: 'Latest Apple iPhone 15 Pro Max',
      sellerId: 'seller1',
      sellerName: 'Tech Store',
    },
    {
      id: '2',
      productName: 'Sony Headphones',
      emoji: '🎧',
      originalPrice: 1500,
      currentPrice: 900,
      minPrice: 600,
      priceDropPerMinute: 0.5,
      startTime: now - 5 * 60 * 1000,
      endTime: now + (24 * 60 - 5) * 60 * 1000,
      timeRemaining: (24 * 60 - 5) * 60,
      category: 'Electronics',
      description: 'Premium noise cancelling headphones',
      sellerId: 'seller2',
      sellerName: 'Audio Pro',
    },
    {
      id: '3',
      productName: 'MacBook Pro',
      emoji: '💻',
      originalPrice: 12000,
      currentPrice: 8500,
      minPrice: 6000,
      priceDropPerMinute: 2.5,
      startTime: now - 20 * 60 * 1000,
      endTime: now + (24 * 60 - 20) * 60 * 1000,
      timeRemaining: (24 * 60 - 20) * 60,
      category: 'Electronics',
      description: '16-inch MacBook Pro with M3 Max',
      sellerId: 'seller1',
      sellerName: 'Tech Store',
    },
    {
      id: '4',
      productName: 'iPad Air',
      emoji: '🖥️',
      originalPrice: 4000,
      currentPrice: 2800,
      minPrice: 2000,
      priceDropPerMinute: 0.8,
      startTime: now - 15 * 60 * 1000,
      endTime: now + (24 * 60 - 15) * 60 * 1000,
      timeRemaining: (24 * 60 - 15) * 60,
      category: 'Electronics',
      description: 'iPad Air with WiFi and cellular',
      sellerId: 'seller3',
      sellerName: 'Gadget Zone',
    },
  ];
}
