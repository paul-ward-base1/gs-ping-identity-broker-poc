export interface CARegion {
  isocode: string
  isocodeShort: string
  name: string
}

export const CA_REGIONS: CARegion[] = [
  { isocode: 'CA-AB', isocodeShort: 'AB', name: 'Alberta' },
  { isocode: 'CA-BC', isocodeShort: 'BC', name: 'British Columbia' },
  { isocode: 'CA-MB', isocodeShort: 'MB', name: 'Manitoba' },
  { isocode: 'CA-NB', isocodeShort: 'NB', name: 'New Brunswick' },
  { isocode: 'CA-NL', isocodeShort: 'NL', name: 'Newfoundland and Labrador' },
  { isocode: 'CA-NT', isocodeShort: 'NT', name: 'Northwest Territories' },
  { isocode: 'CA-NS', isocodeShort: 'NS', name: 'Nova Scotia' },
  { isocode: 'CA-NU', isocodeShort: 'NU', name: 'Nunavut' },
  { isocode: 'CA-ON', isocodeShort: 'ON', name: 'Ontario' },
  { isocode: 'CA-PE', isocodeShort: 'PE', name: 'Prince Edward Island' },
  { isocode: 'CA-QC', isocodeShort: 'QC', name: 'Quebec' },
  { isocode: 'CA-SK', isocodeShort: 'SK', name: 'Saskatchewan' },
  { isocode: 'CA-YT', isocodeShort: 'YT', name: 'Yukon Territories' },
]
