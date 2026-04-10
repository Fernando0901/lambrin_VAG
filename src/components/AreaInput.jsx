import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { products } from '../data/products'

export default function AreaInput({ productId, areas, onAreaAdd, onAreaRemove }) {
  const product = products[productId]
  const isWall = product?.inputType === 'wall'

  // Para pared: campo1 = Ancho, campo2 = Alto
  // Para piso:  campo1 = Largo, campo2 = Ancho
  const [field1, setField1] = React.useState('')
  const [field2, setField2] = React.useState('')

  React.useEffect(() => {
    setField1('')
    setField2('')
  }, [productId])

  const handleAdd = () => {
    const val1 = parseFloat(field1) || 0
    const val2 = parseFloat(field2) || 0

    if (val1 > 0 && val2 > 0) {
      if (isWall) {
        // campo1=Ancho → area.width, campo2=Alto → area.length
        onAreaAdd({ width: val1, length: val2 })
      } else {
        // campo1=Largo → area.length, campo2=Ancho → area.width
        onAreaAdd({ width: val2, length: val1 })
      }
      setField1('')
      setField2('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd()
  }

  const totalArea = areas.reduce((sum, area) => sum + (area.width * area.length), 0)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-semibold text-text-primary uppercase tracking-wide">
        {isWall ? 'Dimensiones de Pared' : 'Dimensiones del Área'}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {isWall ? 'Ancho (m)' : 'Largo (m)'}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={field1}
            onChange={(e) => setField1(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="0.00"
            className="w-full px-3 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {isWall ? 'Alto (m)' : 'Ancho (m)'}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={field2}
            onChange={(e) => setField2(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="0.00"
            className="w-full px-3 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAdd}
        disabled={!field1 || !field2}
        className="w-full py-2.5 bg-accent hover:bg-accent-hover disabled:bg-border-subtle disabled:cursor-not-allowed text-bg-dark font-semibold rounded-lg transition-colors"
      >
        + Agregar Área
      </motion.button>

      <AnimatePresence>
        {areas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="border-t border-border-subtle pt-4">
              <h4 className="text-sm font-medium text-text-secondary mb-2">
                Áreas agregadas ({areas.length})
              </h4>
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                <AnimatePresence>
                  {areas.map((area, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-2 bg-bg-dark rounded-lg border border-border-subtle"
                    >
                      <span className="text-sm text-text-primary">
                        {isWall ? (
                          <>
                            {area.width} m ancho × {area.length} m alto ={' '}
                            <span className="text-accent">{(area.width * area.length).toFixed(2)} m²</span>
                          </>
                        ) : (
                          <>
                            {area.length} m largo × {area.width} m ancho ={' '}
                            <span className="text-accent">{(area.width * area.length).toFixed(2)} m²</span>
                          </>
                        )}
                      </span>
                      <button
                        onClick={() => onAreaRemove(index)}
                        className="ml-2 p-1 text-text-secondary hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>

            <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">Área total:</span>
                <span className="text-xl font-heading font-bold text-accent">
                  {totalArea.toFixed(2)} m²
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
