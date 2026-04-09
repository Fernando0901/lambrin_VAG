import { motion } from 'framer-motion'
import { products } from '../data/products'
import { usePrices } from '../context/PriceContext'

export default function ProductSelector({ selectedProduct, selectedColor, onProductChange, onColorChange }) {
  const { priceMode, customProducts } = usePrices()

  const allProducts = [
    ...Object.values(products),
    ...customProducts
  ]

  const badgeClass = priceMode === 'venta'
    ? 'bg-green-500/20 text-green-400 border-green-500/30'
    : 'bg-red-500/20 text-red-400 border-red-500/30'

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4 uppercase tracking-wide">
          Selecciona un Producto
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {allProducts.map((product) => (
            <motion.button
              key={product.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onProductChange(product.id)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedProduct === product.id
                  ? 'border-accent bg-surface shadow-lg shadow-accent/20'
                  : 'border-border-subtle bg-surface/50 hover:border-accent/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h4 className="font-heading font-semibold text-lg text-text-primary">
                    {product.name}
                    {product.isCustom && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 bg-accent/20 text-accent rounded">Custom</span>
                    )}
                  </h4>
                  <p className="text-sm text-text-secondary mt-1">
                    {product.dimensions.width} m × {product.dimensions.length} m
                  </p>
                </div>
                {selectedProduct === product.id && (
                  <motion.div
                    layoutId="selectedProduct"
                    className="w-6 h-6 rounded-full bg-accent flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-bg-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-semibold text-text-primary uppercase tracking-wide">
            Selecciona un Color
          </h3>
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeClass}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {priceMode === 'venta' ? 'Venta' : 'Costo'}
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {allProducts.find(p => p.id === selectedProduct)?.colors.map((color) => (
            <motion.button
              key={color.name}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onColorChange(color)}
              className={`relative w-14 h-14 rounded-full border-2 transition-all duration-200 ${
                selectedColor?.name === color.name
                  ? 'border-accent ring-2 ring-accent ring-offset-2 ring-offset-bg-dark'
                  : 'border-border-subtle hover:border-accent/50'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {selectedColor?.name === color.name && (
                <motion.div
                  layoutId={`color-${selectedProduct}`}
                  className="absolute inset-0 rounded-full flex items-center justify-center"
                >
                  <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
        {selectedColor && (
          <p className="mt-2 text-sm text-text-secondary">
            Color seleccionado: <span className="text-accent font-medium">{selectedColor.name}</span>
          </p>
        )}
      </div>
    </div>
  )
}
