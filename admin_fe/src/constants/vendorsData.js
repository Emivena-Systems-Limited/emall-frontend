import { GHANA_REGIONS } from './adminDashboardData'

export { GHANA_REGIONS }

export const VENDOR_STATUSES = [
  {
    key: 'approved',
    label: 'Active',
    shortLabel: 'Active',
    hint: 'Live and selling on EZ-Mall',
    badgeClass: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    icon: 'check-circle',
  },
  {
    key: 'pending',
    label: 'Pending review',
    shortLabel: 'Pending',
    hint: 'Waiting on operator approval',
    badgeClass: 'bg-amber-50 text-amber-800 ring-amber-200',
    icon: 'clock',
  },
  {
    key: 'rejected',
    label: 'Reject',
    shortLabel: 'Reject',
    hint: 'Application declined',
    badgeClass: 'bg-slate-100 text-slate-700 ring-slate-200',
    icon: 'x-circle',
  },
  {
    key: 'suspended',
    label: 'Suspended',
    shortLabel: 'Suspended',
    hint: 'Storefront paused',
    badgeClass: 'bg-rose-50 text-rose-800 ring-rose-200',
    icon: 'ban',
  },
]

export const VENDOR_KYC = [
  { key: 'verified', label: 'Verified', badgeClass: 'bg-emerald-50 text-emerald-800 ring-emerald-200', icon: 'badge-check' },
  { key: 'pending', label: 'Pending', badgeClass: 'bg-amber-50 text-amber-800 ring-amber-200', icon: 'clock' },
  { key: 'expired', label: 'Expired', badgeClass: 'bg-rose-50 text-rose-800 ring-rose-200', icon: 'alert' },
]

export const VENDOR_CATEGORIES = [
  'Fashion & apparel',
  'Home & living',
  'Beauty & wellness',
  'Food & grocery',
]

export const JOINED_PRESETS = [
  { key: 'any', label: 'Any time' },
  { key: '30', label: 'Last 30 days' },
  { key: '90', label: 'Last 90 days' },
  { key: 'year', label: 'This year' },
]

export const SALES_BANDS = [
  { key: 'any', label: 'Any sales' },
  { key: 'under_50k', label: 'Under GH₵50k' },
  { key: '50_200', label: 'GH₵50k – 200k' },
  { key: 'over_200', label: 'GH₵200k+' },
]

export const VENDOR_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'listings_desc', label: 'Most listings' },
  { value: 'name', label: 'A to Z' },
]

export const VENDOR_STATUS_TABS = [
  { key: 'all', label: 'All', statuses: [] },
  { key: 'pending', label: 'Pending review', statuses: ['pending'] },
  { key: 'approved', label: 'Active', statuses: ['approved'] },
  { key: 'rejected', label: 'Reject', statuses: ['rejected'] },
  { key: 'suspended', label: 'Suspended', statuses: ['suspended'] },
]

export const DEFAULT_VENDOR_FILTERS = {
  query: '',
  statuses: [],
  kyc: [],
  regions: [],
  joined: 'any',
  salesBand: 'any',
  sort: 'newest',
}

export const VENDOR_PAGE_SIZE = 8

export const ADMIN_VENDORS = [
  {
    id: 'vnd_kente_house',
    store: 'Kente House',
    owner: 'Ama Boateng',
    email: 'carlos.r@example.net',
    phone: '233244111001',
    region: 'Greater Accra',
    status: 'active',
    kyc: 'verified',
    listings: 86,
    sales30d: 214400,
    orders30d: 142,
    rating: 4.8,
    joinedAt: '2024-03-12T09:00:00+00:00',
    category: 'Fashion & apparel',
    payoutHold: false,
    note: 'Flagship Accra storefront. Ceremonial textiles lead 30-day sales.',
  },
  {
    id: 'vnd_accra_atelier',
    store: 'Accra Atelier',
    owner: 'Kojo Addo',
    email: 'aaron.s@example.org',
    phone: '233244111002',
    region: 'Greater Accra',
    status: 'active',
    kyc: 'verified',
    listings: 54,
    sales30d: 128200,
    orders30d: 91,
    rating: 4.6,
    joinedAt: '2024-06-18T10:20:00+00:00',
    category: 'Fashion & apparel',
    payoutHold: false,
    note: 'Ready-to-wear studio. Strong repeat rate from East Legon shoppers.',
  },
  {
    id: 'vnd_kumasi_crafts',
    store: 'Kumasi Crafts',
    owner: 'Akosua Mensah',
    email: 'alice.j@example.com',
    phone: '233244111003',
    region: 'Ashanti',
    status: 'active',
    kyc: 'verified',
    listings: 72,
    sales30d: 97800,
    orders30d: 88,
    rating: 4.7,
    joinedAt: '2024-01-22T08:15:00+00:00',
    category: 'Home & living',
    payoutHold: false,
    note: 'Handwoven baskets and stools. Dispatch SLA is consistently under 24 hours.',
  },
  {
    id: 'vnd_northern_grain',
    store: 'Northern Grain Co.',
    owner: 'Ibrahim Yakubu',
    email: 'rachel.c@example.org',
    phone: '233244111004',
    region: 'Northern',
    status: 'active',
    kyc: 'verified',
    listings: 41,
    sales30d: 72900,
    orders30d: 67,
    rating: 4.5,
    joinedAt: '2024-09-04T11:00:00+00:00',
    category: 'Food & grocery',
    payoutHold: false,
    note: 'Millet, shea, and grains. Cold-chain partners cover Tamale to Accra.',
  },
  {
    id: 'vnd_coastal_home',
    store: 'Coastal Home',
    owner: 'Esi Quaye',
    email: 'fiona.g@example.net',
    phone: '233244111005',
    region: 'Central',
    status: 'active',
    kyc: 'verified',
    listings: 38,
    sales30d: 64200,
    orders30d: 51,
    rating: 4.4,
    joinedAt: '2025-02-11T09:40:00+00:00',
    category: 'Home & living',
    payoutHold: false,
    note: 'Cape Coast interiors. Best-selling rattan sets this quarter.',
  },
  {
    id: 'vnd_labadi_lights',
    store: 'Labadi Lights',
    owner: 'Nii Armah',
    email: 'ivan.p@example.net',
    phone: '233244111006',
    region: 'Greater Accra',
    status: 'pending_review',
    kyc: 'pending',
    listings: 22,
    sales30d: 41800,
    orders30d: 29,
    rating: 4.3,
    joinedAt: '2025-11-08T14:10:00+00:00',
    category: 'Home & living',
    payoutHold: true,
    note: 'Catalogue photos under review after a lighting listing mismatch.',
  },
  {
    id: 'vnd_volta_weaves',
    store: 'Volta Weaves',
    owner: 'Selorm Agbeko',
    email: 'samuel.w@example.com',
    phone: '233244111007',
    region: 'Volta',
    status: 'active',
    kyc: 'verified',
    listings: 29,
    sales30d: 33600,
    orders30d: 34,
    rating: 4.6,
    joinedAt: '2025-04-19T08:00:00+00:00',
    category: 'Fashion & apparel',
    payoutHold: false,
    note: 'Kente and kete weaves from Ho. Ships twice weekly to Accra hub.',
  },
  {
    id: 'vnd_koforidua_beads',
    store: 'Koforidua Beads',
    owner: 'Abena Owusu',
    email: 'nathan.k@example.net',
    phone: '233244111008',
    region: 'Eastern',
    status: 'active',
    kyc: 'verified',
    listings: 33,
    sales30d: 28400,
    orders30d: 26,
    rating: 4.9,
    joinedAt: '2025-07-02T12:30:00+00:00',
    category: 'Beauty & wellness',
    payoutHold: false,
    note: 'Krobo bead cooperative. High review volume, almost no returns.',
  },
  {
    id: 'vnd_sunyani_timber',
    store: 'Sunyani Timber',
    owner: 'Kwame Boateng',
    email: 'olivia.t@example.org',
    phone: '233244111009',
    region: 'Bono',
    status: 'active',
    kyc: 'verified',
    listings: 18,
    sales30d: 22100,
    orders30d: 19,
    rating: 4.2,
    joinedAt: '2025-12-14T09:00:00+00:00',
    category: 'Home & living',
    payoutHold: false,
    note: 'Small furniture line. Freight quotes added at checkout.',
  },
  {
    id: 'vnd_tarkwa_gold_home',
    store: 'Tarkwa Gold Home',
    owner: 'Adwoa Sarpong',
    email: 'beth.t@example.com',
    phone: '233244111010',
    region: 'Western',
    status: 'active',
    kyc: 'verified',
    listings: 15,
    sales30d: 18900,
    orders30d: 17,
    rating: 4.1,
    joinedAt: '2026-01-20T10:45:00+00:00',
    category: 'Home & living',
    payoutHold: false,
    note: 'Brass and wood décor. Growing through Western Region campaigns.',
  },
  {
    id: 'vnd_wa_shea',
    store: 'Wa Shea Collective',
    owner: 'Fatima Alhassan',
    email: 'hannah.h@example.com',
    phone: '233244111011',
    region: 'Upper West',
    status: 'active',
    kyc: 'verified',
    listings: 24,
    sales30d: 15700,
    orders30d: 21,
    rating: 4.8,
    joinedAt: '2026-03-05T08:20:00+00:00',
    category: 'Beauty & wellness',
    payoutHold: false,
    note: 'Women’s cooperative. Shea butter restocks every two weeks.',
  },
  {
    id: 'vnd_techiman_market',
    store: 'Techiman Market Co.',
    owner: 'Yaw Asante',
    email: 'alice.j@example.com',
    phone: '233244111012',
    region: 'Bono East',
    status: 'pending_review',
    kyc: 'pending',
    listings: 0,
    sales30d: 0,
    orders30d: 0,
    rating: null,
    joinedAt: '2026-08-12T16:00:00+00:00',
    category: 'Food & grocery',
    payoutHold: true,
    note: 'Business registration uploaded. Bank letter still outstanding.',
  },
  {
    id: 'vnd_bolga_baskets',
    store: 'Bolga Baskets',
    owner: 'Ayisha Fuseini',
    email: 'wendy.h@example.net',
    phone: '233244111013',
    region: 'Upper East',
    status: 'pending_review',
    kyc: 'pending',
    listings: 0,
    sales30d: 0,
    orders30d: 0,
    rating: null,
    joinedAt: '2026-08-22T11:15:00+00:00',
    category: 'Home & living',
    payoutHold: true,
    note: 'Awaiting Ghana Card match for the listed proprietor.',
  },
  {
    id: 'vnd_hohoe_coffee',
    store: 'Hohoe Coffee',
    owner: 'Elikem Nyarko',
    email: 'nina.v@example.com',
    phone: '233244111014',
    region: 'Oti',
    status: 'pending_review',
    kyc: 'pending',
    listings: 11,
    sales30d: 12400,
    orders30d: 9,
    rating: 4.0,
    joinedAt: '2026-06-30T13:00:00+00:00',
    category: 'Food & grocery',
    payoutHold: true,
    note: 'Origin claims on two listings need a farm certificate.',
  },
  {
    id: 'vnd_cape_coast_ceramics',
    store: 'Cape Coast Ceramics',
    owner: 'Kofi Blankson',
    email: 'emma.t@example.net',
    phone: '233244111015',
    region: 'Central',
    status: 'suspended',
    kyc: 'expired',
    listings: 9,
    sales30d: 8600,
    orders30d: 4,
    rating: 3.6,
    joinedAt: '2024-11-03T09:30:00+00:00',
    category: 'Home & living',
    payoutHold: true,
    note: 'Suspended after KYC expired and two late-dispatch complaints.',
  },
  {
    id: 'vnd_sefwi_cocoa',
    store: 'Sefwi Cocoa House',
    owner: 'Akua Frimpong',
    email: 'nathan.k@example.net',
    phone: '233244111016',
    region: 'Western North',
    status: 'suspended',
    kyc: 'expired',
    listings: 14,
    sales30d: 9100,
    orders30d: 6,
    rating: 3.8,
    joinedAt: '2025-05-16T15:40:00+00:00',
    category: 'Food & grocery',
    payoutHold: true,
    note: 'Paused pending renewed food handling certificate.',
  },
  {
    id: 'vnd_ahafo_honey',
    store: 'Ahafo Honey Co.',
    owner: 'Afia Darko',
    email: 'hannah.h@example.com',
    phone: '233244111017',
    region: 'Ahafo',
    status: 'active',
    kyc: 'verified',
    listings: 12,
    sales30d: 11200,
    orders30d: 14,
    rating: 4.7,
    joinedAt: '2026-04-18T09:10:00+00:00',
    category: 'Food & grocery',
    payoutHold: false,
    note: 'Single-origin honey. Seasonal listing volume around harvest.',
  },
  {
    id: 'vnd_nalerigu_farms',
    store: 'Nalerigu Farms',
    owner: 'Mariama Abdulai',
    email: 'sarah.b@example.net',
    phone: '233244111019',
    region: 'North East',
    status: 'pending_review',
    kyc: 'pending',
    listings: 7,
    sales30d: 4300,
    orders30d: 5,
    rating: 4.0,
    joinedAt: '2026-07-21T09:50:00+00:00',
    category: 'Food & grocery',
    payoutHold: true,
    note: 'Farm photos look solid. Waiting on a cooperative letter for the brand name.',
  },
  {
    id: 'vnd_damongo_pantry',
    store: 'Damongo Pantry',
    owner: 'Musah Iddrisu',
    email: 'xavier.y@example.org',
    phone: '233244111018',
    region: 'Savannah',
    status: 'active',
    kyc: 'verified',
    listings: 16,
    sales30d: 7800,
    orders30d: 11,
    rating: 4.4,
    joinedAt: '2026-02-09T10:00:00+00:00',
    category: 'Food & grocery',
    payoutHold: false,
    note: 'Dried fish and grains. Expanding into North East delivery.',
  },
]

export function getVendorStatusMeta(status) {
  return VENDOR_STATUSES.find((item) => item.key === status) ?? {
    key: status,
    label: status ? String(status).replace(/_/g, ' ') : 'Unknown',
    shortLabel: status ? String(status).replace(/_/g, ' ') : 'Unknown',
    hint: '',
    badgeClass: 'bg-slate-50 text-slate-700 ring-slate-200',
    icon: 'clock',
  }
}

export function getVendorKycMeta(kyc) {
  return VENDOR_KYC.find((item) => item.key === kyc) ?? {
    key: kyc,
    label: kyc ? String(kyc).replace(/_/g, ' ') : 'Unknown',
    badgeClass: 'bg-slate-50 text-slate-700 ring-slate-200',
    icon: 'clock',
  }
}

const PRODUCT_POOLS = {
  'Fashion & apparel': [
    { name: 'Ceremonial kente wrap', price: 890, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=480&h=480&fit=crop' },
    { name: 'Studio linen shirt', price: 245, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=480&h=480&fit=crop' },
    { name: 'Hand-dyed batik dress', price: 420, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=480&h=480&fit=crop' },
    { name: 'Beaded clutch', price: 160, image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=480&h=480&fit=crop' },
    { name: 'Kete scarf', price: 95, image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=480&h=480&fit=crop' },
    { name: 'Tailored kaftan', price: 310, image: 'https://images.unsplash.com/photo-1539109136881-3be8266e4c22?w=480&h=480&fit=crop' },
  ],
  'Home & living': [
    { name: 'Handwoven basket set', price: 180, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=480&h=480&fit=crop' },
    { name: 'Labadi table lamp', price: 240, image: 'https://images.unsplash.com/photo-1507473889455-b7bdd458ad14?w=480&h=480&fit=crop' },
    { name: 'Rattan lounge chair', price: 780, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=480&h=480&fit=crop' },
    { name: 'Ceramic serving bowl', price: 65, image: 'https://images.unsplash.com/photo-1578749556568-bc2c8772cd80?w=480&h=480&fit=crop' },
    { name: 'Carved stool', price: 320, image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=480&h=480&fit=crop' },
    { name: 'Brass wall disc', price: 145, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=480&h=480&fit=crop' },
  ],
  'Beauty & wellness': [
    { name: 'Shea butter 250ml', price: 48, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=480&h=480&fit=crop' },
    { name: 'Krobo bead necklace', price: 85, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=480&h=480&fit=crop' },
    { name: 'Black soap bar', price: 22, image: 'https://images.unsplash.com/photo-1600857065562-0b923069247c?w=480&h=480&fit=crop' },
    { name: 'Coconut hair oil', price: 36, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=480&h=480&fit=crop' },
    { name: 'Honey lip balm', price: 18, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=480&h=480&fit=crop' },
    { name: 'Aroma candle trio', price: 90, image: 'https://images.unsplash.com/photo-1603006905003-be82a6f2b32f?w=480&h=480&fit=crop' },
  ],
  'Food & grocery': [
    { name: 'Northern millet 2kg', price: 42, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=480&h=480&fit=crop' },
    { name: 'Single-origin honey', price: 55, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=480&h=480&fit=crop' },
    { name: 'Cocoa nibs 500g', price: 38, image: 'https://images.unsplash.com/photo-1511381939415-e44015466831?w=480&h=480&fit=crop' },
    { name: 'Smoked fish pack', price: 70, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=480&h=480&fit=crop' },
    { name: 'Shea nuts 1kg', price: 28, image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d25?w=480&h=480&fit=crop' },
    { name: 'Ground coffee 250g', price: 64, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=480&h=480&fit=crop' },
  ],
}

const PRODUCT_STATUSES = ['Live', 'Live', 'Live', 'Draft', 'Paused']

function seededIndex(id, salt) {
  return String(`${id}:${salt}`).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

export function getVendorProducts(vendor) {
  const pool = PRODUCT_POOLS[vendor?.category] ?? PRODUCT_POOLS['Home & living']
  const listingCount = Number(vendor?.listings) || 0
  if (listingCount <= 0) return []

  const count = Math.min(6, Math.max(3, Math.min(listingCount, pool.length)))
  const offset = seededIndex(vendor.id, 'products') % pool.length

  return Array.from({ length: count }, (_, index) => {
    const item = pool[(offset + index) % pool.length]
    const status = vendor.status === 'approved' ? PRODUCT_STATUSES[index % PRODUCT_STATUSES.length] : 'Pending'
    return {
      id: `${vendor.id}-p${index + 1}`,
      name: item.name,
      price: item.price,
      image: item.image,
      stock: 8 + ((offset + index * 5) % 40),
      status,
      sold30d: vendor.status === 'approved' ? 4 + ((offset + index * 3) % 28) : 0,
    }
  })
}

export function getVendorSalesTrend(vendor) {
  const labels = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
  const base = Number(vendor?.sales30d) || 0
  const curve = [0.52, 0.61, 0.58, 0.74, 0.82, 0.76, 1]
  return labels.map((label, index) => ({
    label,
    sales: Math.round(base * curve[index]),
  }))
}

export function getVendorRecentOrders(vendor) {
  if (!vendor || vendor.status === 'pending' || vendor.status === 'rejected') return []
  const statuses = ['pending', 'processing', 'shipped', 'delivered']
  const base = Math.max(80, Math.round((Number(vendor.sales30d) || 0) / Math.max(1, vendor.orders30d)))
  return Array.from({ length: 5 }, (_, index) => ({
    id: `EM-${10490 - index}-${vendor.id.slice(-4).toUpperCase()}`,
    total: base + (index * 37),
    status: statuses[index % statuses.length],
    region: vendor.region,
    placed: `${index + 1}d ago`,
  }))
}
