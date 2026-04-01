export const products = {
  lambrin: {
    id: 'lambrin',
    name: 'Lambrin WPC Interior',
    dimensions: { width: 0.16, length: 2.90 },
    piecesPerBox: 14,
    pricePerPiece: 84.98,
    pricePerBox: 1189.72,
    accessory: {
      name: 'CLIP de instalación',
      unitPrice: 2.62,
      boxPrice: 262.40,
      piecesPerBox: 100,
      clipsPerPiece: 3
    },
    secondaryAccessory: {
      name: 'Ángulo 3.0 m',
      unitPrice: 60.00,
      boxPrice: 3000.00,
      piecesPerBox: 50,
      length: 3.0
    },
    colors: [
      { name: 'Nogal', hex: '#8B6914' },
      { name: 'Parota', hex: '#6B3A2A' },
      { name: 'Roble', hex: '#A0784A' },
      { name: 'Cerezano', hex: '#7B3F3F' }
    ],
    inputType: 'wall'
  },
  piso: {
    id: 'piso',
    name: 'Piso SPC',
    dimensions: { width: 0.18, length: 1.22 },
    piecesPerBox: 10,
    pricePerPiece: 70.00,
    pricePerBox: 700.00,
    accessory: {
      name: 'Esquinero 2.40 m',
      unitPrice: 140.00,
      length: 2.40
    },
    colors: [
      { name: 'Nogal', hex: '#8B6914' },
      { name: 'Oxford', hex: '#5C4A3A' },
      { name: 'Roble', hex: '#A0784A' }
    ],
    inputType: 'floor'
  },
  duela: {
    id: 'duela',
    name: 'Duela PVC',
    dimensions: { width: 0.25, length: 3.0 },
    piecesPerBox: 10,
    pricePerPiece: 90.00,
    pricePerBox: 900.00,
    accessory: {
      name: 'Perfil 3.0 m',
      unitPrice: 43.23,
      boxPrice: 864.62,
      piecesPerBox: 20,
      length: 3.0
    },
    colors: [
      { name: 'Ipé', hex: '#5C3D1E' },
      { name: 'Polar', hex: '#E8E0D0' },
      { name: 'Nogal', hex: '#8B6914' },
      { name: 'Cerezo', hex: '#8B3A3A' }
    ],
    inputType: 'floor'
  }
}

export const IVA = 0.16

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount)
}
