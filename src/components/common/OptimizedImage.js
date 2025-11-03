/**
 * Optimized Image Component
 * Componente de imagen con optimización automática
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

import React, { useState, useEffect, useRef } from 'react'

/**
 * Componente para imágenes optimizadas con múltiples formatos
 * @param {string} src - URL de la imagen
 * @param {string} alt - Texto alternativo
 * @param {string} className - Clases CSS
 * @param {number} width - Ancho de la imagen
 * @param {number} height - Alto de la imagen
 * @param {string} sizes - Sizes para responsive
 * @param {boolean} lazy - Lazy loading
 * @param {Function} onLoad - Callback cuando carga
 * @param {Function} onError - Callback en error
 * @returns {JSX.Element}
 */
const OptimizedImage = ({
  src,
  alt = 'Image',
  className = '',
  width = null,
  height = null,
  sizes = null,
  lazy = true,
  onLoad = null,
  onError = null,
  style = {}
}) => {
  const [imageSrc, setImageSrc] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)

  // Generar URL optimizada
  const getOptimizedUrl = (url, w = null, h = null) => {
    if (!url) return null

    // Si es una URL de Cloudinary o similar, aplicar transformaciones
    if (url.includes('cloudinary')) {
      const params = []
      if (w) params.push(`w_${w}`)
      if (h) params.push(`h_${h}`)
      params.push('q_auto', 'f_auto')
      
      const paramStr = params.join(',')
      return url.replace('/upload/', `/upload/${paramStr}/`)
    }

    // Si es una URL local, retornar como está
    return url
  }

  // Generar srcSet para responsive
  const generateSrcSet = (url) => {
    if (!url) return null

    const widths = [320, 640, 960, 1280, 1920]
    return widths
      .map(w => `${getOptimizedUrl(url, w)} ${w}w`)
      .join(', ')
  }

  useEffect(() => {
    if (!src) return

    // Usar Intersection Observer para lazy loading
    if (lazy && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const optimizedUrl = getOptimizedUrl(src, width, height)
              setImageSrc(optimizedUrl)
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.1 }
      )

      if (imgRef.current) {
        observer.observe(imgRef.current)
      }

      return () => {
        if (imgRef.current) {
          observer.unobserve(imgRef.current)
        }
      }
    } else {
      // Sin lazy loading
      const optimizedUrl = getOptimizedUrl(src, width, height)
      setImageSrc(optimizedUrl)
    }
  }, [src, width, height, lazy])

  const handleLoad = () => {
    setIsLoaded(true)
    setHasError(false)
    if (onLoad) onLoad()
  }

  const handleError = () => {
    setHasError(true)
    if (onError) onError()
  }

  return (
    <picture>
      {/* WebP para navegadores modernos */}
      {imageSrc && (
        <source
          srcSet={generateSrcSet(imageSrc.replace(/\.[^.]+$/, '.webp'))}
          sizes={sizes}
          type="image/webp"
        />
      )}
      
      {/* Fallback a formato original */}
      <img
        ref={imgRef}
        src={imageSrc}
        srcSet={imageSrc ? generateSrcSet(imageSrc) : undefined}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoaded ? 'loaded' : 'loading'} ${hasError ? 'error' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoaded ? 1 : 0.7,
          transition: 'opacity 0.3s ease-in-out',
          ...style
        }}
        loading={lazy ? 'lazy' : 'eager'}
      />
    </picture>
  )
}

export default OptimizedImage
