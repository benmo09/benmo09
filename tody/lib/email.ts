import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const SENDER_EMAIL = 'noreply@tody.app'
export const SUPPORT_EMAIL = 'support@tody.app'

export async function sendEmail({
  to,
  subject,
  html,
  replyTo = SUPPORT_EMAIL,
}: {
  to: string
  subject: string
  html: string
  replyTo?: string
}) {
  try {
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to,
      subject,
      html,
      reply_to: replyTo,
    })

    if (data.error) {
      console.error('Resend error:', data.error)
      return { success: false, error: data.error.message }
    }

    return { success: true, messageId: data.data?.id }
  } catch (error) {
    console.error('Email send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}

export interface EmailRecipient {
  email: string
  name: string
}

export interface OrderDetails {
  orderId: string
  listingTitle: string
  price: number
  quantity: number
  buyerName: string
  sellerName: string
}

export interface AuctionDetails {
  auctionId: string
  listingTitle: string
  winningBid: number
  winnerName: string
  sellerName: string
}

export interface OfferDetails {
  offerId: string
  listingTitle: string
  offerPrice: number
  offerFrom: string
  offerMessage?: string
}
