import React from 'react'

export interface PriceDropEmailProps {
  buyerName: string
  listingTitle: string
  currentPrice: number
  previousPrice: number
  targetPrice: number
  timeRemaining: string
  listingLink: string
  savingsPercent: number
}

export default function PriceDropEmail({
  buyerName,
  listingTitle,
  currentPrice,
  previousPrice,
  targetPrice,
  timeRemaining,
  listingLink,
  savingsPercent,
}: PriceDropEmailProps) {
  const savings = previousPrice - currentPrice

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', maxWidth: '600px' }}>
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
        <h1 style={{ color: '#e74c3c', marginBottom: '20px' }}>📉 Price Drop Alert!</h1>

        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
          Hi {buyerName},
        </p>

        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
          The price for "{listingTitle}" just dropped! ⚡ It's getting closer to your target price.
        </p>

        <div
          style={{
            backgroundColor: '#fff',
            border: '2px solid #e74c3c',
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
                  <strong>Previous Price:</strong>
                </td>
                <td
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid #eee',
                    textAlign: 'right',
                    textDecoration: 'line-through',
                    color: '#999',
                  }}
                >
                  ${previousPrice.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <strong>Current Price:</strong>
                </td>
                <td
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid #eee',
                    textAlign: 'right',
                    fontSize: '18px',
                    color: '#e74c3c',
                  }}
                >
                  <strong>${currentPrice.toFixed(2)}</strong>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <strong>You save:</strong>
                </td>
                <td style={{ padding: '10px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  ${savings.toFixed(2)} ({savingsPercent}% off!)
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px 0' }}>
                  <strong>Target Price:</strong>
                </td>
                <td style={{ padding: '10px 0', textAlign: 'right', color: '#00a86b' }}>
                  ${targetPrice.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              width: '100%',
              backgroundColor: '#eee',
              borderRadius: '8px',
              height: '8px',
              marginBottom: '10px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                backgroundColor: '#e74c3c',
                height: '8px',
                width: `${((previousPrice - currentPrice) / (previousPrice - targetPrice)) * 100}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          <p style={{ fontSize: '12px', color: '#666', margin: '10px 0 0 0' }}>
            Price progress: {Math.round(((previousPrice - currentPrice) / (previousPrice - targetPrice)) * 100)}%
            to your target
          </p>
        </div>

        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a
            href={listingLink}
            style={{
              backgroundColor: '#e74c3c',
              color: '#fff',
              padding: '12px 30px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'inline-block',
            }}
          >
            View Listing
          </a>
        </div>

        <div
          style={{
            backgroundColor: '#e8f5e9',
            border: '1px solid #4caf50',
            borderRadius: '6px',
            padding: '15px',
            marginTop: '20px',
          }}
        >
          <p style={{ fontSize: '14px', margin: 0 }}>
            ⏰ <strong>Hurry!</strong> This Tody Drop ends in {timeRemaining}. Price may drop further,
            but stock is limited!
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
