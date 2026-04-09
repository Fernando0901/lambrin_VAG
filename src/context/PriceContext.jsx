import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { products, getDefaultPrices, STORAGE_KEY } from '../data/products'
import { syncToCloud, fetchFromCloud, isSyncEnabled, setSyncEnabled } from '../utils/syncService'

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
  const [customProducts, setCustomProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('vag_custom_products')
      if (saved) return JSON.parse(saved)
    } catch {}
    return []
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [syncStatus, setSyncStatus] = useState('idle')
  const [lastSynced, setLastSynced] = useState(null)

  const showToastMessage = useCallback((msg) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  const loadFromCloud = useCallback(async () => {
    setSyncStatus('loading')
    const result = await fetchFromCloud()
    if (result.success && result.data) {
      const { precios, customProducts: cp } = result.data
      if (precios) {
        setPrices(precios)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(precios))
      }
      if (cp) {
        setCustomProducts(cp)
        localStorage.setItem('vag_custom_products', JSON.stringify(cp))
      }
      setLastSynced(new Date())
      setSyncStatus('synced')
      showToastMessage('Precios cargados desde la nube')
    } else {
      setSyncStatus('error')
      showToastMessage('Error al conectar con la nube')
    }
  }, [showToastMessage])

  useEffect(() => {
    if (isSyncEnabled()) {
      loadFromCloud()
    }
  }, [loadFromCloud])

  const updatePrice = useCallback((productId, accessoryId, modo, tipo, value, groupId = null) => {
    const parsed = parseFloat(value)
    if (isNaN(parsed) || parsed < 0) return

    setPrices(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      if (accessoryId) {
        next[productId].accesorios[accessoryId].precios[modo][tipo] = parsed
        const acc = products[productId]?.accesorios?.[accessoryId]
        if (acc?.piezasPorCaja && tipo === 'pieza') {
          next[productId].accesorios[accessoryId].precios[modo].caja =
            Number.parseFloat((parsed * acc.piezasPorCaja).toFixed(2))
        } else if (acc?.piezasPorCaja && tipo === 'caja') {
          next[productId].accesorios[accessoryId].precios[modo].pieza =
            Number.parseFloat((parsed / acc.piezasPorCaja).toFixed(2))
        }
      } else if (groupId) {
        const groupIdx = next[productId]?.pricePerColorGroups?.findIndex(g => g.id === groupId)
        if (groupIdx !== -1) {
          next[productId].pricePerColorGroups[groupIdx].precios[modo][tipo] = parsed
          if (tipo === 'pieza') {
            next[productId].pricePerColorGroups[groupIdx].precios[modo].caja = parsed
          } else {
            next[productId].pricePerColorGroups[groupIdx].precios[modo].pieza = parsed
          }
        }
      } else {
        const product = products[productId]
        next[productId].precios[modo][tipo] = parsed
        const ppb = product?.piecesPerBox || 1
        if (tipo === 'pieza') {
          next[productId].precios[modo].caja = Number.parseFloat((parsed * ppb).toFixed(2))
        } else {
          next[productId].precios[modo].pieza = Number.parseFloat((parsed / ppb).toFixed(2))
        }
      }
      return next
    })
    setHasUnsavedChanges(true)
  }, [])

  const resetPrices = useCallback(() => {
    setPrices(getDefaultPrices())
    setHasUnsavedChanges(false)
    showToastMessage('Precios restablecidos')
  }, [showToastMessage])

  const savePrices = useCallback(async () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prices))
      localStorage.setItem('vag_custom_products', JSON.stringify(customProducts))
      setHasUnsavedChanges(false)
      showToastMessage('Cambios guardados localmente')

      if (isSyncEnabled()) {
        setSyncStatus('saving')
        const result = await syncToCloud({ precios: prices, customProducts, timestamp: Date.now() })
        if (result.success) {
          setLastSynced(new Date())
          setSyncStatus('synced')
        } else {
          setSyncStatus('error')
        }
      }
    } catch (e) {
      showToastMessage('Error al guardar')
    }
  }, [prices, customProducts, showToastMessage])

  const addCustomProduct = useCallback((product) => {
    setCustomProducts(prev => {
      const next = [...prev, { ...product, id: `custom_${Date.now()}` }]
      localStorage.setItem('vag_custom_products', JSON.stringify(next))
      return next
    })
    showToastMessage('Producto agregado')
  }, [showToastMessage])

  const updateCustomProduct = useCallback((productId, updates) => {
    setCustomProducts(prev => {
      const next = prev.map(p => p.id === productId ? { ...p, ...updates } : p)
      localStorage.setItem('vag_custom_products', JSON.stringify(next))
      return next
    })
    setHasUnsavedChanges(true)
  }, [])

  const deleteCustomProduct = useCallback((productId) => {
    setCustomProducts(prev => {
      const next = prev.filter(p => p.id !== productId)
      localStorage.setItem('vag_custom_products', JSON.stringify(next))
      return next
    })
    showToastMessage('Producto eliminado')
  }, [showToastMessage])

  const enableSync = useCallback(async (enabled) => {
    setSyncEnabled(enabled)
    if (enabled) {
      await loadFromCloud()
    } else {
      setSyncStatus('idle')
    }
  }, [loadFromCloud])

  const value = {
    priceMode,
    setPriceMode,
    prices,
    setPrices,
    customProducts,
    addCustomProduct,
    updateCustomProduct,
    deleteCustomProduct,
    updatePrice,
    resetPrices,
    savePrices,
    hasUnsavedChanges,
    syncStatus,
    lastSynced,
    enableSync,
    loadFromCloud,
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
