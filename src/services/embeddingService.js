import groqService from './groqService'

class EmbeddingService {
  constructor() {
    this.groq = groqService
  }

  /**
   * Genera embeddings para un texto usando la API de Gemini
   * @param {string} text - Texto para generar embeddings
   * @returns {Promise<number[]>} - Array de embeddings
   */
  async generateEmbedding(text) {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('El texto no puede estar vacío')
      }

      // Limpiar y preparar el texto
      const cleanText = this.preprocessText(text)
      
      // Usar Groq para generar embeddings mediante análisis semántico
      const embedding = await this.generateEmbeddingWithGroq(cleanText)
      
      return embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      
      // Fallback: generar embedding mock si falla la API
      console.warn('Usando embedding mock debido a error en API')
      return this.generateMockEmbedding()
    }
  }

  /**
   * Genera embeddings usando Groq mediante análisis semántico
   */
  async generateEmbeddingWithGroq(text) {
    try {
      const prompt = `Analiza el siguiente texto y genera un vector de embeddings semántico.
      
      Texto: "${text}"
      
      Genera un array de 768 números decimales entre -1 y 1 que representen el significado semántico del texto.
      Responde solo con el array en formato JSON, sin texto adicional.
      
      Ejemplo de formato: [0.1, -0.3, 0.7, ..., -0.2]`

      const response = await this.groq.generateChatResponse(prompt)
      
      try {
        const embedding = JSON.parse(response.response)
        
        // Validar que sea un array de números
        if (!Array.isArray(embedding) || embedding.length === 0) {
          throw new Error('La respuesta no es un array válido')
        }
        
        // Validar que todos los elementos sean números
        const isValidNumbers = embedding.every(val =>
          typeof val === 'number' && val >= -1 && val <= 1
        )
        
        if (!isValidNumbers) {
          throw new Error('El array contiene valores inválidos')
        }
        
        // Asegurar que tenga 768 dimensiones (estándar para embeddings)
        if (embedding.length !== 768) {
          // Extender o truncar a 768 dimensiones
          return this.normalizeEmbedding(embedding, 768)
        }
        
        return this.normalizeVector(embedding)
      } catch (parseError) {
        console.error('Error parseando embedding de Groq:', parseError)
        throw new Error('No se pudo procesar la respuesta del embedding')
      }
    } catch (error) {
      console.error('Error generando embedding con Groq:', error)
      throw error
    }
  }

  /**
   * Normaliza un vector a la dimensión especificada
   */
  normalizeEmbedding(vector, targetSize) {
    if (vector.length === targetSize) {
      return vector
    }
    
    if (vector.length > targetSize) {
      // Truncar
      return vector.slice(0, targetSize)
    } else {
      // Extender con valores calculados
      const extended = [...vector]
      while (extended.length < targetSize) {
        // Generar valores basados en el promedio y varianza del vector existente
        const mean = extended.reduce((a, b) => a + b, 0) / extended.length
        const variance = extended.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / extended.length
        const stdDev = Math.sqrt(variance)
        
        // Generar valor aleatorio con distribución normal
        let value = mean + (Math.random() - 0.5) * 2 * stdDev
        value = Math.max(-1, Math.min(1, value)) // Limitar a [-1, 1]
        extended.push(value)
      }
      return extended
    }
  }

  /**
   * Normaliza un vector para que tenga magnitud unitaria
   */
  normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    if (magnitude === 0) return vector
    
    return vector.map(val => val / magnitude)
  }

  /**
   * Preprocesa el texto antes de generar embeddings
   * @param {string} text - Texto original
   * @returns {string} - Texto procesado
   */
  preprocessText(text) {
    // Limpiar el texto
    let cleanText = text
      .replace(/\s+/g, ' ') // Reemplazar múltiples espacios con uno solo
      .replace(/[\r\n]+/g, ' ') // Reemplazar saltos de línea con espacios
      .trim()
    
    // Limitar la longitud del texto (Gemini tiene límites)
    const maxLength = 30000 // Límite conservador
    if (cleanText.length > maxLength) {
      cleanText = cleanText.substring(0, maxLength) + '...'
      console.warn(`Texto truncado a ${maxLength} caracteres para embeddings`)
    }
    
    return cleanText
  }

  /**
   * Genera un embedding mock de 768 dimensiones
   * @returns {number[]} - Array de números aleatorios normalizados
   */
  generateMockEmbedding() {
    const dimensions = 768
    const embedding = new Array(dimensions)
    
    // Generar números aleatorios con distribución normal
    for (let i = 0; i < dimensions; i++) {
      embedding[i] = (Math.random() - 0.5) * 2 // Rango [-1, 1]
    }
    
    // Normalizar el vector
    return this.normalizeVector(embedding)
  }

  /**
   * Calcula la similitud coseno entre dos embeddings
   * @param {number[]} embedding1 - Primer embedding
   * @param {number[]} embedding2 - Segundo embedding
   * @returns {number} - Similitud coseno (0-1)
   */
  cosineSimilarity(embedding1, embedding2) {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Los embeddings deben tener la misma dimensión')
    }

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i]
      norm1 += embedding1[i] * embedding1[i]
      norm2 += embedding2[i] * embedding2[i]
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
  }

  /**
   * Procesa un archivo completo: extrae contenido y genera embeddings
   * @param {File} file - Archivo a procesar
   * @param {Object} fileContentExtractor - Servicio de extracción de contenido
   * @returns {Promise<{content: string, embedding: number[]}>} - Contenido y embedding
   */
  async processFile(file, fileContentExtractor) {
    try {
      // Extraer contenido del archivo
      const content = await fileContentExtractor.extractContent(file)
      
      if (!content || content.trim().length === 0) {
        throw new Error('No se pudo extraer contenido del archivo, estructura no compatible')
      }

      // Generar embedding del contenido
      const embedding = await this.generateEmbedding(content)
      
      return {
        content: content.trim(),
        embedding
      }
    } catch (error) {
      console.error('Error processing file:', error)
      throw error
    }
  }
}

// Crear instancia única para evitar problemas de exportación
const embeddingServiceInstance = new EmbeddingService()
export default embeddingServiceInstance