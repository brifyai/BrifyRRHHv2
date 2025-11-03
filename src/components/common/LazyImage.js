/**
 * Lazy Image Component
 * Carga imágenes de forma perezosa para mejorar rendimiento
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

import React, { useState, useEffect, useRef } from 'react'

/**
 * Componente para lazy loading de imágenes
 * @param {string} src - URL de la imagen
 * @param {string} alt - Texto alternativo
 * @param {string} placeholder - URL de imagen placeholder
 * @param {string} className - Clases CSS
 * @param {number} threshold - Threshold para Intersection Observer (0-1)
 * @param {Function} onLoad - Callback cuando la imagen carga
 * @param {Function} onError - Callback cuando hay error
 * @returns {JSX.Element}
 */
const LazyImage = ({
  src,
  alt = 'Image',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E',
  className = '',
  threshold = 0.1,
  onLoad = null,
  onError = null,
  width = null,
  height = null,
  style = {}
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    // Crear Intersection Observer para lazy loading
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Imagen está visible, cargar
            const img = new Image()
            
            img.onload = () => {
              setImageSrc(src)
              setIsLoaded(true)
              setHasError(false)
              if (onLoad) onLoad()
              observer.unobserve(entry.target)
            }
            
            img.onerror = () => {
              setHasError(true)
              if (onError) onError()
              observer.unobserve(entry.target)
            }
            
            img.src = src
          }
        })
      },
      { threshold }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current)
      }
    }
  }, [src, threshold, onLoad, onError])

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'} ${hasError ? 'error' : ''}`}
      width={width}
      height={height}
      style={{
        opacity: isLoaded ? 1 : 0.7,
        transition: 'opacity 0.3s ease-in-out',
        ...style
      }}
    />
  )
}

export default LazyImage
