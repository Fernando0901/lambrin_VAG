import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { products, getDefaultPrices, STORAGE_KEY } from '../data/products'

const PriceContext = createContext(null)

export function PriceProvider({ children }) {
  const [priceMode, setPriceMode] = useState('venta')
  const [prices, setPrices] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Error loading prices from localStorage', e)
    }
    return getDefaultPrices()
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [loadedFromStorage, setLoadedFromStorage] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setLoadedFromStorage(true)
        setShowToast(true)
        setToastMessage('Precios cargados desde sesión anterior')
        setTimeout(() => setShowToast(false), 4000)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  const showToastMessage = useCallback((msg) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  const updatePrice = useCallback((productId, accessoryId, modo, tipo, value) => {
    const parsed = parseFloat(value)
    if (isNaN(parsed) || parsed < 0) return

    setPrices(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      if (accessoryId) {
        next[productId].accesorios[accessoryId].precios[modo][tipo] = parsed
        const acc = products[productId].accesorios[accessoryId]
        if (acc.piezasPorCaja && tipo === 'pieza') {
          next[productId].accesorios[accessoryId].precios[modo].caja =
            parseFloat((parsed * acc.piezasPorCaja).toFixed(2))
        } else if (acc.piezasPorCaja && tipo === 'caja') {
          next[productId].accesorios[accessoryId].precios[modo].pieza =
            parseFloat((parsed / acc.piezasPorCaja).toFixed(2))
        }
      } else {
        next[productId].precios[modo][tipo] = parsed
        const ppb = products[productId].piecesPerBox
        if (tipo === 'pieza') {
          next[productId].precios[modo].caja = parseFloat((parsed * ppb).toFixed(2))
        } else {
          next[productId].precios[modo].pieza = parseFloat((parsed / ppb).toFixed(2))
        }
      }
      return next
    })
    setHasUnsavedChanges(true)
  }, [])

  const markFieldEdited = useCallback((productId, accessoryId, modo, tipo) => {
    // Visual feedback is handled in PriceManager state
  }, [])

  const resetPrices = useCallback(() => {
    setPrices(getDefaultPrices())
    setHasUnsavedChanges(false)
    showToastMessage('Precios restablecidos')
  }, [showToastMessage])

  const savePrices = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prices))
      setHasUnsavedChanges(false)
      showToastMessage('Cambios guardados')
    } catch (e) {
      showToastMessage('Error al guardar')
    }
  }, [prices, showToastMessage])

  const getPrice = useCallback((productId, accessoryId, modo, tipo) => {
    if (accessoryId) {
      return prices[productId]?.accesorios[accessoryId]?.precios[modo][tipo] ?? 0
    }
    return prices[productId]?.precios[modo][tipo] ?? 0
  }, [prices])

  const value = {
    priceMode,
    setPriceMode,
    prices,
    setPrices,
    updatePrice,
    markFieldEdited,
    resetPrices,
    savePrices,
    hasUnsavedChanges,
    getPrice,
    loadedFromStorage,
    showToast,
    toastMessage
  }

  return (
    <PriceContext.Provider value={value}>
      {children}
    </PriceContext.Provider>
  )
}

export function usePrices() {
  const ctx = useContext(PriceContext)
  if (!ctx) throw new Error('usePrices must be used within PriceProvider')
  return ctx
}
