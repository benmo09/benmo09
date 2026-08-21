'use server'

import { sendEmail } from '@/lib/email'

export async function sendVerificationEmail(
  email: string,
  userName: string,
  verificationToken: string,
  baseUrl: string
) {
  const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`
  const html = `
    <h1>Welcome to Tody! 🎉</h1>
    <p>Hi ${userName},</p>
    <p>Please verify your email address by clicking the link below:</p>
    <a href="${verificationLink}" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
      Verify Email Address
    </a>
    <p>This link will expire in 24 hours.</p>
  `

  return await sendEmail({
    to: email,
    subject: 'Verify Your Tody Email Address',
    html,
  })
}

export async function sendNewSaleEmail(
  sellerEmail: string,
  sellerName: string,
  listingTitle: string,
  buyerName: string,
  price: number,
  quantity: number,
  orderId: string,
  baseUrl: string
) {
  const totalAmount = price * quantity
  const orderLink = `${baseUrl}/seller/orders/${orderId}`
  const orderConfirmTime = new Date().toLocaleString()

  const html = `
    <h1 style="color: #00a86b;">🎉 New Sale!</h1>
    <p>Hi ${sellerName},</p>
    <p>You just made a sale on Tody! Here are the details:</p>
    <h2>${listingTitle}</h2>
    <ul>
      <li><strong>Buyer:</strong> ${buyerName}</li>
      <li><strong>Price per item:</strong> $${(price / 100).toFixed(2)}</li>
      <li><strong>Quantity:</strong> ${quantity}</li>
      <li><strong>Total:</strong> <strong style="color: #00a86b; font-size: 18px;">$${(totalAmount / 100).toFixed(2)}</strong></li>
    </ul>
    <p>Funds will be held in escrow for 24 hours. Once the buyer confirms receipt, the funds will be released to your account within 2-3 business days.</p>
    <a href="${orderLink}" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Order Details</a>
    <p style="color: #999; font-size: 12px;">Order confirmed at: ${orderConfirmTime}</p>
  `

  return await sendEmail({
    to: sellerEmail,
    subject: `🎉 New Sale: ${listingTitle}`,
    html,
  })
}

export async function sendNewOfferEmail(
  sellerEmail: string,
  sellerName: string,
  listingTitle: string,
  buyerName: string,
  offerPrice: number,
  originalPrice: number,
  offerId: string,
  baseUrl: string,
  messagePreview?: string,
  isAuction: boolean = false
) {
  const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
  const actionLink = `${baseUrl}/seller/${isAuction ? 'auctions' : 'offers'}/${offerId}`
  const discount = Math.round(((originalPrice - offerPrice) / originalPrice) * 100)

  const html = `
    <h1 style="color: #ff9500;">${isAuction ? '🏆 New Bid!' : '💰 New Offer!'}</h1>
    <p>Hi ${sellerName},</p>
    <p>${buyerName} just sent you ${isAuction ? 'a bid' : 'an offer'} on "${listingTitle}"!</p>
    <h2>${listingTitle}</h2>
    <ul>
      <li><strong>Original Price:</strong> $${(originalPrice / 100).toFixed(2)}</li>
      <li><strong>${isAuction ? 'Bid' : 'Offer'} Price:</strong> <strong style="color: #00a86b; font-size: 18px;">$${(offerPrice / 100).toFixed(2)}</strong></li>
      <li><strong>Savings:</strong> ${discount}% off ($${((originalPrice - offerPrice) / 100).toFixed(2)})</li>
    </ul>
    ${messagePreview ? `<p><strong>Message from buyer:</strong> "${messagePreview}"</p>` : ''}
    <p style="color: #ff6b00;"><strong>⏰ Expires: ${expiryDate}</strong></p>
    <a href="${actionLink}" style="background-color: #ff9500; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">${isAuction ? 'View Bid' : 'Review Offer'}</a>
  `

  return await sendEmail({
    to: sellerEmail,
    subject: `${isAuction ? '🏆' : '💰'} New ${isAuction ? 'Bid' : 'Offer'}: ${listingTitle}`,
    html,
  })
}

export async function sendAuctionWonEmail(
  buyerEmail: string,
  buyerName: string,
  listingTitle: string,
  winningBid: number,
  sellerName: string,
  auctionId: string,
  baseUrl: string
) {
  const checkoutLink = `${baseUrl}/checkout/${auctionId}`
  const auctionEndedAt = new Date().toLocaleString()

  const html = `
    <h1 style="color: #ffd700;">🏆 Congratulations! You Won!</h1>
    <p>Hi ${buyerName},</p>
    <p>You're the highest bidder! Congratulations on winning this auction. 🎉</p>
    <h2>${listingTitle}</h2>
    <ul>
      <li><strong>Seller:</strong> ${sellerName}</li>
      <li><strong>Your winning bid:</strong> <strong style="color: #ffd700; font-size: 20px;">$${(winningBid / 100).toFixed(2)}</strong></li>
    </ul>
    <a href="${checkoutLink}" style="background-color: #ffd700; color: black; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Complete Purchase</a>
    <p style="color: #999; font-size: 12px;">Auction ended at: ${auctionEndedAt}</p>
  `

  return await sendEmail({
    to: buyerEmail,
    subject: `🏆 You Won! ${listingTitle}`,
    html,
  })
}

export async function sendPriceDropEmail(
  buyerEmail: string,
  buyerName: string,
  listingTitle: string,
  currentPrice: number,
  previousPrice: number,
  targetPrice: number,
  timeRemaining: string,
  listingId: string,
  baseUrl: string
) {
  const savings = previousPrice - currentPrice
  const savingsPercent = Math.round((savings / previousPrice) * 100)
  const listingLink = `${baseUrl}/product/${listingId}`

  const html = `
    <h1 style="color: #e74c3c;">📉 Price Drop Alert!</h1>
    <p>Hi ${buyerName},</p>
    <p>The price for "${listingTitle}" just dropped! ⚡ It's getting closer to your target price.</p>
    <h2>${listingTitle}</h2>
    <ul>
      <li><strong>Previous Price:</strong> <span style="text-decoration: line-through; color: #999;">$${(previousPrice / 100).toFixed(2)}</span></li>
      <li><strong>Current Price:</strong> <strong style="color: #e74c3c; font-size: 18px;">$${(currentPrice / 100).toFixed(2)}</strong></li>
      <li><strong>You save:</strong> $${(savings / 100).toFixed(2)} (${savingsPercent}% off!)</li>
      <li><strong>Target Price:</strong> <span style="color: #00a86b;">$${(targetPrice / 100).toFixed(2)}</span></li>
    </ul>
    <a href="${listingLink}" style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Listing</a>
    <p style="color: #999; font-size: 12px;">⏰ Hurry! This Tody Drop ends in ${timeRemaining}. Price may drop further, but stock is limited!</p>
  `

  return await sendEmail({
    to: buyerEmail,
    subject: `📉 Price Drop Alert: ${listingTitle}`,
    html,
  })
}
