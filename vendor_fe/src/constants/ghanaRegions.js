export const GHANA_COUNTRY = 'Ghana'

export const GHANA_REGIONS = [
  { value: 'greater accra', label: 'Greater Accra' },
  { value: 'ashanti', label: 'Ashanti' },
  { value: 'western', label: 'Western' },
  { value: 'central', label: 'Central' },
  { value: 'eastern', label: 'Eastern' },
  { value: 'northern', label: 'Northern' },
  { value: 'volta', label: 'Volta' },
  { value: 'upper east', label: 'Upper East' },
  { value: 'upper west', label: 'Upper West' },
  { value: 'bono', label: 'Bono' },
  { value: 'bono east', label: 'Bono East' },
  { value: 'ahafo', label: 'Ahafo' },
  { value: 'western north', label: 'Western North' },
  { value: 'oti', label: 'Oti' },
  { value: 'north east', label: 'North East' },
  { value: 'savannah', label: 'Savannah' },
]

export const GHANA_CITIES = {
  'greater accra': ['Accra', 'Tema', 'Madina', 'Ashaiman', 'Kasoa', 'Dansoman'],
  ashanti: ['Kumasi', 'Obuasi', 'Ejisu', 'Konongo', 'Mampong'],
  western: ['Takoradi', 'Sekondi', 'Tarkwa', 'Axim'],
  central: ['Cape Coast', 'Winneba', 'Kasoa', 'Elmina'],
  eastern: ['Koforidua', 'Nkawkaw', 'Akosombo', 'Nsawam'],
  northern: ['Tamale', 'Yendi', 'Savelugu'],
  volta: ['Ho', 'Hohoe', 'Keta', 'Aflao'],
  'upper east': ['Bolgatanga', 'Navrongo', 'Bawku'],
  'upper west': ['Wa', 'Tumu', 'Lawra'],
  bono: ['Sunyani', 'Berekum', 'Dormaa Ahenkro'],
  'bono east': ['Techiman', 'Kintampo', 'Atebubu'],
  ahafo: ['Goaso', 'Bechem', 'Hwidiem'],
  'western north': ['Sefwi Wiawso', 'Bibiani', 'Juaboso'],
  oti: ['Dambai', 'Jasikan', 'Kadjebi'],
  'north east': ['Nalerigu', 'Walewale', 'Gambaga'],
  savannah: ['Damongo', 'Bole', 'Salaga'],
}

export function getCitiesByRegion(region) {
  if (!region) return []
  return GHANA_CITIES[region.toLowerCase()] ?? []
}
