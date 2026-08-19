const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Cloud Function to update prices every minute
 * Runs every minute and decreases prices for active auctions
 */
exports.updateAuctionPrices = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  try {
    const db = admin.database();
    const auctionsRef = db.ref('auctions');

    const snapshot = await auctionsRef.once('value');
    const auctions = snapshot.val();

    if (!auctions) {
      console.log('No auctions found');
      return;
    }

    const now = Date.now();
    const updates = {};

    // Update each auction
    for (const [auctionId, auction] of Object.entries(auctions)) {
      // Check if auction is still active
      if (auction.endTime > now) {
        // Calculate new price
        const minutesElapsed = (now - auction.startTime) / (1000 * 60);
        const priceDropped = minutesElapsed * auction.priceDropPerMinute;
        const newPrice = Math.max(
          auction.minPrice,
          auction.originalPrice - priceDropped
        );

        updates[`auctions/${auctionId}/currentPrice`] = newPrice;
      } else {
        // Mark auction as ended
        updates[`auctions/${auctionId}/status`] = 'ended';
      }
    }

    // Apply all updates at once
    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
      console.log(`Updated ${Object.keys(updates).length} auction prices`);
    }
  } catch (error) {
    console.error('Error updating auction prices:', error);
    throw error;
  }
});

/**
 * Process purchase transaction
 * Called when a buyer completes a purchase
 */
exports.processPurchase = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { auctionId, sellerId, price } = data;
  const buyerId = context.auth.uid;

  try {
    const db = admin.database();

    // Create transaction record
    const transactionId = db.ref('transactions').push().key;
    const timestamp = Date.now();

    // Calculate commission (15% for platform, 85% for seller)
    const platformCommission = price * 0.15;
    const sellerAmount = price * 0.85;

    // Write transaction
    const updates = {
      // Transaction record
      [`transactions/${transactionId}`]: {
        id: transactionId,
        auctionId,
        buyerId,
        sellerId,
        price,
        platformCommission,
        sellerAmount,
        timestamp,
        status: 'completed',
      },

      // Update buyer's purchase history
      [`users/${buyerId}/purchases/${transactionId}`]: {
        auctionId,
        price,
        timestamp,
      },

      // Update seller's earnings
      [`users/${sellerId}/earnings/total`]: admin.database.ServerValue.increment(sellerAmount),
      [`users/${sellerId}/earnings/pending`]: admin.database.ServerValue.increment(sellerAmount),
      [`users/${sellerId}/sales/${transactionId}`]: {
        auctionId,
        price,
        sellerAmount,
        timestamp,
      },

      // Update platform earnings
      [`analytics/totalEarnings`]: admin.database.ServerValue.increment(platformCommission),
      [`analytics/totalSales`]: admin.database.ServerValue.increment(1),

      // Mark auction as sold
      [`auctions/${auctionId}`]: {
        status: 'sold',
        soldTo: buyerId,
        soldPrice: price,
        soldAt: timestamp,
      },
    };

    await db.ref().update(updates);

    return {
      success: true,
      transactionId,
      message: 'Purchase processed successfully',
    };
  } catch (error) {
    console.error('Error processing purchase:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Process withdrawal request from seller
 * Transfers earnings to seller's bank account via Stripe
 */
exports.processWithdrawal = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { amount, withdrawalMethod } = data;
  const sellerId = context.auth.uid;

  try {
    const db = admin.database();

    // Get seller's pending earnings
    const sellerRef = db.ref(`users/${sellerId}`);
    const sellerSnapshot = await sellerRef.once('value');
    const seller = sellerSnapshot.val();

    if (!seller || !seller.earnings || seller.earnings.pending < amount) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Insufficient pending earnings'
      );
    }

    // Create withdrawal record
    const withdrawalId = db.ref('withdrawals').push().key;
    const timestamp = Date.now();

    const updates = {
      // Withdrawal record
      [`withdrawals/${withdrawalId}`]: {
        id: withdrawalId,
        sellerId,
        amount,
        method: withdrawalMethod,
        status: 'pending',
        createdAt: timestamp,
      },

      // Update seller's pending earnings
      [`users/${sellerId}/earnings/pending`]: admin.database.ServerValue.increment(-amount),
      [`users/${sellerId}/earnings/processed`]: admin.database.ServerValue.increment(amount),
    };

    await db.ref().update(updates);

    return {
      success: true,
      withdrawalId,
      message: 'Withdrawal request submitted',
    };
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Create new auction listing
 */
exports.createAuction = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const {
    productName,
    emoji,
    originalPrice,
    minPrice,
    priceDropPerMinute,
    durationHours,
    category,
    description,
  } = data;

  try {
    const db = admin.database();
    const sellerId = context.auth.uid;

    const auctionId = db.ref('auctions').push().key;
    const startTime = Date.now();
    const endTime = startTime + durationHours * 60 * 60 * 1000;

    await db.ref(`auctions/${auctionId}`).set({
      id: auctionId,
      productName,
      emoji,
      originalPrice,
      currentPrice: originalPrice,
      minPrice,
      priceDropPerMinute,
      startTime,
      endTime,
      category,
      description,
      sellerId,
      status: 'active',
      createdAt: startTime,
    });

    return {
      success: true,
      auctionId,
      message: 'Auction created successfully',
    };
  } catch (error) {
    console.error('Error creating auction:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
