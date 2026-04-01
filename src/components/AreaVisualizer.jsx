import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function AreaVisualizer({ areas, pieceWidth, pieceLength, color, productName }) {
  const canvasRef = useRef(null)

  const totalArea = areas.reduce((sum, area) => sum + (area.width * area.length), 0)
  const pieceArea = pieceWidth * pieceLength
  const piecesNeeded = Math.ceil(totalArea / pieceArea)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    const containerWidth = canvas.parentElement?.clientWidth || 400
    const containerHeight = 300

    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, containerWidth, containerHeight)

    const maxDimension = Math.max(
      ...areas.map(a => Math.max(a.width, a.length)),
      pieceWidth * 5,
      pieceLength * 5
    )

    const padding = 40
    const availableWidth = containerWidth - padding * 2
    const availableHeight = containerHeight - padding * 2
    const scale = Math.min(availableWidth / maxDimension, availableHeight / maxDimension) * 0.8

    const centerX = containerWidth / 2
    const centerY = containerHeight / 2

    ctx.save()
    ctx.translate(centerX, centerY)

    const sortedAreas = [...areas].sort((a, b) => (b.width * b.length) - (a.width * a.length))
    let offsetX = 0
    let offsetY = 0
    let rowMaxHeight = 0

    const gap = 4

    sortedAreas.forEach((area, areaIndex) => {
      const areaWidthPx = area.width * scale
      const areaHeightPx = area.length * scale

      if (offsetX + areaWidthPx > availableWidth && offsetX > 0) {
        offsetX = 0
        offsetY += rowMaxHeight + gap
        rowMaxHeight = 0
      }

      ctx.fillStyle = '#1F2937'
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(offsetX, offsetY, areaWidthPx, areaHeightPx, 4)
      ctx.fill()
      ctx.stroke()

      const piecesX = Math.ceil(areaWidthPx / (pieceWidth * scale))
      const piecesY = Math.ceil(areaHeightPx / (pieceLength * scale))

      for (let px = 0; px < piecesX; px++) {
        for (let py = 0; py < piecesY; py++) {
          const pieceX = offsetX + px * pieceWidth * scale
          const pieceY = offsetY + py * pieceLength * scale
          const pieceW = pieceWidth * scale
          const pieceH = pieceLength * scale

          const isLastX = px === piecesX - 1 && pieceX + pieceW > offsetX + areaWidthPx
          const isLastY = py === piecesY - 1 && pieceY + pieceH > offsetY + areaHeightPx
          const isPartial = isLastX || isLastY

          if (pieceX + pieceW <= offsetX + areaWidthPx + 1 && pieceY + pieceH <= offsetY + areaHeightPx + 1) {
            if (isPartial) {
              ctx.fillStyle = `${color}CC`
              ctx.strokeStyle = `${color}88`
            } else {
              ctx.fillStyle = color
              ctx.strokeStyle = '#374151'
            }
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.rect(pieceX, pieceY, Math.min(pieceW, offsetX + areaWidthPx - pieceX), Math.min(pieceH, offsetY + areaHeightPx - pieceY))
            ctx.fill()
            ctx.stroke()

            if (isPartial) {
              ctx.strokeStyle = '#00000030'
              ctx.lineWidth = 1
              const size = Math.min(pieceW, pieceH) * 0.1
              for (let i = 0; i < 5; i++) {
                ctx.beginPath()
                ctx.moveTo(pieceX + (pieceW / 5) * i, pieceY)
                ctx.lineTo(pieceX, pieceY + (pieceH / 5) * i)
                ctx.stroke()
              }
            }
          }
        }
      }

      ctx.fillStyle = '#9CA3AF'
      ctx.font = '10px DM Sans'
      ctx.textAlign = 'center'
      ctx.fillText(`${area.width}×${area.length}m`, offsetX + areaWidthPx / 2, offsetY + areaHeightPx + 14)

      offsetX += areaWidthPx + gap
      rowMaxHeight = Math.max(rowMaxHeight, areaHeightPx)
    })

    ctx.restore()

    ctx.fillStyle = '#9CA3AF'
    ctx.font = '11px DM Sans'
    ctx.textAlign = 'left'
    let infoY = containerHeight - 20
    ctx.fillStyle = '#D97706'
    ctx.fillText(`Total: ${totalArea.toFixed(2)} m²`, 20, infoY - 12)
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText(`Piezas: ${piecesNeeded} | Dimensión pieza: ${pieceWidth}×${pieceLength}m`, 20, infoY)

  }, [areas, pieceWidth, pieceLength, color, totalArea, piecesNeeded])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surface rounded-xl border border-border-subtle p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-semibold text-text-primary uppercase tracking-wide">
          Distribución de Piezas
        </h3>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
          <span className="text-xs text-text-secondary">{productName}</span>
        </div>
      </div>
      <div className="relative bg-bg-dark rounded-lg overflow-hidden" style={{ minHeight: 300 }}>
        <canvas ref={canvasRef} className="w-full" />
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-text-secondary">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
          <span>Pieza completa</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: `${color}CC` }} />
          <span>Con corte</span>
        </div>
      </div>
    </motion.div>
  )
}
