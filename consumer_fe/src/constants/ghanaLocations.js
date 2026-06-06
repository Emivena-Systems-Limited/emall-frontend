export const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
]

export const LOCATION_OTHER_VALUE = '__other__'

/**
 * All 16 Ghana regions ordered by commercial and business activity prominence.
 * Greater Accra leads as the national economic hub, followed by major trade,
 * industrial, and emerging regional centers.
 */
export const GHANA_LOCATIONS = [
  {
    id: 'greater-accra',
    name: 'Greater Accra',
    districts: [
      {
        id: 'accra-metropolitan',
        name: 'Accra Metropolitan',
        towns: ['Adabraka', 'Kaneshie', 'Dansoman'],
      },
      {
        id: 'okaikoi-north',
        name: 'Okaikoi North',
        towns: ['Osu', 'Ringway Estates', 'North Ridge'],
      },
      {
        id: 'ashaiman-municipal',
        name: 'Ashaiman Municipal',
        towns: ['Ashaiman', 'Taifa', 'Lebanon Zone 4'],
      },
    ],
  },
  {
    id: 'ashanti',
    name: 'Ashanti',
    districts: [
      {
        id: 'kumasi-metropolitan',
        name: 'Kumasi Metropolitan',
        towns: ['Adum', 'Bantama', 'Suame'],
      },
      {
        id: 'asokwa-municipal',
        name: 'Asokwa Municipal',
        towns: ['Asokwa', 'Ayigya', 'Dompoase'],
      },
      {
        id: 'obuasi-municipal',
        name: 'Obuasi Municipal',
        towns: ['Obuasi', 'Tutuka', 'Anyinam'],
      },
    ],
  },
  {
    id: 'western',
    name: 'Western',
    districts: [
      {
        id: 'sekondi-takoradi',
        name: 'Sekondi Takoradi Metropolitan',
        towns: ['Sekondi', 'Takoradi', 'Kwesimintsim'],
      },
      {
        id: 'tarkwa-nsuaem',
        name: 'Tarkwa-Nsuaem Municipal',
        towns: ['Tarkwa', 'Nsuaem', 'Cyanide'],
      },
    ],
  },
  {
    id: 'central',
    name: 'Central',
    districts: [
      {
        id: 'cape-coast-metropolitan',
        name: 'Cape Coast Metropolitan',
        towns: ['Cape Coast', 'Abura', 'Kokoado'],
      },
      {
        id: 'effutu-municipal',
        name: 'Effutu Municipal',
        towns: ['Winneba', 'Gyahadze', 'Ateitu'],
      },
    ],
  },
  {
    id: 'eastern',
    name: 'Eastern',
    districts: [
      {
        id: 'new-juaben-north',
        name: 'New Juaben North Municipal',
        towns: ['Koforidua', 'Oyoko', 'Jumapo'],
      },
      {
        id: 'akuapem-north',
        name: 'Akuapem North Municipal',
        towns: ['Akropong', 'Abiriw', 'Larteh'],
      },
    ],
  },
  {
    id: 'northern',
    name: 'Northern',
    districts: [
      {
        id: 'tamale-metropolitan',
        name: 'Tamale Metropolitan',
        towns: ['Tamale Central', 'Kalpohin', 'Lamashegu'],
      },
      {
        id: 'sagnarigu-municipal',
        name: 'Sagnarigu Municipal',
        towns: ['Sagnarigu', 'Kpalsi', 'Changli'],
      },
    ],
  },
  {
    id: 'volta',
    name: 'Volta',
    districts: [
      {
        id: 'ho-municipal',
        name: 'Ho Municipal',
        towns: ['Ho', 'Bankoe', 'Dome'],
      },
      {
        id: 'ketu-south',
        name: 'Ketu South Municipal',
        towns: ['Aflao', 'Denu', 'Agbozume'],
      },
    ],
  },
  {
    id: 'bono',
    name: 'Bono',
    districts: [
      {
        id: 'sunyani-municipal',
        name: 'Sunyani Municipal',
        towns: ['Sunyani', 'Abesim', 'New Dormaa'],
      },
      {
        id: 'berekum-east',
        name: 'Berekum East Municipal',
        towns: ['Berekum', 'Jinijini', 'Senase'],
      },
    ],
  },
  {
    id: 'upper-east',
    name: 'Upper East',
    districts: [
      {
        id: 'bolgatanga-municipal',
        name: 'Bolgatanga Municipal',
        towns: ['Bolgatanga', 'Zuarungu', 'Sumbrungu'],
      },
      {
        id: 'bawku-municipal',
        name: 'Bawku Municipal',
        towns: ['Bawku', 'Mognori', 'Kuka'],
      },
    ],
  },
  {
    id: 'upper-west',
    name: 'Upper West',
    districts: [
      {
        id: 'wa-municipal',
        name: 'Wa Municipal',
        towns: ['Wa', 'Kambali', 'Bamahu'],
      },
      {
        id: 'lawra-municipal',
        name: 'Lawra Municipal',
        towns: ['Lawra', 'Eremon', 'Babile'],
      },
    ],
  },
  {
    id: 'western-north',
    name: 'Western North',
    districts: [
      {
        id: 'sefwi-wiawso',
        name: 'Sefwi Wiawso Municipal',
        towns: ['Sefwi Wiawso', 'Asafo', 'Old Town'],
      },
      {
        id: 'bibiani-anhwiaso-bekwai',
        name: 'Bibiani Anhwiaso Bekwai Municipal',
        towns: ['Bibiani', 'Anhwiaso', 'Bekwai'],
      },
    ],
  },
  {
    id: 'ahafo',
    name: 'Ahafo',
    districts: [
      {
        id: 'goaso-municipal',
        name: 'Asunafo North Municipal',
        towns: ['Goaso', 'Kasapin', 'Akrodie'],
      },
      {
        id: 'kenyasi-no-1',
        name: 'Asutifi North District',
        towns: ['Kenyasi No. 1', 'Hwidiem', 'Ntotroso'],
      },
    ],
  },
  {
    id: 'bono-east',
    name: 'Bono East',
    districts: [
      {
        id: 'techiman-municipal',
        name: 'Techiman Municipal',
        towns: ['Techiman', 'Tuobodom', 'Tanoso'],
      },
      {
        id: 'kintampo-north',
        name: 'Kintampo North Municipal',
        towns: ['Kintampo', 'New Longoro', 'Jema'],
      },
    ],
  },
  {
    id: 'oti',
    name: 'Oti',
    districts: [
      {
        id: 'krachi-east',
        name: 'Krachi East Municipal',
        towns: ['Dambai', 'Chinderi', 'Kete Krachi'],
      },
      {
        id: 'nkwanta-south',
        name: 'Nkwanta South Municipal',
        towns: ['Nkwanta', 'Kpassa', 'Kerri'],
      },
    ],
  },
  {
    id: 'savannah',
    name: 'Savannah',
    districts: [
      {
        id: 'west-gonja',
        name: 'West Gonja Municipal',
        towns: ['Damongo', 'Larabanga', 'Mole'],
      },
      {
        id: 'central-gonja',
        name: 'Central Gonja District',
        towns: ['Buipe', 'Bole', 'Yapei'],
      },
    ],
  },
  {
    id: 'north-east',
    name: 'North East',
    districts: [
      {
        id: 'west-mamprusi',
        name: 'West Mamprusi Municipal',
        towns: ['Walewale', 'Janga', 'Kperiga'],
      },
      {
        id: 'mamprugu-moagduri',
        name: 'Mamprugu Moagduri District',
        towns: ['Yagaba', 'Kubori', 'Zangum'],
      },
    ],
  },
]

export function getDistrictsByRegion(regionId) {
  return GHANA_LOCATIONS.find((region) => region.id === regionId)?.districts ?? []
}

export function getTownsByDistrict(regionId, districtId) {
  return (
    getDistrictsByRegion(regionId).find((district) => district.id === districtId)?.towns ?? []
  )
}

export function getCityOptionsByRegion(regionId) {
  const districts = getDistrictsByRegion(regionId)
  const nameCounts = new Map()

  for (const district of districts) {
    for (const city of district.towns) {
      nameCounts.set(city, (nameCounts.get(city) ?? 0) + 1)
    }
  }

  const options = []

  for (const district of districts) {
    for (const city of district.towns) {
      const isDuplicate = nameCounts.get(city) > 1

      options.push({
        value: isDuplicate ? `${district.id}::${city}` : city,
        label: isDuplicate ? `${city} — ${district.name}` : city,
        districtId: district.id,
        city,
      })
    }
  }

  return options.sort((a, b) => a.label.localeCompare(b.label))
}

export function getDistrictsByRegionAndCity(regionId, cityValue) {
  const districts = getDistrictsByRegion(regionId)
  if (!cityValue) return districts

  const { districtId, city } = resolveCitySelection(regionId, cityValue)

  if (districtId) {
    return districts.filter((district) => district.id === districtId)
  }

  return districts.filter((district) => district.towns.includes(city))
}

export function resolveCitySelection(regionId, cityValue) {
  if (!cityValue) {
    return { districtId: '', city: '' }
  }

  if (cityValue.includes('::')) {
    const [districtId, city] = cityValue.split('::')
    return { districtId, city }
  }

  const matches = getDistrictsByRegion(regionId).filter((district) =>
    district.towns.includes(cityValue),
  )

  return {
    districtId: matches.length === 1 ? matches[0].id : '',
    city: cityValue,
  }
}

export function getCityLabel(regionId, cityValue) {
  if (!cityValue) return ''

  const options = getCityOptionsByRegion(regionId)
  return options.find((option) => option.value === cityValue)?.city ?? cityValue.split('::')[1] ?? cityValue
}
