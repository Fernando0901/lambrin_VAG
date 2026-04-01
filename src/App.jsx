import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductSelector from './components/ProductSelector'
import AreaInput from './components/AreaInput'
import AreaVisualizer from './components/AreaVisualizer'
import ResultsTable from './components/ResultsTable'
import PrintSummary from './components/PrintSummary'
import { products } from './data/products'
import { calculateMaterial } from './utils/calculator'

function App() {
  const [selectedProduct, setSelectedProduct] = useState('lambrin')
  const [selectedColor, setSelectedColor] = useState(products.lambrin.colors[0])
  const [areas, setAreas] = useState([])
  const [calculation, setCalculation] = useState(null)

  useEffect(() => {
    if (selectedProduct) {
      const product = products[selectedProduct]
      setSelectedColor(product.colors[0])
      setAreas([])
    }
  }, [selectedProduct])

  useEffect(() => {
    if (areas.length > 0 && selectedProduct && selectedColor) {
      const result = calculateMaterial(selectedProduct, areas, selectedColor)
      setCalculation(result)
    } else {
      setCalculation(null)
    }
  }, [selectedProduct, areas, selectedColor])

  const handleProductChange = (productId) => {
    setSelectedProduct(productId)
  }

  const handleColorChange = (color) => {
    setSelectedColor(color)
  }

  const handleAreaAdd = (area) => {
    setAreas(prev => [...prev, area])
  }

  const handleAreaRemove = (index) => {
    setAreas(prev => prev.filter((_, i) => i !== index))
  }

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0 }
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <header className="bg-surface border-b border-border-subtle sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-bg-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="font-heading font-bold text-xl text-text-primary uppercase tracking-wide">
                  Calculadora de Materiales
                </h1>
                <p className="text-xs text-text-secondary">
                  Lambrin WPC • Piso SPC • Duela PVC
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span> Precios sin IVA</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedProduct}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="space-y-6">
              <div className="bg-surface rounded-xl border border-border-subtle p-5 no-print">
                <ProductSelector
                  selectedProduct={selectedProduct}
                  selectedColor={selectedColor}
                  onProductChange={handleProductChange}
                  onColorChange={handleColorChange}
                />
              </div>

              <div className="bg-surface rounded-xl border border-border-subtle p-5 no-print">
                <AreaInput
                  productId={selectedProduct}
                  areas={areas}
                  onAreaAdd={handleAreaAdd}
                  onAreaRemove={handleAreaRemove}
                />
              </div>

              <PrintSummary calculation={calculation} />
            </div>

            <div className="space-y-6">
              {calculation && (
                <>
                  <AreaVisualizer
                    areas={areas}
                    pieceWidth={calculation.pieceWidth}
                    pieceLength={calculation.pieceLength}
                    color={selectedColor?.hex || '#D97706'}
                    productName={products[selectedProduct]?.name}
                  />
                </>
              )}

              <ResultsTable calculation={calculation} />
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-border-subtle mt-12 py-6 no-print">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-text-secondary">
          <p>
            Calculadora de Materiales de Construcción • Precios sin IVA • IVA = 16%
          </p>
          <p className="mt-1 text-xs">
            © {new Date().getFullYear()} Ferretería Lambrin
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
