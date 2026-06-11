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

const EXTRA_GHANA_DISTRICTS_BY_REGION = {
  'greater-accra': [
    { id: 'tema-metropolitan', name: 'Tema Metropolitan', towns: ['Tema Community 1', 'Tema Community 2', 'Tema Community 25', 'Sakumono'] },
    { id: 'tema-west-municipal', name: 'Tema West Municipal', towns: ['Lashibi', 'Adjei Kojo', 'Baatsona', 'Spintex'] },
    { id: 'ledzokuku-municipal', name: 'Ledzokuku Municipal', towns: ['Teshie', 'Tse Addo', 'Manet', 'Baatsonaa'] },
    { id: 'la-dade-kotopon', name: 'La Dade-Kotopon Municipal', towns: ['La', 'Cantonments', 'Labone', 'Burma Camp'] },
    { id: 'adentan-municipal', name: 'Adentan Municipal', towns: ['Adenta', 'Frafraha', 'Ashaley Botwe', 'New Legon'] },
    { id: 'ga-east-municipal', name: 'Ga East Municipal', towns: ['Abokobi', 'Haatso', 'Dome', 'Ashongman'] },
    { id: 'ga-west-municipal', name: 'Ga West Municipal', towns: ['Amasaman', 'Pokuase', 'Medie', 'Ofankor'] },
    { id: 'ga-south-municipal', name: 'Ga South Municipal', towns: ['Weija', 'Bortianor', 'Ngleshie Amanfro', 'Domeabra'] },
    { id: 'weija-gbawe-municipal', name: 'Weija-Gbawe Municipal', towns: ['Gbawe', 'Mallam', 'Anyaa', 'Oblogo'] },
    { id: 'la-nkwantanang-madina', name: 'La Nkwantanang-Madina Municipal', towns: ['Madina', 'Atomic', 'Ritz Junction', 'Pantang'] },
    { id: 'kpone-katamanso', name: 'Kpone Katamanso Municipal', towns: ['Kpone', 'Katamanso', 'Oyibi', 'Gbetsile'] },
    { id: 'ningo-prampram', name: 'Ningo-Prampram District', towns: ['Prampram', 'Old Ningo', 'Dawhenya', 'Afienya'] },
  ],
  ashanti: [
    { id: 'ejisu-municipal', name: 'Ejisu Municipal', towns: ['Ejisu', 'Kwaso', 'Besease', 'Onwe'] },
    { id: 'kwabre-east-municipal', name: 'Kwabre East Municipal', towns: ['Mamponteng', 'Ahwiaa', 'Aboaso', 'Ntonso'] },
    { id: 'old-tafo-municipal', name: 'Old Tafo Municipal', towns: ['Old Tafo', 'Pankrono', 'Krofrom', 'Akwatia Line'] },
    { id: 'suame-municipal', name: 'Suame Municipal', towns: ['Suame', 'Maakro', 'Kronum', 'Anomangye'] },
    { id: 'bekwai-municipal', name: 'Bekwai Municipal', towns: ['Bekwai', 'Anwiankwanta', 'Poano', 'Kokofu'] },
    { id: 'mampong-municipal', name: 'Mampong Municipal', towns: ['Mampong', 'Kofiase', 'Bosofour', 'Beposo'] },
  ],
  western: [
    { id: 'effia-kwesimintsim', name: 'Effia-Kwesimintsim Municipal', towns: ['Effia', 'Kwesimintsim', 'Apremdo', 'Anaji'] },
    { id: 'shama-district', name: 'Shama District', towns: ['Shama', 'Aboadze', 'Inchaban', 'Daboase'] },
    { id: 'ellembelle-district', name: 'Ellembelle District', towns: ['Nkroful', 'Esiama', 'Aiyinase', 'Asasetre'] },
    { id: 'prestea-huni-valley', name: 'Prestea-Huni Valley Municipal', towns: ['Prestea', 'Bogoso', 'Huni Valley', 'Aboso'] },
  ],
  central: [
    { id: 'komenda-edina-eguafo-abirem', name: 'Komenda-Edina-Eguafo-Abirem Municipal', towns: ['Elmina', 'Komenda', 'Brenu Akyinim', 'Kissi'] },
    { id: 'awutu-senya-east', name: 'Awutu Senya East Municipal', towns: ['Kasoa', 'Opeikuma', 'Ofaakor', 'Buduburam'] },
    { id: 'mfantsiman-municipal', name: 'Mfantsiman Municipal', towns: ['Saltpond', 'Mankessim', 'Anomabo', 'Yamoransa'] },
    { id: 'agona-west', name: 'Agona West Municipal', towns: ['Agona Swedru', 'Nyakrom', 'Bobikuma', 'Nkum'] },
  ],
  eastern: [
    { id: 'new-juaben-south', name: 'New Juaben South Municipal', towns: ['Koforidua', 'Srodae', 'Betom', 'Adweso'] },
    { id: 'nsawam-adoagyiri', name: 'Nsawam-Adoagyiri Municipal', towns: ['Nsawam', 'Adoagyiri', 'Dobro', 'Fotobi'] },
    { id: 'abuakwa-south', name: 'Abuakwa South Municipal', towns: ['Kibi', 'Asiakwa', 'Apedwa', 'Asikam'] },
    { id: 'kwahu-west', name: 'Kwahu West Municipal', towns: ['Nkawkaw', 'Amanfrom', 'Asuboni Rails', 'Bepong'] },
  ],
  northern: [
    { id: 'savelugu-municipal', name: 'Savelugu Municipal', towns: ['Savelugu', 'Diare', 'Nanton', 'Pong-Tamale'] },
    { id: 'yendi-municipal', name: 'Yendi Municipal', towns: ['Yendi', 'Gbungbaliga', 'Adibo', 'Bunbon'] },
    { id: 'tolon-district', name: 'Tolon District', towns: ['Tolon', 'Nyankpala', 'Tali', 'Wantugu'] },
  ],
  volta: [
    { id: 'hohoe-municipal', name: 'Hohoe Municipal', towns: ['Hohoe', 'Gbi Wegbe', 'Alavanyo', 'Fodome'] },
    { id: 'akatsi-south', name: 'Akatsi South Municipal', towns: ['Akatsi', 'Avenorpeme', 'Wute', 'Atidzive'] },
    { id: 'keta-municipal', name: 'Keta Municipal', towns: ['Keta', 'Anloga', 'Abor', 'Tegbi'] },
  ],
  bono: [
    { id: 'dormaa-central', name: 'Dormaa Central Municipal', towns: ['Dormaa Ahenkro', 'Amasu', 'Asuotiano', 'Nkrankwanta'] },
    { id: 'wenchi-municipal', name: 'Wenchi Municipal', towns: ['Wenchi', 'Nchiraa', 'Awisa', 'Koase'] },
    { id: 'jaman-south', name: 'Jaman South Municipal', towns: ['Drobo', 'Japekrom', 'Adamsu', 'Dwenem'] },
  ],
  'upper-east': [
    { id: 'kasena-nankana', name: 'Kasena-Nankana Municipal', towns: ['Navrongo', 'Paga', 'Kandiga', 'Sirigu'] },
    { id: 'talensi-district', name: 'Talensi District', towns: ['Tongo', 'Winkogo', 'Pwalugu', 'Datoku'] },
    { id: 'bongo-district', name: 'Bongo District', towns: ['Bongo', 'Namoo', 'Zorko', 'Balungu'] },
  ],
  'upper-west': [
    { id: 'nadowli-kaleo', name: 'Nadowli-Kaleo District', towns: ['Nadowli', 'Kaleo', 'Charikpong', 'Sombo'] },
    { id: 'sissala-east', name: 'Sissala East Municipal', towns: ['Tumu', 'Wellembelle', 'Nabulo', 'Sakai'] },
    { id: 'jirapa-municipal', name: 'Jirapa Municipal', towns: ['Jirapa', 'Ullo', 'Sabuli', 'Tizza'] },
  ],
  'western-north': [
    { id: 'aowin-municipal', name: 'Aowin Municipal', towns: ['Enchi', 'Achimfo', 'Boinso', 'Jema'] },
    { id: 'juaboso-district', name: 'Juaboso District', towns: ['Juaboso', 'Boinzan', 'Kofikrom', 'Asempanaye'] },
    { id: 'bia-west', name: 'Bia West District', towns: ['Essam', 'Debiso', 'Oseikojokrom', 'Adabokrom'] },
  ],
  ahafo: [
    { id: 'tano-north', name: 'Tano North Municipal', towns: ['Duayaw Nkwanta', 'Yamfo', 'Bomaa', 'Terchire'] },
    { id: 'tano-south', name: 'Tano South Municipal', towns: ['Bechem', 'Techimantia', 'Derma', 'Dwomo'] },
    { id: 'asutifi-south', name: 'Asutifi South District', towns: ['Hwidiem', 'Acherensua', 'Kenyasi No. 2', 'Dadiesoaba'] },
  ],
  'bono-east': [
    { id: 'nkoranza-south', name: 'Nkoranza South Municipal', towns: ['Nkoranza', 'Donkro Nkwanta', 'Akuma', 'Busunya'] },
    { id: 'atebubu-amantin', name: 'Atebubu-Amantin Municipal', towns: ['Atebubu', 'Amantin', 'Jato Zongo', 'Kumfia'] },
    { id: 'pru-east', name: 'Pru East District', towns: ['Yeji', 'Prang', 'Parambo', 'Kadue'] },
  ],
  oti: [
    { id: 'jasikan-municipal', name: 'Jasikan Municipal', towns: ['Jasikan', 'Bodada', 'Okadjakrom', 'Atonkor'] },
    { id: 'biakoye-district', name: 'Biakoye District', towns: ['Nkonya Ahenkro', 'Tapa Abotoase', 'Bowiri', 'Kwamikrom'] },
    { id: 'krachi-west', name: 'Krachi West Municipal', towns: ['Kete Krachi', 'Osramani', 'Ehiamankyene', 'Kpandai'] },
  ],
  savannah: [
    { id: 'east-gonja', name: 'East Gonja Municipal', towns: ['Salaga', 'Kafaba', 'Makango', 'Kpembe'] },
    { id: 'bole-district', name: 'Bole District', towns: ['Bole', 'Tinga', 'Mandari', 'Bamboi'] },
    { id: 'north-gonja', name: 'North Gonja District', towns: ['Daboya', 'Lingbinsi', 'Mankarigu', 'Sinsina'] },
  ],
  'north-east': [
    { id: 'east-mamprusi', name: 'East Mamprusi Municipal', towns: ['Nalerigu', 'Gambaga', 'Sakogu', 'Langbinsi'] },
    { id: 'bunkpurugu-nakpanduri', name: 'Bunkpurugu-Nakpanduri District', towns: ['Bunkpurugu', 'Nakpanduri', 'Binde', 'Nayorku'] },
    { id: 'yunyoo-nasuan', name: 'Yunyoo-Nasuan District', towns: ['Yunyoo', 'Nasuan', 'Gbungbaliga', 'Kpunkpamba'] },
  ],
}

for (const region of GHANA_LOCATIONS) {
  region.districts = [
    ...region.districts,
    ...(EXTRA_GHANA_DISTRICTS_BY_REGION[region.id] ?? []),
  ]
}

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
