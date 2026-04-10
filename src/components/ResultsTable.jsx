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

  const bgTint = priceMode === 'costo' ? 'bg-red-950/10' : 'bg-green-950/10'
  const labelMode = priceMode === 'venta' ? 'Venta' : 'Costo'
  const headerLabel = priceMode === 'venta'
    ? 'Resultados — Precio de Venta (sin IVA / con IVA)'
    : 'Resultados — Precio de Costo (sin IVA / con IVA)'

  // Desglose de material
  const { fullBoxes, loosePieces, piecesPerBox, piecesNeeded, boxesNeeded } = current

  // Filas de material según modo de vista
  const materialRows = []
  if (viewMode === 'piece') {
    materialRows.push({
      concept: `${current.product.name} (pieza)`,
      quantity: piecesNeeded,
      unit: 'pzas',
      unitPrice: current.pricePieza,
      unitPriceWithIVA: current.pricePieza * (1 + IVA),
      subtotal: current.materialTotal,
      subtotalWithIVA: current.materialTotalWithIVA
    })
  } else {
    // Por caja: mostrar cajas completas + piezas sueltas
    if (fullBoxes > 0) {
      materialRows.push({
        concept: `${current.product.name} (caja ×${piecesPerBox} pzas)`,
        quantity: fullBoxes,
        unit: fullBoxes === 1 ? 'caja' : 'cajas',
        unitPrice: current.priceCaja,
        unitPriceWithIVA: current.priceCaja * (1 + IVA),
        subtotal: fullBoxes * current.priceCaja,
        subtotalWithIVA: fullBoxes * current.priceCaja * (1 + IVA)
      })
    }
    if (loosePieces > 0) {
      materialRows.push({
        concept: `${current.product.name} — piezas sueltas`,
        quantity: loosePieces,
        unit: loosePieces === 1 ? 'pza' : 'pzas',
        unitPrice: current.pricePieza,
        unitPriceWithIVA: current.pricePieza * (1 + IVA),
        subtotal: loosePieces * current.pricePieza,
        subtotalWithIVA: loosePieces * current.pricePieza * (1 + IVA),
        isExtra: true
      })
    }
  }

  // Accesorios
  const accessoryRows = current.accessories.map((acc) => {
    const accFullBoxes = acc.piecesPerBox ? Math.floor(acc.quantity / acc.piecesPerBox) : 0
    const accLoose = acc.piecesPerBox ? acc.quantity - accFullBoxes * acc.piecesPerBox : acc.quantity

    if (viewMode === 'box' && acc.boxPrice != null && acc.piecesPerBox) {
      const rows = []
      if (accFullBoxes > 0) {
        rows.push({
          concept: `${acc.name} (caja ×${acc.piecesPerBox})`,
          quantity: accFullBoxes,
          unit: accFullBoxes === 1 ? 'caja' : 'cajas',
          unitPrice: acc.boxPrice,
          unitPriceWithIVA: acc.boxPriceWithIVA,
          subtotal: accFullBoxes * acc.boxPrice,
          subtotalWithIVA: accFullBoxes * acc.boxPriceWithIVA
        })
      }
      if (accLoose > 0) {
        rows.push({
          concept: `${acc.name} — sueltos`,
          quantity: accLoose,
          unit: 'pzas',
          unitPrice: acc.unitPrice,
          unitPriceWithIVA: acc.unitPriceWithIVA,
          subtotal: accLoose * acc.unitPrice,
          subtotalWithIVA: accLoose * acc.unitPriceWithIVA,
          isExtra: true
        })
      }
      if (rows.length === 0) {
        rows.push({
          concept: acc.name,
          quantity: acc.quantity,
          unit: 'pzas',
          unitPrice: acc.unitPrice,
          unitPriceWithIVA: acc.unitPriceWithIVA,
          subtotal: acc.quantity * acc.unitPrice,
          subtotalWithIVA: acc.quantity * acc.unitPriceWithIVA
        })
      }
      return rows
    }

    return [{
      concept: acc.name,
      quantity: acc.quantity,
      unit: 'pzas',
      unitPrice: acc.unitPrice,
      unitPriceWithIVA: acc.unitPriceWithIVA,
      subtotal: acc.quantity * acc.unitPrice,
      subtotalWithIVA: acc.quantity * acc.unitPriceWithIVA
    }]
  }).flat()

  const allRows = [...materialRows, ...accessoryRows]
  const subtotalSinIVA = allRows.reduce((sum, r) => sum + r.subtotal, 0)
  const subtotalConIVA = subtotalSinIVA * (1 + IVA)
  const ivaAmount = subtotalConIVA - subtotalSinIVA

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-border-subtle overflow-hidden ${bgTint}`}
    >
      <div className="p-4 border-b border-border-subtle flex items-center justify-between flex-wrap gap-3 bg-surface">
        <h3 className="font-heading font-semibold text-text-primary uppercase tracking-wide text-sm">
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

      {/* Resumen de material rápido */}
      <div className="bg-surface px-4 py-3 border-b border-border-subtle/50">
        <div className="flex items-center gap-4 flex-wrap text-xs">
          <span className="text-text-secondary">
            Total: <span className="text-accent font-bold text-sm">{piecesNeeded} piezas</span>
          </span>
          <span className="text-text-secondary">
            = <span className="text-text-primary font-medium">{fullBoxes} caja{fullBoxes !== 1 ? 's' : ''}</span>
            {loosePieces > 0 && (
              <> + <span className="text-amber-400 font-medium">{loosePieces} pieza{loosePieces !== 1 ? 's' : ''} suelta{loosePieces !== 1 ? 's' : ''}</span></>
            )}
          </span>
          <span className="text-text-secondary">
            ({piecesPerBox} pzas/caja)
          </span>
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
            {allRows.map((row, idx) => (
              <motion.tr
                key={`row-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`border-t border-border-subtle/50 hover:bg-bg-dark/30 ${row.isExtra ? 'bg-amber-500/5' : ''}`}
              >
                <td className="p-3 text-text-primary text-sm">
                  {row.concept}
                  {row.isExtra && <span className="ml-1 text-[10px] text-amber-400 font-medium">(extra)</span>}
                </td>
                <td className="p-3 text-right text-text-secondary text-sm">{row.quantity} {row.unit}</td>
                <td className="p-3 text-right text-text-secondary text-sm">{formatCurrency(row.unitPrice)}</td>
                <td className="p-3 text-right text-text-secondary text-sm">{formatCurrency(row.unitPriceWithIVA)}</td>
                <td className="p-3 text-right text-text-primary font-medium text-sm">{formatCurrency(row.subtotal)}</td>
                <td className="p-3 text-right text-accent font-medium text-sm">{formatCurrency(row.subtotalWithIVA)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="border-t border-border-subtle bg-bg-dark/50">
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-border-subtle/30">
            <span className="text-text-secondary">Subtotal s/IVA</span>
            <AnimatedNumber value={subtotalSinIVA} className="text-text-primary font-medium" />
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border-subtle/30">
            <span className="text-text-secondary">IVA (16%)</span>
            <AnimatedNumber value={ivaAmount} className="text-amber-400 font-medium" />
          </div>
          <motion.div
            key={subtotalConIVA}
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
              <AnimatedNumber value={subtotalConIVA} className="" />
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
