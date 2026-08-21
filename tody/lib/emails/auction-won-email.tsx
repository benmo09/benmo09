import React from 'react'

export interface AuctionWonEmailProps {
  buyerName: string
  listingTitle: string
  winningBid: number
  sellerName: string
  checkoutLink: string
  auctionEndedAt: string
}

export default function AuctionWonEmail({
  buyerName,
  listingTitle,
  winningBid,
  sellerName,
  checkoutLink,
  auctionEndedAt,
}: AuctionWonEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', maxWidth: '600px' }}>
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
        <h1 style={{ color: '#ffd700', marginBottom: '20px' }}>🏆 Congratulations! You Won!</h1>

        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
          Hi {buyerName},
        </p>

        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
          You're the highest bidder! Congratulations on winning this auction. 🎉
        </p>

        <div
          style={{
            backgroundColor: '#fff',
            border: '2px solid #ffd700',
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
                  <strong>Seller:</strong>
                </td>
                <td style={{ padding: '10px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  {sellerName}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px 0' }}>
                  <strong>Your winning bid:</strong>
                </td>
                <td
                  style={{
                    padding: '10px 0',
                    textAlign: 'right',
                    fontSize: '20px',
                    color: '#ffd700',
                  }}
                >
                  <strong>${winningBid.toFixed(2)}</strong>
                </td>
              </tr>
            </tbody>
          </table>

          <p style={{ fontSize: '13px', color: '#666', margin: '15px 0 0 0' }}>
            Auction ended at: {auctionEndedAt}
          </p>
        </div>

        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a
            href={checkoutLink}
            style={{
              backgroundColor: '#ffd700',
              color: '#000',
              padding: '12px 30px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'inline-block',
            }}
          >
            Complete Purchase
          </a>
        </div>

        <div
          style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '6px',
            padding: '15px',
            marginTop: '20px',
          }}
        >
          <p style={{ fontSize: '14px', margin: '0 0 10px 0' }}>
            <strong>What's next?</strong>
          </p>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '13px' }}>
            <li>Complete payment checkout within 24 hours</li>
            <li>Your payment will be held in escrow</li>
            <li>Once you receive the item, confirm receipt to release payment to the seller</li>
            <li>You'll receive your payout notification within 2-3 business days</li>
          </ul>
        </div>

        <p style={{ fontSize: '13px', color: '#999', marginTop: '20px' }}>
          If you have any questions about your auction win, please contact our support team.
        </p>
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
