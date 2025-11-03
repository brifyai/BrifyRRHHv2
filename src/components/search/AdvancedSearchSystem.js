/**
 * Advanced Search System
 * Sistema de búsqueda global con filtros avanzados, historial y sugerencias
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  BookmarkIcon,
  XMarkIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  TagIcon,
  StarIcon,
  ArrowPathIcon,
  ShareIcon,
  PrinterIcon
} from '@heroicons/react/24/outline'

const AdvancedSearchSystem = ({ 
  onSearch,
  placeholder = "Buscar global...",
  enableFilters = true,
  enableHistory = true,
  enableSuggestions = true,
  enableBookmarks = true,
  maxResults = 50,
  searchScope = "all"
}) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({})
  const [searchHistory, setSearchHistory] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [searchTime, setSearchTime] = useState(0)
  
  const searchRef = useRef(null)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  // Cargar historial y bookmarks desde localStorage
  useEffect(() => {
    if (enableHistory) {
      const savedHistory = localStorage.getItem('searchHistory')
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory))
      }
    }
    
    if (enableBookmarks) {
      const savedBookmarks = localStorage.getItem('searchBookmarks')
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks))
      }
    }
  }, [enableHistory, enableBookmarks])

  // Guardar historial en localStorage
  useEffect(() => {
    if (enableHistory && searchHistory.length > 0) {
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory.slice(0, 20)))
    }
  }, [searchHistory, enableHistory])

  // Guardar bookmarks en localStorage
  useEffect(() => {
    if (enableBookmarks && bookmarks.length > 0) {
      localStorage.setItem('searchBookmarks', JSON.stringify(bookmarks))
    }
  }, [bookmarks, enableBookmarks])

  // Categorías de búsqueda
  const searchCategories = useMemo(() => [
    { id: 'all', name: 'Todo', icon: MagnifyingGlassIcon, color: 'blue' },
    { id: 'employees', name: 'Empleados', icon: UserIcon, color: 'green' },
    { id: 'companies', name: 'Empresas', icon: BuildingOfficeIcon, color: 'purple' },
    { id: 'documents', name: 'Documentos', icon: DocumentTextIcon, color: 'yellow' },
    { id: 'communications', name: 'Comunicaciones', icon: TagIcon, color: 'pink' },
    { id: 'reports', name: 'Reportes', icon: StarIcon, color: 'indigo' }
  ], [])

  // Opciones de filtros
  const filterOptions = useMemo(() => ({
    dateRange: {
      label: 'Rango de fechas',
      type: 'daterange',
      options: [
        { value: 'today', label: 'Hoy' },
        { value: 'week', label: 'Esta semana' },
        { value: 'month', label: 'Este mes' },
        { value: 'year', label: 'Este año' },
        { value: 'custom', label: 'Personalizado' }
      ]
    },
    fileType: {
      label: 'Tipo de archivo',
      type: 'select',
      options: [
        { value: 'pdf', label: 'PDF' },
        { value: 'doc', label: 'Word' },
        { value: 'xls', label: 'Excel' },
        { value: 'ppt', label: 'PowerPoint' },
        { value: 'txt', label: 'Texto' }
      ]
    },
    status: {
      label: 'Estado',
      type: 'multiselect',
      options: [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
        { value: 'pending', label: 'Pendiente' },
        { value: 'completed', label: 'Completado' }
      ]
    },
    priority: {
      label: 'Prioridad',
      type: 'select',
      options: [
        { value: 'high', label: 'Alta' },
        { value: 'medium', label: 'Media' },
        { value: 'low', label: 'Baja' }
      ]
    }
  }), [])

  // Generar sugerencias basadas en la consulta
  const generateSuggestions = useCallback(async (searchQuery) => {
    if (!enableSuggestions || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    // Simular sugerencias (en producción, esto vendría de una API)
    const mockSuggestions = [
      { text: `${searchQuery} en empleados`, type: 'employees', count: 12 },
      { text: `${searchQuery} en documentos`, type: 'documents', count: 8 },
      { text: `${searchQuery} en empresas`, type: 'companies', count: 5 },
      { text: `${searchQuery} en comunicaciones`, type: 'communications', count: 3 }
    ]

    setSuggestions(mockSuggestions.slice(0, 5))
  }, [enableSuggestions])

  // Realizar búsqueda con debounce
  const performSearch = useCallback(async (searchQuery, searchFilters = {}) => {
    if (!searchQuery.trim()) {
      setResults([])
      setSearchTime(0)
      return
    }

    setIsSearching(true)
    const startTime = performance.now()

    try {
      // Simular búsqueda (en producción, esto llamaría a una API real)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Generar resultados mock
      const mockResults = Array.from({ length: Math.min(Math.floor(Math.random() * 20) + 5, maxResults) }, (_, index) => ({
        id: `result-${index}`,
        title: `Resultado ${index + 1} para "${searchQuery}"`,
        description: `Descripción del resultado ${index + 1} que coincide con la búsqueda`,
        type: searchCategories[Math.floor(Math.random() * searchCategories.length)].id,
        category: searchCategories[Math.floor(Math.random() * searchCategories.length)].name,
        score: Math.random() * 100,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        author: `Usuario ${Math.floor(Math.random() * 10) + 1}`,
        tags: [`tag${index}`, `search${searchQuery.length}`, 'important'],
        url: `/result/${index}`
      }))

      // Aplicar filtros
      let filteredResults = mockResults
      
      if (selectedCategory !== 'all') {
        filteredResults = filteredResults.filter(result => result.type === selectedCategory)
      }

      // Ordenar resultados
      filteredResults.sort((a, b) => {
        switch (sortBy) {
          case 'relevance':
            return b.score - a.score
          case 'date':
            return new Date(b.date) - new Date(a.date)
          case 'title':
            return a.title.localeCompare(b.title)
          default:
            return b.score - a.score
        }
      })

      setResults(filteredResults)
      
      // Agregar al historial
      if (enableHistory && searchQuery.trim()) {
        setSearchHistory(prev => {
          const newHistory = [
            { query: searchQuery, timestamp: new Date().toISOString(), results: filteredResults.length },
            ...prev.filter(item => item.query !== searchQuery)
          ].slice(0, 20)
          return newHistory
        })
      }

      const endTime = performance.now()
      setSearchTime(Math.round(endTime - startTime))

      // Llamar al callback externo
      if (onSearch) {
        onSearch(searchQuery, filteredResults, searchFilters)
      }

    } catch (error) {
      console.error('Error en búsqueda:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [selectedCategory, sortBy, maxResults, searchCategories, enableHistory, onSearch])

  // Manejar cambios en la consulta con debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query, filters)
      generateSuggestions(query)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, filters, performSearch, generateSuggestions])

  // Manejar submit del formulario
  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    performSearch(query, filters)
    setIsOpen(false)
  }, [query, filters, performSearch])

  // Agregar o quitar bookmark
  const toggleBookmark = useCallback((result) => {
    setBookmarks(prev => {
      const exists = prev.find(bookmark => bookmark.id === result.id)
      if (exists) {
        return prev.filter(bookmark => bookmark.id !== result.id)
      } else {
        return [...prev, { ...result, bookmarkedAt: new Date().toISOString() }]
      }
    })
  }, [])

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setSuggestions([])
    setFilters({})
    setSelectedCategory('all')
    inputRef.current?.focus()
  }, [])

  // Aplicar sugerencia
  const applySuggestion = useCallback((suggestion) => {
    setQuery(suggestion.text)
    setSelectedCategory(suggestion.type)
    setSuggestions([])
    inputRef.current?.focus()
  }, [])

  // Aplicar búsqueda del historial
  const applyHistoryItem = useCallback((historyItem) => {
    setQuery(historyItem.query)
    performSearch(historyItem.query, filters)
    setIsOpen(false)
  }, [filters, performSearch])

  // Exportar resultados
  const exportResults = useCallback(() => {
    const exportData = {
      query,
      filters,
      results,
      timestamp: new Date().toISOString(),
      totalResults: results.length
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `search-results-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [query, filters, results])

  // Compartir resultados
  const shareResults = useCallback(async () => {
    const shareData = {
      title: `Resultados de búsqueda: ${query}`,
      text: `Se encontraron ${results.length} resultados para "${query}"`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
      }
    } catch (error) {
      console.error('Error al compartir:', error)
    }
  }, [query, results])

  // Renderizar filtros
  const renderFilters = () => (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(filterOptions).map(([key, filter]) => (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {filter.label}
            </label>
            
            {filter.type === 'select' && (
              <select
                value={filters[key] || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Todos</option>
                {filter.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            
            {filter.type === 'multiselect' && (
              <div className="space-y-1">
                {filter.options.map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters[key]?.includes(option.value) || false}
                      onChange={(e) => {
                        const currentValues = filters[key] || []
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, [key]: [...currentValues, option.value] }))
                        } else {
                          setFilters(prev => ({ ...prev, [key]: currentValues.filter(v => v !== option.value) }))
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
            
            {filter.type === 'daterange' && (
              <select
                value={filters[key] || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Cualquier fecha</option>
                {filter.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setFilters({})}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          Limpiar filtros
        </button>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="relevance">Relevancia</option>
            <option value="date">Fecha</option>
            <option value="title">Título</option>
          </select>
        </div>
      </div>
    </div>
  )

  // Renderizar resultados
  const renderResults = () => (
    <div className="max-h-96 overflow-y-auto">
      {results.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          {isSearching ? 'Buscando...' : 'No se encontraron resultados'}
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {results.map(result => (
            <div key={result.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {result.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {result.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <TagIcon className="w-3 h-3" />
                      {result.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {new Date(result.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3" />
                      {result.author}
                    </span>
                    <span>
                      Relevancia: {Math.round(result.score)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => toggleBookmark(result)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title={bookmarks.find(b => b.id === result.id) ? 'Quitar bookmark' : 'Agregar bookmark'}
                  >
                    <BookmarkIcon 
                      className={`w-4 h-4 ${bookmarks.find(b => b.id === result.id) ? 'fill-current text-yellow-500' : 'text-gray-400'}`} 
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {results.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{results.length} resultados ({searchTime}ms)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={exportResults}
                className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-100"
                title="Exportar resultados"
              >
                <DocumentTextIcon className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={shareResults}
                className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-100"
                title="Compartir resultados"
              >
                <ShareIcon className="w-4 h-4" />
                Compartir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="relative" ref={searchRef}>
      {/* Input de búsqueda */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center">
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
            
            {enableFilters && (
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="p-1 mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Filtros"
              >
                <FunnelIcon className="h-5 w-5" />
              </button>
            )}
            
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ChevronDownIcon className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </form>

      {/* Panel desplegable */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          {/* Categorías */}
          <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Categoría:</span>
            <div className="flex items-center gap-1">
              {searchCategories.map(category => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedCategory === category.id
                        ? `bg-${category.color}-100 dark:bg-${category.color}-900/20 text-${category.color}-700 dark:text-${category.color}-400`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filtros */}
          {showFilters && enableFilters && renderFilters()}

          {/* Historial */}
          {enableHistory && searchHistory.length > 0 && query.length === 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  Búsquedas recientes
                </h3>
                <button
                  onClick={() => setSearchHistory([])}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Limpiar
                </button>
              </div>
              <div className="space-y-1">
                {searchHistory.slice(0, 5).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => applyHistoryItem(item)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-between"
                  >
                    <span>{item.query}</span>
                    <span className="text-xs text-gray-400">
                      {item.results} resultados
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencias */}
          {suggestions.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sugerencias</h3>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => applySuggestion(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-between"
                  >
                    <span>{suggestion.text}</span>
                    <span className="text-xs text-gray-400">
                      {suggestion.count} resultados
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resultados */}
          {renderResults()}
        </div>
      )}

      {/* Overlay para cerrar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default AdvancedSearchSystem