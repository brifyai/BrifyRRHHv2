/**
 * Advanced Data Visualization
 * Sistema de visualización de datos avanzada con gráficos interactivos
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { 
  ChartBarIcon,
  ChartPieIcon,
  ChartLineIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

const AdvancedDataVisualization = ({ 
  data = [], 
  title = "Visualización de Datos",
  type = "auto",
  height = 400,
  interactive = true,
  exportable = true,
  theme = "light"
}) => {
  const [chartType, setChartType] = useState(type)
  const [selectedDataPoint, setSelectedDataPoint] = useState(null)
  const [filters, setFilters] = useState({})
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [animationEnabled, setAnimationEnabled] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animationRef = useRef(null)

  // Procesar datos según el tipo de gráfico
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    // Aplicar filtros
    let filteredData = data.filter(item => {
      if (searchTerm) {
        return Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      return true
    })

    // Aplicar filtros adicionales
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filteredData = filteredData.filter(item => item[key] === value)
      }
    })

    return filteredData
  }, [data, filters, searchTerm])

  // Calcular estadísticas
  const statistics = useMemo(() => {
    if (processedData.length === 0) return null
    
    const numericValues = processedData
      .filter(item => typeof item.value === 'number')
      .map(item => item.value)
    
    if (numericValues.length === 0) return null
    
    return {
      total: numericValues.reduce((sum, val) => sum + val, 0),
      average: numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length,
      min: Math.min(...numericValues),
      max: Math.max(...numericValues),
      count: numericValues.length,
      trend: numericValues.length > 1 ? 
        (numericValues[numericValues.length - 1] - numericValues[0]) / numericValues[0] * 100 : 0
    }
  }, [processedData])

  // Detectar automáticamente el mejor tipo de gráfico
  const detectBestChartType = useCallback(() => {
    if (processedData.length < 3) return 'pie'
    if (processedData.length > 20) return 'line'
    if (statistics && Math.abs(statistics.trend) > 10) return 'line'
    return 'bar'
  }, [processedData, statistics])

  // Renderizar gráfico de barras
  const renderBarChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height)
    
    if (processedData.length === 0) return
    
    // Calcular dimensiones
    const padding = 40
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding
    const barWidth = chartWidth / processedData.length * 0.8
    const barSpacing = chartWidth / processedData.length * 0.2
    
    // Encontrar valores máximos y mínimos
    const maxValue = Math.max(...processedData.map(d => d.value || 0))
    const minValue = Math.min(...processedData.map(d => d.value || 0))
    const valueRange = maxValue - minValue || 1
    
    // Dibujar grid si está habilitado
    if (showGrid) {
      ctx.strokeStyle = theme === 'dark' ? '#374151' : '#e5e7eb'
      ctx.lineWidth = 0.5
      
      // Líneas horizontales
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(width - padding, y)
        ctx.stroke()
      }
    }
    
    // Dibujar barras
    processedData.forEach((item, index) => {
      const value = item.value || 0
      const barHeight = (value / valueRange) * chartHeight
      const x = padding + index * (barWidth + barSpacing) + barSpacing / 2
      const y = height - padding - barHeight
      
      // Color de la barra
      const isSelected = selectedDataPoint === index
      const isHovered = hoveredPoint === index
      
      if (isSelected) {
        ctx.fillStyle = '#3b82f6'
      } else if (isHovered) {
        ctx.fillStyle = '#60a5fa'
      } else {
        ctx.fillStyle = theme === 'dark' ? '#6b7280' : '#9ca3af'
      }
      
      // Dibujar barra con animación
      const animatedHeight = animationEnabled ? barHeight * zoomLevel : barHeight
      ctx.fillRect(x, height - padding - animatedHeight, barWidth, animatedHeight)
      
      // Dibujar etiquetas si está habilitado
      if (showLabels && item.label) {
        ctx.fillStyle = theme === 'dark' ? '#d1d5db' : '#374151'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(item.label, x + barWidth / 2, height - padding + 20)
        
        // Valor en la parte superior
        ctx.fillText(value.toString(), x + barWidth / 2, y - 5)
      }
    })
  }, [processedData, selectedDataPoint, hoveredPoint, showGrid, showLabels, theme, zoomLevel, animationEnabled])

  // Renderizar gráfico de líneas
  const renderLineChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    if (processedData.length === 0) return
    
    const padding = 40
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding
    
    const maxValue = Math.max(...processedData.map(d => d.value || 0))
    const minValue = Math.min(...processedData.map(d => d.value || 0))
    const valueRange = maxValue - minValue || 1
    
    // Dibujar grid
    if (showGrid) {
      ctx.strokeStyle = theme === 'dark' ? '#374151' : '#e5e7eb'
      ctx.lineWidth = 0.5
      
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(width - padding, y)
        ctx.stroke()
      }
    }
    
    // Dibujar línea
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    processedData.forEach((item, index) => {
      const value = item.value || 0
      const x = padding + (index / (processedData.length - 1)) * chartWidth
      const y = height - padding - ((value - minValue) / valueRange) * chartHeight
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.stroke()
    
    // Dibujar puntos
    processedData.forEach((item, index) => {
      const value = item.value || 0
      const x = padding + (index / (processedData.length - 1)) * chartWidth
      const y = height - padding - ((value - minValue) / valueRange) * chartHeight
      
      ctx.fillStyle = selectedDataPoint === index ? '#3b82f6' : '#60a5fa'
      ctx.beginPath()
      ctx.arc(x, y, selectedDataPoint === index ? 6 : 4, 0, 2 * Math.PI)
      ctx.fill()
      
      // Etiquetas
      if (showLabels && item.label) {
        ctx.fillStyle = theme === 'dark' ? '#d1d5db' : '#374151'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(item.label, x, height - padding + 20)
      }
    })
  }, [processedData, selectedDataPoint, showGrid, showLabels, theme])

  // Renderizar gráfico circular
  const renderPieChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    if (processedData.length === 0) return
    
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 3
    
    const total = processedData.reduce((sum, item) => sum + (item.value || 0), 0)
    let currentAngle = -Math.PI / 2
    
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
    ]
    
    processedData.forEach((item, index) => {
      const value = item.value || 0
      const sliceAngle = (value / total) * 2 * Math.PI
      
      // Dibujar slice
      ctx.fillStyle = colors[index % colors.length]
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()
      
      // Resaltar si está seleccionado
      if (selectedDataPoint === index) {
        ctx.strokeStyle = '#1f2937'
        ctx.lineWidth = 3
        ctx.stroke()
      }
      
      // Etiquetas
      if (showLabels && item.label) {
        const labelAngle = currentAngle + sliceAngle / 2
        const labelX = centerX + Math.cos(labelAngle) * (radius + 20)
        const labelY = centerY + Math.sin(labelAngle) * (radius + 20)
        
        ctx.fillStyle = theme === 'dark' ? '#d1d5db' : '#374151'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(item.label, labelX, labelY)
        ctx.fillText(`${((value / total) * 100).toFixed(1)}%`, labelX, labelY + 15)
      }
      
      currentAngle += sliceAngle
    })
  }, [processedData, selectedDataPoint, showLabels, theme])

  // Renderizar mapa de calor
  const renderHeatmap = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    if (processedData.length === 0) return
    
    const padding = 40
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding
    
    // Crear grid de datos
    const gridSize = Math.ceil(Math.sqrt(processedData.length))
    const cellWidth = chartWidth / gridSize
    const cellHeight = chartHeight / gridSize
    
    const maxValue = Math.max(...processedData.map(d => d.value || 0))
    const minValue = Math.min(...processedData.map(d => d.value || 0))
    const valueRange = maxValue - minValue || 1
    
    processedData.forEach((item, index) => {
      const row = Math.floor(index / gridSize)
      const col = index % gridSize
      const value = item.value || 0
      
      const x = padding + col * cellWidth
      const y = padding + row * cellHeight
      
      // Calcular color basado en el valor
      const intensity = (value - minValue) / valueRange
      const red = Math.floor(255 * intensity)
      const blue = Math.floor(255 * (1 - intensity))
      
      ctx.fillStyle = `rgb(${red}, 100, ${blue})`
      ctx.fillRect(x, y, cellWidth - 2, cellHeight - 2)
      
      // Etiqueta si hay espacio
      if (cellWidth > 30 && cellHeight > 30 && showLabels && item.label) {
        ctx.fillStyle = intensity > 0.5 ? 'white' : 'black'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(item.label, x + cellWidth / 2, y + cellHeight / 2)
      }
    })
  }, [processedData, showLabels, theme])

  // Efecto para renderizar el gráfico
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Ajustar tamaño del canvas
    const container = containerRef.current
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = height
    }
    
    // Renderizar según el tipo
    switch (chartType) {
      case 'bar':
        renderBarChart()
        break
      case 'line':
        renderLineChart()
        break
      case 'pie':
        renderPieChart()
        break
      case 'heatmap':
        renderHeatmap()
        break
      default:
        if (chartType === 'auto') {
          const bestType = detectBestChartType()
          setChartType(bestType)
        }
    }
  }, [chartType, processedData, height, renderBarChart, renderLineChart, renderPieChart, renderHeatmap, detectBestChartType])

  // Manejar clic en el gráfico
  const handleCanvasClick = useCallback((event) => {
    if (!interactive) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Detectar punto de datos (simplificado)
    const padding = 40
    const chartWidth = canvas.width - 2 * padding
    
    if (chartType === 'bar' || chartType === 'line') {
      const index = Math.floor((x - padding) / (chartWidth / processedData.length))
      if (index >= 0 && index < processedData.length) {
        setSelectedDataPoint(selectedDataPoint === index ? null : index)
      }
    }
  }, [interactive, chartType, processedData, selectedDataPoint])

  // Exportar gráfico
  const exportChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = `chart-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }, [])

  // Compartir gráfico
  const shareChart = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve))
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `Gráfico: ${title}`,
          files: [new File([blob], 'chart.png', { type: 'image/png' })]
        })
      } else {
        // Fallback: copiar al portapapeles
        const item = new ClipboardItem({ 'image/png': blob })
        await navigator.clipboard.write([item])
      }
    } catch (error) {
      console.error('Error sharing chart:', error)
    }
  }, [title])

  // Controles del gráfico
  const ChartControls = () => (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Selector de tipo */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setChartType('bar')}
          className={`p-2 rounded ${chartType === 'bar' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          title="Gráfico de barras"
        >
          <ChartBarIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setChartType('line')}
          className={`p-2 rounded ${chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          title="Gráfico de líneas"
        >
          <ChartLineIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setChartType('pie')}
          className={`p-2 rounded ${chartType === 'pie' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          title="Gráfico circular"
        >
          <ChartPieIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setChartType('heatmap')}
          className={`p-2 rounded ${chartType === 'heatmap' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          title="Mapa de calor"
        >
          <FunnelIcon className="w-4 h-4" />
        </button>
      </div>
      
      {/* Separador */}
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
      
      {/* Controles de visualización */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded ${showGrid ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          title="Mostrar/ocultar grid"
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowLabels(!showLabels)}
          className={`p-2 rounded ${showLabels ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          title="Mostrar/ocultar etiquetas"
        >
          {showLabels ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
        </button>
      </div>
      
      {/* Separador */}
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
      
      {/* Zoom */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
          className="px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
        >
          -
        </button>
        <span className="px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
          className="px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
        >
          +
        </button>
      </div>
      
      {/* Separador */}
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
      
      {/* Búsqueda */}
      <div className="flex items-center gap-1">
        <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar..."
          className="px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm border border-gray-300 dark:border-gray-600"
        />
      </div>
      
      {/* Acciones */}
      {exportable && (
        <>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          <button
            onClick={exportChart}
            className="p-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
            title="Exportar gráfico"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
          </button>
          <button
            onClick={shareChart}
            className="p-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
            title="Compartir gráfico"
          >
            <ShareIcon className="w-4 h-4" />
          </button>
        </>
      )}
      
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="p-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
        title="Pantalla completa"
      >
        {isFullscreen ? '↙' : '↗'}
      </button>
    </div>
  )

  // Panel de estadísticas
  const StatisticsPanel = () => {
    if (!statistics) return null
    
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statistics.count}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Datos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statistics.total.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statistics.average.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Promedio</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statistics.min.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Mínimo</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statistics.max.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Máximo</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold flex items-center justify-center ${statistics.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {statistics.trend >= 0 ? (
                <ArrowTrendingUpIcon className="w-6 h-6" />
              ) : (
                <ArrowTrendingDownIcon className="w-6 h-6" />
              )}
              {Math.abs(statistics.trend).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tendencia</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-sm">
            {chartType}
          </span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
            {processedData.length} datos
          </span>
        </div>
      </div>
      
      {/* Controles */}
      {interactive && <ChartControls />}
      
      {/* Canvas del gráfico */}
      <div 
        ref={containerRef} 
        className="relative bg-white dark:bg-gray-900"
        style={{ height: `${height}px` }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-pointer"
        />
        
        {/* Tooltip para puntos hover */}
        {hoveredPoint !== null && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-sm">
            {processedData[hoveredPoint]?.label}: {processedData[hoveredPoint]?.value}
          </div>
        )}
      </div>
      
      {/* Estadísticas */}
      {statistics && <StatisticsPanel />}
    </div>
  )
}

export default AdvancedDataVisualization