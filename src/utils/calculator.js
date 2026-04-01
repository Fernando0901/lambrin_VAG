import { products, IVA } from '../data/products'

export const calculateMaterial = (productId, areas, color) => {
  const product = products[productId]
  if (!product) return null

  const totalArea = areas.reduce((sum, area) => sum + (area.width * area.length), 0)
  const pieceArea = product.dimensions.width * product.dimensions.length

  const piecesNeeded = Math.ceil(totalArea / pieceArea)
  const boxesNeeded = Math.ceil(piecesNeeded / product.piecesPerBox)

  let accessories = []
  let perimeterTotal = 0
  let lengthTotal = 0

  if (productId === 'lambrin') {
    const clipsTotal = piecesNeeded * product.accessory.clipsPerPiece
    const clipBoxes = Math.ceil(clipsTotal / product.accessory.piecesPerBox)

    perimeterTotal = areas.reduce((sum, area) => {
      return sum + 2 * (area.width + area.length)
    }, 0)

    const anglesNeeded = Math.ceil(perimeterTotal / product.secondaryAccessory.length)

    accessories = [
      {
        name: product.accessory.name,
        quantity: clipsTotal,
        boxes: clipBoxes,
        unitPrice: product.accessory.unitPrice,
        boxPrice: product.accessory.boxPrice,
        unitPriceWithIVA: product.accessory.unitPrice * (1 + IVA),
        boxPriceWithIVA: product.accessory.boxPrice * (1 + IVA)
      },
      {
        name: product.secondaryAccessory.name,
        quantity: anglesNeeded,
        unitPrice: product.secondaryAccessory.unitPrice,
        boxPrice: product.secondaryAccessory.boxPrice,
        unitPriceWithIVA: product.secondaryAccessory.unitPrice * (1 + IVA),
        boxPriceWithIVA: product.secondaryAccessory.boxPrice * (1 + IVA)
      }
    ]
  } else if (productId === 'piso') {
    perimeterTotal = areas.reduce((sum, area) => {
      return sum + 2 * (area.length + area.width)
    }, 0)

    const esquinerosNeeded = Math.ceil(perimeterTotal / product.accessory.length)

    accessories = [
      {
        name: product.accessory.name,
        quantity: esquinerosNeeded,
        unitPrice: product.accessory.unitPrice,
        unitPriceWithIVA: product.accessory.unitPrice * (1 + IVA)
      }
    ]
  } else if (productId === 'duela') {
    lengthTotal = areas.reduce((sum, area) => sum + area.length, 0)
    const perfilesNeeded = Math.ceil(lengthTotal / product.accessory.length)

    accessories = [
      {
        name: product.accessory.name,
        quantity: perfilesNeeded,
        unitPrice: product.accessory.unitPrice,
        boxPrice: product.accessory.boxPrice,
        unitPriceWithIVA: product.accessory.unitPrice * (1 + IVA),
        boxPriceWithIVA: product.accessory.boxPrice * (1 + IVA)
      }
    ]
  }

  const materialTotal = piecesNeeded * product.pricePerPiece
  const materialBoxTotal = boxesNeeded * product.pricePerBox
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
    perimeterTotal,
    lengthTotal,
    pieceWidth: product.dimensions.width,
    pieceLength: product.dimensions.length
  }
}

export const calculatePiecesForVisualization = (totalArea, pieceWidth, pieceLength) => {
  const pieceArea = pieceWidth * pieceLength
  const piecesNeeded = Math.ceil(totalArea / pieceArea)

  const fullPieces = Math.floor(piecesNeeded)
  const partialPieces = piecesNeeded - fullPieces > 0 ? 1 : 0

  return { fullPieces, partialPieces, totalPieces: piecesNeeded }
}
