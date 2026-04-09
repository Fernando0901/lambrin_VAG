import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrices } from '../context/PriceContext'
import { products } from '../data/products'
import { formatCurrency } from '../data/products'

export default function PriceManager({ isOpen, onClose }) {
  const { priceMode, setPriceMode, prices, updatePrice, resetPrices, savePrices, hasUnsavedChanges, customProducts } = usePrices()
  const [editedFields, setEditedFields] = useState({})

  const handleToggle = (mode) => {
    setPriceMode(mode)
  }

  const handlePriceChange = (productId, accessoryId, modo, tipo, value, groupId = null) => {
    updatePrice(productId, accessoryId, modo, tipo, value, groupId)
    setEditedFields(prev => ({
      ...prev,
      [`${productId}|${accessoryId || 'main'}|${modo}|${tipo}|${groupId || ''}`]: true
    }))
  }

  const getEditedStatus = (productId, accessoryId, modo, tipo, groupId = null) => {
    return editedFields[`${productId}|${accessoryId || 'main'}|${modo}|${tipo}|${groupId || ''}`] === true
  }

  const renderInput = (productId, accessoryId, modo, tipo, value, isDisabled, groupId = null) => (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">$</span>
      <input
        type="number"
        step="0.01"
        min="0"
        value={value ?? ''}
        disabled={isDisabled}
        onChange={(e) => handlePriceChange(productId, accessoryId, modo, tipo, e.target.value, groupId)}
        className={`w-full pl-7 pr-2 py-1.5 bg-bg-dark border rounded text-text-primary text-sm text-right focus:outline-none focus:ring-1 disabled:opacity-40 disabled:cursor-not-allowed ${
          getEditedStatus(productId, accessoryId, modo, tipo, groupId)
            ? 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/30'
            : 'border-border-subtle focus:border-accent focus:ring-accent/30'
        }`}
      />
    </div>
  )

  const rowsCosto = []
  const rowsVenta = []

  for (const [pid, product] of Object.entries(products)) {
    if (product.pricePerColorGroups) {
      for (const group of product.pricePerColorGroups) {
        const currentPrices = prices[pid]?.pricePerColorGroups?.find(g => g.id === group.id)
        const effectivePrices = currentPrices ? currentPrices.precios : group.precios

        rowsCosto.push(
          <tr key={`${pid}-${group.id}-costo`} className="border-t border-border-subtle/30">
            <td className="p-3 text-sm text-text-primary">
              <div className="flex flex-col">
                <span>{product.name} — {group.label}</span>
                <span className="text-xs text-text-secondary mt-0.5">
                  {group.colors.join(', ')}
                </span>
              </div>
            </td>
            <td className="p-2">
              {renderInput(pid, null, 'costo', 'pieza', effectivePrices?.costo?.pieza, false, group.id)}
            </td>
            <td className="p-2">
              {renderInput(pid, null, 'costo', 'caja', effectivePrices?.costo?.caja, true, group.id)}
            </td>
          </tr>
        )
        rowsVenta.push(
          <tr key={`${pid}-${group.id}-venta`} className="border-t border-border-subtle/30">
            <td className="p-3 text-sm text-text-primary">
              <div className="flex flex-col">
                <span>{product.name} — {group.label}</span>
                <span className="text-xs text-text-secondary mt-0.5">
                  {group.colors.join(', ')}
                </span>
              </div>
            </td>
            <td className="p-2">
              {renderInput(pid, null, 'venta', 'pieza', effectivePrices?.venta?.pieza, false, group.id)}
            </td>
            <td className="p-2">
              {renderInput(pid, null, 'venta', 'caja', effectivePrices?.venta?.caja, true, group.id)}
            </td>
          </tr>
        )
      }
    } else {
      const currentPiezaCosto = prices[pid]?.precios?.costo?.pieza ?? product.precios.costo.pieza
      const currentPiezaVenta = prices[pid]?.precios?.venta?.pieza ?? product.precios.venta.pieza
      const currentCajaCosto = prices[pid]?.precios?.costo?.caja ?? product.precios.costo.caja
      const currentCajaVenta = prices[pid]?.precios?.venta?.caja ?? product.precios.venta.caja

      rowsCosto.push(
        <tr key={`${pid}-costo`} className="border-t border-border-subtle/30">
          <td className="p-3 text-sm text-text-primary">{product.name}</td>
          <td className="p-2">{renderInput(pid, null, 'costo', 'pieza', currentPiezaCosto, false)}</td>
          <td className="p-2">{renderInput(pid, null, 'costo', 'caja', currentCajaCosto, false)}</td>
        </tr>
      )
      rowsVenta.push(
        <tr key={`${pid}-venta`} className="border-t border-border-subtle/30">
          <td className="p-3 text-sm text-text-primary">{product.name}</td>
          <td className="p-2">{renderInput(pid, null, 'venta', 'pieza', currentPiezaVenta, false)}</td>
          <td className="p-2">{renderInput(pid, null, 'venta', 'caja', currentCajaVenta, false)}</td>
        </tr>
      )

      for (const [aid, acc] of Object.entries(product.accesorios || {})) {
        const accPiezaCosto = prices[pid]?.accesorios?.[aid]?.precios?.costo?.pieza ?? acc.precios.costo.pieza
        const accPiezaVenta = prices[pid]?.accesorios?.[aid]?.precios?.venta?.pieza ?? acc.precios.venta.pieza
        const accCajaCosto = prices[pid]?.accesorios?.[aid]?.precios?.costo?.caja ?? acc.precios.costo.caja
        const accCajaVenta = prices[pid]?.accesorios?.[aid]?.precios?.venta?.caja ?? acc.precios.venta.caja
        const hasBox = acc.piezasPorCaja

        rowsCosto.push(
          <tr key={`${pid}-${aid}-costo`} className="border-t border-border-subtle/30">
            <td className="p-3 text-sm text-text-primary">{acc.nombre}</td>
            <td className="p-2">{renderInput(pid, aid, 'costo', 'pieza', accPiezaCosto, false)}</td>
            <td className="p-2">{renderInput(pid, aid, 'costo', 'caja', accCajaCosto, !hasBox)}</td>
          </tr>
        )
        rowsVenta.push(
          <tr key={`${pid}-${aid}-venta`} className="border-t border-border-subtle/30">
            <td className="p-3 text-sm text-text-primary">{acc.nombre}</td>
            <td className="p-2">{renderInput(pid, aid, 'venta', 'pieza', accPiezaVenta, false)}</td>
            <td className="p-2">{renderInput(pid, aid, 'venta', 'caja', accCajaVenta, !hasBox)}</td>
          </tr>
        )
      }
    }
  }

  for (const cp of customProducts) {
    const cpPrices = prices[cp.id]?.precios || cp.precios
    const cpPiezaCosto = cpPrices?.costo?.pieza ?? 0
    const cpPiezaVenta = cpPrices?.venta?.pieza ?? 0
    const cpCajaCosto = cpPrices?.costo?.caja ?? 0
    const cpCajaVenta = cpPrices?.venta?.caja ?? 0

    rowsCosto.push(
      <tr key={`${cp.id}-costo`} className="border-t border-border-subtle/30">
        <td className="p-3 text-sm text-text-primary">
          <span>{cp.name}</span>
          <span className="ml-2 text-xs px-1.5 py-0.5 bg-accent/20 text-accent rounded">Custom</span>
        </td>
        <td className="p-2">{renderInput(cp.id, null, 'costo', 'pieza', cpPiezaCosto, false)}</td>
        <td className="p-2">{renderInput(cp.id, null, 'costo', 'caja', cpCajaCosto, false)}</td>
      </tr>
    )
    rowsVenta.push(
      <tr key={`${cp.id}-venta`} className="border-t border-border-subtle/30">
        <td className="p-3 text-sm text-text-primary">
          <span>{cp.name}</span>
          <span className="ml-2 text-xs px-1.5 py-0.5 bg-accent/20 text-accent rounded">Custom</span>
        </td>
        <td className="p-2">{renderInput(cp.id, null, 'venta', 'pieza', cpPiezaVenta, false)}</td>
        <td className="p-2">{renderInput(cp.id, null, 'venta', 'caja', cpCajaVenta, false)}</td>
      </tr>
    )

    for (const [aid, acc] of Object.entries(cp.accesorios || {})) {
      const accPiezaCosto = prices[cp.id]?.accesorios?.[aid]?.precios?.costo?.pieza ?? acc.precios.costo.pieza
      const accPiezaVenta = prices[cp.id]?.accesorios?.[aid]?.precios?.venta?.pieza ?? acc.precios.venta.pieza
      const accCajaCosto = prices[cp.id]?.accesorios?.[aid]?.precios?.costo?.caja ?? acc.precios.costo.caja
      const accCajaVenta = prices[cp.id]?.accesorios?.[aid]?.precios?.venta?.caja ?? acc.precios.venta.caja
      const hasBox = acc.piezasPorCaja

      rowsCosto.push(
        <tr key={`${cp.id}-${aid}-costo`} className="border-t border-border-subtle/30">
          <td className="p-3 text-sm text-text-primary pl-6">{acc.nombre}</td>
          <td className="p-2">{renderInput(cp.id, aid, 'costo', 'pieza', accPiezaCosto, false)}</td>
          <td className="p-2">{renderInput(cp.id, aid, 'costo', 'caja', accCajaCosto, !hasBox)}</td>
        </tr>
      )
      rowsVenta.push(
        <tr key={`${cp.id}-${aid}-venta`} className="border-t border-border-subtle/30">
          <td className="p-3 text-sm text-text-primary pl-6">{acc.nombre}</td>
          <td className="p-2">{renderInput(cp.id, aid, 'venta', 'pieza', accPiezaVenta, false)}</td>
          <td className="p-2">{renderInput(cp.id, aid, 'venta', 'caja', accCajaVenta, !hasBox)}</td>
        </tr>
      )
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
                <h3 className="text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
                  — Precio Costo —
                </h3>
                <table className="w-full">
                  <thead>
                    <tr className="bg-bg-dark text-text-secondary text-xs uppercase tracking-wider">
                      <th className="text-left p-3 font-medium rounded-tl-lg">Material</th>
                      <th className="text-right p-3 font-medium">Pieza</th>
                      <th className="text-right p-3 font-medium rounded-tr-lg">Caja</th>
                    </tr>
                  </thead>
                  <tbody>{rowsCosto}</tbody>
                </table>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
                  — Precio Venta —
                </h3>
                <table className="w-full">
                  <thead>
                    <tr className="bg-bg-dark text-text-secondary text-xs uppercase tracking-wider">
                      <th className="text-left p-3 font-medium rounded-tl-lg">Material</th>
                      <th className="text-right p-3 font-medium">Pieza</th>
                      <th className="text-right p-3 font-medium rounded-tr-lg">Caja</th>
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
