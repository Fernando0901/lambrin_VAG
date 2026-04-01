import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrices } from '../context/PriceContext'
import { products } from '../data/products'
import { formatCurrency } from '../data/products'

const EDITED_SENTINEL = '__edited__'

export default function PriceManager({ isOpen, onClose }) {
  const { priceMode, setPriceMode, prices, updatePrice, resetPrices, savePrices, hasUnsavedChanges } = usePrices()
  const [editedFields, setEditedFields] = useState({})

  const handleToggle = (mode) => {
    setPriceMode(mode)
  }

  const handlePriceChange = (productId, accessoryId, modo, tipo, value) => {
    updatePrice(productId, accessoryId, modo, tipo, value)
    setEditedFields(prev => ({
      ...prev,
      [`${productId}|${accessoryId || 'main'}|${modo}|${tipo}`]: true
    }))
  }

  const getEditedStatus = (productId, accessoryId, modo, tipo) => {
    return editedFields[`${productId}|${accessoryId || 'main'}|${modo}|${tipo}`] === true
  }

  const renderPriceInputs = (productId, accessoryId, acc, modo) => {
    const ppb = acc?.piezasPorCaja || products[productId].piecesPerBox
    const currentPieza = accessoryId
      ? prices[productId]?.accesorios[accessoryId]?.precios[modo]?.pieza
      : prices[productId]?.precios[modo]?.pieza
    const currentCaja = accessoryId
      ? prices[productId]?.accesorios[accessoryId]?.precios[modo]?.caja
      : prices[productId]?.precios[modo]?.caja

    return (
      <tr key={`${productId}-${accessoryId}-${modo}`} className="border-t border-border-subtle/30">
        <td className="p-3 text-sm text-text-primary">
          {accessoryId
            ? (acc.nombre || products[productId].accesorios[accessoryId]?.nombre)
            : products[productId].name}
        </td>
        <td className="p-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={currentPieza || ''}
              onChange={(e) => handlePriceChange(productId, accessoryId, modo, 'pieza', e.target.value)}
              className={`w-full pl-7 pr-2 py-1.5 bg-bg-dark border rounded text-text-primary text-sm text-right focus:outline-none focus:ring-1 ${
                getEditedStatus(productId, accessoryId, modo, 'pieza')
                  ? 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/30'
                  : 'border-border-subtle focus:border-accent focus:ring-accent/30'
              }`}
            />
          </div>
        </td>
        <td className="p-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={currentCaja || ''}
              disabled={!acc?.piezasPorCaja && !products[productId].piecesPerBox}
              onChange={(e) => handlePriceChange(productId, accessoryId, modo, 'caja', e.target.value)}
              className={`w-full pl-7 pr-2 py-1.5 bg-bg-dark border rounded text-text-primary text-sm text-right focus:outline-none focus:ring-1 disabled:opacity-40 disabled:cursor-not-allowed ${
                getEditedStatus(productId, accessoryId, modo, 'caja')
                  ? 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/30'
                  : 'border-border-subtle focus:border-accent focus:ring-accent/30'
              }`}
            />
          </div>
        </td>
      </tr>
    )
  }

  const rowsCosto = []
  const rowsVenta = []

  for (const [pid, product] of Object.entries(products)) {
    rowsCosto.push(renderPriceInputs(pid, null, null, 'costo'))
    rowsVenta.push(renderPriceInputs(pid, null, null, 'venta'))
    for (const [aid, acc] of Object.entries(product.accesorios || {})) {
      rowsCosto.push(renderPriceInputs(pid, aid, acc, 'costo'))
      rowsVenta.push(renderPriceInputs(pid, aid, acc, 'venta'))
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[520px] bg-surface border-l border-border-subtle z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-border-subtle">
              <h2 className="font-heading font-bold text-xl text-text-primary uppercase tracking-wide">
                Gestión de Precios
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-bg-dark"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 border-b border-border-subtle">
              <p className="text-sm text-text-secondary mb-3">Modo de precio activo</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleToggle('costo')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm uppercase tracking-wide border-2 transition-all ${
                    priceMode === 'costo'
                      ? 'border-red-500 bg-red-500/10 text-red-400'
                      : 'border-border-subtle text-text-secondary hover:border-red-500/50'
                  }`}
                >
                  Precio Costo
                </button>
                <button
                  onClick={() => handleToggle('venta')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm uppercase tracking-wide border-2 transition-all ${
                    priceMode === 'venta'
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-border-subtle text-text-secondary hover:border-green-500/50'
                  }`}
                >
                  Precio Venta
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-bg-dark text-text-secondary text-xs uppercase tracking-wider">
                      <th className="text-left p-3 font-medium rounded-tl-lg">Material</th>
                      <th className="text-right p-3 font-medium">Pieza (Costo)</th>
                      <th className="text-right p-3 font-medium rounded-tr-lg">Caja (Costo)</th>
                    </tr>
                  </thead>
                  <tbody>{rowsCosto}</tbody>
                </table>
              </div>

              <div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-bg-dark text-text-secondary text-xs uppercase tracking-wider">
                      <th className="text-left p-3 font-medium rounded-tl-lg">Material</th>
                      <th className="text-right p-3 font-medium">Pieza (Venta)</th>
                      <th className="text-right p-3 font-medium">Caja (Venta)</th>
                    </tr>
                  </thead>
                  <tbody>{rowsVenta}</tbody>
                </table>
              </div>
            </div>

            <div className="p-5 border-t border-border-subtle flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm">
                {hasUnsavedChanges ? (
                  <span className="flex items-center gap-1.5 text-yellow-400">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    Cambios sin guardar
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-green-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardado
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={resetPrices}
                  className="px-4 py-2 text-sm font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-dark transition-colors"
                >
                  Restablecer
                </button>
                <button
                  onClick={savePrices}
                  className="px-5 py-2 text-sm font-semibold bg-accent hover:bg-accent-hover text-bg-dark rounded-lg transition-colors"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
