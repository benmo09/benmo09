import React from 'react'

export interface NewSaleEmailProps {
  sellerName: string
  listingTitle: string
  buyerName: string
  price: number
  quantity: number
  totalAmount: number
  orderLink: string
  orderConfirmTime: string
}

export default function NewSaleEmail({
  sellerName,
  listingTitle,
  buyerName,
  price,
  quantity,
  totalAmount,
  orderLink,
  orderConfirmTime,
}: NewSaleEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', maxWidth: '600px' }}>
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
        <h1 style={{ color: '#00a86b', marginBottom: '20px' }}>🎉 New Sale!</h1>

        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
          Great news, {sellerName}!
        </p>

        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
          You just made a sale on Tody! Here are the details:
        </p>

        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '6px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#000' }}>{listingTitle}</h3>

          <table style={{ width: '100%', marginBottom: '20px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <strong>Buyer:</strong>
                </td>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  {buyerName}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <strong>Price per item:</strong>
                </td>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  ${price.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <strong>Quantity:</strong>
                </td>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  {quantity}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}>
                  <strong>Total:</strong>
                </td>
                <td style={{ padding: '8px 0', textAlign: 'right', fontSize: '18px', color: '#00a86b' }}>
                  <strong>${totalAmount.toFixed(2)}</strong>
                </td>
              </tr>
            </tbody>
          </table>

          <p style={{ fontSize: '13px', color: '#666', margin: '15px 0 0 0' }}>
            Funds will be held in escrow for 24 hours. Once the buyer confirms receipt, the funds
            will be released to your account within 2-3 business days.
          </p>
        </div>

        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a
            href={orderLink}
            style={{
              backgroundColor: '#0066cc',
              color: '#fff',
              padding: '12px 30px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'inline-block',
            }}
          >
            View Order Details
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
          <p style={{ fontSize: '14px', margin: '0' }}>
            <strong>Next Steps:</strong> Make sure to prepare your item for shipment. The buyer will
            confirm receipt, which releases payment to you.
          </p>
        </div>

        <p style={{ fontSize: '13px', color: '#999', marginTop: '20px' }}>
          Order confirmed at: {orderConfirmTime}
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
