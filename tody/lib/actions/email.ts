'use server'

import { sendEmail } from '@/lib/email'
import { render } from 'react-email'
import VerificationEmail from '@/lib/emails/verification-email'
import NewSaleEmail from '@/lib/emails/new-sale-email'
import NewOfferEmail from '@/lib/emails/new-offer-email'
import AuctionWonEmail from '@/lib/emails/auction-won-email'
import PriceDropEmail from '@/lib/emails/price-drop-email'

export async function sendVerificationEmail(
  email: string,
  userName: string,
  verificationToken: string,
  baseUrl: string
) {
  const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`
  const html = render(
    VerificationEmail({
      userName,
      verificationLink,
      expiresIn: '24 hours',
    })
  )

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
  const platformFee = totalAmount * 0.05
  const orderLink = `${baseUrl}/seller/orders/${orderId}`
  const orderConfirmTime = new Date().toLocaleString()

  const html = render(
    NewSaleEmail({
      sellerName,
      listingTitle,
      buyerName,
      price,
      quantity,
      totalAmount,
      orderLink,
      orderConfirmTime,
    })
  )

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

  const html = render(
    NewOfferEmail({
      sellerName,
      listingTitle,
      buyerName,
      offerPrice,
      originalPrice,
      offerType: isAuction ? 'bid' : 'offer',
      messagePreview,
      actionLink,
      expiresAt: expiryDate,
    })
  )

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

  const html = render(
    AuctionWonEmail({
      buyerName,
      listingTitle,
      winningBid,
      sellerName,
      checkoutLink,
      auctionEndedAt,
    })
  )

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

  const html = render(
    PriceDropEmail({
      buyerName,
      listingTitle,
      currentPrice,
      previousPrice,
      targetPrice,
      timeRemaining,
      listingLink,
      savingsPercent,
    })
  )

  return await sendEmail({
    to: buyerEmail,
    subject: `📉 Price Drop Alert: ${listingTitle}`,
    html,
  })
}
