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
  const isFloor = !isWall

  const areaStats = useMemo(() => {
    return areas.map((area, idx) => {
      const placement = placements[idx]
      if (!placement) return null

      const {
        columns, rows, pieces,
        pieceDimAlongWidth, pieceDimAlongLength,
        cutWidth, cutLength
      } = placement

      // Calcular desglose detallado de cortes
      const fullCols = cutWidth ? columns - 1 : columns
      const fullRows = cutLength ? rows - 1 : rows

      const fullPieces = fullCols * fullRows
      const cutWidthPieces = cutWidth ? fullRows : 0          // piezas cortadas solo en ancho
      const cutLengthPieces = cutLength ? fullCols : 0        // piezas cortadas solo en largo
      const cutCornerPieces = (cutWidth && cutLength) ? 1 : 0 // pieza esquina (doble corte)

      return {
        area,
        columns, rows, pieces,
        pieceDimAlongWidth, pieceDimAlongLength,
        cutWidth, cutLength,
        fullCols, fullRows,
        fullPieces,
        cutWidthPieces,
        cutLengthPieces,
        cutCornerPieces
      }
    }).filter(Boolean)
  }, [areas, placements])

  const totalPieces = areaStats.reduce((sum, s) => sum + s.pieces, 0)
  const totalArea = areas.reduce((sum, a) => sum + (a.width * a.length), 0)
  const totalFullPieces = areaStats.reduce((sum, s) => sum + s.fullPieces, 0)
  const totalCutPieces = totalPieces - totalFullPieces

  // Etiquetas de dimensión según orientación
  const pieceLabelLong = `${pieceLength} m`
  const pieceLabelShort = `${pieceWidth} m`

  let dimAlongWidthLabel, dimAlongLengthLabel
  if (orientation === 'horizontal') {
    if (isWall) {
      dimAlongWidthLabel = pieceLabelShort
      dimAlongLengthLabel = pieceLabelLong
    } else {
      dimAlongWidthLabel = pieceLabelLong
      dimAlongLengthLabel = pieceLabelShort
    }
  } else {
    if (isWall) {
      dimAlongWidthLabel = pieceLabelLong
      dimAlongLengthLabel = pieceLabelShort
    } else {
      dimAlongWidthLabel = pieceLabelShort
      dimAlongLengthLabel = pieceLabelLong
    }
  }

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
            Pieza: {pieceWidth} × {pieceLength} m
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
            Orientación: <span className="text-accent font-bold">{orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}</span>
          </span>
          <span className="text-xs text-text-secondary ml-1">
            ({isWall ? 'ancho' : 'ancho'}: {dimAlongWidthLabel} | {isWall ? 'alto' : 'largo'}: {dimAlongLengthLabel})
          </span>
        </button>
      </div>

      <div className="p-4 space-y-6">
        {areaStats.map((stat, idx) => {
          // SVG proporcional al área real
          const maxSvgW = 400
          const maxSvgH = 280
          const margin = { top: 18, right: 10, bottom: 10, left: 22 }

          const areaW = stat.area.width
          const areaH = stat.area.length

          const drawW = maxSvgW - margin.left - margin.right
          const drawH = maxSvgH - margin.top - margin.bottom

          const scale = Math.min(drawW / areaW, drawH / areaH)
          const svgAreaW = areaW * scale
          const svgAreaH = areaH * scale

          const svgW = svgAreaW + margin.left + margin.right
          const svgH = svgAreaH + margin.top + margin.bottom

          const cellW = stat.pieceDimAlongWidth * scale
          const cellH = stat.pieceDimAlongLength * scale
          const cutCellW = stat.cutWidth ? stat.cutWidth * scale : 0
          const cutCellH = stat.cutLength ? stat.cutLength * scale : 0

          const isBrick = isFloor

          return (
            <div key={idx} className="border border-border-subtle rounded-lg overflow-hidden">
              <div className="bg-bg-dark px-4 py-2 flex items-center justify-between flex-wrap gap-2">
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
                <div className="flex gap-4 flex-col lg:flex-row">
                  {/* SVG visualización */}
                  <div className="flex-1 flex justify-center">
                    <svg
                      viewBox={`0 0 ${svgW} ${svgH}`}
                      className="w-full"
                      style={{ maxHeight: 300, maxWidth: 420 }}
                    >
                      {/* Borde del área */}
                      <rect
                        x={margin.left}
                        y={margin.top}
                        width={svgAreaW}
                        height={svgAreaH}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                      />

                      {/* Piezas - renderizar fila por fila */}
                      {Array.from({ length: stat.rows }).map((_, row) => {
                        const isOddRow = row % 2 === 1
                        const brickOffset = (isBrick && isOddRow) ? cellW / 2 : 0
                        const yPos = margin.top + row * cellH
                        const h = (row < stat.fullRows) ? cellH : cutCellH

                        // Para patrón cocido en filas impares, necesitamos generar piezas
                        // que llenen completamente el ancho incluyendo el offset
                        const piecesInRow = []

                        if (isBrick && isOddRow) {
                          // Fila con offset: media pieza al inicio
                          // Primera media pieza
                          piecesInRow.push({
                            x: margin.left,
                            w: Math.min(cellW / 2, svgAreaW),
                            isCut: true,
                            isHalfBrick: true
                          })

                          // Piezas completas después del offset
                          let currentX = cellW / 2
                          for (let col = 0; currentX < svgAreaW - 0.5; col++) {
                            const remaining = svgAreaW - currentX
                            const w = Math.min(cellW, remaining)
                            const isCutW = w < cellW - 0.5
                            piecesInRow.push({
                              x: margin.left + currentX,
                              w: w,
                              isCut: isCutW || (row >= stat.fullRows),
                              isHalfBrick: false
                            })
                            currentX += cellW
                          }
                        } else {
                          // Fila normal (sin offset)
                          for (let col = 0; col < stat.columns; col++) {
                            const w = (col < stat.fullCols) ? cellW : cutCellW
                            piecesInRow.push({
                              x: margin.left + col * cellW,
                              w: w,
                              isCut: (col >= stat.fullCols) || (row >= stat.fullRows),
                              isHalfBrick: false
                            })
                          }
                        }

                        return piecesInRow.map((piece, pi) => (
                          <rect
                            key={`${row}-${pi}`}
                            x={piece.x + 0.5}
                            y={yPos + 0.5}
                            width={Math.max(piece.w - 1, 1)}
                            height={Math.max(h - 1, 1)}
                            fill={piece.isCut || piece.isHalfBrick ? `${color}88` : color}
                            stroke="#374151"
                            strokeWidth="0.5"
                            strokeDasharray={piece.isCut || piece.isHalfBrick ? "3 1.5" : "none"}
                            rx="1"
                          />
                        ))
                      })}

                      {/* Etiqueta superior: ancho */}
                      <text
                        x={margin.left + svgAreaW / 2}
                        y={margin.top - 5}
                        textAnchor="middle"
                        fontSize="8"
                        fill="#9CA3AF"
                      >
                        {isWall ? 'Ancho' : 'Ancho'}: {stat.area.width} m ({stat.columns} × {stat.pieceDimAlongWidth}m)
                      </text>

                      {/* Etiqueta lateral: largo/alto */}
                      <text
                        x={margin.left - 5}
                        y={margin.top + svgAreaH / 2}
                        textAnchor="middle"
                        fontSize="8"
                        fill="#9CA3AF"
                        transform={`rotate(-90, ${margin.left - 5}, ${margin.top + svgAreaH / 2})`}
                      >
                        {isWall ? 'Alto' : 'Largo'}: {stat.area.length} m ({stat.rows} × {stat.pieceDimAlongLength}m)
                      </text>
                    </svg>
                  </div>

                  {/* Detalles numéricos */}
                  <div className="w-full lg:w-52 flex flex-col justify-center space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Columnas:</span>
                      <span className="text-text-primary font-medium">{stat.columns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Filas:</span>
                      <span className="text-text-primary font-medium">{stat.rows}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Piezas completas:</span>
                      <span className="text-green-400 font-medium">{stat.fullPieces}</span>
                    </div>

                    {stat.cutWidthPieces > 0 && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Cortadas ({isWall ? 'ancho' : 'ancho'}):</span>
                        <span className="text-amber-400 font-medium">{stat.cutWidthPieces} pza{stat.cutWidthPieces !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {stat.cutLengthPieces > 0 && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Cortadas ({isWall ? 'alto' : 'largo'}):</span>
                        <span className="text-amber-400 font-medium">{stat.cutLengthPieces} pza{stat.cutLengthPieces !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {stat.cutCornerPieces > 0 && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Esquina (doble corte):</span>
                        <span className="text-amber-400 font-medium">{stat.cutCornerPieces} pza</span>
                      </div>
                    )}

                    {isBrick && stat.rows > 1 && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Patrón:</span>
                        <span className="text-amber-400 font-medium">Cocido ½</span>
                      </div>
                    )}

                    <div className="flex justify-between border-t border-border-subtle pt-2 mt-1">
                      <span className="text-text-secondary font-medium">Subtotal:</span>
                      <span className="text-accent font-bold">{stat.pieces} pieza{stat.pieces !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Instrucciones de corte detalladas por área */}
                {(stat.cutWidth || stat.cutLength || (isBrick && stat.rows > 1)) && (
                  <div className="mt-4 pt-3 border-t border-border-subtle/50">
                    <h5 className="text-xs font-heading font-semibold text-text-secondary uppercase mb-2">
                      Detalle de cortes — {isWall ? 'Pared' : 'Área'} {idx + 1}
                    </h5>
                    <div className="space-y-1.5">
                      {stat.cutWidth && (
                        <div className="flex items-start gap-2 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                          <span className="text-text-secondary">
                            <span className="text-amber-400 font-medium">{stat.cutWidthPieces} pieza{stat.cutWidthPieces !== 1 ? 's' : ''}</span> cortada{stat.cutWidthPieces !== 1 ? 's' : ''} a{' '}
                            <span className="text-text-primary font-medium">{stat.cutWidth.toFixed(3)} m</span> en la medida de{' '}
                            <span className="text-text-primary">{stat.pieceDimAlongWidth} m</span> ({isWall ? 'ancho' : 'ancho'} de pieza)
                          </span>
                        </div>
                      )}
                      {stat.cutLength && (
                        <div className="flex items-start gap-2 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                          <span className="text-text-secondary">
                            <span className="text-amber-400 font-medium">{stat.cutLengthPieces} pieza{stat.cutLengthPieces !== 1 ? 's' : ''}</span> cortada{stat.cutLengthPieces !== 1 ? 's' : ''} a{' '}
                            <span className="text-text-primary font-medium">{stat.cutLength.toFixed(3)} m</span> en la medida de{' '}
                            <span className="text-text-primary">{stat.pieceDimAlongLength} m</span> ({isWall ? 'alto' : 'largo'} de pieza)
                          </span>
                        </div>
                      )}
                      {stat.cutCornerPieces > 0 && (
                        <div className="flex items-start gap-2 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 shrink-0" />
                          <span className="text-text-secondary">
                            <span className="text-red-400 font-medium">1 pieza esquina</span> con doble corte:{' '}
                            <span className="text-text-primary font-medium">{stat.cutWidth.toFixed(3)} m × {stat.cutLength.toFixed(3)} m</span>
                          </span>
                        </div>
                      )}
                      {isBrick && stat.rows > 1 && (
                        <div className="flex items-start gap-2 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 shrink-0" />
                          <span className="text-text-secondary">
                            <span className="text-blue-400 font-medium">Patrón cocido:</span> las filas impares inician con media pieza ({(stat.pieceDimAlongWidth / 2).toFixed(3)} m), cortar por la mitad y pegar.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Resumen Total */}
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
              <p className="text-2xl font-heading font-bold text-amber-400">{totalCutPieces}</p>
              <p className="text-xs text-text-secondary mt-1">piezas con corte</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-text-primary">{totalPieces}</p>
              <p className="text-xs text-text-secondary mt-1">total piezas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="px-4 pb-4 flex items-center gap-4 text-xs text-text-secondary flex-wrap">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
          <span>Pieza completa</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm border border-dashed border-gray-500" style={{ backgroundColor: `${color}88` }} />
          <span>Pieza con corte</span>
        </div>
        {isFloor && (
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-blue-400/50 border border-dashed border-blue-400" />
            <span>Patrón cocido</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
