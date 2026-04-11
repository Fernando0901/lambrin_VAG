import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency, IVA } from '../data/products'
import { usePrices } from '../context/PriceContext'

/* ── helpers ───────────────────────────────────────────────── */
function AnimatedNumber({ value, className }) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)
  useEffect(() => {
    if (prevRef.current !== value) {
      const start = prevRef.current; const end = value
      const dur = 300; const t0 = performance.now()
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1)
        setDisplay(start + (end - start) * (1 - Math.pow(1 - p, 3)))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      prevRef.current = value
    }
  }, [value])
  return <span className={className}>{formatCurrency(display)}</span>
}

function Pill({ active, children, onClick, badge }) {
  return (
    <button onClick={onClick}
      className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
        active ? 'bg-accent text-bg-dark shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
      {children}
      {badge && (
        <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 rounded text-[8px] leading-none font-bold bg-green-500 text-white">
          {badge}
        </span>
      )}
    </button>
  )
}

/* ── Main ──────────────────────────────────────────────────── */
export default function ResultsTable({
  calculationBoth,
  includeAccessories = true,
  onToggleAccessories,
  discount = 0,
  onDiscountChange,
  clientName = '',
  onClientNameChange
}) {
  const { priceMode } = usePrices()
  const [viewMode, setViewMode] = useState('desglose')

  if (!calculationBoth) {
    return (
      <div className="bg-surface rounded-xl border border-border-subtle p-6 text-center">
        <p className="text-text-secondary">Agrega al menos un área para ver los resultados</p>
      </div>
    )
  }

  const { venta, costo, margenMonto, margenPct } = calculationBoth
  const current = priceMode === 'venta' ? venta : costo
  const bgTint = priceMode === 'costo' ? 'bg-red-950/10' : 'bg-green-950/10'
  const labelMode = priceMode === 'venta' ? 'Venta' : 'Costo'

  const {
    fullBoxes, loosePieces, piecesPerBox, piecesNeeded, boxesNeeded,
    pricePieza, priceCaja
  } = current

  const hasAccessories = current.accessories.length > 0
  const discountPct = Math.max(0, Math.min(100, discount || 0))
  const discountMultiplier = 1 - discountPct / 100

  /* ─── build rows ─── */
  const { materialRows, accessoryRows } = useMemo(() => {
    const mat = []
    const acc = []

    if (viewMode === 'piece') {
      mat.push({
        concept: current.product.name,
        detail: `${piecesNeeded} pza × ${formatCurrency(pricePieza)}`,
        quantity: piecesNeeded, unit: 'pzas',
        unitPrice: pricePieza, total: piecesNeeded * pricePieza
      })
    } else if (viewMode === 'box') {
      mat.push({
        concept: current.product.name,
        detail: `${boxesNeeded} caja${boxesNeeded !== 1 ? 's' : ''} de ${piecesPerBox} pzas (${boxesNeeded * piecesPerBox} pzas cubiertas)`,
        quantity: boxesNeeded,
        unit: boxesNeeded === 1 ? 'caja' : 'cajas',
        unitPrice: priceCaja, total: boxesNeeded * priceCaja
      })
    } else {
      if (fullBoxes > 0) {
        mat.push({
          concept: `${current.product.name} — Caja`,
          detail: `${piecesPerBox} pzas/caja`,
          quantity: fullBoxes,
          unit: fullBoxes === 1 ? 'caja' : 'cajas',
          unitPrice: priceCaja, total: fullBoxes * priceCaja
        })
      }
      if (loosePieces > 0) {
        mat.push({
          concept: `${current.product.name} — Pieza suelta`,
          detail: 'Unidades adicionales',
          quantity: loosePieces, unit: 'pzas',
          unitPrice: pricePieza, total: loosePieces * pricePieza,
          isExtra: true
        })
      }
      if (fullBoxes === 0 && loosePieces === 0) {
        mat.push({
          concept: current.product.name, detail: '',
          quantity: piecesNeeded, unit: 'pzas',
          unitPrice: pricePieza, total: piecesNeeded * pricePieza
        })
      }
    }

    if (includeAccessories) {
      current.accessories.forEach(a => {
        const aFull = a.piecesPerBox ? Math.floor(a.quantity / a.piecesPerBox) : 0
        const aLoose = a.piecesPerBox ? a.quantity - aFull * a.piecesPerBox : a.quantity

        if (viewMode === 'box' && a.boxPrice != null && a.piecesPerBox) {
          const boxes = Math.ceil(a.quantity / a.piecesPerBox)
          acc.push({ concept: a.name, detail: `${a.piecesPerBox} pzas/caja`, quantity: boxes, unit: boxes === 1 ? 'caja' : 'cajas', unitPrice: a.boxPrice, total: boxes * a.boxPrice })
        } else if (viewMode === 'desglose' && a.boxPrice != null && a.piecesPerBox) {
          if (aFull > 0) acc.push({ concept: `${a.name} — Caja`, detail: `${a.piecesPerBox} pzas/caja`, quantity: aFull, unit: aFull === 1 ? 'caja' : 'cajas', unitPrice: a.boxPrice, total: aFull * a.boxPrice })
          if (aLoose > 0) acc.push({ concept: `${a.name} — Suelto`, detail: '', quantity: aLoose, unit: 'pzas', unitPrice: a.unitPrice, total: aLoose * a.unitPrice, isExtra: true })
          if (aFull === 0 && aLoose === 0) acc.push({ concept: a.name, detail: '', quantity: a.quantity, unit: 'pzas', unitPrice: a.unitPrice, total: a.quantity * a.unitPrice })
        } else {
          acc.push({ concept: a.name, detail: '', quantity: a.quantity, unit: 'pzas', unitPrice: a.unitPrice, total: a.quantity * a.unitPrice })
        }
      })
    }
    return { materialRows: mat, accessoryRows: acc }
  }, [viewMode, current, includeAccessories, fullBoxes, loosePieces, piecesNeeded, boxesNeeded, pricePieza, priceCaja, piecesPerBox])

  const allRows = [...materialRows, ...accessoryRows]
  const subtotalSinIVA = allRows.reduce((s, r) => s + r.total, 0)

  const descuentoMonto = subtotalSinIVA * (discountPct / 100)
  const subtotalConDescuento = subtotalSinIVA - descuentoMonto
  const ivaAmount = subtotalConDescuento * IVA
  const totalConIVA = subtotalConDescuento + ivaAmount

  // m² cost
  const costPerM2 = current.totalArea > 0 ? totalConIVA / current.totalArea : 0

  // Waste / efficiency
  const piecesFromBoxes = boxesNeeded * piecesPerBox
  const wastePieces = piecesFromBoxes - piecesNeeded
  const wasteM2 = wastePieces * current.pieceWidth * current.pieceLength
  const efficiencyPct = current.totalArea > 0
    ? ((current.totalArea / (current.totalArea + wasteM2)) * 100).toFixed(1) : '100.0'

  // Price comparison across the 3 modes
  const priceByPiece = piecesNeeded * pricePieza
  const priceByBox = boxesNeeded * priceCaja
  const priceDesglose = (fullBoxes * priceCaja) + (loosePieces * pricePieza)
  const cheapest = Math.min(priceByPiece, priceByBox, priceDesglose)
  const cheapestLabel = cheapest === priceDesglose ? 'desglose'
    : cheapest === priceByPiece ? 'piece' : 'box'

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-border-subtle overflow-hidden ${bgTint}`}>

      {/* ── Header + View Selector ── */}
      <div className="p-4 border-b border-border-subtle bg-surface">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h3 className="font-heading font-semibold text-text-primary uppercase tracking-wide text-sm">
            Resultados — {labelMode}
          </h3>
          <span className="text-[10px] text-text-secondary px-2 py-0.5 rounded bg-bg-dark border border-border-subtle">
            sin IVA / con IVA
          </span>
        </div>
        <div className="flex items-center gap-1 bg-bg-dark rounded-lg p-1">
          <Pill active={viewMode === 'piece'} onClick={() => setViewMode('piece')}
            badge={cheapestLabel === 'piece' ? '$' : null}>
            Por Pieza
          </Pill>
          <Pill active={viewMode === 'box'} onClick={() => setViewMode('box')}
            badge={cheapestLabel === 'box' ? '$' : null}>
            Solo Cajas
          </Pill>
          <Pill active={viewMode === 'desglose'} onClick={() => setViewMode('desglose')}
            badge={cheapestLabel === 'desglose' ? '$' : null}>
            Cajas + Sueltas
          </Pill>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="bg-surface border-b border-border-subtle/50 px-4 py-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center">
            <p className="text-lg font-heading font-bold text-accent">{piecesNeeded}</p>
            <p className="text-[10px] text-text-secondary">piezas totales</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-heading font-bold text-text-primary">
              {fullBoxes}<span className="text-text-secondary text-xs font-normal"> caja{fullBoxes !== 1 ? 's' : ''}</span>
              {loosePieces > 0 && (
                <span className="text-amber-400"> +{loosePieces}<span className="text-text-secondary text-xs font-normal"> pza{loosePieces !== 1 ? 's' : ''}</span></span>
              )}
            </p>
            <p className="text-[10px] text-text-secondary">{piecesPerBox} pzas/caja</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-heading font-bold text-blue-400">{efficiencyPct}%</p>
            <p className="text-[10px] text-text-secondary">aprovechamiento</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-heading font-bold text-purple-400">{formatCurrency(costPerM2)}</p>
            <p className="text-[10px] text-text-secondary">costo / m²</p>
          </div>
        </div>

        {/* Price comparison bar */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { key: 'piece', label: 'Pieza', val: priceByPiece },
            { key: 'box', label: 'Cajas', val: priceByBox },
            { key: 'desglose', label: 'Cajas+Sueltas', val: priceDesglose }
          ].map(opt => {
            const isCheapest = opt.key === cheapestLabel
            const diff = opt.val - cheapest
            return (
              <button key={opt.key} onClick={() => setViewMode(opt.key)}
                className={`p-2 rounded-lg border text-center transition-all text-xs ${
                  viewMode === opt.key
                    ? 'border-accent bg-accent/10'
                    : isCheapest
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-border-subtle bg-bg-dark/30 hover:border-border-subtle/80'
                }`}>
                <p className="text-text-secondary text-[10px] uppercase">{opt.label}</p>
                <p className={`font-heading font-bold ${isCheapest ? 'text-green-400' : 'text-text-primary'}`}>
                  {formatCurrency(opt.val)}
                </p>
                {diff > 0.5 && (
                  <p className="text-[9px] text-red-400/70">+{formatCurrency(diff)}</p>
                )}
                {isCheapest && (
                  <p className="text-[9px] text-green-400 font-medium">Mejor precio</p>
                )}
              </button>
            )
          })}
        </div>

        {/* Waste tip */}
        {viewMode === 'box' && wastePieces > 0 && (
          <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Al comprar <strong>{boxesNeeded} cajas completas</strong> obtienes {piecesFromBoxes} pzas — te sobran <strong>{wastePieces} pieza{wastePieces !== 1 ? 's' : ''}</strong> ({wasteM2.toFixed(2)} m²).
            </span>
          </div>
        )}

        {viewMode !== 'desglose' && loosePieces > 0 && priceDesglose < (viewMode === 'piece' ? priceByPiece : priceByBox) - 0.5 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>
              Cambia a <strong className="cursor-pointer underline" onClick={() => setViewMode('desglose')}>Cajas + Sueltas</strong> y ahorra{' '}
              <strong>{formatCurrency((viewMode === 'piece' ? priceByPiece : priceByBox) - priceDesglose)}</strong> sin IVA.
            </span>
          </motion.div>
        )}
      </div>

      {/* ── Accessories Toggle ── */}
      {hasAccessories && (
        <div className="bg-surface px-4 py-2.5 border-b border-border-subtle/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-text-secondary">Incluir herrajes y accesorios</span>
          </div>
          <button onClick={onToggleAccessories}
            className={`relative w-10 h-5 rounded-full transition-colors ${includeAccessories ? 'bg-accent' : 'bg-border-subtle'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${includeAccessories ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>
      )}

      {/* ── Discount ── */}
      {onDiscountChange && (
        <div className="bg-surface px-4 py-2.5 border-b border-border-subtle/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="text-xs text-text-secondary">Descuento</span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number" min="0" max="100" step="1"
              value={discount || ''}
              onChange={e => onDiscountChange(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-16 px-2 py-1 text-right text-sm bg-bg-dark border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent"
            />
            <span className="text-xs text-text-secondary">%</span>
            {discountPct > 0 && (
              <span className="text-xs text-green-400 ml-1">-{formatCurrency(descuentoMonto)}</span>
            )}
          </div>
        </div>
      )}

      {/* ── Client Name ── */}
      {onClientNameChange && (
        <div className="bg-surface px-4 py-2.5 border-b border-border-subtle/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs text-text-secondary">Cliente</span>
          </div>
          <input
            type="text"
            value={clientName}
            onChange={e => onClientNameChange(e.target.value)}
            placeholder="Nombre del cliente"
            className="w-44 px-2 py-1 text-sm bg-bg-dark border border-border-subtle rounded text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent"
          />
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto bg-surface">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-dark text-text-secondary text-[10px] uppercase tracking-wider">
              <th className="text-left p-3 font-medium">Concepto</th>
              <th className="text-right p-3 font-medium">Cant.</th>
              <th className="text-right p-3 font-medium">P. Unit s/IVA</th>
              <th className="text-right p-3 font-medium">P. Unit c/IVA</th>
              <th className="text-right p-3 font-medium">Total s/IVA</th>
              <th className="text-right p-3 font-medium">Total c/IVA</th>
            </tr>
          </thead>
          <tbody>
            {materialRows.length > 0 && (
              <tr className="bg-bg-dark/30">
                <td colSpan="6" className="px-3 py-1 text-[10px] text-text-secondary uppercase font-semibold tracking-wider">
                  Material principal
                </td>
              </tr>
            )}
            {materialRows.map((row, idx) => (
              <motion.tr key={`m-${idx}-${viewMode}`}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`border-t border-border-subtle/30 hover:bg-bg-dark/20 ${row.isExtra ? 'bg-amber-500/5' : ''}`}>
                <td className="p-3">
                  <div className="text-text-primary text-sm">{row.concept}</div>
                  {row.detail && <div className="text-[10px] text-text-secondary">{row.detail}</div>}
                </td>
                <td className="p-3 text-right text-text-secondary text-sm whitespace-nowrap">{row.quantity} {row.unit}</td>
                <td className="p-3 text-right text-text-secondary text-sm">{formatCurrency(row.unitPrice)}</td>
                <td className="p-3 text-right text-text-secondary text-sm">{formatCurrency(row.unitPrice * (1 + IVA))}</td>
                <td className="p-3 text-right text-text-primary font-medium text-sm">{formatCurrency(row.total)}</td>
                <td className="p-3 text-right text-accent font-medium text-sm">{formatCurrency(row.total * (1 + IVA))}</td>
              </motion.tr>
            ))}

            <AnimatePresence>
              {includeAccessories && accessoryRows.length > 0 && (
                <>
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-bg-dark/30">
                    <td colSpan="6" className="px-3 py-1 text-[10px] text-text-secondary uppercase font-semibold tracking-wider">
                      Herrajes y Accesorios
                    </td>
                  </motion.tr>
                  {accessoryRows.map((row, idx) => (
                    <motion.tr key={`a-${idx}-${viewMode}`}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: (materialRows.length + idx) * 0.03 }}
                      className={`border-t border-border-subtle/30 hover:bg-bg-dark/20 ${row.isExtra ? 'bg-amber-500/5' : ''}`}>
                      <td className="p-3">
                        <div className="text-text-primary text-sm">{row.concept}</div>
                        {row.detail && <div className="text-[10px] text-text-secondary">{row.detail}</div>}
                      </td>
                      <td className="p-3 text-right text-text-secondary text-sm whitespace-nowrap">{row.quantity} {row.unit}</td>
                      <td className="p-3 text-right text-text-secondary text-sm">{formatCurrency(row.unitPrice)}</td>
                      <td className="p-3 text-right text-text-secondary text-sm">{formatCurrency(row.unitPrice * (1 + IVA))}</td>
                      <td className="p-3 text-right text-text-primary font-medium text-sm">{formatCurrency(row.total)}</td>
                      <td className="p-3 text-right text-accent font-medium text-sm">{formatCurrency(row.total * (1 + IVA))}</td>
                    </motion.tr>
                  ))}
                </>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* ── Totals ── */}
      <div className="border-t border-border-subtle bg-bg-dark/50">
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-center py-1.5">
            <span className="text-text-secondary text-sm">Subtotal</span>
            <AnimatedNumber value={subtotalSinIVA} className="text-text-primary font-medium text-sm" />
          </div>

          {discountPct > 0 && (
            <div className="flex justify-between items-center py-1.5">
              <span className="text-green-400 text-sm">Descuento ({discountPct}%)</span>
              <span className="text-green-400 font-medium text-sm">-{formatCurrency(descuentoMonto)}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-1.5">
            <span className="text-text-secondary text-sm">IVA (16%)</span>
            <AnimatedNumber value={ivaAmount} className="text-amber-400 font-medium text-sm" />
          </div>

          <motion.div key={totalConIVA}
            initial={{ scale: 1 }} animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 0.3 }}
            className={`flex justify-between items-center py-3 rounded-lg px-3 mt-1 ${
              priceMode === 'venta' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
            }`}>
            <span className="text-base font-heading font-bold text-text-primary uppercase">
              Total {labelMode} c/IVA
            </span>
            <span className={`text-xl font-heading font-bold ${priceMode === 'venta' ? 'text-green-400' : 'text-red-400'}`}>
              <AnimatedNumber value={totalConIVA} className="" />
            </span>
          </motion.div>

          {/* Margin */}
          <div className={`mt-2 p-3 rounded-lg border text-xs ${
            priceMode === 'venta' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
          }`}>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Margen de ganancia</span>
              <span className="font-medium text-green-400">{formatCurrency(margenMonto)} ({margenPct.toFixed(1)}%)</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-text-secondary">Costo c/IVA</span>
              <span className="text-red-400">{formatCurrency(costo.grandTotalWithIVA)}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-text-secondary">Venta c/IVA</span>
              <span className="text-green-400">{formatCurrency(venta.grandTotalWithIVA)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="p-4 border-t border-border-subtle bg-surface flex gap-2">
        {/* WhatsApp */}
        <button onClick={() => {
          const lines = [
            `*Cotización — ${current.product.name}*`,
            clientName ? `Cliente: ${clientName}` : '',
            `Color: ${current.product.selectedColor?.name || '—'}`,
            `Piezas: ${piecesNeeded} (${fullBoxes} caja${fullBoxes !== 1 ? 's' : ''}${loosePieces > 0 ? ` + ${loosePieces} suelta${loosePieces !== 1 ? 's' : ''}` : ''})`,
            `Área: ${current.totalArea.toFixed(2)} m²`,
            discountPct > 0 ? `Descuento: ${discountPct}%` : '',
            '',
            `*Total ${labelMode} c/IVA: ${formatCurrency(totalConIVA)}*`,
            includeAccessories && accessoryRows.length > 0 ? '(Incluye herrajes)' : '(Sin herrajes)',
            '', '_Ferretería Lambrin_'
          ].filter(Boolean)
          window.open(`https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`, '_blank')
        }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </button>

        {/* Copy */}
        <button onClick={() => {
          const lines = [
            `Cotización — ${current.product.name}`,
            clientName ? `Cliente: ${clientName}` : '',
            `Color: ${current.product.selectedColor?.name || '—'}`,
            `Piezas: ${piecesNeeded} (${fullBoxes} cajas + ${loosePieces} sueltas)`,
            `Área: ${current.totalArea.toFixed(2)} m²`,
            discountPct > 0 ? `Descuento: ${discountPct}%` : '',
            `Total ${labelMode} c/IVA: ${formatCurrency(totalConIVA)}`,
            includeAccessories ? '(Con herrajes)' : '(Sin herrajes)'
          ].filter(Boolean)
          navigator.clipboard?.writeText(lines.join('\n'))
        }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-bg-dark hover:bg-border-subtle border border-border-subtle text-text-secondary hover:text-text-primary rounded-lg transition-colors text-sm font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copiar
        </button>
      </div>
    </motion.div>
  )
}
