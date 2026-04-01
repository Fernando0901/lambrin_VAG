import { IVA, products } from '../data/products'

export const calculateMaterial = (productId, areas, color, prices, priceMode = 'venta') => {
  const product = products[productId]
  if (!product) return null

  const currentPrices = prices?.[productId] || product.precios
  const modo = priceMode || 'venta'

  const totalArea = areas.reduce((sum, area) => sum + (area.width * area.length), 0)
  const pieceArea = product.dimensions.width * product.dimensions.length

  const piecesNeeded = Math.ceil(totalArea / pieceArea)
  const boxesNeeded = Math.ceil(piecesNeeded / product.piecesPerBox)

  const pricePieza = currentPrices.precios?.[modo]?.pieza ?? product.precios.venta.pieza
  const priceCaja = currentPrices.precios?.[modo]?.caja ?? product.precios.venta.caja

  let accessories = []
  let perimeterTotal = 0
  let lengthTotal = 0

  if (productId === 'lambrin') {
    const clipsTotal = piecesNeeded * product.accesorios.clip.porPieza
    const clipBoxes = Math.ceil(clipsTotal / product.accesorios.clip.piezasPorCaja)
    const clipPricePieza = currentPrices.accesorios?.clip?.precios?.[modo]?.pieza ?? product.accesorios.clip.precios.venta.pieza
    const clipPriceCaja = currentPrices.accesorios?.clip?.precios?.[modo]?.caja ?? product.accesorios.clip.precios.venta.caja

    perimeterTotal = areas.reduce((sum, area) => sum + 2 * (area.width + area.length), 0)
    const anglesNeeded = Math.ceil(perimeterTotal / product.accesorios.angulo.largo)
    const anglePricePieza = currentPrices.accesorios?.angulo?.precios?.[modo]?.pieza ?? product.accesorios.angulo.precios.venta.pieza
    const anglePriceCaja = currentPrices.accesorios?.angulo?.precios?.[modo]?.caja ?? product.accesorios.angulo.precios.venta.caja

    accessories = [
      {
        name: product.accesorios.clip.nombre,
        quantity: clipsTotal,
        boxes: clipBoxes,
        unitPrice: clipPricePieza,
        boxPrice: clipPriceCaja,
        unitPriceWithIVA: clipPricePieza * (1 + IVA),
        boxPriceWithIVA: clipPriceCaja * (1 + IVA),
        piecesPerBox: product.accesorios.clip.piezasPorCaja
      },
      {
        name: product.accesorios.angulo.nombre,
        quantity: anglesNeeded,
        unitPrice: anglePricePieza,
        boxPrice: anglePriceCaja,
        unitPriceWithIVA: anglePricePieza * (1 + IVA),
        boxPriceWithIVA: anglePriceCaja * (1 + IVA),
        piecesPerBox: product.accesorios.angulo.piezasPorCaja
      }
    ]
  } else if (productId === 'piso') {
    perimeterTotal = areas.reduce((sum, area) => sum + 2 * (area.length + area.width), 0)
    const esquinerosNeeded = Math.ceil(perimeterTotal / product.accesorios.esquinero.largo)
    const esquineroPrice = currentPrices.accesorios?.esquinero?.precios?.[modo]?.pieza ?? product.accesorios.esquinero.precios.venta.pieza

    accessories = [
      {
        name: product.accesorios.esquinero.nombre,
        quantity: esquinerosNeeded,
        unitPrice: esquineroPrice,
        unitPriceWithIVA: esquineroPrice * (1 + IVA)
      }
    ]
  } else if (productId === 'duela') {
    lengthTotal = areas.reduce((sum, area) => sum + area.length, 0)
    const perfilesNeeded = Math.ceil(lengthTotal / product.accesorios.perfil.largo)
    const perfilPricePieza = currentPrices.accesorios?.perfil?.precios?.[modo]?.pieza ?? product.accesorios.perfil.precios.venta.pieza
    const perfilPriceCaja = currentPrices.accesorios?.perfil?.precios?.[modo]?.caja ?? product.accesorios.perfil.precios.venta.caja

    accessories = [
      {
        name: product.accesorios.perfil.nombre,
        quantity: perfilesNeeded,
        unitPrice: perfilPricePieza,
        boxPrice: perfilPriceCaja,
        unitPriceWithIVA: perfilPricePieza * (1 + IVA),
        boxPriceWithIVA: perfilPriceCaja * (1 + IVA),
        piecesPerBox: product.accesorios.perfil.piezasPorCaja
      }
    ]
  }

  const materialTotal = piecesNeeded * pricePieza
  const materialBoxTotal = boxesNeeded * priceCaja
  const materialTotalWithIVA = materialTotal * (1 + IVA)
  const materialBoxTotalWithIVA = materialBoxTotal * (1 + IVA)

  const accessoriesTotal = accessories.reduce((sum, acc) => sum + acc.quantity * acc.unitPrice, 0)
  const accessoriesTotalWithIVA = accessoriesTotal * (1 + IVA)

  const grandTotal = materialTotal + accessoriesTotal
  const grandTotalWithIVA = grandTotal * (1 + IVA)
  const ivaAmount = grandTotalWithIVA - grandTotal

  return {
    product: { ...product, selectedColor: color },
    areas,
    totalArea,
    piecesNeeded,
    boxesNeeded,
    pricePieza,
    priceCaja,
    materialTotal,
    materialBoxTotal,
    materialTotalWithIVA,
    materialBoxTotalWithIVA,
    accessories,
    accessoriesTotal,
    accessoriesTotalWithIVA,
    grandTotal,
    grandTotalWithIVA,
    ivaAmount,
    priceMode: modo,
    perimeterTotal,
    lengthTotal,
    pieceWidth: product.dimensions.width,
    pieceLength: product.dimensions.length
  }
}

export const calculateBothModes = (productId, areas, color, prices) => {
  const venta = calculateMaterial(productId, areas, color, prices, 'venta')
  const costo = calculateMaterial(productId, areas, color, prices, 'costo')

  if (!venta || !costo) return null

  const margenMonto = venta.grandTotal - costo.grandTotal
  const margenPct = costo.grandTotal > 0 ? (margenMonto / costo.grandTotal) * 100 : 0

  return {
    venta,
    costo,
    margenMonto,
    margenPct
  }
}

export const calculatePiecesForVisualization = (totalArea, pieceWidth, pieceLength) => {
  const pieceArea = pieceWidth * pieceLength
  const piecesNeeded = Math.ceil(totalArea / pieceArea)
  const fullPieces = Math.floor(piecesNeeded)
  const partialPieces = piecesNeeded - fullPieces > 0 ? 1 : 0
  return { fullPieces, partialPieces, totalPieces: piecesNeeded }
}
