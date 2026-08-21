import React from 'react'

export interface NewOfferEmailProps {
  sellerName: string
  listingTitle: string
  buyerName: string
  offerPrice: number
  originalPrice: number
  offerType: 'offer' | 'bid'
  messagePreview?: string
  actionLink: string
  expiresAt: string
}

export default function NewOfferEmail({
  sellerName,
  listingTitle,
  buyerName,
  offerPrice,
  originalPrice,
  offerType,
  messagePreview,
  actionLink,
  expiresAt,
}: NewOfferEmailProps) {
  const discount = Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
  const isOffer = offerType === 'offer'

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', maxWidth: '600px' }}>
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
        <h1 style={{ color: '#ff9500', marginBottom: '20px' }}>
          {isOffer ? '💰 New Offer!' : '🏆 New Bid!'}
        </h1>

        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
          Hi {sellerName},
        </p>

        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
          {buyerName} just sent you {isOffer ? 'an offer' : 'a bid'} on "{listingTitle}"!
        </p>

        <div
          style={{
            backgroundColor: '#fff',
            border: '2px solid #ff9500',
            borderRadius: '6px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#000' }}>{listingTitle}</h3>

          <table style={{ width: '100%', marginBottom: '20px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <strong>Original Price:</strong>
                </td>
                <td style={{ padding: '10px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  ${originalPrice.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <strong>{isOffer ? 'Offer' : 'Bid'} Price:</strong>
                </td>
                <td
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid #eee',
                    textAlign: 'right',
                    fontSize: '18px',
                    color: '#00a86b',
                  }}
                >
                  <strong>${offerPrice.toFixed(2)}</strong>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px 0' }}>
                  <strong>Savings:</strong>
                </td>
                <td style={{ padding: '10px 0', textAlign: 'right', color: '#00a86b' }}>
                  {discount}% off (${(originalPrice - offerPrice).toFixed(2)})
                </td>
              </tr>
            </tbody>
          </table>

          {messagePreview && (
            <div
              style={{
                backgroundColor: '#f0f0f0',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '15px',
              }}
            >
              <p style={{ fontSize: '13px', color: '#666', margin: '0 0 8px 0' }}>
                <strong>Message from buyer:</strong>
              </p>
              <p style={{ fontSize: '14px', color: '#333', margin: 0, fontStyle: 'italic' }}>
                "{messagePreview}"
              </p>
            </div>
          )}

          <p style={{ fontSize: '13px', color: '#ff6b00', margin: '15px 0 0 0' }}>
            <strong>⏰ Expires: {expiresAt}</strong>
          </p>
        </div>

        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a
            href={actionLink}
            style={{
              backgroundColor: '#ff9500',
              color: '#fff',
              padding: '12px 30px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'inline-block',
            }}
          >
            {isOffer ? 'Review Offer' : 'View Bid'}
          </a>
        </div>

        <p style={{ fontSize: '14px', color: '#666', marginTop: '20px', textAlign: 'center' }}>
          Accept it, reject it, or make a counter-offer.
        </p>

        <div
          style={{
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '6px',
            padding: '15px',
            marginTop: '20px',
          }}
        >
          <p style={{ fontSize: '13px', margin: 0 }}>
            💡 <strong>Tip:</strong> Respond quickly to keep the buyer engaged. {isOffer ? 'Offers' : 'Bids'} expire
            after 7 days if not accepted.
          </p>
        </div>
      </div>

      <footer
        style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#999',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #eee',
        }}
      >
        <p>© 2026 Tody. All rights reserved.</p>
      </footer>
    </div>
  )
}
