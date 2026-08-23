'use server'

import { supabase } from '@/lib/supabase'
import type { Stay, StayBooking } from '@/lib/types'

// Create a stay listing
export async function createStay(
  hostId: string,
  title: string,
  description: string,
  category: string,
  address: string,
  lat: number,
  lng: number,
  pricePerNight: number,
  bedrooms: number,
  bathrooms: number,
  maxGuests: number,
  amenities: string[],
  rules: string[],
  images: string[]
): Promise<{ success: boolean; stay?: Stay; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('stays')
      .insert({
        host_id: hostId,
        title,
        description,
        category,
        address,
        lat,
        lng,
        price_per_night: pricePerNight,
        bedrooms,
        bathrooms,
        max_guests: maxGuests,
        amenities,
        rules,
        images,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, stay: data as Stay }
  } catch (error) {
    console.error('Error creating stay:', error)
    return { success: false, error: 'Failed to create stay listing' }
  }
}

// Get stay details
export async function getStayDetails(
  stayId: string
): Promise<{ success: boolean; stay?: Stay & { host: any }; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('stays')
      .select(`
        *,
        host:users!host_id(id, full_name, avatar_url, rating, verified_at)
      `)
      .eq('id', stayId)
      .single()

    if (error) throw error

    return {
      success: true,
      stay: {
        ...data,
        host: data.host?.[0] || null,
      },
    }
  } catch (error) {
    console.error('Error fetching stay details:', error)
    return { success: false, error: 'Failed to fetch stay details' }
  }
}

// Search stays by location and dates
export async function searchStays(
  lat: number,
  lng: number,
  radiusKm = 50,
  checkInDate: string,
  checkOutDate: string,
  guests: number,
  priceMin?: number,
  priceMax?: number
): Promise<{ success: boolean; stays?: (Stay & { distance: number })[]; error?: string }> {
  try {
    // Convert to PostgreSQL point format for distance calculation
    // For now, use a simple bounding box approach
    const latDelta = radiusKm / 111
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180))

    let query = supabase
      .from('stays')
      .select('*')
      .eq('status', 'active')
      .gte('max_guests', guests)
      .gte('lat', lat - latDelta)
      .lte('lat', lat + latDelta)
      .gte('lng', lng - lngDelta)
      .lte('lng', lng + lngDelta)

    if (priceMin !== undefined) {
      query = query.gte('price_per_night', priceMin)
    }
    if (priceMax !== undefined) {
      query = query.lte('price_per_night', priceMax)
    }

    const { data: stays, error } = await query

    if (error) throw error

    // Filter by availability (no overlapping bookings)
    const { data: bookings } = await supabase
      .from('stay_bookings')
      .select('stay_id')
      .in(
        'stay_id',
        (stays || []).map((s: any) => s.id)
      )
      .eq('status', 'confirmed')
      .lte('check_in_date', checkOutDate)
      .gte('check_out_date', checkInDate)

    const bookedStayIds = (bookings || []).map((b: any) => b.stay_id)
    const availableStays = (stays || []).filter((s: any) => !bookedStayIds.includes(s.id))

    // Calculate distance from search center
    const staysWithDistance = availableStays.map((stay: any) => ({
      ...stay,
      distance: calculateDistance(lat, lng, stay.lat, stay.lng),
    }))

    return { success: true, stays: staysWithDistance }
  } catch (error) {
    console.error('Error searching stays:', error)
    return { success: false, error: 'Failed to search stays' }
  }
}

// Book a stay
export async function bookStay(
  stayId: string,
  guestId: string,
  checkInDate: string,
  checkOutDate: string,
  numberOfGuests: number,
  totalPrice: number
): Promise<{ success: boolean; booking?: StayBooking; error?: string }> {
  try {
    // Verify stay exists and is available
    const { data: stay } = await supabase
      .from('stays')
      .select('id, price_per_night, max_guests')
      .eq('id', stayId)
      .single()

    if (!stay) {
      return { success: false, error: 'Stay not found' }
    }

    if (numberOfGuests > stay.max_guests) {
      return { success: false, error: 'Too many guests for this property' }
    }

    // Check for conflicting bookings
    const { data: conflictingBookings } = await supabase
      .from('stay_bookings')
      .select('id')
      .eq('stay_id', stayId)
      .eq('status', 'confirmed')
      .lte('check_in_date', checkOutDate)
      .gte('check_out_date', checkInDate)

    if ((conflictingBookings || []).length > 0) {
      return { success: false, error: 'Stay is not available for these dates' }
    }

    // Create booking
    const { data: booking, error } = await supabase
      .from('stay_bookings')
      .insert({
        stay_id: stayId,
        guest_id: guestId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        number_of_guests: numberOfGuests,
        total_price: totalPrice,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, booking: booking as StayBooking }
  } catch (error) {
    console.error('Error booking stay:', error)
    return { success: false, error: 'Failed to book stay' }
  }
}

// Confirm a booking
export async function confirmBooking(
  bookingId: string,
  paymentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('stay_bookings')
      .update({
        status: 'confirmed',
      })
      .eq('id', bookingId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error confirming booking:', error)
    return { success: false, error: 'Failed to confirm booking' }
  }
}

// Cancel a booking
export async function cancelBooking(
  bookingId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('stay_bookings')
      .update({
        status: 'cancelled',
      })
      .eq('id', bookingId)

    if (error) throw error

    // TODO: Process refund based on cancellation policy

    return { success: true }
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return { success: false, error: 'Failed to cancel booking' }
  }
}

// Get host's stays
export async function getHostStays(hostId: string): Promise<{ success: boolean; stays?: Stay[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('stays')
      .select('*')
      .eq('host_id', hostId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, stays: data as Stay[] }
  } catch (error) {
    console.error('Error fetching host stays:', error)
    return { success: false, error: 'Failed to fetch stays' }
  }
}

// Get guest bookings
export async function getGuestBookings(guestId: string): Promise<{ success: boolean; bookings?: StayBooking[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('stay_bookings')
      .select('*')
      .eq('guest_id', guestId)
      .order('check_in_date', { ascending: false })

    if (error) throw error

    return { success: true, bookings: data as StayBooking[] }
  } catch (error) {
    console.error('Error fetching guest bookings:', error)
    return { success: false, error: 'Failed to fetch bookings' }
  }
}

// Update stay listing
export async function updateStay(
  stayId: string,
  hostId: string,
  updates: Partial<Stay>
): Promise<{ success: boolean; stay?: Stay; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('stays')
      .update(updates)
      .eq('id', stayId)
      .eq('host_id', hostId)
      .select()
      .single()

    if (error) throw error

    return { success: true, stay: data as Stay }
  } catch (error) {
    console.error('Error updating stay:', error)
    return { success: false, error: 'Failed to update stay' }
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
