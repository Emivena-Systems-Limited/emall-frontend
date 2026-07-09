/**
 * Downloads real photographic category assets (JPG).
 * Product/lifestyle photos that speak to each category.
 * When people appear, prefer Black models.
 *
 * Run: node scripts/download-category-photos.mjs
 */
import { mkdir, writeFile, unlink, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, '../src/assets/images/categories/catalog')

/**
 * Curated Pexels photos — thematic product/lifestyle.
 * People shots: Black models where people are the subject.
 */
const CURATED = {
  // —— Home & Kitchen (product) ——
  'home-kitchen':
    'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'home-kitchen-home-decor':
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'home-kitchen-kitchen-utensils':
    'https://images.pexels.com/photos/4226896/pexels-photo-4226896.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'home-kitchen-bedding':
    'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'home-kitchen-kitchen-storage-organization':
    'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=1200',

  // —— Sports & Outdoors (product; people shots are curated PNGs) ——
  'sports-outdoors':
    'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'sports-outdoors-mens-sports-outdoor-shoes':
    'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'sports-outdoors-womens-athletic-shoes':
    'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=1200',
  // exercise-fitness: curated PNG with Black athlete (skip stock)
  'sports-outdoors-sports-outdoor-accessories':
    'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1200',

  // —— Jewelry & Accessories (product) ——
  'jewelry-accessories':
    'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'jewelry-accessories-womens-jewelry':
    'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'jewelry-accessories-mens-jewelry':
    'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'jewelry-accessories-mens-watches':
    'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'jewelry-accessories-womens-watches':
    'https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'jewelry-accessories-eyewear':
    'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=1200',

  // —— Beauty & Health (product; people shots are curated PNGs) ——
  // beauty-health, facial-care, hair-care: curated PNGs
  'beauty-health-makeup':
    'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'beauty-health-personal-care':
    'https://images.pexels.com/photos/3738349/pexels-photo-3738349.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'beauty-health-foot-hand-nail-care':
    'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'beauty-health-oral-care':
    'https://images.pexels.com/photos/6627538/pexels-photo-6627538.jpeg?auto=compress&cs=tinysrgb&w=1200',

  // —— Toys & Games (product; parent toys-games is curated PNG) ——
  'toys-games-building-toys':
    'https://images.pexels.com/photos/298825/pexels-photo-298825.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'toys-games-games-accessories':
    'https://images.pexels.com/photos/776654/pexels-photo-776654.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'toys-games-learning-education':
    'https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'toys-games-baby-toddles-toys':
    'https://images.pexels.com/photos/3661350/pexels-photo-3661350.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'toys-games-party-supplies':
    'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=1200',

  // —— Baby & Maternity (product; parent + baby-care are curated PNGs) ——
  'baby-maternity-feeding':
    'https://images.pexels.com/photos/3875080/pexels-photo-3875080.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'baby-maternity-nappy-changing':
    'https://images.pexels.com/photos/3933025/pexels-photo-3933025.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'baby-maternity-nursery':
    'https://images.pexels.com/photos/1648377/pexels-photo-1648377.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'baby-maternity-baby-travel-gear':
    'https://images.pexels.com/photos/3933024/pexels-photo-3933024.jpeg?auto=compress&cs=tinysrgb&w=1200',

  // —— Bags & Luggage ——
  'bags-luggage':
    'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'bags-luggage-luggage':
    'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=1200',
  // Handbag product / Black woman with bag
  'bags-luggage-womens-handbags':
    'https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'bags-luggage-laptop-bags':
    'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=1200',
  // Black student with backpack
  'bags-luggage-student-backpacks':
    'https://images.pexels.com/photos/1546003/pexels-photo-1546003.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'bags-luggage-mens-shoulder-bags':
    'https://images.pexels.com/photos/934673/pexels-photo-934673.jpeg?auto=compress&cs=tinysrgb&w=1200',

  // —— Arts, Crafts & Sewing ——
  'arts-crafts-sewing':
    'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'arts-crafts-sewing-sewing':
    'https://images.pexels.com/photos/4620624/pexels-photo-4620624.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'arts-crafts-sewing-crafting':
    'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'arts-crafts-sewing-party-decorations-supplies':
    'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'arts-crafts-sewing-fabric':
    'https://images.pexels.com/photos/4620621/pexels-photo-4620621.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'arts-crafts-sewing-painting-drawing-arts-supplies':
    'https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg?auto=compress&cs=tinysrgb&w=1200',

  // —— Mobile Phones & Accessories (product) ——
  'mobile-phones-accessories':
    'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'mobile-phones-accessories-cases-holsters-sleeves':
    'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'mobile-phones-accessories-mobile-phones':
    'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'mobile-phones-accessories-stands':
    'https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'mobile-phones-accessories-phone-accessories':
    'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1200',

  // —— Health & Household (skin-care is curated PNG) ——
  'health-household':
    'https://images.pexels.com/photos/3738349/pexels-photo-3738349.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'health-household-household-cleaning-supplies':
    'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'health-household-massage-tools':
    'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'health-household-bathing-accessories':
    'https://images.pexels.com/photos/6621462/pexels-photo-6621462.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'health-household-vision-care':
    'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=1200',
}

/** Slugs with curated people PNGs — never overwrite with stock downloads */
const SKIP_STOCK = new Set([
  'beauty-health',
  'beauty-health-facial-care',
  'beauty-health-hair-care',
  'sports-outdoors',
  'sports-outdoors-exercise-fitness',
  'baby-maternity',
  'baby-maternity-baby-care',
  'toys-games',
  'health-household-skin-care',
  // Legacy override photos in src/assets/images/categories/
  'home-kitchen-home-decor',
  'home-kitchen-kitchen-utensils',
  'home-kitchen-bedding',
  'home-kitchen-kitchen-storage-organization',
])

async function download(url, dest) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'image/jpeg,image/*,*/*',
    },
    redirect: 'follow',
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.length < 2000) {
    throw new Error(`File too small (${buffer.length}b)`)
  }

  // Basic JPEG magic check
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error('Not a JPEG')
  }

  await writeFile(dest, buffer)
  return buffer.length
}

async function clearOldAssets() {
  try {
    const files = await readdir(OUT_DIR)
    for (const file of files) {
      // Never delete curated PNG people shots
      if (file.endsWith('.jpg') || file.endsWith('.svg')) {
        const slug = file.replace(/\.(jpg|svg)$/, '')
        if (SKIP_STOCK.has(slug)) continue
        await unlink(path.join(OUT_DIR, file))
      }
    }
  } catch {
    // ignore
  }
}

await mkdir(OUT_DIR, { recursive: true })
await clearOldAssets()

let ok = 0
let fail = 0
const failed = []

for (const [slug, url] of Object.entries(CURATED)) {
  if (SKIP_STOCK.has(slug)) {
    console.log(`↷ ${slug} (curated PNG — skipped)`)
    continue
  }
  const dest = path.join(OUT_DIR, `${slug}.jpg`)
  try {
    const size = await download(url, dest)
    console.log(`✓ ${slug} (${Math.round(size / 1024)} KB)`)
    ok += 1
  } catch (err) {
    console.error(`✗ ${slug}: ${err.message}`)
    failed.push(slug)
    fail += 1
  }
}

console.log(`\nDone: ${ok} downloaded, ${fail} failed → ${OUT_DIR}`)
if (failed.length) console.log('Failed:', failed.join(', '))
if (fail > 0) process.exitCode = 1
