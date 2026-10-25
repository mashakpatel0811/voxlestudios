// ZIP codes the app knows about: 50 in the City of Los Angeles area and the Santa Clarita Valley.
// Each ZIP belongs to an "area". A place that is in the same area as your ZIP counts as nearby.
// The neighborhood names are approximate: check them before submitting.

export const areas = [
  { id: 'downtown', label: 'Downtown Los Angeles' },
  { id: 'south-la', label: 'South Los Angeles' },
  { id: 'hollywood', label: 'Hollywood and Mid-City' },
  { id: 'east-la', label: 'East and Northeast Los Angeles' },
  { id: 'westside', label: 'Westside' },
  { id: 'valley', label: 'San Fernando Valley' },
  { id: 'scv', label: 'Santa Clarita Valley' },
]

export const zipcodes = {
  // Downtown Los Angeles
  90012: { area: 'downtown', neighborhood: 'Chinatown and Civic Center' },
  90013: { area: 'downtown', neighborhood: 'Downtown (Skid Row)' },
  90015: { area: 'downtown', neighborhood: 'Downtown (South Park)' },
  90017: { area: 'downtown', neighborhood: 'Westlake and Downtown' },
  90021: { area: 'downtown', neighborhood: 'Arts District' },
  90071: { area: 'downtown', neighborhood: 'Financial District' },

  // South Los Angeles
  90001: { area: 'south-la', neighborhood: 'Florence' },
  90002: { area: 'south-la', neighborhood: 'Watts' },
  90003: { area: 'south-la', neighborhood: 'South Los Angeles' },
  90007: { area: 'south-la', neighborhood: 'University Park (USC)' },
  90008: { area: 'south-la', neighborhood: 'Baldwin Hills' },
  90011: { area: 'south-la', neighborhood: 'Central-Alameda' },
  90016: { area: 'south-la', neighborhood: 'West Adams' },
  90037: { area: 'south-la', neighborhood: 'South Los Angeles' },
  90044: { area: 'south-la', neighborhood: 'Athens and Westmont' },
  90058: { area: 'south-la', neighborhood: 'Vernon' },

  // Hollywood and Mid-City
  90004: { area: 'hollywood', neighborhood: 'Hancock Park' },
  90005: { area: 'hollywood', neighborhood: 'Koreatown' },
  90019: { area: 'hollywood', neighborhood: 'Mid-City' },
  90028: { area: 'hollywood', neighborhood: 'Hollywood' },
  90029: { area: 'hollywood', neighborhood: 'East Hollywood' },
  90036: { area: 'hollywood', neighborhood: 'Fairfax and Mid-Wilshire' },
  90038: { area: 'hollywood', neighborhood: 'Hollywood' },

  // East and Northeast Los Angeles
  90026: { area: 'east-la', neighborhood: 'Echo Park' },
  90031: { area: 'east-la', neighborhood: 'Lincoln Heights' },
  90033: { area: 'east-la', neighborhood: 'Boyle Heights' },
  90042: { area: 'east-la', neighborhood: 'Highland Park' },
  90065: { area: 'east-la', neighborhood: 'Glassell Park' },
  91205: { area: 'east-la', neighborhood: 'Glendale' },

  // Westside
  90024: { area: 'westside', neighborhood: 'Westwood' },
  90025: { area: 'westside', neighborhood: 'West Los Angeles' },
  90034: { area: 'westside', neighborhood: 'Palms' },
  90064: { area: 'westside', neighborhood: 'Rancho Park' },
  90066: { area: 'westside', neighborhood: 'Mar Vista' },
  90291: { area: 'westside', neighborhood: 'Venice' },

  // San Fernando Valley
  91331: { area: 'valley', neighborhood: 'Pacoima' },
  91335: { area: 'valley', neighborhood: 'Reseda' },
  91344: { area: 'valley', neighborhood: 'Granada Hills' },
  91401: { area: 'valley', neighborhood: 'Van Nuys' },
  91402: { area: 'valley', neighborhood: 'Panorama City' },
  91601: { area: 'valley', neighborhood: 'North Hollywood' },

  // Santa Clarita Valley
  91321: { area: 'scv', neighborhood: 'Newhall' },
  91350: { area: 'scv', neighborhood: 'Saugus' },
  91351: { area: 'scv', neighborhood: 'Canyon Country' },
  91354: { area: 'scv', neighborhood: 'Valencia' },
  91355: { area: 'scv', neighborhood: 'Valencia' },
  91381: { area: 'scv', neighborhood: 'Stevenson Ranch' },
  91384: { area: 'scv', neighborhood: 'Castaic' },
  91387: { area: 'scv', neighborhood: 'Canyon Country' },
  91390: { area: 'scv', neighborhood: 'Santa Clarita (Saugus)' },
}
