import { functions } from 'firebase/app';
import { httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

/**
 * Process a purchase transaction
 */
export async function processPurchase(
  auctionId: string,
  sellerId: string,
  price: number
) {
  try {
    const app = getApp();
    const processPurchaseFn = httpsCallable(
      app.functions() as any,
      'processPurchase'
    );

    const result = await processPurchaseFn({
      auctionId,
      sellerId,
      price,
    });

    return result.data;
  } catch (error) {
    console.error('Error processing purchase:', error);
    throw error;
  }
}

/**
 * Create new auction
 */
export async function createAuction(
  productName: string,
  emoji: string,
  originalPrice: number,
  minPrice: number,
  priceDropPerMinute: number,
  durationHours: number,
  category: string,
  description?: string
) {
  try {
    const app = getApp();
    const createAuctionFn = httpsCallable(
      app.functions() as any,
      'createAuction'
    );

    const result = await createAuctionFn({
      productName,
      emoji,
      originalPrice,
      minPrice,
      priceDropPerMinute,
      durationHours,
      category,
      description,
    });

    return result.data;
  } catch (error) {
    console.error('Error creating auction:', error);
    throw error;
  }
}

/**
 * Process seller withdrawal
 */
export async function processWithdrawal(
  amount: number,
  withdrawalMethod: string
) {
  try {
    const app = getApp();
    const processWithdrawalFn = httpsCallable(
      app.functions() as any,
      'processWithdrawal'
    );

    const result = await processWithdrawalFn({
      amount,
      withdrawalMethod,
    });

    return result.data;
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    throw error;
  }
}

/**
 * Calculate commission
 */
export function calculateCommission(price: number) {
  return {
    platformCommission: price * 0.15,
    sellerAmount: price * 0.85,
  };
}

/**
 * Format price in Hebrew
 */
export function formatPrice(price: number): string {
  return `₪${price.toLocaleString('he-IL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'הסתיים';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}
