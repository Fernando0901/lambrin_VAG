import React from 'react'
import { motion } from 'framer-motion'
import { formatCurrency, IVA } from '../data/products'

export default function PrintSummary({ calculationBoth, priceMode }) {
  const handlePrint = () => {
    window.print()
  }

  if (!calculationBoth) return null

  const { venta, costo, margenMonto, margenPct } = calculationBoth
  const current = priceMode === 'venta' ? venta : costo

  const currentDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const folio = `COT-${Date.now().toString(36).toUpperCase().slice(-6)}`
  const isWall = current.product.inputType === 'wall'
  const { fullBoxes, loosePieces, piecesPerBox } = current

  // Construir filas del presupuesto
  const rows = []
  let partida = 1

  // Material principal
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
      concept: `${current.product.name}`,
      quantity: current.piecesNeeded,
      unit: 'Piezas',
      unitPrice: current.pricePieza,
      total: current.piecesNeeded * current.pricePieza
    })
  }

  // Accesorios
  current.accessories.forEach(acc => {
    if (acc.piecesPerBox && acc.boxPrice != null) {
      const accFullBoxes = Math.floor(acc.quantity / acc.piecesPerBox)
      const accLoose = acc.quantity - accFullBoxes * acc.piecesPerBox
      if (accFullBoxes > 0) {
        rows.push({
          partida: partida++,
          concept: `${acc.name} — Caja (${acc.piecesPerBox} pzas)`,
          quantity: accFullBoxes,
          unit: accFullBoxes === 1 ? 'Caja' : 'Cajas',
          unitPrice: acc.boxPrice,
          total: accFullBoxes * acc.boxPrice
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
      if (accFullBoxes === 0 && accLoose === 0) {
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

  const subtotalSinIVA = rows.reduce((sum, r) => sum + r.total, 0)
  const ivaAmount = subtotalSinIVA * IVA
  const totalConIVA = subtotalSinIVA + ivaAmount

  // Información de cortes
  const cutInfo = current.placements?.map((p, i) => {
    const cuts = []
    if (p.cutWidth) {
      const fullRows = p.cutLength ? p.rows - 1 : p.rows
      cuts.push(`${fullRows} pza${fullRows !== 1 ? 's' : ''} cortada${fullRows !== 1 ? 's' : ''} a ${p.cutWidth.toFixed(3)} m (${isWall ? 'ancho' : 'ancho'})`)
    }
    if (p.cutLength) {
      const fullCols = p.cutWidth ? p.columns - 1 : p.columns
      cuts.push(`${fullCols} pza${fullCols !== 1 ? 's' : ''} cortada${fullCols !== 1 ? 's' : ''} a ${p.cutLength.toFixed(3)} m (${isWall ? 'alto' : 'largo'})`)
    }
    if (p.cutWidth && p.cutLength) {
      cuts.push(`1 pieza esquina: ${p.cutWidth.toFixed(3)} m × ${p.cutLength.toFixed(3)} m`)
    }
    return cuts.length > 0 ? { areaIdx: i + 1, cuts } : null
  }).filter(Boolean) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl border border-border-subtle p-4"
    >
      {/* Botón visible en pantalla */}
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h3 className="font-heading font-semibold text-text-primary uppercase tracking-wide">
            Guardar Cotización
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Imprime o guarda como PDF
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-bg-dark font-semibold rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir / Exportar PDF
        </motion.button>
      </div>

      {/* ========== PRESUPUESTO PARA IMPRESIÓN ========== */}
      <div className="hidden print:block print-only">
        {/* Encabezado */}
        <div className="print-header">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#D97706', fontFamily: 'Barlow Condensed, sans-serif' }}>
                PRESUPUESTO DE MATERIALES
              </h1>
              <p className="text-sm text-gray-600 mt-1">Ferretería Lambrin</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Folio: <span className="font-medium text-gray-800">{folio}</span></p>
              <p className="text-sm text-gray-500">Fecha: <span className="font-medium text-gray-800">{currentDate}</span></p>
              <p className="text-xs mt-1 px-2 py-0.5 inline-block rounded"
                style={{ backgroundColor: priceMode === 'venta' ? '#DEF7EC' : '#FDE8E8', color: priceMode === 'venta' ? '#03543F' : '#9B1C1C' }}>
                Precio de {priceMode === 'venta' ? 'Venta' : 'Costo'}
              </p>
            </div>
          </div>
        </div>

        {/* Datos del producto */}
        <div className="mb-5 p-3 border border-gray-200 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Producto</p>
              <p className="font-medium text-gray-800">{current.product.name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Color</p>
              <p className="font-medium text-gray-800">{current.product.selectedColor?.name || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Dimensión pieza</p>
              <p className="font-medium text-gray-800">{current.product.dimensions.width} m × {current.product.dimensions.length} m</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Orientación</p>
              <p className="font-medium text-gray-800">{current.orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}</p>
            </div>
          </div>
        </div>

        {/* Áreas */}
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-800 uppercase border-b border-gray-300 pb-1 mb-2" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Superficies
          </h2>
          <table className="print-table">
            <thead>
              <tr>
                <th className="text-left">#</th>
                <th className="text-left">{isWall ? 'Ancho' : 'Largo'}</th>
                <th className="text-left">{isWall ? 'Alto' : 'Ancho'}</th>
                <th className="text-right">Área</th>
                <th className="text-right">Piezas</th>
              </tr>
            </thead>
            <tbody>
              {current.areas.map((area, i) => {
                const placement = current.placements?.[i]
                return (
                  <tr key={i}>
                    <td className="text-left">{isWall ? 'Pared' : 'Área'} {i + 1}</td>
                    <td className="text-left">{isWall ? area.width : area.length} m</td>
                    <td className="text-left">{isWall ? area.length : area.width} m</td>
                    <td className="text-right">{(area.width * area.length).toFixed(2)} m²</td>
                    <td className="text-right font-medium">{placement?.pieces || '—'}</td>
                  </tr>
                )
              })}
              <tr style={{ backgroundColor: '#F3F4F6', fontWeight: 600 }}>
                <td colSpan="3" className="text-left">TOTAL</td>
                <td className="text-right" style={{ color: '#D97706' }}>{current.totalArea.toFixed(2)} m²</td>
                <td className="text-right" style={{ color: '#D97706' }}>{current.piecesNeeded} pzas</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-1">
            = {fullBoxes} caja{fullBoxes !== 1 ? 's' : ''}{loosePieces > 0 ? ` + ${loosePieces} pieza${loosePieces !== 1 ? 's' : ''} suelta${loosePieces !== 1 ? 's' : ''}` : ''} ({piecesPerBox} pzas/caja)
          </p>
        </div>

        {/* Cortes necesarios */}
        {cutInfo.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-800 uppercase border-b border-gray-300 pb-1 mb-2" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Cortes Necesarios
            </h2>
            {cutInfo.map((ci, i) => (
              <div key={i} className="mb-1">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">{isWall ? 'Pared' : 'Área'} {ci.areaIdx}:</span>{' '}
                  {ci.cuts.join(' | ')}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tabla de presupuesto */}
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-800 uppercase border-b border-gray-300 pb-1 mb-2" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Desglose de Presupuesto
          </h2>
          <table className="print-table">
            <thead>
              <tr>
                <th className="text-center" style={{ width: '30px' }}>#</th>
                <th className="text-left">Concepto</th>
                <th className="text-center">Cant.</th>
                <th className="text-center">Unidad</th>
                <th className="text-right">P. Unit.</th>
                <th className="text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="text-center">{row.partida}</td>
                  <td className="text-left">{row.concept}</td>
                  <td className="text-center">{row.quantity}</td>
                  <td className="text-center">{row.unit}</td>
                  <td className="text-right">{formatCurrency(row.unitPrice)}</td>
                  <td className="text-right">{formatCurrency(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="mb-6" style={{ maxWidth: '320px', marginLeft: 'auto' }}>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 text-gray-600">Subtotal</td>
                <td className="py-1 text-right font-medium text-gray-800">{formatCurrency(subtotalSinIVA)}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-600">IVA (16%)</td>
                <td className="py-1 text-right font-medium text-gray-800">{formatCurrency(ivaAmount)}</td>
              </tr>
              <tr style={{ borderTop: '2px solid #D97706' }}>
                <td className="py-2 font-bold text-gray-900 text-base">TOTAL</td>
                <td className="py-2 text-right font-bold text-base" style={{ color: '#D97706' }}>{formatCurrency(totalConIVA)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Margen (solo visible para uso interno) */}
        <div className="mb-6 p-2 border border-gray-200 rounded text-xs" style={{ backgroundColor: '#FEFCE8' }}>
          <p className="text-gray-600">
            <span className="font-semibold">Margen:</span>{' '}
            <span style={{ color: '#059669' }}>{formatCurrency(margenMonto)} ({margenPct.toFixed(1)}%)</span>
            <span className="text-gray-400 ml-2">|</span>
            <span className="text-gray-500 ml-2">Costo: {formatCurrency(costo.grandTotalWithIVA)}</span>
            <span className="text-gray-400 ml-2">|</span>
            <span className="text-gray-500 ml-2">Venta: {formatCurrency(venta.grandTotalWithIVA)}</span>
          </p>
        </div>

        {/* Notas y condiciones */}
        <div className="print-footer">
          <h3 className="text-xs font-bold text-gray-700 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Condiciones
          </h3>
          <ul className="text-[10px] text-gray-500 space-y-0.5">
            <li>• Cotización válida por 15 días naturales a partir de la fecha de emisión.</li>
            <li>• Precios sujetos a cambio sin previo aviso posterior al vencimiento.</li>
            <li>• Los precios incluyen IVA (16%) donde se indica.</li>
            <li>• Material sujeto a disponibilidad en inventario.</li>
            <li>• Las piezas con corte son aproximadas; confirmar medidas en sitio.</li>
          </ul>
          <div className="mt-4 pt-3 border-t border-gray-200 text-center text-[10px] text-gray-400">
            <p>Ferretería Lambrin — Calculadora de Materiales</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
