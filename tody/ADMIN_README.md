# Tody Admin System - Complete Guide

Tody's administration platform provides comprehensive tools for monitoring marketplace health, managing content, users, and system configuration without requiring code changes.

## System Overview

```
Admin Panel (/admin):
1. Dashboard → Key metrics (GMV, fees, users, activity)
2. Listings → Approve/reject/freeze listings with audit
3. Users → Block users, update risk scores
4. Settings → Dynamic configuration (fees, features, limits)
5. Logs → Complete audit trail of all admin actions
```

## Architecture

### Authorization & Middleware

**middleware.ts** - Protects all `/admin` routes
- Verifies user authentication
- Checks admin role
- Rejects blocked admins
- Redirects unauthorized users to home

**lib/actions/admin.ts** - Server actions with role checks
- All functions call `requireAdmin()`
- Prevents unauthorized access server-side
- Logs all admin actions automatically

### Database Schema

**users table**
```sql
- role: 'user' | 'seller' | 'admin'
- is_blocked: BOOLEAN
- risk_score: INT (0-100)
- risk_reason: TEXT
- blocked_at: TIMESTAMP
- blocked_reason: TEXT
```

**listings table**
```sql
- admin_status: 'pending' | 'approved' | 'rejected' | 'frozen'
- admin_notes: TEXT
- reviewed_at: TIMESTAMP
- reviewed_by: UUID (admin user)
```

**system_settings table** - Dynamic configuration
```sql
- platform_fee_percentage: DECIMAL
- enable_auctions, enable_offers, enable_tody_drop: BOOLEAN
- minimum/maximum_transaction_amount: INT
- require_listing_approval: BOOLEAN
- maintenance_mode: BOOLEAN
```

**admin_audit_log table** - Complete action history
```sql
- admin_id: UUID
- action: TEXT
- entity_type: TEXT
- entity_id: UUID
- old_values, new_values: JSONB
- reason: TEXT
- created_at: TIMESTAMP
```

## Admin Pages

### 1. Dashboard (/admin)

**Key Metrics:**
- **Revenue**
  - Gross Merchandise Volume (GMV): Total value of all completed orders
  - Tody Fees Collected: Platform fees from completed orders
  - Completed Orders: Total number of finished transactions

- **Users**
  - Active Buyers: Total users with role 'user'
  - Active Sellers: Total users with role 'seller'
  - Blocked Users: Users currently blocked from platform

- **Listings**
  - Active: Approved and live listings
  - Pending: Awaiting admin review
  - Rejected: Rejected by moderation
  - Frozen: Frozen by admin
  - Added (24h): New listings in last 24 hours

- **Activity (24h)**
  - Orders: New orders placed
  - Bids: New auction bids
  - Offers: New offers made

### 2. Listing Management (/admin/listings)

**Features:**
- View listings by status (pending, approved, rejected, frozen)
- See seller info, price, quantity, creation date
- Actions:
  - **Approve** - List goes live immediately
  - **Reject** - List is removed with auto-notification
  - **Freeze** - Prevent sales but keep visible
- Audit logged for each action

**Use Cases:**
- Review new listings for policy violations
- Remove prohibited content
- Suspend listings during disputes
- Track all moderation decisions

### 3. User Management (/admin/users)

**User Status Indicators:**
- Role badge (user/seller/admin)
- Blocked status (if applicable)
- Risk score (0-100)

**Actions:**
- **Risk Score Update**
  - Set score 0-100
  - Add reason for change
  - Logged with old/new values
- **Block User**
  - Prevents login
  - Stops all marketplace activity
  - Requires reason
- **Unblock User**
  - Restores access
  - Clears block timestamp

**Risk Score Usage:**
- 0-30: Low risk (normal user)
- 31-70: Medium risk (watch account)
- 71-100: High risk (consider blocking)

Examples:
- Multiple disputes: +20-30
- Chargebacks: +40-50
- Fraud indicators: +50-75
- Repeated violations: +30-50

### 4. System Settings (/admin/settings)

**Dynamic Configuration (no code changes required):**

**Platform Fee**
- Percentage (e.g., 5%)
- Minimum fee in cents
- Affects all future transactions

**Features** (enable/disable)
- Auctions
- Offers
- Tody Drop
- Messaging

**Transaction Limits**
- Minimum transaction: cents
- Maximum transaction: cents
- Prevent edge case orders

**Moderation**
- Require admin approval for new listings
- Auto-moderate with spam detection

**Maintenance Mode**
- Take platform offline temporarily
- Display custom message to users
- All pages show maintenance notice

### 5. Audit Logs (/admin/logs)

**Complete Action History:**
- Who: Admin name and email
- What: Action performed
- When: Exact timestamp
- Why: Reason provided
- Changes: Old and new values (JSON)

**Search Functionality:**
- By action (e.g., "listing_approved")
- By entity type (e.g., "user", "listing")
- By entity name (user email, listing title)

**Expandable Details:**
- Full reason text
- Previous values in JSON
- New values in JSON
- Compare changes side-by-side

## API Reference

### Authorization

```typescript
isUserAdmin(userId: string): Promise<boolean>
- Check if user is admin and not blocked
```

### Dashboard Analytics

```typescript
getAdminDashboardStats(): Promise<{
  revenue: { totalGMV, totalFees, completedOrders }
  users: { buyers, sellers, blocked }
  listings: { active, pending, rejected, frozen, last24h }
  activity24h: { orders, bids, offers }
}>
```

### Listing Management

```typescript
getListingsForReview(status: string, limit: number): Promise<Listing[]>
- Get listings by status: 'pending' | 'approved' | 'rejected' | 'frozen'

updateListingStatus(
  listingId: string,
  status: 'approved' | 'rejected' | 'frozen',
  reason?: string
): Promise<{ success: boolean }>
```

### User Management

```typescript
getUsersForManagement(limit: number, offset: number): Promise<User[]>

blockUser(userId: string, reason: string): Promise<{ success: boolean }>

unblockUser(userId: string): Promise<{ success: boolean }>

updateUserRiskScore(
  userId: string,
  riskScore: number,
  reason?: string
): Promise<{ success: boolean }>
```

### System Settings

```typescript
getSystemSettings(): Promise<SystemSettings>

updateSystemSettings(
  updates: Record<string, unknown>,
  reason?: string
): Promise<{ success: boolean }>
```

### Audit Log

```typescript
getAuditLog(limit: number, offset: number): Promise<AuditLogEntry[]>

searchAuditLog(query: string, limit: number): Promise<AuditLogEntry[]>
```

## Making an Admin User

To grant admin access to a user:

```sql
-- Method 1: Via SQL
UPDATE users SET role = 'admin' WHERE id = 'user-uuid';

-- Method 2: Via server action (in backend)
const { error } = await supabase
  .from('users')
  .update({ role: 'admin' })
  .eq('id', userId)
```

Or create a seeding script:

```typescript
// Create admin user
const { data, error } = await supabase.auth.admin.createUser({
  email: 'admin@tody.app',
  password: 'secure-password',
  email_confirm: true,
})

// Set role to admin
if (data.user) {
  await supabase
    .from('users')
    .insert({
      id: data.user.id,
      email: data.user.email,
      full_name: 'Tody Admin',
      role: 'admin',
    })
}
```

## Workflow Examples

### Moderating a Listing

1. Go to /admin/listings
2. Review "Pending" listings
3. Read title, description, seller info
4. Click **Approve** if legitimate
5. Click **Reject** if violates policy
6. Action logged automatically

### Blocking a Suspicious User

1. Go to /admin/users
2. Find user in list
3. Click **Risk Score** to review previous actions
4. Optionally update risk score
5. Click **Block** and enter reason
6. User blocked from login/marketplace
7. All actions logged in audit trail

### Updating Platform Fee

1. Go to /admin/settings
2. Change "Platform Fee Percentage" (e.g., 5% → 6%)
3. Click **Save Settings**
4. New fee applies to all future orders
5. Change logged with reason
6. Previous value preserved in audit log

### Investigating a Dispute

1. Go to /admin/logs
2. Search for user email or order ID
3. See all actions related to this user
4. Review risk score history
5. Check blocked users list
6. Make evidence-based decision

## Security & Audit

**All admin actions are logged:**
- ✅ Who performed the action
- ✅ What entity was affected
- ✅ When it happened (exact timestamp)
- ✅ Why (reason text)
- ✅ Old and new values (for changes)

**Cannot be tampered with:**
- Server-side authorization checks
- Immutable audit log (never deleted)
- Middleware protects all routes
- Each action requires admin role

**Compliance:**
- SOC 2 audit trail ready
- PCI-DSS compliant actions
- GDPR-ready data handling
- Clear evidence for disputes

## Best Practices

✅ **DO:**
- Always provide reason for blocking users
- Review audit logs regularly
- Use risk scores proactively
- Test setting changes carefully
- Keep maintenance mode brief

❌ **DON'T:**
- Block users without documentation
- Change fees too frequently
- Leave maintenance mode enabled
- Share admin credentials
- Delete audit logs
- Approve suspicious listings without review

## Troubleshooting

### "Admin access required" error

**Problem:** User is not admin
**Fix:**
1. Check user role in database: `SELECT role FROM users WHERE id = 'user-id'`
2. Update if needed: `UPDATE users SET role = 'admin' WHERE id = 'user-id'`
3. User must log out and log back in

### Audit log showing wrong data

**Problem:** Old values are null
**Fix:** This is expected for newly created entities (no previous values)

### Setting changes not taking effect

**Problem:** Cached values
**Fix:**
1. Restart application server
2. Clear browser cache
3. Verify setting actually changed in database

### Cannot block admin user

**Problem:** Admins can block other admins
**Fix:** Only super-admin should have access (implement in future)

## Future Enhancements

1. **Role-based access** - Different permission levels (moderator, support, analyst)
2. **Bulk actions** - Approve/reject multiple listings at once
3. **Reporting** - CSV export of audit logs, revenue reports
4. **Alerts** - Notifications for high-risk events
5. **Automation** - Rules-based listing approval, user blocking
6. **Analytics** - Charts, trends, patterns
7. **Two-factor authentication** - Extra security for admins
8. **Activity log filters** - By date range, admin, action type
9. **User appeals** - Handle blocked user disputes
10. **Seller ratings** - Admin can adjust seller scores

---

Tody's admin system keeps the marketplace safe, fair, and functioning smoothly! 🛡️✨
