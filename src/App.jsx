import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductSelector from './components/ProductSelector'
import AreaInput from './components/AreaInput'
import AreaVisualizer from './components/AreaVisualizer'
import ResultsTable from './components/ResultsTable'
import PrintSummary from './components/PrintSummary'
import PriceManager from './components/PriceManager'
import CustomProductPanel from './components/CustomProductPanel'
import { products } from './data/products'
import { calculateBothModes } from './utils/calculator'
import { usePrices } from './context/PriceContext'

function App() {
  const [selectedProduct, setSelectedProduct] = useState('lambrin')
  const [selectedColor, setSelectedColor] = useState(products.lambrin.colors[0])
  const [areas, setAreas] = useState([])
  const [calculationBoth, setCalculationBoth] = useState(null)
  const [priceDrawerOpen, setPriceDrawerOpen] = useState(false)
  const [customProductPanelOpen, setCustomProductPanelOpen] = useState(false)

  const { prices, priceMode, showToast, toastMessage, customProducts } = usePrices()

  useEffect(() => {
    const allProducts = { ...products }
    customProducts.forEach(cp => { allProducts[cp.id] = cp })
    const current = allProducts[selectedProduct]
    if (current?.colors?.length > 0) {
      setSelectedColor(current.colors[0])
    }
    if (selectedProduct.startsWith('custom_')) {
      setAreas([])
    }
  }, [selectedProduct, customProducts])

  useEffect(() => {
    const allProducts = { ...products }
    customProducts.forEach(cp => { allProducts[cp.id] = cp })
    const current = allProducts[selectedProduct]
    if (areas.length > 0 && selectedProduct && selectedColor && current) {
      const result = calculateBothModes(selectedProduct, areas, selectedColor, prices)
      setCalculationBoth(result)
    } else {
      setCalculationBoth(null)
    }
  }, [selectedProduct, areas, selectedColor, prices, customProducts])

  const handleProductChange = (productId) => setSelectedProduct(productId)
  const handleColorChange = (color) => setSelectedColor(color)
  const handleAreaAdd = (area) => setAreas(prev => [...prev, area])
  const handleAreaRemove = (index) => setAreas(prev => prev.filter((_, i) => i !== index))

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0 }
  }

  const badgeClass = priceMode === 'venta'
    ? 'bg-green-500/20 text-green-400 border-green-500/30'
    : 'bg-red-500/20 text-red-400 border-red-500/30'

  const allProducts = { ...products }
  customProducts.forEach(cp => { allProducts[cp.id] = cp })
  const currentProduct = allProducts[selectedProduct]

  return (
    <div className="min-h-screen bg-bg-dark">
      <header className="bg-surface border-b border-border-subtle sticky top-0 z-40 no-print">
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

            <div className="flex items-center gap-2">
              <span className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${badgeClass}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {priceMode === 'venta' ? 'Venta' : 'Costo'}
              </span>

              <button
                onClick={() => setCustomProductPanelOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-bg-dark hover:bg-border-subtle text-text-secondary hover:text-text-primary border border-border-subtle rounded-lg transition-colors text-sm font-medium"
                title="Gestionar productos y sincronización"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">Productos</span>
              </button>

              <button
                onClick={() => setPriceDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-bg-dark hover:bg-border-subtle text-text-secondary hover:text-text-primary border border-border-subtle rounded-lg transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">Precios</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-surface border border-accent/30 text-text-primary px-4 py-2 rounded-lg shadow-lg text-sm"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <PriceManager isOpen={priceDrawerOpen} onClose={() => setPriceDrawerOpen(false)} />
      <CustomProductPanel isOpen={customProductPanelOpen} onClose={() => setCustomProductPanelOpen(false)} />

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

              <PrintSummary calculationBoth={calculationBoth} priceMode={priceMode} />
            </div>

            <div className="space-y-6">
              {calculationBoth && (
                <>
                  <AreaVisualizer
                    areas={areas}
                    pieceWidth={calculationBoth.venta.pieceWidth}
                    pieceLength={calculationBoth.venta.pieceLength}
                    color={selectedColor?.hex || '#D97706'}
                    productName={currentProduct?.name}
                    inputType={currentProduct?.inputType}
                  />
                </>
              )}

              <ResultsTable calculationBoth={calculationBoth} />
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
