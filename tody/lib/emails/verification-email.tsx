import React from 'react'

export interface VerificationEmailProps {
  userName: string
  verificationLink: string
  expiresIn: string
}

export default function VerificationEmail({
  userName,
  verificationLink,
  expiresIn = '24 hours',
}: VerificationEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', maxWidth: '600px' }}>
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
        <h1 style={{ color: '#000', marginBottom: '20px' }}>Welcome to Tody! 🎉</h1>

        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
          Hi {userName},
        </p>

        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
          Thank you for signing up! To complete your registration and verify your email address,
          please click the button below.
        </p>

        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a
            href={verificationLink}
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
            Verify Email Address
          </a>
        </div>

        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          Or copy and paste this link in your browser:
        </p>
        <p
          style={{
            fontSize: '12px',
            color: '#0066cc',
            wordBreak: 'break-all',
            backgroundColor: '#f0f0f0',
            padding: '10px',
            borderRadius: '4px',
          }}
        >
          {verificationLink}
        </p>

        <p style={{ fontSize: '14px', color: '#999', marginTop: '30px' }}>
          This link will expire in {expiresIn}. If you didn't sign up for Tody, you can safely
          ignore this email.
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
        <p>
          <a href="https://tody.app" style={{ color: '#0066cc', textDecoration: 'none' }}>
            Visit Tody
          </a>
          {' | '}
          <a href="https://tody.app/support" style={{ color: '#0066cc', textDecoration: 'none' }}>
            Support
          </a>
        </p>
      </footer>
    </div>
  )
}
