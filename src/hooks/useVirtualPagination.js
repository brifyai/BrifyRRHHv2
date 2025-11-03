/**
 * Virtual Pagination Hook
 * Optimiza la carga de listas grandes usando paginación virtual
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

import { useState, useCallback, useMemo } from 'react'

/**
 * Hook para paginación virtual
 * @param {Array} items - Array de items a paginar
 * @param {number} itemsPerPage - Items por página (default: 50)
 * @param {number} visiblePages - Páginas visibles en el rango (default: 3)
 * @returns {Object} Estado y funciones de paginación
 */
export const useVirtualPagination = (items = [], itemsPerPage = 50, visiblePages = 3) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(itemsPerPage)

  // Calcular total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil((items?.length || 0) / pageSize)
  }, [items?.length, pageSize])

  // Obtener items de la página actual
  const currentItems = useMemo(() => {
    if (!items || items.length === 0) return []
    
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    return items.slice(startIndex, endIndex)
  }, [items, currentPage, pageSize])

  // Calcular rango de páginas a mostrar
  const pageRange = useMemo(() => {
    const range = []
    const halfVisible = Math.floor(visiblePages / 2)
    
    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, startPage + visiblePages - 1)
    
    // Ajustar si estamos cerca del final
    if (endPage - startPage + 1 < visiblePages) {
      startPage = Math.max(1, endPage - visiblePages + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      range.push(i)
    }
    
    return range
  }, [currentPage, totalPages, visiblePages])

  // Ir a página específica
  const goToPage = useCallback((page) => {
    const pageNum = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(pageNum)
  }, [totalPages])

  // Página siguiente
  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  // Página anterior
  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  // Primera página
  const firstPage = useCallback(() => {
    goToPage(1)
  }, [goToPage])

  // Última página
  const lastPage = useCallback(() => {
    goToPage(totalPages)
  }, [totalPages, goToPage])

  // Cambiar tamaño de página
  const changePageSize = useCallback((newSize) => {
    setPageSize(Math.max(1, newSize))
    setCurrentPage(1) // Volver a primera página
  }, [])

  // Información de paginación
  const info = useMemo(() => {
    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, items?.length || 0)
    const total = items?.length || 0

    return {
      currentPage,
      totalPages,
      pageSize,
      totalItems: total,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      itemsInCurrentPage: currentItems.length
    }
  }, [currentPage, totalPages, pageSize, items?.length, currentItems.length])

  return {
    // Items
    currentItems,
    
    // Navegación
    currentPage,
    totalPages,
    pageRange,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    
    // Tamaño de página
    pageSize,
    changePageSize,
    
    // Información
    info,
    
    // Helpers
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    isEmpty: !items || items.length === 0
  }
}

/**
 * Hook para paginación virtual con búsqueda
 * @param {Array} items - Array de items
 * @param {string} searchTerm - Término de búsqueda
 * @param {Function} filterFn - Función de filtrado personalizada
 * @param {number} itemsPerPage - Items por página
 * @returns {Object} Estado y funciones de paginación con búsqueda
 */
export const useVirtualPaginationWithSearch = (
  items = [],
  searchTerm = '',
  filterFn = null,
  itemsPerPage = 50
) => {
  // Filtrar items según búsqueda
  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) return []
    
    if (!searchTerm && !filterFn) return items
    
    return items.filter(item => {
      // Aplicar función de filtrado personalizada si existe
      if (filterFn) {
        return filterFn(item, searchTerm)
      }
      
      // Búsqueda por defecto en propiedades comunes
      const searchLower = searchTerm.toLowerCase()
      const itemStr = JSON.stringify(item).toLowerCase()
      
      return itemStr.includes(searchLower)
    })
  }, [items, searchTerm, filterFn])

  // Usar paginación virtual con items filtrados
  const pagination = useVirtualPagination(filteredItems, itemsPerPage)

  return {
    ...pagination,
    filteredItems,
    searchTerm,
    hasSearchResults: filteredItems.length > 0,
    searchResultsCount: filteredItems.length
  }
}

/**
 * Hook para paginación virtual con ordenamiento
 * @param {Array} items - Array de items
 * @param {string} sortBy - Campo para ordenar
 * @param {string} sortOrder - 'asc' o 'desc'
 * @param {number} itemsPerPage - Items por página
 * @returns {Object} Estado y funciones de paginación con ordenamiento
 */
export const useVirtualPaginationWithSort = (
  items = [],
  sortBy = null,
  sortOrder = 'asc',
  itemsPerPage = 50
) => {
  // Ordenar items
  const sortedItems = useMemo(() => {
    if (!items || items.length === 0 || !sortBy) return items
    
    const sorted = [...items].sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })
    
    return sorted
  }, [items, sortBy, sortOrder])

  // Usar paginación virtual con items ordenados
  const pagination = useVirtualPagination(sortedItems, itemsPerPage)

  return {
    ...pagination,
    sortedItems,
    sortBy,
    sortOrder
  }
}

/**
 * Hook para paginación virtual con búsqueda y ordenamiento
 * @param {Array} items - Array de items
 * @param {string} searchTerm - Término de búsqueda
 * @param {string} sortBy - Campo para ordenar
 * @param {string} sortOrder - 'asc' o 'desc'
 * @param {Function} filterFn - Función de filtrado personalizada
 * @param {number} itemsPerPage - Items por página
 * @returns {Object} Estado y funciones de paginación completa
 */
export const useVirtualPaginationAdvanced = (
  items = [],
  searchTerm = '',
  sortBy = null,
  sortOrder = 'asc',
  filterFn = null,
  itemsPerPage = 50
) => {
  // Filtrar items
  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) return []
    
    if (!searchTerm && !filterFn) return items
    
    return items.filter(item => {
      if (filterFn) {
        return filterFn(item, searchTerm)
      }
      
      const searchLower = searchTerm.toLowerCase()
      const itemStr = JSON.stringify(item).toLowerCase()
      
      return itemStr.includes(searchLower)
    })
  }, [items, searchTerm, filterFn])

  // Ordenar items filtrados
  const sortedItems = useMemo(() => {
    if (!filteredItems || filteredItems.length === 0 || !sortBy) {
      return filteredItems
    }
    
    const sorted = [...filteredItems].sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })
    
    return sorted
  }, [filteredItems, sortBy, sortOrder])

  // Usar paginación virtual con items filtrados y ordenados
  const pagination = useVirtualPagination(sortedItems, itemsPerPage)

  return {
    ...pagination,
    filteredItems,
    sortedItems,
    searchTerm,
    sortBy,
    sortOrder,
    hasSearchResults: filteredItems.length > 0,
    searchResultsCount: filteredItems.length
  }
}

export default useVirtualPagination
