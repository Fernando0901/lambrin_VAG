const MARGIN_MULTIPLIER = 1.30

const buildPrecios = (costoPieza, costoCaja) => ({
  costo: {
    pieza: costoPieza,
    caja: costoCaja
  },
  venta: {
    pieza: parseFloat((costoPieza * MARGIN_MULTIPLIER).toFixed(2)),
    caja: parseFloat((costoCaja * MARGIN_MULTIPLIER).toFixed(2))
  }
})

export const products = {
  lambrin: {
    id: 'lambrin',
    name: 'Lambrin WPC Interior',
    dimensions: { width: 0.16, length: 2.90 },
    piecesPerBox: 14,
    precios: buildPrecios(84.98, 1189.72),
    accesorios: {
      clip: {
        nombre: 'Clip de instalación',
        porPieza: 3,
        piezasPorCaja: 100,
        precios: buildPrecios(2.62, 262.40)
      },
      angulo: {
        nombre: 'Ángulo 3.0 m',
        largo: 3.0,
        piezasPorCaja: 50,
        precios: buildPrecios(60.00, 3000.00)
      }
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
    precios: buildPrecios(70.00, 700.00),
    accesorios: {
      esquinero: {
        nombre: 'Esquinero 2.40 m',
        largo: 2.40,
        precios: {
          costo: { pieza: 140.00, caja: null },
          venta: { pieza: parseFloat((140.00 * MARGIN_MULTIPLIER).toFixed(2)), caja: null }
        }
      }
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
    precios: buildPrecios(90.00, 900.00),
    accesorios: {
      perfil: {
        nombre: 'Perfil 3.0 m',
        largo: 3.0,
        piezasPorCaja: 20,
        precios: buildPrecios(43.23, 864.62)
      }
    },
    colors: [
      { name: 'Ipé', hex: '#5C3D1E' },
      { name: 'Polar', hex: '#E8E0D0' },
      { name: 'Nogal', hex: '#8B6914' },
      { name: 'Cerezo', hex: '#8B3A3A' }
    ],
    inputType: 'floor'
  },
  placa: {
    id: 'placa',
    name: 'Placa Mármol PVC',
    dimensions: { width: 1.22, length: 2.44 },
    piecesPerBox: 1,
    precios: {
      costo: { pieza: null, caja: null },
      venta: { pieza: null, caja: null }
    },
    pricePerColor: true,
    colorPrices: {
      '396.55': ['ÁGATA', 'GRAFITO', 'ÓNIX', 'PERLA', 'ZAFIRO'],
      '456.90': ['AURORA', 'BLACK GOLD', 'PERLA GOLD', 'NEBBIA', 'SIENNA', 'OBSIDIA']
    },
    accesorios: {
      perfilUnion: {
        nombre: 'Perfil Union 2.45 m',
        largo: 2.45,
        piezasPorCaja: 1,
        precios: {
          costo: { pieza: 60.00, caja: null },
          venta: { pieza: parseFloat((60.00 * MARGIN_MULTIPLIER).toFixed(2)), caja: null }
        }
      }
    },
    colors: [
      { name: 'ÁGATA', hex: '#B5B5B5' },
      { name: 'GRAFITO', hex: '#4A4A4A' },
      { name: 'ÓNIX', hex: '#2D2D2D' },
      { name: 'PERLA', hex: '#F0EDE8' },
      { name: 'ZAFIRO', hex: '#2E4A6E' },
      { name: 'AURORA', hex: '#D4C5A9' },
      { name: 'BLACK GOLD', hex: '#1C1C1C' },
      { name: 'PERLA GOLD', hex: '#C9A96E' },
      { name: 'NEBBIA', hex: '#9FA5A8' },
      { name: 'SIENNA', hex: '#8B4513' },
      { name: 'OBSIDIA', hex: '#0D0D0D' }
    ],
    inputType: 'wall'
  }
}

export const IVA = 0.16

export const STORAGE_KEY = 'vag_precios_v1'

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount || 0)
}

export const getDefaultPrices = () => {
  const result = {}
  for (const [pid, product] of Object.entries(products)) {
    result[pid] = {
      precios: JSON.parse(JSON.stringify(product.precios)),
      accesorios: {}
    }
    for (const [aid, acc] of Object.entries(product.accesorios || {})) {
      result[pid].accesorios[aid] = {
        precios: JSON.parse(JSON.stringify(acc.precios))
      }
    }
  }
  return result
}
