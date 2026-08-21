'use server'

import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from './auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ===== Authorization =====

export async function isUserAdmin(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('role, is_blocked')
    .eq('id', userId)
    .single()

  if (error || !data) return false
  return data.role === 'admin' && !data.is_blocked
}

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || !(await isUserAdmin(user.id))) {
    throw new Error('Admin access required')
  }
  return user
}

// ===== Audit Logging =====

async function logAdminAction({
  action,
  entityType,
  entityId,
  entityName,
  oldValues,
  newValues,
  reason,
  adminId,
  ipAddress = '0.0.0.0',
}: {
  action: string
  entityType: string
  entityId?: string
  entityName?: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  reason?: string
  adminId: string
  ipAddress?: string
}) {
  const { error } = await supabase.from('admin_audit_log').insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    entity_name: entityName,
    old_values: oldValues || null,
    new_values: newValues || null,
    reason: reason || null,
    ip_address: ipAddress,
    user_agent: '',
  })

  if (error) {
    console.error('Failed to log admin action:', error)
  }
}

// ===== Dashboard Analytics =====

export async function getAdminDashboardStats() {
  await requireAdmin()

  const { data, error } = await supabase.from('admin_dashboard_stats').select('*').single()

  if (error) {
    return { error: error.message }
  }

  return {
    success: true,
    stats: {
      revenue: {
        totalGMV: data.total_gmv || 0,
        totalFees: data.total_platform_fees || 0,
        completedOrders: data.total_completed_orders || 0,
      },
      users: {
        buyers: data.total_buyers || 0,
        sellers: data.total_sellers || 0,
        blocked: data.blocked_users || 0,
      },
      listings: {
        active: data.active_listings || 0,
        pending: data.pending_listings || 0,
        rejected: data.rejected_listings || 0,
        frozen: data.frozen_listings || 0,
        last24h: data.listings_24h || 0,
      },
      activity24h: {
        orders: data.orders_24h || 0,
        bids: data.bids_24h || 0,
        offers: data.offers_24h || 0,
      },
    },
  }
}

// ===== Listing Management =====

export async function getListingsForReview(status: string = 'pending', limit: number = 50) {
  await requireAdmin()

  const { data, error } = await supabase
    .from('listings')
    .select(
      `
      id, title, description, price, quantity,
      created_at, admin_status, reviewed_at, admin_notes,
      users:seller_id(id, email, full_name),
      categories:category_id(name)
    `
    )
    .eq('admin_status', status)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { error: error.message }
  }

  return { success: true, listings: data }
}

export async function updateListingStatus(
  listingId: string,
  status: 'approved' | 'rejected' | 'frozen',
  reason?: string
) {
  const admin = await requireAdmin()

  // Get current listing
  const { data: listing, error: getError } = await supabase
    .from('listings')
    .select('admin_status, title')
    .eq('id', listingId)
    .single()

  if (getError || !listing) {
    return { error: 'Listing not found' }
  }

  const { error: updateError } = await supabase
    .from('listings')
    .update({
      admin_status: status,
      admin_notes: reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: admin.id,
    })
    .eq('id', listingId)

  if (updateError) {
    return { error: updateError.message }
  }

  // Log action
  await logAdminAction({
    action: `listing_${status}`,
    entityType: 'listing',
    entityId: listingId,
    entityName: listing.title,
    oldValues: { status: listing.admin_status },
    newValues: { status },
    reason,
    adminId: admin.id,
  })

  return { success: true, message: `Listing ${status}` }
}

// ===== User Management =====

export async function getUsersForManagement(limit: number = 50, offset: number = 0) {
  await requireAdmin()

  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, role, is_blocked, risk_score, risk_reason, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return { error: error.message }
  }

  return { success: true, users: data }
}

export async function blockUser(
  userId: string,
  reason: string
) {
  const admin = await requireAdmin()

  // Get user info
  const { data: user, error: getError } = await supabase
    .from('users')
    .select('email, full_name, is_blocked')
    .eq('id', userId)
    .single()

  if (getError || !user) {
    return { error: 'User not found' }
  }

  if (user.is_blocked) {
    return { error: 'User is already blocked' }
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({
      is_blocked: true,
      blocked_at: new Date().toISOString(),
      blocked_reason: reason,
    })
    .eq('id', userId)

  if (updateError) {
    return { error: updateError.message }
  }

  // Log action
  await logAdminAction({
    action: 'user_blocked',
    entityType: 'user',
    entityId: userId,
    entityName: user.full_name || user.email,
    newValues: { is_blocked: true },
    reason,
    adminId: admin.id,
  })

  return { success: true, message: 'User blocked' }
}

export async function unblockUser(userId: string) {
  const admin = await requireAdmin()

  // Get user info
  const { data: user, error: getError } = await supabase
    .from('users')
    .select('email, full_name, is_blocked')
    .eq('id', userId)
    .single()

  if (getError || !user) {
    return { error: 'User not found' }
  }

  if (!user.is_blocked) {
    return { error: 'User is not blocked' }
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({
      is_blocked: false,
      blocked_at: null,
      blocked_reason: null,
    })
    .eq('id', userId)

  if (updateError) {
    return { error: updateError.message }
  }

  // Log action
  await logAdminAction({
    action: 'user_unblocked',
    entityType: 'user',
    entityId: userId,
    entityName: user.full_name || user.email,
    newValues: { is_blocked: false },
    adminId: admin.id,
  })

  return { success: true, message: 'User unblocked' }
}

export async function updateUserRiskScore(
  userId: string,
  riskScore: number,
  reason?: string
) {
  const admin = await requireAdmin()

  if (riskScore < 0 || riskScore > 100) {
    return { error: 'Risk score must be between 0 and 100' }
  }

  // Get user info
  const { data: user, error: getError } = await supabase
    .from('users')
    .select('email, full_name, risk_score')
    .eq('id', userId)
    .single()

  if (getError || !user) {
    return { error: 'User not found' }
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({
      risk_score: riskScore,
      risk_reason: reason,
    })
    .eq('id', userId)

  if (updateError) {
    return { error: updateError.message }
  }

  // Log action
  await logAdminAction({
    action: 'user_risk_updated',
    entityType: 'user',
    entityId: userId,
    entityName: user.full_name || user.email,
    oldValues: { risk_score: user.risk_score },
    newValues: { risk_score: riskScore },
    reason,
    adminId: admin.id,
  })

  return { success: true, message: 'Risk score updated' }
}

// ===== System Settings =====

export async function getSystemSettings() {
  await requireAdmin()

  const { data, error } = await supabase.from('system_settings').select('*').single()

  if (error) {
    return { error: error.message }
  }

  return { success: true, settings: data }
}

export async function updateSystemSettings(
  updates: Record<string, unknown>,
  reason?: string
) {
  const admin = await requireAdmin()

  // Get current settings for audit log
  const { data: currentSettings } = await supabase
    .from('system_settings')
    .select('*')
    .single()

  const { error: updateError } = await supabase
    .from('system_settings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })

  if (updateError) {
    return { error: updateError.message }
  }

  // Log action
  await logAdminAction({
    action: 'settings_updated',
    entityType: 'setting',
    entityName: 'system_settings',
    oldValues: currentSettings || undefined,
    newValues: updates,
    reason,
    adminId: admin.id,
  })

  return { success: true, message: 'Settings updated' }
}

// ===== Audit Log =====

export async function getAuditLog(limit: number = 100, offset: number = 0) {
  await requireAdmin()

  const { data, error } = await supabase
    .from('admin_audit_log')
    .select(
      `
      id, action, entity_type, entity_id, entity_name,
      old_values, new_values, reason, created_at,
      users:admin_id(email, full_name)
    `
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return { error: error.message }
  }

  return { success: true, logs: data }
}

export async function searchAuditLog(
  query: string,
  limit: number = 50
) {
  await requireAdmin()

  const { data, error } = await supabase
    .from('admin_audit_log')
    .select(
      `
      id, action, entity_type, entity_id, entity_name,
      old_values, new_values, reason, created_at,
      users:admin_id(email, full_name)
    `
    )
    .or(
      `action.ilike.%${query}%,entity_name.ilike.%${query}%,entity_type.ilike.%${query}%`
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { error: error.message }
  }

  return { success: true, logs: data }
}
