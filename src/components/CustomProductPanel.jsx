import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrices } from '../context/PriceContext'
import { isSyncEnabled } from '../utils/syncService'
import { formatCurrency } from '../data/products'

const MARGIN = 1.30

export default function CustomProductPanel({ isOpen, onClose }) {
  const { customProducts, addCustomProduct, updateCustomProduct, deleteCustomProduct, syncStatus, lastSynced, enableSync, loadFromCloud } = usePrices()
  const [activeTab, setActiveTab] = useState('products')
  const [form, setForm] = useState({
    name: '',
    width: '',
    length: '',
    piecesPerBox: '1',
    inputType: 'floor',
    colors: '',
    accessoryName: '',
    accessoryPrice: '',
    accessoryLength: ''
  })

  const syncEnabled = isSyncEnabled()

  const handleAddProduct = () => {
    if (!form.name.trim() || !form.width || !form.length) return

    const colorList = form.colors.split(',').map(c => c.trim()).filter(Boolean)
    const colors = colorList.map(name => ({ name, hex: '#888888' }))

    const accesorios = {}
    if (form.accessoryName.trim() && form.accessoryPrice) {
      const accId = `acc_${Date.now()}`
      accesorios[accId] = {
        nombre: form.accessoryName.trim(),
        largo: parseFloat(form.accessoryLength) || 1,
        piezasPorCaja: 1,
        precios: {
          costo: { pieza: parseFloat(form.accessoryPrice), caja: null },
          venta: { pieza: parseFloat(form.accessoryPrice) * MARGIN, caja: null }
        }
      }
    }

    addCustomProduct({
      name: form.name.trim(),
      dimensions: {
        width: parseFloat(form.width),
        length: parseFloat(form.length)
      },
      piecesPerBox: parseInt(form.piecesPerBox) || 1,
      precios: {
        costo: { pieza: 0, caja: 0 },
        venta: { pieza: 0, caja: 0 }
      },
      accesorios,
      colors,
      inputType: form.inputType,
      isCustom: true
    })

    setForm({
      name: '', width: '', length: '', piecesPerBox: '1',
      inputType: 'floor', colors: '',
      accessoryName: '', accessoryPrice: '', accessoryLength: ''
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[560px] bg-surface border-l border-border-subtle z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-border-subtle">
              <h2 className="font-heading font-bold text-xl text-text-primary uppercase tracking-wide">
                Panel de Productos
              </h2>
              <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-bg-dark">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex border-b border-border-subtle">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 py-3 text-sm font-medium uppercase tracking-wide transition-colors ${
                  activeTab === 'products' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Productos
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`flex-1 py-3 text-sm font-medium uppercase tracking-wide transition-colors ${
                  activeTab === 'add' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Agregar Nuevo
              </button>
              <button
                onClick={() => setActiveTab('sync')}
                className={`flex-1 py-3 text-sm font-medium uppercase tracking-wide transition-colors ${
                  activeTab === 'sync' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Nube
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === 'products' && (
                <div className="space-y-4">
                  {customProducts.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                      <p>No hay productos personalizados.</p>
                      <p className="text-sm mt-1">Usa "Agregar Nuevo" para crear uno.</p>
                    </div>
                  ) : (
                    customProducts.map(product => (
                      <div key={product.id} className="bg-bg-dark rounded-lg border border-border-subtle p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-heading font-semibold text-text-primary">{product.name}</h4>
                            <p className="text-sm text-text-secondary mt-1">
                              {product.dimensions.width} × {product.dimensions.length} m
                              {' • '}{product.piecesPerBox} pzas/caja
                            </p>
                            <p className="text-xs text-text-secondary mt-1">
                              Colores: {product.colors.map(c => c.name).join(', ')}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteCustomProduct(product.id)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'add' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-heading font-semibold text-text-primary uppercase mb-3">Datos del Producto</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">Nombre del producto</label>
                        <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Ej: Lambrin Exterior"
                          className="w-full px-3 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-text-secondary mb-1">Ancho (m)</label>
                          <input type="number" step="0.01" value={form.width} onChange={e => setForm(p => ({ ...p, width: e.target.value }))}
                            placeholder="0.00" className="w-full px-3 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent" />
                        </div>
                        <div>
                          <label className="block text-xs text-text-secondary mb-1">Largo (m)</label>
                          <input type="number" step="0.01" value={form.length} onChange={e => setForm(p => ({ ...p, length: e.target.value }))}
                            placeholder="0.00" className="w-full px-3 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-text-secondary mb-1">Piezas por caja</label>
                          <input type="number" value={form.piecesPerBox} onChange={e => setForm(p => ({ ...p, piecesPerBox: e.target.value }))}
                            className="w-full px-3 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent" />
                        </div>
                        <div>
                          <label className="block text-xs text-text-secondary mb-1">Tipo de ingreso</label>
                          <select value={form.inputType} onChange={e => setForm(p => ({ ...p, inputType: e.target.value }))}
                            className="w-full px-3 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent">
                            <option value="floor">Piso (largo × ancho)</option>
                            <option value="wall">Pared (ancho × alto)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">Colores (separados por coma)</label>
                        <input type="text" value={form.colors} onChange={e => setForm(p => ({ ...p, colors: e.target.value }))}
                          placeholder="Blanco, Negro, Gris" className="w-full px-3 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-heading font-semibold text-text-primary uppercase mb-3">Accesorio (opcional)</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">Nombre del accesorio</label>
                        <input type="text" value={form.accessoryName} onChange={e => setForm(p => ({ ...p, accessoryName: e.target.value }))}
                          placeholder="Ej: Perfil J" className="w-full px-3 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-text-secondary mb-1">Precio unitario (costo)</label>
                          <input type="number" step="0.01" value={form.accessoryPrice} onChange={e => setForm(p => ({ ...p, accessoryPrice: e.target.value }))}
                            placeholder="0.00" className="w-full px-3 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent" />
                        </div>
                        <div>
                          <label className="block text-xs text-text-secondary mb-1">Largo (m)</label>
                          <input type="number" step="0.01" value={form.accessoryLength} onChange={e => setForm(p => ({ ...p, accessoryLength: e.target.value }))}
                            placeholder="2.00" className="w-full px-3 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleAddProduct}
                    disabled={!form.name.trim() || !form.width || !form.length}
                    className="w-full py-3 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-bg-dark font-semibold rounded-lg transition-colors"
                  >
                    Agregar Producto
                  </button>
                </div>
              )}

              {activeTab === 'sync' && (
                <div className="space-y-5">
                  <div className="bg-bg-dark rounded-lg border border-border-subtle p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-heading font-semibold text-text-primary">Sincronización en la Nube</h4>
                        <p className="text-xs text-text-secondary mt-1">
                          Guarda precios y productos personalizados en JSONBin.io
                        </p>
                      </div>
                      <button
                        onClick={() => enableSync(!syncEnabled)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          syncEnabled ? 'bg-green-500' : 'bg-border-subtle'
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          syncEnabled ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>

                    {syncEnabled && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">Estado:</span>
                          <span className={`font-medium ${
                            syncStatus === 'synced' ? 'text-green-400' :
                            syncStatus === 'saving' ? 'text-yellow-400' :
                            syncStatus === 'loading' ? 'text-yellow-400' :
                            syncStatus === 'error' ? 'text-red-400' : 'text-text-secondary'
                          }`}>
                            {syncStatus === 'synced' ? 'Sincronizado' :
                             syncStatus === 'saving' ? 'Guardando...' :
                             syncStatus === 'loading' ? 'Cargando...' :
                             syncStatus === 'error' ? 'Error de conexión' : 'Idle'}
                          </span>
                        </div>
                        {lastSynced && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary">Última sincronización:</span>
                            <span className="text-text-primary text-xs">
                              {lastSynced.toLocaleString('es-MX')}
                            </span>
                          </div>
                        )}
                        <button
                          onClick={loadFromCloud}
                          disabled={syncStatus === 'loading' || syncStatus === 'saving'}
                          className="w-full py-2 text-sm font-medium border border-border-subtle rounded-lg hover:bg-surface transition-colors disabled:opacity-40"
                        >
                          Sincronizar ahora
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-bg-dark rounded-lg border border-border-subtle p-4">
                    <h4 className="font-heading font-semibold text-text-primary mb-2">Información</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Al activar la sincronización, tus precios y productos personalizados se guardan en JSONBin.io y se cargan automáticamente en cualquier dispositivo que use el mismo BIN ID.
                    </p>
                    <div className="mt-3 p-2 bg-surface rounded border border-border-subtle">
                      <p className="text-xs text-text-secondary">BIN ID:</p>
                      <p className="text-xs text-accent font-mono break-all">2a$10$1jeowFk4rI03kberVotT5e...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
