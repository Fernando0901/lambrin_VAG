import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

export default function AreaVisualizer({ areas, pieceWidth, pieceLength, color, productName, inputType = 'floor' }) {
  const totalArea = areas.reduce((sum, a) => sum + (a.width * a.length), 0)
  const pieceArea = pieceWidth * pieceLength
  const piecesNeeded = Math.ceil(totalArea / pieceArea)

  const areaStats = useMemo(() => {
    return areas.map(area => {
      const [dimA, dimB] = inputType === 'wall'
        ? [area.width, area.length]
        : [area.length, area.width]

      const piecesAlongA = Math.floor(dimA / pieceWidth)
      const piecesAlongB = Math.floor(dimB / pieceLength)
      const fullPiecesPerArea = piecesAlongA * piecesAlongB

      const remainingA = dimA - piecesAlongA * pieceWidth
      const remainingB = dimB - piecesAlongB * pieceLength

      const partialAlongA = remainingA > 0.001 ? 1 : 0
      const partialAlongB = remainingB > 0.001 ? 1 : 0

      const totalPiecesForArea = piecesAlongA * piecesAlongB
        + (remainingA > 0.001 ? piecesAlongB : 0)
        + (remainingB > 0.001 ? piecesAlongA : 0)
        + (remainingA > 0.001 && remainingB > 0.001 ? 1 : 0)

      return {
        area,
        piecesAlongA,
        piecesAlongB,
        fullPieces: fullPiecesPerArea,
        partialAlongA,
        partialAlongB,
        totalPiecesForArea,
        remainingA,
        remainingB,
        cutA: remainingA > 0.001 ? remainingA : null,
        cutB: remainingB > 0.001 ? remainingB : null,
        pieceWidth,
        pieceLength
      }
    })
  }, [areas, pieceWidth, pieceLength, inputType])

  const totalFullPieces = areaStats.reduce((sum, s) => sum + s.fullPieces, 0)
  const totalPartialPieces = piecesNeeded - totalFullPieces

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

      <div className="p-4 space-y-6">
        {areaStats.map((stat, idx) => (
          <div key={idx} className="border border-border-subtle rounded-lg overflow-hidden">
            <div className="bg-bg-dark px-4 py-2 flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">
                {inputType === 'wall' ? 'Pared' : 'Área'} {idx + 1}
              </span>
              <span className="text-xs text-text-secondary">
                {inputType === 'wall'
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
                    viewBox={`0 0 ${stat.piecesAlongA * 50 + 60} ${stat.piecesAlongB * 50 + 60}`}
                    className="w-full"
                    style={{ maxHeight: 220 }}
                  >
                    <rect x="5" y="5" width={stat.piecesAlongA * 50} height={stat.piecesAlongB * 50}
                      fill={`${color}25`} stroke={color} strokeWidth="2" />

                    {Array.from({ length: stat.piecesAlongA }).map((_, px) =>
                      Array.from({ length: stat.piecesAlongB }).map((_, py) => (
                        <rect
                          key={`${px}-${py}`}
                          x={10 + px * 50}
                          y={10 + py * 50}
                          width={45}
                          height={45}
                          fill={color}
                          stroke="#374151"
                          strokeWidth="1"
                          rx="2"
                        />
                      ))
                    )}

                    {stat.partialAlongA > 0 && Array.from({ length: stat.piecesAlongB }).map((_, py) => (
                      <rect
                        key={`partial-a-${py}`}
                        x={10 + stat.piecesAlongA * 50}
                        y={10 + py * 50}
                        width={45}
                        height={45}
                        fill={`${color}AA`}
                        stroke="#374151"
                        strokeWidth="1"
                        strokeDasharray="4 2"
                        rx="2"
                      />
                    ))}

                    {stat.partialAlongB > 0 && Array.from({ length: stat.piecesAlongA }).map((_, px) => (
                      <rect
                        key={`partial-b-${px}`}
                        x={10 + px * 50}
                        y={10 + stat.piecesAlongB * 50}
                        width={45}
                        height={45}
                        fill={`${color}AA`}
                        stroke="#374151"
                        strokeWidth="1"
                        strokeDasharray="4 2"
                        rx="2"
                      />
                    ))}

                    {stat.partialAlongA > 0 && stat.partialAlongB > 0 && (
                      <rect
                        x={10 + stat.piecesAlongA * 50}
                        y={10 + stat.piecesAlongB * 50}
                        width={45}
                        height={45}
                        fill={`${color}77`}
                        stroke="#374151"
                        strokeWidth="1"
                        strokeDasharray="4 2"
                        rx="2"
                      />
                    )}

                    <line x1="5" y1="5" x2={5 + stat.piecesAlongA * 50} y2="5" stroke="#9CA3AF" strokeWidth="1" />
                    <line x1="5" y1="5" x2="5" y2={5 + stat.piecesAlongB * 50} stroke="#9CA3AF" strokeWidth="1" />

                    <text x={5 + (stat.piecesAlongA * 50) / 2} y="0" textAnchor="middle" fontSize="8" fill="#9CA3AF">
                      {stat.piecesAlongA} pieza{stat.piecesAlongA !== 1 ? 's' : ''} × {pieceWidth}m
                    </text>
                    <text x="0" y={5 + (stat.piecesAlongB * 50) / 2} textAnchor="middle" fontSize="8" fill="#9CA3AF"
                      transform={`rotate(-90, 0, ${5 + (stat.piecesAlongB * 50) / 2})`}>
                      {stat.piecesAlongB} pieza{stat.piecesAlongB !== 1 ? 's' : ''} × {pieceLength}m
                    </text>
                  </svg>
                </div>

                <div className="w-40 flex flex-col justify-center space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Piezas completas:</span>
                    <span className="text-text-primary font-medium">{stat.fullPieces}</span>
                  </div>
                  {stat.partialAlongA > 0 && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Corte en A:</span>
                      <span className="text-amber-400 font-medium">{stat.cutA?.toFixed(3)} m</span>
                    </div>
                  )}
                  {stat.partialAlongB > 0 && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Corte en B:</span>
                      <span className="text-amber-400 font-medium">{stat.cutB?.toFixed(3)} m</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border-subtle pt-2">
                    <span className="text-text-secondary">Subtotal:</span>
                    <span className="text-accent font-bold">{stat.totalPiecesForArea} pieza{stat.totalPiecesForArea !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
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
              <p className="text-2xl font-heading font-bold text-text-primary">{piecesNeeded}</p>
              <p className="text-xs text-text-secondary mt-1">total piezas</p>
            </div>
          </div>

          {areaStats.some(s => s.partialAlongA > 0 || s.partialAlongB > 0) && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <h5 className="text-xs font-heading font-semibold text-text-secondary uppercase mb-2">
                Instrucciones de Corte
              </h5>
              <ul className="space-y-1">
                {areaStats.map((stat, idx) => {
                  const cuts = []
                  if (stat.partialAlongA > 0) cuts.push(`Cortar ${stat.piecesAlongB} pieza${stat.piecesAlongB !== 1 ? 's' : ''} a ${stat.cutA?.toFixed(3)} m (ancho)`)
                  if (stat.partialAlongB > 0) cuts.push(`Cortar ${stat.piecesAlongA} pieza${stat.piecesAlongA !== 1 ? 's' : ''} a ${stat.cutB?.toFixed(3)} m (largo)`)
                  if (stat.partialAlongA > 0 && stat.partialAlongB > 0) cuts.push(`1 esquina requiere corte ${stat.cutA?.toFixed(3)} m × ${stat.cutB?.toFixed(3)} m`)
                  if (cuts.length === 0) return null
                  return (
                    <li key={idx} className="text-xs text-text-secondary">
                      <span className="text-accent font-medium">{inputType === 'wall' ? 'Pared' : 'Área'} {idx + 1}:</span>{' '}
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
      </div>
    </motion.div>
  )
}
