/**
 * Utilidades de formateo para el sistema multi-empresa
 */

/**
 * Formatear cantidad de números con separadores de miles
 * @param {number} value - Valor a formatear
 * @param {string} locale - Configuración regional (default: 'es-CL')
 * @returns {string} Valor formateado
 */
export const formatNumber = (value, locale = 'es-CL') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Formatear cantidad de números con decimales
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Cantidad de decimales (default: 2)
 * @param {string} locale - Configuración regional (default: 'es-CL')
 * @returns {string} Valor formateado
 */
export const formatDecimal = (value, decimals = 2, locale = 'es-CL') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Formatear moneda (Pesos Chilenos por defecto)
 * @param {number} value - Valor a formatear
 * @param {string} currency - Código de moneda (default: 'CLP')
 * @param {string} locale - Configuración regional (default: 'es-CL')
 * @returns {string} Valor formateado como moneda
 */
export const formatCurrency = (value, currency = 'CLP', locale = 'es-CL') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }
  
  // Para CLP no mostrar decimales
  const options = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'CLP' ? 0 : 2,
    maximumFractionDigits: currency === 'CLP' ? 0 : 2
  };
  
  return new Intl.NumberFormat(locale, options).format(value);
};

/**
 * Formatear porcentaje
 * @param {number} value - Valor decimal (0.1 = 10%)
 * @param {number} decimals - Cantidad de decimales (default: 1)
 * @param {string} locale - Configuración regional (default: 'es-CL')
 * @returns {string} Valor formateado como porcentaje
 */
export const formatPercentage = (value, decimals = 1, locale = 'es-CL') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Formatear fecha
 * @param {string|Date} date - Fecha a formatear
 * @param {Object} options - Opciones de formateo
 * @param {string} locale - Configuración regional (default: 'es-CL')
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, options = {}, locale = 'es-CL') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
};

/**
 * Formatear fecha y hora
 * @param {string|Date} date - Fecha a formatear
 * @param {Object} options - Opciones de formateo
 * @param {string} locale - Configuración regional (default: 'es-CL')
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (date, options = {}, locale = 'es-CL') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
};

/**
 * Formatear hora relativa (hace 2 horas, ayer, etc.)
 * @param {string|Date} date - Fecha a formatear
 * @param {string} locale - Configuración regional (default: 'es-CL')
 * @returns {string} Tiempo relativo formateado
 */
export const formatRelativeTime = (date, locale = 'es-CL') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  if (diffInSeconds < 60) {
    return 'ahora';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    if (diffInDays === 1) return 'ayer';
    return `hace ${diffInDays} días`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `hace ${diffInWeeks} semana${diffInWeeks !== 1 ? 's' : ''}`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `hace ${diffInMonths} mes${diffInMonths !== 1 ? 'es' : ''}`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `hace ${diffInYears} año${diffInYears !== 1 ? 's' : ''}`;
};

/**
 * Formatear tamaño de archivo
 * @param {number} bytes - Tamaño en bytes
 * @param {number} decimals - Cantidad de decimales (default: 2)
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Formatear duración en milisegundos a formato legible
 * @param {number} milliseconds - Duración en milisegundos
 * @returns {string} Duración formateada
 */
export const formatDuration = (milliseconds) => {
  if (!milliseconds || milliseconds === 0) return '0ms';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else if (seconds > 0) {
    return `${seconds}s`;
  } else {
    return `${milliseconds}ms`;
  }
};

/**
 * Formatear número de teléfono chileno
 * @param {string} phone - Número de teléfono
 * @returns {string} Teléfono formateado
 */
export const formatChileanPhone = (phone) => {
  if (!phone) return '';
  
  // Limpiar el número
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verificar si es un número chileno válido
  if (cleanPhone.length === 9 && cleanPhone.startsWith('9')) {
    // Formato: 9 1234 5678
    return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(1, 5)} ${cleanPhone.slice(5)}`;
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('569')) {
    // Formato: +56 9 1234 5678
    return `+56 ${cleanPhone.slice(2, 3)} ${cleanPhone.slice(3, 7)} ${cleanPhone.slice(7)}`;
  } else if (cleanPhone.length === 12 && cleanPhone.startsWith('569')) {
    // Formato: +56 9 1234 5678
    return `+56 ${cleanPhone.slice(3, 4)} ${cleanPhone.slice(4, 8)} ${cleanPhone.slice(8)}`;
  }
  
  // Si no coincide con los formatos chilenos, devolver el número limpio
  return cleanPhone;
};

/**
 * Formatear RUT chileno
 * @param {string} rut - RUT sin formatear
 * @returns {string} RUT formateado con puntos y guión
 */
export const formatChileanRUT = (rut) => {
  if (!rut) return '';
  
  // Limpiar el RUT
  const cleanRut = rut.replace(/[^\dKk]/g, '');
  
  if (cleanRut.length < 2) return cleanRut;
  
  // Separar número y dígito verificador
  const number = cleanRut.slice(0, -1);
  const verifier = cleanRut.slice(-1).toUpperCase();
  
  // Formatear número con puntos
  const formattedNumber = new Intl.NumberFormat('es-CL').format(parseInt(number, 10));
  
  return `${formattedNumber}-${verifier}`;
};

/**
 * Validar RUT chileno
 * @param {string} rut - RUT a validar
 * @returns {boolean} True si es válido
 */
export const validateChileanRUT = (rut) => {
  if (!rut) return false;
  
  // Limpiar el RUT
  const cleanRut = rut.replace(/[^\dKk]/g, '');
  
  if (cleanRut.length < 2) return false;
  
  // Separar número y dígito verificador
  const number = cleanRut.slice(0, -1);
  const verifier = cleanRut.slice(-1).toUpperCase();
  
  // Calcular dígito verificador
  let sum = 0;
  let factor = 2;
  
  for (let i = number.length - 1; i >= 0; i--) {
    sum += parseInt(number[i], 10) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  
  const calculatedVerifier = 11 - (sum % 11);
  const expectedVerifier = calculatedVerifier === 11 ? '0' : 
                          calculatedVerifier === 10 ? 'K' : 
                          calculatedVerifier.toString();
  
  return verifier === expectedVerifier;
};

/**
 * Formatear texto para URL (slug)
 * @param {string} text - Texto a formatear
 * @returns {string} Texto formateado como slug
 */
export const formatSlug = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Truncar texto
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @param {string} suffix - Sufijo (default: '...')
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalizar primera letra
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export const capitalize = (text) => {
  if (!text) return '';
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Capitalizar cada palabra
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto con cada palabra capitalizada
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  
  return text.split(' ').map(word => capitalize(word)).join(' ');
};

/**
 * Formatear estado de mensaje
 * @param {string} status - Estado del mensaje
 * @returns {Object} Objeto con estado formateado
 */
export const formatMessageStatus = (status) => {
  const statusMap = {
    pending: { text: 'Pendiente', color: 'yellow', icon: 'ClockIcon' },
    sent: { text: 'Enviado', color: 'blue', icon: 'PaperAirplaneIcon' },
    delivered: { text: 'Entregado', color: 'green', icon: 'CheckCircleIcon' },
    read: { text: 'Leído', color: 'green', icon: 'CheckIcon' },
    failed: { text: 'Fallido', color: 'red', icon: 'XCircleIcon' },
    cancelled: { text: 'Cancelado', color: 'gray', icon: 'XMarkIcon' }
  };
  
  return statusMap[status] || { text: status, color: 'gray', icon: 'QuestionMarkCircleIcon' };
};

/**
 * Formatear tipo de canal
 * @param {string} channel - Tipo de canal
 * @returns {Object} Objeto con canal formateado
 */
export const formatChannelType = (channel) => {
  const channelMap = {
    email: { text: 'Email', color: 'blue', icon: 'EnvelopeIcon' },
    sms: { text: 'SMS', color: 'green', icon: 'PhoneIcon' },
    whatsapp: { text: 'WhatsApp', color: 'green', icon: 'ChatBubbleLeftRightIcon' },
    telegram: { text: 'Telegram', color: 'blue', icon: 'ChatBubbleLeftRightIcon' },
    push: { text: 'Push', color: 'purple', icon: 'BellIcon' },
    webhook: { text: 'Webhook', color: 'gray', icon: 'LinkIcon' }
  };
  
  return channelMap[channel] || { text: channel, color: 'gray', icon: 'QuestionMarkCircleIcon' };
};

export default {
  formatNumber,
  formatDecimal,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatFileSize,
  formatDuration,
  formatChileanPhone,
  formatChileanRUT,
  validateChileanRUT,
  formatSlug,
  truncateText,
  capitalize,
  capitalizeWords,
  formatMessageStatus,
  formatChannelType
};