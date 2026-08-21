# Tody Deal Map - Complete Guide

Tody's Deal Map is an interactive geospatial visualization platform that displays all nearby deals on an interactive map with real-time filtering, deal score visualization, and quick-view capabilities.

## System Overview

```
Deal Map Flow:
1. User navigates to /marketplace/map
2. Browser requests geolocation permission
3. Map loads centered on user location
4. All active listings within radius displayed as pins
5. Pins colored by Deal Score (1-100)
6. Price and deal score visible on each pin
7. Click pin to open quick card
8. Quick card shows full details and Buy Now button
9. Adjust radius slider to see more/fewer deals
```

## Architecture

### Components

**components/TodyMap.tsx** - Leaflet map wrapper
```typescript
- Uses Leaflet (open-source map library)
- Renders OSM (OpenStreetMap) tiles
- Customizable user location marker (blue dot)
- Colored pins based on deal score
- Click handler for pin selection
- Dynamic marker updates
```

**components/MapListingCard.tsx** - Quick view card
```typescript
- Slides up from bottom when pin clicked
- Shows deal score badge with color
- Displays price, quantity, sale type
- Quick "View Details" link
- Close button
- Mobile-friendly design
```

**app/marketplace/map/page.tsx** - Main map page
```typescript
- Geolocation permission handling
- Radius control (5-100km)
- Live listing count
- Price range stats
- Deal score distribution
- Loading states
```

### Backend

**lib/actions/map.ts** - Server actions
```typescript
getListingsForMap()
- Get all active listings within radius
- Filter by location and admin status
- Calculate deal scores for each
- Sort by score (highest first)
- Return with seller info

getListingsInBounds()
- Get listings in map viewport bounds
- Useful for dynamic map updates
- Used when panning/zooming
```

### Dependencies

- **leaflet** ^1.9.4 - Map library (OSM provider)
- **react-leaflet** ^4.2.1 - React bindings (currently using direct Leaflet)

## Features

### 1. Geolocation-Based Display

Automatically detects user location and centers map.

```typescript
// Auto-requests permission
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    position => {
      setUserLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      })
    },
    () => {
      // Fallback to NYC (40.7128, -74.006)
      setUserLocation({ lat: 40.7128, lon: -74.006 })
    }
  )
}
```

**Permissions:**
- Browser requests location permission first time
- User can allow/deny
- Fallback location if denied

### 2. Interactive Map

**Leaflet Map with OpenStreetMap**
- Tile-based rendering
- Smooth panning and zooming
- Click handlers on markers
- Responsive to viewport changes

**Map Layers:**
- Base layer: OpenStreetMap tiles
- Marker layer: User location + listings
- Popup layer: Quick view card

### 3. Colored Pins by Deal Score

**Color Scheme:**
```
80-100: Red (#ef4444) - Excellent
60-79:  Orange (#f97316) - Very Good
40-59:  Yellow (#eab308) - Good
20-39:  Lime (#84cc16) - Fair
0-19:   Green (#22c55e) - Below Average
```

**Pin Design:**
- SVG pin shape with deal score inside
- Price label below pin
- Hover effect (cursor changes to pointer)
- Click opens quick card

### 4. Radius Control

Adjust visible radius from 5km to 100km.

```typescript
<input
  type="range"
  min="5"
  max="100"
  value={radiusKm}
  onChange={e => setRadiusKm(parseInt(e.target.value))}
/>
```

**Behavior:**
- Slider updates immediately
- Listings re-fetched on radius change
- Listing count updates
- Stats (avg score, price range) recalculate

### 5. Quick View Card

Opens when pin clicked, slides up from bottom.

**Displays:**
- Deal Score badge with color
- Listing title
- Price (large, green text)
- Available quantity
- Sale type badge (Buy Now, Auction, etc)
- "View Details" button (links to product page)
- Close button

**Mobile-Optimized:**
- Full width on small screens
- Swipe down to close
- Touch-friendly buttons

### 6. Map Statistics

Real-time stats update as radius changes.

**Shown:**
- Current radius
- Number of listings
- Average deal score
- Min/max price range

## API Reference

### Server Actions

```typescript
getListingsForMap(
  userLatitude: number,
  userLongitude: number,
  radiusKm: number = 50,
  limit: number = 100
): Promise<{
  success?: boolean,
  listings?: MapListingResult[],
  error?: string
}>
```

**Returns:**
```typescript
MapListingResult[] {
  id: string
  title: string
  price: number
  quantity: number
  latitude: number
  longitude: number
  deal_score: number
  sale_type: string
  created_at: string
  users: {
    full_name: string
    rating: number
  }
}
```

**Example:**
```typescript
const result = await getListingsForMap(
  40.7128,  // User latitude (NYC)
  -74.006,  // User longitude
  50,       // 50km radius
  150       // Max 150 listings
)

if (result.success) {
  listings.forEach(l => {
    console.log(l.title, l.deal_score, l.price)
  })
}
```

### Map Component

```typescript
<TodyMap
  listings={listings}                    // Array of listings
  onListingSelect={setSelectedListing}   // Click handler
  userLatitude={40.7128}                 // Map center lat
  userLongitude={-74.006}                // Map center lon
  zoom={12}                              // Initial zoom level
/>
```

### Card Component

```typescript
<MapListingCard
  listing={selectedListing}              // Selected listing
  onClose={() => setSelectedListing(null)} // Close handler
/>
```

## Workflow Examples

### View Map Centered on Location

1. User clicks "Map" in navigation
2. Browser requests permission for location
3. User allows (or denies for fallback)
4. Map loads with 50km default radius
5. All deals visible as colored pins

### Find Best Deals in Area

1. Open map at current location
2. See deal score colors: Red = best (80-100)
3. Adjust radius to search wider/narrower
4. Click on red pins (excellent deals)
5. View details and buy

### Search Specific Area

1. Center map on desired location (pan/zoom)
2. See listings update dynamically
3. Adjust radius based on area size
4. Stats show avg price and deal quality

### Compare Multiple Deals

1. Click pin A to view card
2. Close card (Escape or button)
3. Click pin B nearby
4. Compare prices and deal scores
5. Link to details for deeper comparison

## Performance Optimization

### Database Queries

**Indexed Columns:**
```sql
-- Fast location queries
CREATE INDEX idx_listings_location 
  ON listings(latitude, longitude);

CREATE INDEX idx_listings_status 
  ON listings(status, admin_status);

CREATE INDEX idx_listings_created 
  ON listings(created_at);
```

**Query Strategy:**
- Fetch all listings once
- Filter by radius in application
- Calculate deal scores client-side
- Sort by score for ranking

**Caching Opportunities:**
- Cache listings for 5 minutes
- Re-fetch when radius changes significantly
- Cache deal score calculations

### Frontend Optimization

**Dynamic Import:**
```typescript
const TodyMap = dynamic(() => import('@/components/TodyMap'), {
  loading: () => <div>Loading map...</div>,
  ssr: false,  // No server-side rendering (Leaflet uses DOM)
})
```

**Reasons:**
- Leaflet requires browser APIs (DOM, Canvas)
- Can't render on server
- Dynamic import reduces bundle size
- Loading state shown while hydrating

**Marker Management:**
```typescript
// Store markers in Map to avoid re-creates
markersRef.current.forEach(marker => marker.remove())
markersRef.current.clear()

listings.forEach(listing => {
  const marker = L.marker([lat, lon], { icon })
  markersRef.current.set(listing.id, marker)
})
```

## Database Schema

**listings table (required columns):**
```sql
- latitude: DECIMAL (nullable, default NULL)
- longitude: DECIMAL (nullable, default NULL)
- admin_status: TEXT ('approved' required for display)
- status: TEXT ('active' required for display)
- price: INT
- quantity: INT
- sale_type: TEXT
- created_at: TIMESTAMP
```

**Ensure geolocation data:**
```sql
-- Set coordinates during listing creation
INSERT INTO listings (
  latitude, longitude, ...
) VALUES (
  40.7128, -74.006, ...
)
```

## Configuration

### Map Settings

**Default Map Center:**
```typescript
const DEFAULT_LAT = 40.7128   // NYC latitude
const DEFAULT_LON = -74.006   // NYC longitude
```

**Zoom Levels:**
```typescript
zoom: 12  // City/neighborhood level
// 10 = larger area
// 15 = street level
```

**Radius Limits:**
```typescript
min="5"    // 5km minimum
max="100"  // 100km maximum
```

**Listing Limits:**
```typescript
limit={150}  // Max 150 listings per query
```

## Troubleshooting

### "Map is not loading"

**Problem:** Leaflet or React-Leaflet not installed
**Fix:**
```bash
npm install leaflet react-leaflet
```

### "Geolocation permission denied"

**Problem:** User clicked deny
**Fix:**
- Map falls back to NYC coordinates
- User can manually pan/zoom
- Show message: "Allow location for better results"

### "Pins not showing"

**Problem:** No coordinates in database
**Fix:**
```sql
-- Add coordinates to listings
UPDATE listings SET latitude = 40.7128, longitude = -74.006
WHERE latitude IS NULL OR longitude IS NULL;
```

### "Deal scores seem wrong"

**Problem:** Calculation doesn't match expected
**Fix:**
- Check calculateDealScore() in lib/utils/dealScore.ts
- Verify time component (days since listing)
- Check distance calculation (Haversine formula)

### "Map tiles not loading"

**Problem:** OpenStreetMap unavailable
**Fix:**
- Check internet connection
- OpenStreetMap sometimes has slow servers
- Can switch to alternative tile provider:
```typescript
L.tileLayer('https://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png')
```

## Future Enhancements

1. **Heat Map** - Density visualization of deals by area
2. **Clustering** - Group nearby pins at zoom out
3. **Filters** - Price range, category, sale type
4. **Favorites** - Save favorite locations
5. **Alerts** - Notify when deal appears near saved location
6. **Route Planning** - Directions to seller
7. **Real-time Updates** - WebSocket new listings
8. **Satellite View** - Switch map styles
9. **Offline Maps** - Cache tiles for offline viewing
10. **AR Mode** - View deals in camera AR view

## Security & Privacy

✅ **Geolocation:**
- Browser controls permission
- User can disable anytime
- Can't be forced
- Optional feature

✅ **Seller Privacy:**
- Never show exact address
- Only approximate location
- Can't reverse-geocode to street

✅ **Map Data:**
- Public listings only
- Admin-approved content
- User radius filters applied

## Code Examples

### Adding Map Link to Navbar

```typescript
<Link href="/marketplace/map" className="flex items-center gap-2">
  🗺️ Deal Map
</Link>
```

### Customizing Pin Color

```typescript
const getMarkerColor = (dealScore: number) => {
  if (dealScore >= 80) return '#ef4444'  // Red
  if (dealScore >= 60) return '#f97316'  // Orange
  if (dealScore >= 40) return '#eab308'  // Yellow
  if (dealScore >= 20) return '#84cc16'  // Lime
  return '#22c55e'                        // Green
}
```

### Fetching Listings in Custom Radius

```typescript
const { getListingsForMap } = require('@/lib/actions/map')

const result = await getListingsForMap(
  userLatitude,
  userLongitude,
  radiusKm,
  maxListings
)
```

---

Tody's Deal Map brings geographic discovery to the marketplace! 🗺️📍✨
