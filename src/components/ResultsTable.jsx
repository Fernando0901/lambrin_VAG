import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency, IVA } from '../data/products'
import { usePrices } from '../context/PriceContext'

function AnimatedNumber({ value, className }) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    if (prevRef.current !== value) {
      const start = prevRef.current
      const end = value
      const duration = 300
      const startTime = performance.now()

      const animate = (now) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay(start + (end - start) * eased)
        if (progress < 1) requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
      prevRef.current = value
    }
  }, [value])

  return <span className={className}>{formatCurrency(display)}</span>
}

export default function ResultsTable({ calculationBoth, viewMode: externalViewMode, onViewModeChange }) {
  const { priceMode } = usePrices()
  const [viewMode, setViewMode] = useState('piece')

  useEffect(() => {
    if (externalViewMode !== undefined) setViewMode(externalViewMode)
  }, [externalViewMode])

  const handleViewChange = (v) => {
    setViewMode(v)
    if (onViewModeChange) onViewModeChange(v)
  }

  if (!calculationBoth) {
    return (
      <div className="bg-surface rounded-xl border border-border-subtle p-6 text-center">
        <p className="text-text-secondary">
          Agrega al menos un área para ver los resultados
        </p>
      </div>
    )
  }

  const { venta, costo, margenMonto, margenPct } = calculationBoth
  const current = priceMode === 'venta' ? venta : costo

  const bgTint = priceMode === 'costo'
    ? 'bg-red-950/10'
    : 'bg-green-950/10'

  const labelMode = priceMode === 'venta' ? 'Venta' : 'Costo'
  const headerLabel = priceMode === 'venta'
    ? 'Resultados — Precio de Venta (sin IVA / con IVA)'
    : 'Resultados — Precio de Costo (sin IVA / con IVA)'

  const materialRows = [
    {
      concept: `${current.product.name} por pieza`,
      quantity: current.piecesNeeded,
      unitPrice: current.pricePieza,
      unitPriceWithIVA: current.pricePieza * (1 + IVA),
      subtotal: current.materialTotal,
      subtotalWithIVA: current.materialTotalWithIVA
    },
    {
      concept: `${current.product.name} por caja`,
      quantity: current.boxesNeeded,
      unitPrice: current.priceCaja,
      unitPriceWithIVA: current.priceCaja * (1 + IVA),
      subtotal: current.materialBoxTotal,
      subtotalWithIVA: current.materialBoxTotalWithIVA
    }
  ]

  const accessoryRows = current.accessories.map((acc, i) => ({
    concept: acc.name,
    quantity: acc.quantity,
    unitPrice: acc.unitPrice,
    unitPriceWithIVA: acc.unitPriceWithIVA,
    subtotal: acc.quantity * acc.unitPrice,
    subtotalWithIVA: acc.quantity * acc.unitPriceWithIVA,
    hasBox: acc.boxPrice !== undefined && acc.boxPrice !== null
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-border-subtle overflow-hidden ${bgTint}`}
    >
      <div className="p-4 border-b border-border-subtle flex items-center justify-between flex-wrap gap-3 bg-surface">
        <h3 className="font-heading font-semibold text-text-primary uppercase tracking-wide">
          {headerLabel}
        </h3>
        <div className="flex items-center gap-2 bg-bg-dark rounded-lg p-1">
          <button
            onClick={() => handleViewChange('piece')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'piece'
                ? 'bg-accent text-bg-dark'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Por Pieza
          </button>
          <button
            onClick={() => handleViewChange('box')}
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

      <div className="overflow-x-auto bg-surface">
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
                {materialRows.map((row, idx) => (
                  <motion.tr
                    key={`m-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-t border-border-subtle/50 hover:bg-bg-dark/30"
                  >
                    <td className="p-3 text-text-primary">{row.concept}</td>
                    <td className="p-3 text-right text-text-secondary">{row.quantity}</td>
                    <td className="p-3 text-right text-text-secondary">{formatCurrency(row.unitPrice)}</td>
                    <td className="p-3 text-right text-text-secondary">{formatCurrency(row.unitPriceWithIVA)}</td>
                    <td className="p-3 text-right text-text-primary font-medium">{formatCurrency(row.subtotal)}</td>
                    <td className="p-3 text-right text-accent font-medium">{formatCurrency(row.subtotalWithIVA)}</td>
                  </motion.tr>
                ))}
                {accessoryRows.map((row, idx) => (
                  <motion.tr
                    key={`a-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (materialRows.length + idx) * 0.05 }}
                    className="border-t border-border-subtle/50 hover:bg-bg-dark/30"
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
                  className="border-t border-border-subtle/50 hover:bg-bg-dark/30"
                >
                  <td className="p-3 text-text-primary">{current.product.name} por caja</td>
                  <td className="p-3 text-right text-text-secondary">{current.boxesNeeded}</td>
                  <td className="p-3 text-right text-text-secondary">{formatCurrency(current.priceCaja)}</td>
                  <td className="p-3 text-right text-text-secondary">{formatCurrency(current.priceCaja * (1 + IVA))}</td>
                  <td className="p-3 text-right text-text-primary font-medium">{formatCurrency(current.materialBoxTotal)}</td>
                  <td className="p-3 text-right text-accent font-medium">{formatCurrency(current.materialBoxTotalWithIVA)}</td>
                </motion.tr>
                {accessoryRows.filter(r => r.hasBox).map((row, idx) => (
                  <motion.tr
                    key={`ab-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (idx + 1) * 0.05 }}
                    className="border-t border-border-subtle/50 hover:bg-bg-dark/30"
                  >
                    <td className="p-3 text-text-primary">{row.concept} (caja)</td>
                    <td className="p-3 text-right text-text-secondary">{Math.ceil(row.quantity / (row.piecesPerBox || 1))}</td>
                    <td className="p-3 text-right text-text-secondary">{formatCurrency(row.unitPrice)}</td>
                    <td className="p-3 text-right text-text-secondary">{formatCurrency(row.unitPriceWithIVA)}</td>
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
            <AnimatedNumber value={current.grandTotal} className="text-text-primary font-medium" />
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border-subtle/30">
            <span className="text-text-secondary">IVA (16%)</span>
            <AnimatedNumber value={current.ivaAmount} className="text-amber-400 font-medium" />
          </div>
          <motion.div
            key={current.grandTotalWithIVA}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 0.3 }}
            className={`flex justify-between items-center py-3 rounded-lg px-3 mt-2 ${
              priceMode === 'venta'
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-red-500/10 border border-red-500/30'
            }`}
          >
            <span className="text-lg font-heading font-bold text-text-primary uppercase">
              Total {labelMode} c/IVA
            </span>
            <span className={`text-2xl font-heading font-bold ${
              priceMode === 'venta' ? 'text-green-400' : 'text-red-400'
            }`}>
              <AnimatedNumber value={current.grandTotalWithIVA} className="" />
            </span>
          </motion.div>

          <div className={`mt-3 p-3 rounded-lg border ${
            priceMode === 'venta'
              ? 'bg-green-500/5 border-green-500/20'
              : 'bg-red-500/5 border-red-500/20'
          }`}>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Margen de ganancia</span>
              <span className="text-sm font-medium text-green-400">
                {formatCurrency(margenMonto)} ({margenPct.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-text-secondary">Total Costo c/IVA</span>
              <span className="text-xs text-red-400">{formatCurrency(costo.grandTotalWithIVA)}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-text-secondary">Total Venta c/IVA</span>
              <span className="text-xs text-green-400">{formatCurrency(venta.grandTotalWithIVA)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
