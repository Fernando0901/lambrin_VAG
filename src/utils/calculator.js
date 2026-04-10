import { IVA, products } from '../data/products'

/**
 * Calcula las piezas necesarias por área usando lógica de colocación física.
 *
 * LAMBRIN (wall): lado largo de la pieza → alto de la pared (area.length)
 *                 lado corto de la pieza → ancho de la pared (area.width)
 *
 * PISO (floor):   lado largo de la pieza → ancho del área (area.width) horizontal
 *                 lado corto de la pieza → largo del área (area.length) en filas
 *                 Patrón cocido: cada fila impar se desplaza medio largo de pieza
 *
 * orientation='horizontal' es el default descrito arriba.
 * orientation='vertical' intercambia la orientación de la pieza.
 */
export const calculatePlacementForArea = (area, product, orientation = 'horizontal') => {
  const isWall = product.inputType === 'wall'
  const pW = product.dimensions.width   // lado corto de la pieza
  const pL = product.dimensions.length  // lado largo de la pieza

  let pieceDimAlongWidth, pieceDimAlongLength

  if (orientation === 'horizontal') {
    if (isWall) {
      // Largo pieza → alto pared, corto pieza → ancho pared
      pieceDimAlongWidth = pW   // 0.16 m a lo ancho de la pared
      pieceDimAlongLength = pL  // 2.90 m a lo alto de la pared
    } else {
      // Largo pieza → ancho área (horizontal), corto pieza → largo área (filas)
      pieceDimAlongWidth = pL   // 1.22 m a lo ancho
      pieceDimAlongLength = pW  // 0.18 m filas a lo largo
    }
  } else {
    // Vertical: intercambia orientación de la pieza
    if (isWall) {
      pieceDimAlongWidth = pL
      pieceDimAlongLength = pW
    } else {
      pieceDimAlongWidth = pW
      pieceDimAlongLength = pL
    }
  }

  const columns = Math.ceil(area.width / pieceDimAlongWidth)
  const rows = Math.ceil(area.length / pieceDimAlongLength)
  const pieces = columns * rows

  const remainingWidth = area.width - (columns - 1) * pieceDimAlongWidth
  const remainingLength = area.length - (rows - 1) * pieceDimAlongLength

  const cutWidth = remainingWidth < pieceDimAlongWidth - 0.001 ? remainingWidth : null
  const cutLength = remainingLength < pieceDimAlongLength - 0.001 ? remainingLength : null

  return {
    columns,
    rows,
    pieces,
    pieceDimAlongWidth,
    pieceDimAlongLength,
    cutWidth,
    cutLength,
    remainingWidth,
    remainingLength
  }
}

export const calculateMaterial = (productId, areas, color, prices, priceMode = 'venta', orientation = 'horizontal') => {
  const product = products[productId]
  if (!product) return null

  const currentPrices = prices?.[productId] || product.precios
  const modo = priceMode || 'venta'

  const totalArea = areas.reduce((sum, area) => sum + (area.width * area.length), 0)

  // Calcular piezas por colocación física (filas × columnas) por cada área
  const placements = areas.map(area => calculatePlacementForArea(area, product, orientation))
  const piecesNeeded = placements.reduce((sum, p) => sum + p.pieces, 0)
  const boxesNeeded = Math.ceil(piecesNeeded / product.piecesPerBox)

  let pricePieza, priceCaja

  if (product.pricePerColorGroups && color) {
    const colorName = color.name
    const group = product.pricePerColorGroups.find(g => g.colors.includes(colorName))
    if (group) {
      const groupOverride = currentPrices.pricePerColorGroups?.find(g => g.id === group.id)
      if (groupOverride) {
        pricePieza = groupOverride.precios[modo].pieza
        priceCaja = groupOverride.precios[modo].caja
      } else {
        pricePieza = group.precios[modo].pieza
        priceCaja = group.precios[modo].caja
      }
    } else {
      pricePieza = currentPrices.precios?.[modo]?.pieza ?? product.precios.venta.pieza
      priceCaja = currentPrices.precios?.[modo]?.caja ?? product.precios.venta.caja
    }
  } else {
    pricePieza = currentPrices.precios?.[modo]?.pieza ?? product.precios.venta.pieza
    priceCaja = currentPrices.precios?.[modo]?.caja ?? product.precios.venta.caja
  }

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
  } else if (productId === 'placa') {
    lengthTotal = areas.reduce((sum, area) => sum + area.length, 0)
    const perfilUnionNeeded = Math.ceil(lengthTotal / product.accesorios.perfilUnion.largo)
    const perfilPrice = currentPrices.accesorios?.perfilUnion?.precios?.[modo]?.pieza ?? product.accesorios.perfilUnion.precios.venta.pieza

    accessories = [
      {
        name: product.accesorios.perfilUnion.nombre,
        quantity: perfilUnionNeeded,
        unitPrice: perfilPrice,
        unitPriceWithIVA: perfilPrice * (1 + IVA)
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
    pieceLength: product.dimensions.length,
    orientation,
    placements
  }
}

export const calculateBothModes = (productId, areas, color, prices, orientation = 'horizontal') => {
  const venta = calculateMaterial(productId, areas, color, prices, 'venta', orientation)
  const costo = calculateMaterial(productId, areas, color, prices, 'costo', orientation)

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
