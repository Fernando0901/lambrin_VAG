import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

export default function AreaVisualizer({
  areas,
  pieceWidth,
  pieceLength,
  color,
  productName,
  inputType = 'floor',
  orientation = 'horizontal',
  onToggleOrientation,
  placements = []
}) {
  const isWall = inputType === 'wall'
  const isFloor = inputType === 'floor'

  const areaStats = useMemo(() => {
    return areas.map((area, idx) => {
      const placement = placements[idx]
      if (!placement) return null

      const {
        columns, rows, pieces,
        pieceDimAlongWidth, pieceDimAlongLength,
        cutWidth, cutLength
      } = placement

      return {
        area,
        columns,
        rows,
        pieces,
        pieceDimAlongWidth,
        pieceDimAlongLength,
        cutWidth,
        cutLength
      }
    }).filter(Boolean)
  }, [areas, placements])

  const totalPieces = areaStats.reduce((sum, s) => sum + s.pieces, 0)
  const totalArea = areas.reduce((sum, a) => sum + (a.width * a.length), 0)

  const totalFullPieces = areaStats.reduce((sum, s) => {
    const fullCols = s.cutWidth ? s.columns - 1 : s.columns
    const fullRows = s.cutLength ? s.rows - 1 : s.rows
    return sum + fullCols * fullRows
  }, 0)
  const totalPartialPieces = totalPieces - totalFullPieces

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surface rounded-xl border border-border-subtle overflow-hidden"
    >
      <div className="p-4 border-b border-border-subtle flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-heading font-semibold text-text-primary uppercase tracking-wide">
          Distribución de Piezas
        </h3>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
          <span className="text-xs text-text-secondary">{productName}</span>
          <span className="text-xs text-text-secondary ml-2">
            {pieceWidth} × {pieceLength} m
          </span>
        </div>
      </div>

      {/* Botón de cambio de orientación */}
      <div className="px-4 pt-4">
        <button
          onClick={onToggleOrientation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-bg-dark hover:bg-border-subtle border border-border-subtle rounded-lg transition-colors text-sm font-medium text-text-primary"
        >
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span>
            Cambiar orientación: <span className="text-accent font-bold">{orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}</span>
          </span>
          <span className="text-xs text-text-secondary ml-1">
            ({orientation === 'horizontal'
              ? (isWall
                ? `${pieceLength}m ↕ × ${pieceWidth}m ↔`
                : `${pieceLength}m ↔ × ${pieceWidth}m ↕`)
              : (isWall
                ? `${pieceWidth}m ↕ × ${pieceLength}m ↔`
                : `${pieceWidth}m ↔ × ${pieceLength}m ↕`)
            })
          </span>
        </button>
      </div>

      <div className="p-4 space-y-6">
        {areaStats.map((stat, idx) => {
          const cellW = 50
          const cellH = 50
          const padding = 10
          const labelSpace = 20

          // For brick pattern on floors, offset odd rows
          const isBrick = isFloor

          const svgW = stat.columns * cellW + padding * 2 + labelSpace
          const svgH = stat.rows * cellH + padding * 2 + labelSpace

          return (
            <div key={idx} className="border border-border-subtle rounded-lg overflow-hidden">
              <div className="bg-bg-dark px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">
                  {isWall ? 'Pared' : 'Área'} {idx + 1}
                </span>
                <span className="text-xs text-text-secondary">
                  {isWall
                    ? `${stat.area.width} m ancho × ${stat.area.length} m alto`
                    : `${stat.area.length} m largo × ${stat.area.width} m ancho`}
                  {' = '}
                  <span className="text-accent">{(stat.area.width * stat.area.length).toFixed(2)} m²</span>
                </span>
              </div>

              <div className="p-4">
                <div className="flex gap-6">
                  <div className="flex-1">
                    <svg
                      viewBox={`0 0 ${svgW} ${svgH}`}
                      className="w-full"
                      style={{ maxHeight: 260 }}
                    >
                      {/* Fondo del área */}
                      <rect
                        x={labelSpace}
                        y={padding}
                        width={stat.columns * cellW}
                        height={stat.rows * cellH}
                        fill={`${color}15`}
                        stroke={color}
                        strokeWidth="2"
                      />

                      {/* Piezas */}
                      {Array.from({ length: stat.rows }).map((_, row) => {
                        const offsetX = (isBrick && row % 2 === 1) ? cellW / 2 : 0
                        const isLastRow = row === stat.rows - 1 && stat.cutLength
                        return Array.from({ length: stat.columns }).map((_, col) => {
                          const isLastCol = col === stat.columns - 1 && stat.cutWidth
                          const isCut = isLastRow || isLastCol

                          // For brick pattern: first piece of odd row is "half"
                          const isBrickHalf = isBrick && row % 2 === 1 && (col === 0 || col === stat.columns - 1)

                          const x = labelSpace + padding / 2 + col * cellW + offsetX
                          const y = padding + padding / 2 + row * cellH
                          const w = cellW - padding / 2
                          const h = cellH - padding / 2

                          // Clip pieces to the area boundary
                          const maxX = labelSpace + stat.columns * cellW
                          const clippedW = Math.min(w, maxX - x - 2)
                          if (clippedW <= 2) return null

                          return (
                            <rect
                              key={`${row}-${col}`}
                              x={x}
                              y={y}
                              width={clippedW}
                              height={h}
                              fill={isCut || isBrickHalf ? `${color}AA` : color}
                              stroke="#374151"
                              strokeWidth="1"
                              strokeDasharray={isCut || isBrickHalf ? "4 2" : "none"}
                              rx="2"
                            />
                          )
                        })
                      })}

                      {/* Etiqueta superior: columnas */}
                      <text
                        x={labelSpace + (stat.columns * cellW) / 2}
                        y={padding - 2}
                        textAnchor="middle"
                        fontSize="8"
                        fill="#9CA3AF"
                      >
                        {stat.columns} col × {stat.pieceDimAlongWidth}m
                        {stat.cutWidth ? ` (últ: ${stat.cutWidth.toFixed(3)}m)` : ''}
                      </text>

                      {/* Etiqueta lateral: filas */}
                      <text
                        x={labelSpace - 4}
                        y={padding + (stat.rows * cellH) / 2}
                        textAnchor="middle"
                        fontSize="8"
                        fill="#9CA3AF"
                        transform={`rotate(-90, ${labelSpace - 4}, ${padding + (stat.rows * cellH) / 2})`}
                      >
                        {stat.rows} filas × {stat.pieceDimAlongLength}m
                        {stat.cutLength ? ` (últ: ${stat.cutLength.toFixed(3)}m)` : ''}
                      </text>

                      {/* Indicador de patrón cocido */}
                      {isBrick && stat.rows > 1 && (
                        <text
                          x={labelSpace + (stat.columns * cellW) / 2}
                          y={svgH - 2}
                          textAnchor="middle"
                          fontSize="7"
                          fill="#D97706"
                        >
                          Patrón cocido (desfase ½ pieza)
                        </text>
                      )}
                    </svg>
                  </div>

                  <div className="w-44 flex flex-col justify-center space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Columnas:</span>
                      <span className="text-text-primary font-medium">{stat.columns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Filas:</span>
                      <span className="text-text-primary font-medium">{stat.rows}</span>
                    </div>
                    {stat.cutWidth && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Corte ancho:</span>
                        <span className="text-amber-400 font-medium">{stat.cutWidth.toFixed(3)} m</span>
                      </div>
                    )}
                    {stat.cutLength && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Corte {isWall ? 'alto' : 'largo'}:</span>
                        <span className="text-amber-400 font-medium">{stat.cutLength.toFixed(3)} m</span>
                      </div>
                    )}
                    {isBrick && stat.rows > 1 && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Patrón:</span>
                        <span className="text-amber-400 font-medium">Cocido ½</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-border-subtle pt-2">
                      <span className="text-text-secondary">Subtotal:</span>
                      <span className="text-accent font-bold">{stat.pieces} pieza{stat.pieces !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 pb-4">
        <div className="bg-bg-dark rounded-lg p-4 border border-border-subtle">
          <h4 className="text-sm font-heading font-semibold text-text-primary uppercase mb-3">
            Resumen Total
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-accent">{totalArea.toFixed(2)}</p>
              <p className="text-xs text-text-secondary mt-1">m² área total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-green-400">{totalFullPieces}</p>
              <p className="text-xs text-text-secondary mt-1">piezas completas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-amber-400">{totalPartialPieces}</p>
              <p className="text-xs text-text-secondary mt-1">piezas con corte</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-text-primary">{totalPieces}</p>
              <p className="text-xs text-text-secondary mt-1">total piezas</p>
            </div>
          </div>

          {areaStats.some(s => s.cutWidth || s.cutLength) && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <h5 className="text-xs font-heading font-semibold text-text-secondary uppercase mb-2">
                Instrucciones de Corte
              </h5>
              <ul className="space-y-1">
                {areaStats.map((stat, idx) => {
                  const cuts = []
                  if (stat.cutWidth) {
                    const pcsForCut = stat.cutLength ? stat.rows - 1 : stat.rows
                    cuts.push(`Cortar ${pcsForCut} pieza${pcsForCut !== 1 ? 's' : ''} a ${stat.cutWidth.toFixed(3)} m (ancho)`)
                  }
                  if (stat.cutLength) {
                    const pcsForCut = stat.cutWidth ? stat.columns - 1 : stat.columns
                    cuts.push(`Cortar ${pcsForCut} pieza${pcsForCut !== 1 ? 's' : ''} a ${stat.cutLength.toFixed(3)} m (${isWall ? 'alto' : 'largo'})`)
                  }
                  if (stat.cutWidth && stat.cutLength) {
                    cuts.push(`1 esquina: corte ${stat.cutWidth.toFixed(3)} m × ${stat.cutLength.toFixed(3)} m`)
                  }
                  if (isFloor && stat.rows > 1) {
                    cuts.push(`Patrón cocido: cortar 1 pieza por la mitad para filas impares`)
                  }
                  if (cuts.length === 0) return null
                  return (
                    <li key={idx} className="text-xs text-text-secondary">
                      <span className="text-accent font-medium">{isWall ? 'Pared' : 'Área'} {idx + 1}:</span>{' '}
                      {cuts.join(' | ')}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 flex items-center gap-4 text-xs text-text-secondary">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
          <span>Completa</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: `${color}AA` }} />
          <span>Con corte (punteado)</span>
        </div>
        {isFloor && (
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-amber-500/50" />
            <span>Patrón cocido</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
