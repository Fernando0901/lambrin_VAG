import React from 'react'
import { motion } from 'framer-motion'
import { formatCurrency, IVA } from '../data/products'

export default function PrintSummary({
  calculationBoth,
  priceMode,
  includeAccessories = true,
  discount = 0,
  clientName = ''
}) {
  const handlePrint = () => { window.print() }

  if (!calculationBoth) return null

  const { venta, costo, margenMonto, margenPct } = calculationBoth
  const current = priceMode === 'venta' ? venta : costo

  const currentDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  const folio = `COT-${Date.now().toString(36).toUpperCase().slice(-6)}`
  const isWall = current.product.inputType === 'wall'
  const { fullBoxes, loosePieces, piecesPerBox } = current
  const discountPct = Math.max(0, Math.min(100, discount || 0))

  // Build rows
  const rows = []
  let partida = 1

  if (fullBoxes > 0) {
    rows.push({
      partida: partida++,
      concept: `${current.product.name} — Caja (${piecesPerBox} pzas)`,
      quantity: fullBoxes,
      unit: fullBoxes === 1 ? 'Caja' : 'Cajas',
      unitPrice: current.priceCaja,
      total: fullBoxes * current.priceCaja
    })
  }
  if (loosePieces > 0) {
    rows.push({
      partida: partida++,
      concept: `${current.product.name} — Pieza suelta`,
      quantity: loosePieces,
      unit: loosePieces === 1 ? 'Pieza' : 'Piezas',
      unitPrice: current.pricePieza,
      total: loosePieces * current.pricePieza
    })
  }
  if (fullBoxes === 0 && loosePieces === 0) {
    rows.push({
      partida: partida++,
      concept: current.product.name,
      quantity: current.piecesNeeded,
      unit: 'Piezas',
      unitPrice: current.pricePieza,
      total: current.piecesNeeded * current.pricePieza
    })
  }

  if (includeAccessories) {
    current.accessories.forEach(acc => {
      if (acc.piecesPerBox && acc.boxPrice != null) {
        const accFull = Math.floor(acc.quantity / acc.piecesPerBox)
        const accLoose = acc.quantity - accFull * acc.piecesPerBox
        if (accFull > 0) {
          rows.push({
            partida: partida++,
            concept: `${acc.name} — Caja (${acc.piecesPerBox} pzas)`,
            quantity: accFull,
            unit: accFull === 1 ? 'Caja' : 'Cajas',
            unitPrice: acc.boxPrice,
            total: accFull * acc.boxPrice
          })
        }
        if (accLoose > 0) {
          rows.push({
            partida: partida++,
            concept: `${acc.name} — Suelto`,
            quantity: accLoose,
            unit: 'Piezas',
            unitPrice: acc.unitPrice,
            total: accLoose * acc.unitPrice
          })
        }
        if (accFull === 0 && accLoose === 0) {
          rows.push({
            partida: partida++,
            concept: acc.name,
            quantity: acc.quantity,
            unit: 'Piezas',
            unitPrice: acc.unitPrice,
            total: acc.quantity * acc.unitPrice
          })
        }
      } else {
        rows.push({
          partida: partida++,
          concept: acc.name,
          quantity: acc.quantity,
          unit: 'Piezas',
          unitPrice: acc.unitPrice,
          total: acc.quantity * acc.unitPrice
        })
      }
    })
  }

  const subtotalSinIVA = rows.reduce((sum, r) => sum + r.total, 0)
  const descuentoMonto = subtotalSinIVA * (discountPct / 100)
  const subtotalConDescuento = subtotalSinIVA - descuentoMonto
  const ivaAmount = subtotalConDescuento * IVA
  const totalConIVA = subtotalConDescuento + ivaAmount

  // Cuts
  const cutInfo = current.placements?.map((p, i) => {
    const cuts = []
    if (p.cutWidth) {
      const n = p.cutLength ? p.rows - 1 : p.rows
      cuts.push(`${n} pza${n !== 1 ? 's' : ''} a ${p.cutWidth.toFixed(3)} m (${isWall ? 'ancho' : 'ancho'})`)
    }
    if (p.cutLength) {
      const n = p.cutWidth ? p.columns - 1 : p.columns
      cuts.push(`${n} pza${n !== 1 ? 's' : ''} a ${p.cutLength.toFixed(3)} m (${isWall ? 'alto' : 'largo'})`)
    }
    if (p.cutWidth && p.cutLength) cuts.push(`1 esquina: ${p.cutWidth.toFixed(3)} × ${p.cutLength.toFixed(3)} m`)
    return cuts.length > 0 ? { idx: i + 1, cuts } : null
  }).filter(Boolean) || []

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl border border-border-subtle p-4">

      {/* Screen button */}
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h3 className="font-heading font-semibold text-text-primary uppercase tracking-wide">
            Guardar Cotización
          </h3>
          <p className="text-sm text-text-secondary mt-1">Imprime o guarda como PDF</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-bg-dark font-semibold rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir / PDF
        </motion.button>
      </div>

      {/* ========== PRINT LAYOUT ========== */}
      <div className="hidden print:block print-only">

        {/* Header */}
        <div className="print-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#D97706', fontFamily: 'Barlow Condensed, sans-serif', margin: 0 }}>
                PRESUPUESTO DE MATERIALES
              </h1>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0' }}>Ferretería Lambrin</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
                Folio: <span style={{ fontWeight: 600, color: '#1F2937' }}>{folio}</span>
              </p>
              <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '2px 0 0' }}>
                Fecha: <span style={{ fontWeight: 600, color: '#1F2937' }}>{currentDate}</span>
              </p>
              <span style={{
                display: 'inline-block', marginTop: '4px', fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
                backgroundColor: priceMode === 'venta' ? '#DEF7EC' : '#FDE8E8',
                color: priceMode === 'venta' ? '#03543F' : '#9B1C1C'
              }}>
                Precio de {priceMode === 'venta' ? 'Venta' : 'Costo'}
              </span>
            </div>
          </div>
        </div>

        {/* Client + Product info */}
        <div style={{ marginBottom: '16px', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#F9FAFB' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            {clientName && (
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, margin: '0 0 2px' }}>Cliente</p>
                <p style={{ fontWeight: 600, color: '#1F2937', margin: 0, fontSize: '14px' }}>{clientName}</p>
              </div>
            )}
            <div>
              <p style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, margin: '0 0 2px' }}>Producto</p>
              <p style={{ fontWeight: 500, color: '#1F2937', margin: 0 }}>{current.product.name}</p>
            </div>
            <div>
              <p style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, margin: '0 0 2px' }}>Color</p>
              <p style={{ fontWeight: 500, color: '#1F2937', margin: 0 }}>{current.product.selectedColor?.name || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, margin: '0 0 2px' }}>Dimensión pieza</p>
              <p style={{ fontWeight: 500, color: '#1F2937', margin: 0 }}>{current.product.dimensions.width} m × {current.product.dimensions.length} m</p>
            </div>
            <div>
              <p style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, margin: '0 0 2px' }}>Orientación</p>
              <p style={{ fontWeight: 500, color: '#1F2937', margin: 0 }}>{current.orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}</p>
            </div>
          </div>
        </div>

        {/* Surfaces table */}
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 700, color: '#1F2937', textTransform: 'uppercase', borderBottom: '1px solid #D1D5DB', paddingBottom: '4px', marginBottom: '6px', fontFamily: 'Barlow Condensed, sans-serif' }}>
            Superficies
          </h2>
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>#</th>
                <th style={{ textAlign: 'left' }}>{isWall ? 'Ancho' : 'Largo'}</th>
                <th style={{ textAlign: 'left' }}>{isWall ? 'Alto' : 'Ancho'}</th>
                <th style={{ textAlign: 'right' }}>Área</th>
                <th style={{ textAlign: 'right' }}>Piezas</th>
              </tr>
            </thead>
            <tbody>
              {current.areas.map((area, i) => {
                const p = current.placements?.[i]
                return (
                  <tr key={i}>
                    <td style={{ textAlign: 'left' }}>{isWall ? 'Pared' : 'Área'} {i + 1}</td>
                    <td style={{ textAlign: 'left' }}>{isWall ? area.width : area.length} m</td>
                    <td style={{ textAlign: 'left' }}>{isWall ? area.length : area.width} m</td>
                    <td style={{ textAlign: 'right' }}>{(area.width * area.length).toFixed(2)} m²</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>{p?.pieces || '—'}</td>
                  </tr>
                )
              })}
              <tr style={{ backgroundColor: '#F3F4F6', fontWeight: 600 }}>
                <td colSpan="3" style={{ textAlign: 'left' }}>TOTAL</td>
                <td style={{ textAlign: 'right', color: '#D97706' }}>{current.totalArea.toFixed(2)} m²</td>
                <td style={{ textAlign: 'right', color: '#D97706' }}>{current.piecesNeeded} pzas</td>
              </tr>
            </tbody>
          </table>
          <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>
            = {fullBoxes} caja{fullBoxes !== 1 ? 's' : ''}{loosePieces > 0 ? ` + ${loosePieces} pieza${loosePieces !== 1 ? 's' : ''} suelta${loosePieces !== 1 ? 's' : ''}` : ''} ({piecesPerBox} pzas/caja)
          </p>
        </div>

        {/* Cuts */}
        {cutInfo.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 700, color: '#1F2937', textTransform: 'uppercase', borderBottom: '1px solid #D1D5DB', paddingBottom: '4px', marginBottom: '6px', fontFamily: 'Barlow Condensed, sans-serif' }}>
              Cortes Necesarios
            </h2>
            {cutInfo.map((ci, i) => (
              <p key={i} style={{ fontSize: '10px', color: '#4B5563', margin: '2px 0' }}>
                <span style={{ fontWeight: 600 }}>{isWall ? 'Pared' : 'Área'} {ci.idx}:</span> {ci.cuts.join(' | ')}
              </p>
            ))}
          </div>
        )}

        {/* Budget table */}
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 700, color: '#1F2937', textTransform: 'uppercase', borderBottom: '1px solid #D1D5DB', paddingBottom: '4px', marginBottom: '6px', fontFamily: 'Barlow Condensed, sans-serif' }}>
            Desglose de Presupuesto {!includeAccessories && '(Sin herrajes)'}
          </h2>
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center', width: '30px' }}>#</th>
                <th style={{ textAlign: 'left' }}>Concepto</th>
                <th style={{ textAlign: 'center' }}>Cant.</th>
                <th style={{ textAlign: 'center' }}>Unidad</th>
                <th style={{ textAlign: 'right' }}>P. Unit.</th>
                <th style={{ textAlign: 'right' }}>Importe</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'center' }}>{row.partida}</td>
                  <td style={{ textAlign: 'left' }}>{row.concept}</td>
                  <td style={{ textAlign: 'center' }}>{row.quantity}</td>
                  <td style={{ textAlign: 'center' }}>{row.unit}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(row.unitPrice)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals box */}
        <div style={{ maxWidth: '340px', marginLeft: 'auto', marginBottom: '20px' }}>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', color: '#6B7280' }}>Subtotal</td>
                <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 500, color: '#1F2937' }}>{formatCurrency(subtotalSinIVA)}</td>
              </tr>
              {discountPct > 0 && (
                <tr>
                  <td style={{ padding: '4px 0', color: '#059669' }}>Descuento ({discountPct}%)</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 500, color: '#059669' }}>-{formatCurrency(descuentoMonto)}</td>
                </tr>
              )}
              <tr>
                <td style={{ padding: '4px 0', color: '#6B7280' }}>IVA (16%)</td>
                <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 500, color: '#1F2937' }}>{formatCurrency(ivaAmount)}</td>
              </tr>
              <tr style={{ borderTop: '3px solid #D97706' }}>
                <td style={{ padding: '8px 0', fontWeight: 700, color: '#1F2937', fontSize: '14px' }}>TOTAL</td>
                <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, fontSize: '14px', color: '#D97706' }}>{formatCurrency(totalConIVA)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Internal margin */}
        <div style={{ marginBottom: '20px', padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: '4px', backgroundColor: '#FEFCE8', fontSize: '10px', color: '#6B7280' }}>
          <span style={{ fontWeight: 600 }}>Margen:</span>{' '}
          <span style={{ color: '#059669' }}>{formatCurrency(margenMonto)} ({margenPct.toFixed(1)}%)</span>
          <span style={{ color: '#D1D5DB', margin: '0 6px' }}>|</span>
          Costo: {formatCurrency(costo.grandTotalWithIVA)}
          <span style={{ color: '#D1D5DB', margin: '0 6px' }}>|</span>
          Venta: {formatCurrency(venta.grandTotalWithIVA)}
        </div>

        {/* Footer conditions */}
        <div className="print-footer">
          <h3 style={{ fontSize: '10px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'Barlow Condensed, sans-serif' }}>
            Condiciones
          </h3>
          <div style={{ fontSize: '9px', color: '#9CA3AF', lineHeight: 1.5 }}>
            <p style={{ margin: '2px 0' }}>• Cotización válida por 15 días naturales a partir de la fecha de emisión.</p>
            <p style={{ margin: '2px 0' }}>• Precios sujetos a cambio sin previo aviso posterior al vencimiento.</p>
            <p style={{ margin: '2px 0' }}>• Los precios mostrados son en MXN. El total incluye IVA (16%).</p>
            <p style={{ margin: '2px 0' }}>• Material sujeto a disponibilidad en inventario.</p>
            <p style={{ margin: '2px 0' }}>• Las medidas de corte son aproximadas; confirmar en sitio antes de instalar.</p>
          </div>

          {/* Signature line */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '10px' }}>
            <div style={{ width: '45%', borderTop: '1px solid #D1D5DB', paddingTop: '4px', textAlign: 'center', fontSize: '10px', color: '#9CA3AF' }}>
              Elaboró
            </div>
            <div style={{ width: '45%', borderTop: '1px solid #D1D5DB', paddingTop: '4px', textAlign: 'center', fontSize: '10px', color: '#9CA3AF' }}>
              Autorizó / Cliente
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '8px', borderTop: '1px solid #E5E7EB', textAlign: 'center', fontSize: '9px', color: '#D1D5DB' }}>
            Ferretería Lambrin — Calculadora de Materiales
          </div>
        </div>
      </div>
    </motion.div>
  )
}
