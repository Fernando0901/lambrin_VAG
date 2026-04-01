import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency, IVA } from '../data/products'

export default function ResultsTable({ calculation, showBoxPrices }) {
  const [viewMode, setViewMode] = useState('piece')

  if (!calculation) {
    return (
      <div className="bg-surface rounded-xl border border-border-subtle p-6 text-center">
        <p className="text-text-secondary">
          Agrega al menos un área para ver los resultados
        </p>
      </div>
    )
  }

  const { product, piecesNeeded, boxesNeeded, materialTotal, materialBoxTotal, materialTotalWithIVA, materialBoxTotalWithIVA, accessories, accessoriesTotal, accessoriesTotalWithIVA, grandTotal, grandTotalWithIVA, ivaAmount } = calculation

  const materialRows = [
    {
      concept: `${product.name} por pieza`,
      quantity: piecesNeeded,
      unitPrice: product.pricePerPiece,
      unitPriceWithIVA: product.pricePerPiece * (1 + IVA),
      subtotal: materialTotal,
      subtotalWithIVA: materialTotalWithIVA
    },
    {
      concept: `${product.name} por caja`,
      quantity: boxesNeeded,
      unitPrice: product.pricePerBox,
      unitPriceWithIVA: product.pricePerBox * (1 + IVA),
      subtotal: materialBoxTotal,
      subtotalWithIVA: materialBoxTotalWithIVA
    }
  ]

  const accessoryRows = accessories.map(acc => ({
    concept: acc.name,
    quantity: acc.quantity,
    unitPrice: acc.unitPrice,
    unitPriceWithIVA: acc.unitPriceWithIVA,
    subtotal: acc.quantity * acc.unitPrice,
    subtotalWithIVA: acc.quantity * acc.unitPriceWithIVA,
    isBox: acc.boxPrice !== undefined
  }))

  const allRows = [...materialRows, ...accessoryRows]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl border border-border-subtle overflow-hidden"
    >
      <div className="p-4 border-b border-border-subtle flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-heading font-semibold text-text-primary uppercase tracking-wide">
          Resumen de Costos
        </h3>
        <div className="flex items-center gap-2 bg-bg-dark rounded-lg p-1">
          <button
            onClick={() => setViewMode('piece')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'piece'
                ? 'bg-accent text-bg-dark'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Por Pieza
          </button>
          <button
            onClick={() => setViewMode('box')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'box'
                ? 'bg-accent text-bg-dark'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Por Caja
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-dark text-text-secondary text-xs uppercase tracking-wider">
              <th className="text-left p-3 font-medium">Concepto</th>
              <th className="text-right p-3 font-medium">Cant.</th>
              <th className="text-right p-3 font-medium">P. Unit s/IVA</th>
              <th className="text-right p-3 font-medium">P. Unit c/IVA</th>
              <th className="text-right p-3 font-medium">Total s/IVA</th>
              <th className="text-right p-3 font-medium">Total c/IVA</th>
            </tr>
          </thead>
          <tbody>
            {viewMode === 'piece' ? (
              <>
                {materialRows.map((row, index) => (
                  <motion.tr
                    key={`piece-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-border-subtle/50 hover:bg-bg-dark/50"
                  >
                    <td className="p-3 text-text-primary">{row.concept}</td>
                    <td className="p-3 text-right text-text-secondary">{row.quantity}</td>
                    <td className="p-3 text-right text-text-secondary">{formatCurrency(row.unitPrice)}</td>
                    <td className="p-3 text-right text-text-secondary">{formatCurrency(row.unitPriceWithIVA)}</td>
                    <td className="p-3 text-right text-text-primary font-medium">{formatCurrency(row.subtotal)}</td>
                    <td className="p-3 text-right text-accent font-medium">{formatCurrency(row.subtotalWithIVA)}</td>
                  </motion.tr>
                ))}
                {accessoryRows.map((row, index) => (
                  <motion.tr
                    key={`acc-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (materialRows.length + index) * 0.05 }}
                    className="border-t border-border-subtle/50 hover:bg-bg-dark/50"
                  >
                    <td className="p-3 text-text-primary">{row.concept}</td>
                    <td className="p-3 text-right text-text-secondary">{row.quantity}</td>
                    <td className="p-3 text-right text-text-secondary">{formatCurrency(row.unitPrice)}</td>
                    <td className="p-3 text-right text-text-secondary">{formatCurrency(row.unitPriceWithIVA)}</td>
                    <td className="p-3 text-right text-text-primary font-medium">{formatCurrency(row.subtotal)}</td>
                    <td className="p-3 text-right text-accent font-medium">{formatCurrency(row.subtotalWithIVA)}</td>
                  </motion.tr>
                ))}
              </>
            ) : (
              <>
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border-t border-border-subtle/50 hover:bg-bg-dark/50"
                >
                  <td className="p-3 text-text-primary">{product.name} por caja</td>
                  <td className="p-3 text-right text-text-secondary">{boxesNeeded}</td>
                  <td className="p-3 text-right text-text-secondary">{formatCurrency(product.pricePerBox)}</td>
                  <td className="p-3 text-right text-text-secondary">{formatCurrency(product.pricePerBox * (1 + IVA))}</td>
                  <td className="p-3 text-right text-text-primary font-medium">{formatCurrency(materialBoxTotal)}</td>
                  <td className="p-3 text-right text-accent font-medium">{formatCurrency(materialBoxTotalWithIVA)}</td>
                </motion.tr>
                {accessoryRows.filter(r => r.isBox).map((row, index) => (
                  <motion.tr
                    key={`acc-box-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + 1) * 0.05 }}
                    className="border-t border-border-subtle/50 hover:bg-bg-dark/50"
                  >
                    <td className="p-3 text-text-primary">{row.concept} (caja)</td>
                    <td className="p-3 text-right text-text-secondary">{Math.ceil(row.quantity / (product.id === 'lambrin' ? product.accessory.piecesPerBox : product.accessory.piecesPerBox))}</td>
                    <td className="p-3 text-right text-text-secondary">{formatCurrency(row.isBox ? row.unitPrice * (product.accessory?.piecesPerBox || 20) : row.unitPrice)}</td>
                    <td className="p-3 text-right text-text-secondary">{formatCurrency(row.isBox ? row.unitPriceWithIVA * (product.accessory?.piecesPerBox || 20) : row.unitPriceWithIVA)}</td>
                    <td className="p-3 text-right text-text-primary font-medium">{formatCurrency(row.subtotal)}</td>
                    <td className="p-3 text-right text-accent font-medium">{formatCurrency(row.subtotalWithIVA)}</td>
                  </motion.tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border-subtle bg-bg-dark/50">
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-border-subtle/30">
            <span className="text-text-secondary">Subtotal s/IVA</span>
            <span className="text-text-primary font-medium">{formatCurrency(grandTotal)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border-subtle/30">
            <span className="text-text-secondary">IVA (16%)</span>
            <span className="text-amber-400 font-medium">{formatCurrency(ivaAmount)}</span>
          </div>
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 0.3 }}
            className="flex justify-between items-center py-3 bg-accent/10 rounded-lg px-3 mt-2"
          >
            <span className="text-lg font-heading font-bold text-text-primary uppercase">Total c/IVA</span>
            <span className="text-2xl font-heading font-bold text-accent">{formatCurrency(grandTotalWithIVA)}</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
