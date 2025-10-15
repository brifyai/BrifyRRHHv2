import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import communicationService from '../../services/communicationService'
import {
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  PhotoIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  LinkIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const SendMessage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { recipientIds, recipientCount } = location.state || {}
  
  const [message, setMessage] = useState('')
  const [mediaType, setMediaType] = useState('') // 'image', 'document', 'video', 'link'
  const [mediaUrl, setMediaUrl] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [channel, setChannel] = useState('whatsapp') // 'whatsapp' o 'telegram'
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState('')

  // Cargar plantillas de mensajes
  useEffect(() => {
    loadMessageTemplates()
  }, [])

  const loadMessageTemplates = async () => {
    try {
      const templateData = await communicationService.getMessageTemplates()
      setTemplates(templateData)
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  // Aplicar plantilla seleccionada
  const applyTemplate = () => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === parseInt(selectedTemplate))
      if (template) {
        setMessage(template.content)
      }
    }
  }

  // Enviar mensaje
  const handleSendMessage = async () => {
    if (!message.trim() && !mediaUrl.trim()) {
      setError('Por favor ingresa un mensaje o adjunta un medio')
      return
    }
    
    if (!recipientIds || recipientIds.length === 0) {
      setError('No hay destinatarios seleccionados')
      return
    }
    
    try {
      setSending(true)
      setError('')
      
      // Enviar mensaje según el canal seleccionado
      if (channel === 'whatsapp') {
        await communicationService.sendWhatsAppMessage(recipientIds, message)
      } else {
        await communicationService.sendTelegramMessage(recipientIds, message)
      }
      
      setSent(true)
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Error al enviar el mensaje: ' + error.message)
    } finally {
      setSending(false)
    }
  }

  // Volver a la base de datos
  const handleBackToDatabase = () => {
    navigate('/base-de-datos')
  }

  if (!recipientIds) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-amber-500 mx-auto" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Acceso no autorizado</h2>
          <p className="mt-2 text-gray-600">
            Debes seleccionar empleados desde la base de datos primero.
          </p>
          <button
            onClick={handleBackToDatabase}
            className="mt-6 px-4 py-2 bg-engage-blue text-white rounded-lg hover:bg-engage-yellow transition-colors duration-200"
          >
            Ir a Base de Datos
          </button>
        </div>
      </div>
    )
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">¡Mensaje Enviado!</h2>
          <p className="mt-2 text-gray-600">
            Tu mensaje ha sido enviado exitosamente a {recipientCount} empleados.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleBackToDatabase}
              className="px-4 py-2 bg-engage-blue text-white rounded-lg hover:bg-engage-yellow transition-colors duration-200"
            >
              Volver a Base de Datos
            </button>
            <button
              onClick={() => {
                setSent(false)
                setMessage('')
                setMediaUrl('')
                setMediaType('')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Enviar Otro Mensaje
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado */}
        <div className="mb-8">
          <button
            onClick={handleBackToDatabase}
            className="flex items-center text-engage-blue hover:text-engage-yellow mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Volver a Base de Datos
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Enviar Mensaje Masivo</h1>
          <p className="text-gray-600 mt-2">
            Enviando a {recipientCount} empleado{recipientCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel izquierdo - Canal y plantillas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Canal de Envío</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setChannel('whatsapp')}
                  className={`w-full flex items-center p-3 rounded-lg border transition-colors duration-200 ${
                    channel === 'whatsapp'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div className="ml-3 text-left">
                    <div className="font-medium text-gray-900">WhatsApp</div>
                    <div className="text-sm text-gray-500">Enviar por WhatsApp Business</div>
                  </div>
                  {channel === 'whatsapp' && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 ml-auto" />
                  )}
                </button>
                
                <button
                  onClick={() => setChannel('telegram')}
                  className={`w-full flex items-center p-3 rounded-lg border transition-colors duration-200 ${
                    channel === 'telegram'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.788-1.48-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </div>
                  <div className="ml-3 text-left">
                    <div className="font-medium text-gray-900">Telegram</div>
                    <div className="text-sm text-gray-500">Enviar por Telegram Bot</div>
                  </div>
                  {channel === 'telegram' && (
                    <CheckCircleIcon className="h-5 w-5 text-blue-500 ml-auto" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Plantillas de mensajes */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Plantillas de Mensajes</h2>
              <div className="space-y-3">
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-engage-blue focus:ring-engage-blue"
                >
                  <option value="">Seleccionar plantilla</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={applyTemplate}
                  disabled={!selectedTemplate}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    selectedTemplate
                      ? 'bg-engage-blue text-white hover:bg-engage-yellow'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Aplicar Plantilla
                </button>
              </div>
            </div>
          </div>
          
          {/* Panel central - Editor de mensaje */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contenido del Mensaje</h2>
              
              {/* Área de texto del mensaje */}
              <div className="mb-6">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-engage-blue focus:ring-engage-blue"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>{message.length} caracteres</span>
                  <span>Máx. 1000 caracteres</span>
                </div>
              </div>
              
              {/* Adjuntar medios */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Adjuntar Medios</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => setMediaType('image')}
                    className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <PhotoIcon className="h-6 w-6 text-engage-blue" />
                    <span className="mt-1 text-sm text-gray-700">Imagen</span>
                  </button>
                  
                  <button
                    onClick={() => setMediaType('document')}
                    className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <DocumentTextIcon className="h-6 w-6 text-engage-blue" />
                    <span className="mt-1 text-sm text-gray-700">Documento</span>
                  </button>
                  
                  <button
                    onClick={() => setMediaType('video')}
                    className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <VideoCameraIcon className="h-6 w-6 text-engage-blue" />
                    <span className="mt-1 text-sm text-gray-700">Video</span>
                  </button>
                  
                  <button
                    onClick={() => setMediaType('link')}
                    className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <LinkIcon className="h-6 w-6 text-engage-blue" />
                    <span className="mt-1 text-sm text-gray-700">Enlace</span>
                  </button>
                </div>
                
                {/* Campo para URL de medio */}
                {(mediaType === 'image' || mediaType === 'document' || mediaType === 'video' || mediaType === 'link') && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {mediaType === 'image' && 'URL de la imagen'}
                      {mediaType === 'document' && 'URL del documento'}
                      {mediaType === 'video' && 'URL del video'}
                      {mediaType === 'link' && 'URL del enlace'}
                    </label>
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://ejemplo.com/archivo"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-engage-blue focus:ring-engage-blue"
                    />
                  </div>
                )}
              </div>
              
              {/* Botón de envío */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSendMessage}
                  disabled={sending}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-white shadow-md transition-all duration-300 ${
                    sending
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  <PaperAirplaneIcon className={`h-5 w-5 mr-2 ${sending ? 'animate-spin' : ''}`} />
                  {sending ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </div>
              
              {/* Mensaje de error */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              {/* Información adicional */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Información importante</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Los mensajes se enviarán individualmente a cada empleado seleccionado</li>
                  <li>• El envío masivo puede tardar unos minutos dependiendo de la cantidad de destinatarios</li>
                  <li>• Asegúrate de que el contenido cumple con las políticas de comunicación de la empresa</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SendMessage