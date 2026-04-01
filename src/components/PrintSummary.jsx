import React from 'react'
import { motion } from 'framer-motion'
import { formatCurrency } from '../data/products'

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl border border-border-subtle p-4"
    >
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

      <div className="hidden print:block print-only">
        <div className="print-header mb-6">
          <h1 className="text-2xl font-heading font-bold text-amber-600 uppercase">
            Cotización de Materiales
          </h1>
          <p className="text-sm text-gray-600 mt-1">Fecha: {currentDate}</p>
          <p className="text-xs text-gray-500 mt-1">
            Modo: {priceMode === 'venta' ? 'Precio de Venta' : 'Precio de Costo'}
          </p>
        </div>

        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-heading font-semibold text-lg text-gray-800">
            {current.product.name}
          </h2>
          <p className="text-sm text-gray-600">
            Color: {current.product.selectedColor?.name || 'No seleccionado'}
          </p>
          <p className="text-sm text-gray-600">
            Dimensiones: {current.product.dimensions.width} m × {current.product.dimensions.length} m
          </p>
        </div>

        <div className="mb-6">
          <h3 className="font-heading font-semibold text-gray-800 border-b pb-2 mb-3">
            Áreas Ingresadas
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {current.areas.map((area, i) => (
              <li key={i}>
                {current.product.inputType === 'wall' ? 'Pared' : 'Área'} {i + 1}: {area.width} m × {area.length} m = {(area.width * area.length).toFixed(2)} m²
              </li>
            ))}
          </ul>
          <p className="text-sm font-medium text-gray-800 mt-2">
            Área total: <span className="text-amber-600">{current.totalArea.toFixed(2)} m²</span>
          </p>
        </div>

        <div className="mb-6">
          <h3 className="font-heading font-semibold text-gray-800 border-b pb-2 mb-3">
            Resumen de Material
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Piezas necesarias: <span className="font-medium">{current.piecesNeeded}</span></p>
            <p>Cajas necesarias: <span className="font-medium">{current.boxesNeeded}</span></p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-heading font-semibold text-gray-800 border-b pb-2 mb-3">
            Costos ({priceMode === 'venta' ? 'Venta' : 'Costo'})
          </h3>
          <table className="print-table">
            <thead>
              <tr>
                <th className="text-left">Concepto</th>
                <th className="text-right">Total sin IVA</th>
                <th className="text-right">Total con IVA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Material principal</td>
                <td className="text-right">{formatCurrency(current.grandTotal)}</td>
                <td className="text-right">{formatCurrency(current.grandTotalWithIVA - current.ivaAmount)}</td>
              </tr>
              <tr>
                <td>IVA (16%)</td>
                <td className="text-right">-</td>
                <td className="text-right">{formatCurrency(current.ivaAmount)}</td>
              </tr>
              <tr className="font-bold bg-gray-100">
                <td>TOTAL</td>
                <td className="text-right">{formatCurrency(current.grandTotal)}</td>
                <td className="text-right text-amber-600">{formatCurrency(current.grandTotalWithIVA)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6 p-3 bg-gray-50 rounded border">
          <p className="text-sm text-gray-600">
            Margen de ganancia: <span className="font-medium text-green-600">{formatCurrency(margenMonto)} ({margenPct.toFixed(1)}%)</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Costo total c/IVA: {formatCurrency(costo.grandTotalWithIVA)} vs Venta total c/IVA: {formatCurrency(venta.grandTotalWithIVA)}
          </p>
        </div>

        <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t">
          <p>Esta cotización es válida por 30 días a partir de la fecha de emisión.</p>
          <p className="mt-1">Los precios mostrados son en pesos mexicanos (MXN) e incluyen IVA.</p>
        </div>
      </div>
    </motion.div>
  )
}
