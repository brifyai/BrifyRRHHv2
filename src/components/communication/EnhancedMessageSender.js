import React, { useState, useRef } from 'react';
import { 
  PaperAirplaneIcon, 
  ArrowPathIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  PhotoIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  LinkIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import enhancedCommunicationService from '../../services/enhancedCommunicationService';

const EnhancedMessageSender = ({ selectedEmployees, onBackToContacts, onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState('');
  const [channel, setChannel] = useState('whatsapp'); // whatsapp or telegram
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) {
      return <PhotoIcon className="h-5 w-5 text-green-500" />;
    } else if (type.startsWith('video/')) {
      return <VideoCameraIcon className="h-5 w-5 text-blue-500" />;
    } else if (type.includes('pdf') || type.includes('document')) {
      return <DocumentTextIcon className="h-5 w-5 text-red-500" />;
    } else {
      return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const sendWhatsAppMessage = async () => {
    if (!message.trim() && attachments.length === 0) {
      setSendError('Por favor ingresa un mensaje o adjunta un archivo');
      return;
    }

    if (selectedEmployees.length === 0) {
      setSendError('Por favor selecciona al menos un empleado');
      return;
    }

    setIsSending(true);
    setSendError('');
    setSendSuccess(false);

    try {
      // Enviar mensaje via WhatsApp
      const result = await enhancedCommunicationService.sendWhatsAppMessage(selectedEmployees, message);
      
      console.log('Sending WhatsApp message to:', selectedEmployees);
      console.log('Message:', message);
      console.log('Attachments:', attachments);
      
      setSendSuccess(true);
      setMessage('');
      setAttachments([]);
      
      // Actualizar estadísticas
      const updatedStats = await enhancedCommunicationService.getCommunicationStats();
      
      // Notificar que el mensaje fue enviado
      if (onMessageSent) {
        onMessageSent(updatedStats);
      }
    } catch (error) {
      setSendError('Error al enviar el mensaje. Por favor intenta nuevamente.');
      console.error('WhatsApp send error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const sendTelegramMessage = async () => {
    if (!message.trim() && attachments.length === 0) {
      setSendError('Por favor ingresa un mensaje o adjunta un archivo');
      return;
    }

    if (selectedEmployees.length === 0) {
      setSendError('Por favor selecciona al menos un empleado');
      return;
    }

    setIsSending(true);
    setSendError('');
    setSendSuccess(false);

    try {
      // Enviar mensaje via Telegram
      const result = await enhancedCommunicationService.sendTelegramMessage(selectedEmployees, message);
      
      console.log('Sending Telegram message to:', selectedEmployees);
      console.log('Message:', message);
      console.log('Attachments:', attachments);
      
      setSendSuccess(true);
      setMessage('');
      setAttachments([]);
      
      // Actualizar estadísticas
      const updatedStats = await enhancedCommunicationService.getCommunicationStats();
      
      // Notificar que el mensaje fue enviado
      if (onMessageSent) {
        onMessageSent(updatedStats);
      }
    } catch (error) {
      setSendError('Error al enviar el mensaje. Por favor intenta nuevamente.');
      console.error('Telegram send error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = async () => {
    if (channel === 'whatsapp') {
      await sendWhatsAppMessage();
    } else {
      await sendTelegramMessage();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Send Form */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-engage-black flex items-center">
              <PaperAirplaneIcon className="h-5 w-5 mr-2 text-engage-blue" />
              Enviar Mensajes
            </h2>
            <span className="text-sm font-medium text-engage-black">
              {selectedEmployees.length} seleccionados
            </span>
          </div>
          
          <div className="space-y-4">
            {/* Selector de canal */}
            <div>
              <label className="block text-sm font-medium text-engage-black mb-2">
                Canal de envío
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setChannel('whatsapp')}
                  className={`py-2 px-3 rounded-md text-sm font-medium ${
                    channel === 'whatsapp'
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => setChannel('telegram')}
                  className={`py-2 px-3 rounded-md text-sm font-medium ${
                    channel === 'telegram'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Telegram
                </button>
              </div>
            </div>
            
            {/* Área de texto para el mensaje */}
            <div>
              <label className="block text-sm font-medium text-engage-black mb-2">
                Mensaje
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full resize-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-engage-blue"
                placeholder="Escribe tu mensaje aquí..."
              ></textarea>
            </div>
            
            {/* Adjuntos */}
            <div>
              <label className="block text-sm font-medium text-engage-black mb-2">
                Archivos adjuntos
              </label>
              
              {/* Botón para seleccionar archivos */}
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-engage-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-engage-blue"
              >
                <PhotoIcon className="h-5 w-5 mr-2 text-gray-500" />
                Adjuntar archivos
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
                accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />
              
              {/* Lista de archivos adjuntos */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        {getFileIcon(attachment.type)}
                        <div className="ml-2">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(attachment.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Botones de envío */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleSend}
                disabled={isSending}
                className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isSending
                    ? 'bg-gray-400 cursor-not-allowed'
                    : channel === 'whatsapp'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                <ArrowPathIcon className={`h-4 w-4 mr-1 ${isSending ? 'animate-spin' : ''}`} />
                Enviar via {channel === 'whatsapp' ? 'WhatsApp' : 'Telegram'}
              </button>
              
              <button
                onClick={onBackToContacts}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-engage-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-engage-blue"
              >
                Volver a contactos
              </button>
            </div>
            
            {/* Mensajes de estado */}
            {sendError && (
              <div className="mt-4 p-3 bg-red-50 rounded-md flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-sm text-red-800">{sendError}</span>
              </div>
            )}
            
            {sendSuccess && (
              <div className="mt-4 p-3 bg-green-50 rounded-md flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-sm text-green-800">Mensaje enviado correctamente</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Vista previa de envío */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-engage-black mb-4">Vista previa del envío</h3>
          
          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Canal:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-engage-blue/10 text-engage-blue">
                {channel === 'whatsapp' ? 'WhatsApp' : 'Telegram'}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Destinatarios:</span>
              <span className="text-sm font-medium text-engage-black">
                {selectedEmployees.length} contactos seleccionados
              </span>
            </div>
            
            {message && (
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-500 block mb-1">Mensaje:</span>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{message}</p>
                </div>
              </div>
            )}
            
            {attachments.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-500 block mb-1">Archivos adjuntos:</span>
                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center p-2 bg-gray-50 rounded-md">
                      {getFileIcon(attachment.type)}
                      <div className="ml-2">
                        <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Información importante</h4>
            <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
              <li>Los mensajes se enviarán individualmente a cada contacto seleccionado</li>
              <li>Los archivos adjuntos se enviarán según las limitaciones del canal seleccionado</li>
              <li>WhatsApp tiene límites de tamaño para archivos (100MB máximo)</li>
              <li>Telegram permite archivos más grandes (2GB máximo)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMessageSender;