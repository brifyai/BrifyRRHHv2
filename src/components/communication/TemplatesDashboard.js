import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  UserPlusIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import templateService from '../../services/templateService.js';

const MySwal = withReactContent(Swal);

const TemplatesDashboard = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    content: '',
    channel: 'whatsapp',
    category: 'general',
    autoTrigger: {
      enabled: false,
      type: 'new_employee', // 'new_employee', 'scheduled', 'event_based'
      schedule: {
        type: 'daily', // 'daily', 'weekly', 'monthly'
        time: '09:00',
        dayOfWeek: 1, // 0-6 (Domingo-Sábado)
        dayOfMonth: 1 // 1-31
      },
      conditions: {
        department: '',
        level: '',
        workMode: '',
        contractType: ''
      }
    }
  });

  // Categorías y canales predefinidos
  const categories = [
    { id: 'actualizacion', name: 'Actualización' },
    { id: 'bienvenida', name: 'Bienvenida' },
    { id: 'feedback', name: 'Feedback' },
    { id: 'general', name: 'General' },
    { id: 'notificaciones', name: 'Notificaciones' },
    { id: 'promociones', name: 'Promociones' },
    { id: 'recordatorios', name: 'Recordatorios' }
  ];

  const channels = [
    { id: 'whatsapp', name: 'WhatsApp' },
    { id: 'telegram', name: 'Telegram' }
  ];

  const triggerTypes = [
    { id: 'new_employee', name: 'Nuevo Empleado', icon: UserPlusIcon },
    { id: 'scheduled', name: 'Programado', icon: ClockIcon },
    { id: 'event_based', name: 'Basado en Eventos', icon: BellIcon }
  ];

  const scheduleTypes = [
    { id: 'daily', name: 'Diario' },
    { id: 'weekly', name: 'Semanal' },
    { id: 'monthly', name: 'Mensual' }
  ];

  // Cargar plantillas desde el servicio
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesData = await templateService.getTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
      MySwal.fire({
        title: 'Error',
        text: 'Hubo un problema al cargar las plantillas',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#0693e3'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: '',
      content: '',
      channel: 'whatsapp',
      category: 'general',
      autoTrigger: {
        enabled: false,
        type: 'new_employee',
        schedule: {
          type: 'daily',
          time: '09:00',
          dayOfWeek: 1,
          dayOfMonth: 1
        },
        conditions: {
          department: '',
          level: '',
          workMode: '',
          contractType: ''
        }
      }
    });
    setShowTemplateModal(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      content: template.content,
      channel: template.channel,
      category: template.category,
      autoTrigger: template.autoTrigger || {
        enabled: false,
        type: 'new_employee',
        schedule: {
          type: 'daily',
          time: '09:00',
          dayOfWeek: 1,
          dayOfMonth: 1
        },
        conditions: {
          department: '',
          level: '',
          workMode: '',
          contractType: ''
        }
      }
    });
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = async (templateId) => {
    const result = await MySwal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#fcb900',
      cancelButtonColor: '#0693e3'
    });

    if (result.isConfirmed) {
      try {
        // Eliminar plantilla usando el servicio
        await templateService.deleteTemplate(templateId);

        // Recargar plantillas
        await loadTemplates();

        MySwal.fire({
          title: '¡Eliminado!',
          text: 'La plantilla ha sido eliminada correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#0693e3'
        });
      } catch (error) {
        console.error('Error deleting template:', error);
        MySwal.fire({
          title: 'Error',
          text: 'Hubo un problema al eliminar la plantilla',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#0693e3'
        });
      }
    }
  };

  const handleSubmitTemplate = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        // Actualizar plantilla existente
        await templateService.updateTemplate(editingTemplate.id, templateForm);
      } else {
        // Crear nueva plantilla
        await templateService.createTemplate(templateForm);
      }

      // Recargar plantillas
      await loadTemplates();

      setShowTemplateModal(false);
      MySwal.fire({
        title: editingTemplate ? '¡Actualizado!' : '¡Creado!',
        text: editingTemplate
          ? 'La plantilla ha sido actualizada correctamente'
          : 'La plantilla ha sido creada correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#0693e3'
      });
    } catch (error) {
      console.error('Error saving template:', error);
      MySwal.fire({
        title: 'Error',
        text: 'Hubo un problema al guardar la plantilla',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#0693e3'
      });
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getChannelName = (channelId) => {
    const channel = channels.find(c => c.id === channelId);
    return channel ? channel.name : channelId;
  };

  const getTriggerTypeName = (triggerTypeId) => {
    const triggerType = triggerTypes.find(t => t.id === triggerTypeId);
    return triggerType ? triggerType.name : triggerTypeId;
  };

  const getScheduleTypeName = (scheduleTypeId) => {
    const scheduleType = scheduleTypes.find(s => s.id === scheduleTypeId);
    return scheduleType ? scheduleType.name : scheduleTypeId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="h-12 w-12 text-engage-blue animate-spin mx-auto" />
          <p className="mt-4 text-engage-black font-medium">Cargando plantillas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Moderno */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-3">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <DocumentTextIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-1">
                  Plantillas de Mensajes
                </h1>
                <div className="h-1 w-20 bg-white/30 rounded-full"></div>
              </div>
            </div>
            <p className="text-indigo-100 text-lg font-medium">
              Gestiona tus plantillas para comunicaciones masivas y automatizadas
            </p>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center text-sm text-indigo-200">
                <div className="flex items-center mr-6">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  {templates.length} plantillas activas
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  Automatización inteligente
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateTemplate}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Crear Plantilla
                </button>
                <button
                  onClick={() => MySwal.fire({
                    title: '🔔 Gestionar Notificaciones y Actualizaciones',
                    html: `
                      <div style="text-align: left; font-size: 16px; line-height: 1.6;">
                        <p style="margin-bottom: 16px;"><strong>Funcionalidad próximamente disponible</strong></p>
                        <p style="margin-bottom: 12px;">Esta sección te permitirá:</p>
                        <ul style="margin-left: 20px; margin-bottom: 16px;">
                          <li>• Crear notificaciones del sistema</li>
                          <li>• Gestionar actualizaciones importantes</li>
                          <li>• Programar alertas automáticas</li>
                          <li>• Personalizar mensajes informativos</li>
                        </ul>
                        <p style="color: #666; font-size: 14px;">Esta funcionalidad se implementará en la próxima actualización.</p>
                      </div>
                    `,
                    icon: 'info',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#7c3aed',
                    showCloseButton: true
                  })}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center"
                >
                  <BellIcon className="h-5 w-5 mr-2" />
                  Notificaciones
                </button>
              </div>
            </div>
          </div>
          {/* Elementos decorativos */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full"></div>
        </div>

        {/* Botón flotante para crear plantilla */}
        <div className="fixed bottom-8 right-8 z-40">
          <button
            onClick={handleCreateTemplate}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 group"
          >
            <PlusIcon className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Nueva Plantilla
            </div>
          </button>
        </div>

        {/* Templates Grid - Layout Horizontal */}
        {templates.length > 0 ? (
          <div className="space-y-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-102 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                {/* Layout Horizontal */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Columna Izquierda: Icono, Título y Contenido */}
                  <div className="flex-1 min-w-0">
                    {/* Icono y título */}
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl mr-4 shadow-lg flex-shrink-0">
                        {template.channel === 'whatsapp' ? (
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.788-1.48-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors truncate">{template.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{getCategoryName(template.category)}</p>
                      </div>
                    </div>

                    {/* Contenido del mensaje - Debajo del título */}
                    <div className="mb-4">
                      <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 bg-gray-50 p-4 rounded-xl border-l-4 border-indigo-200">
                        "{template.content}"
                      </p>
                    </div>
                  </div>

                  {/* Columna Derecha: Badges, información y acciones */}
                  <div className="flex flex-col gap-3 flex-shrink-0 lg:w-80">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 shadow-sm">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {getChannelName(template.channel)}
                      </div>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300 shadow-sm">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {getCategoryName(template.category)}
                      </div>
                      {template.autoTrigger?.enabled && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 shadow-sm">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          Auto
                        </div>
                      )}
                    </div>

                    {/* Información de automatización */}
                    {template.autoTrigger?.enabled && (
                      <div className="text-xs text-indigo-700 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-2 rounded-lg border border-indigo-200">
                        <div className="flex items-center font-semibold mb-1">
                          <BellIcon className="h-3 w-3 mr-1" />
                          {getTriggerTypeName(template.autoTrigger.type)}
                        </div>
                        {template.autoTrigger.type === 'scheduled' && (
                          <div className="text-indigo-600">
                            {getScheduleTypeName(template.autoTrigger.schedule.type)} {template.autoTrigger.schedule.time}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Fechas */}
                    <div className="text-xs bg-gray-50 px-3 py-2 rounded-lg">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-gray-500 font-medium">Creada</p>
                          <p className="text-gray-900 font-semibold">{new Date(template.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Actualizada</p>
                          <p className="text-gray-900 font-semibold">{new Date(template.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg transition-colors duration-200"
                        title="Editar plantilla"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200"
                        title="Eliminar plantilla"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full opacity-50"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-r from-pink-100 to-indigo-100 rounded-full opacity-50"></div>

            <div className="relative z-10">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center shadow-2xl">
                <DocumentTextIcon className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">No hay plantillas aún</h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                Crea tu primera plantilla de mensaje para automatizar tus comunicaciones y mejorar la eficiencia de tu equipo
              </p>
              <button
                onClick={handleCreateTemplate}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <PlusIcon className="h-6 w-6 mr-3" />
                Crear Primera Plantilla
              </button>
            </div>
          </div>
        )}

        {/* Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header con gradiente de plantillas */}
              <div style={{background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white', padding: '24px', textAlign: 'center', borderRadius: '16px 16px 0 0'}}>
                <h2 style={{margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700'}}>
                  📝 {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                </h2>
                <p style={{margin: '0', fontSize: '16px', opacity: '0.9'}}>
                  Crea plantillas inteligentes para comunicaciones automatizadas
                </p>
              </div>

              {/* Formulario en layout horizontal */}
              <div style={{padding: '32px'}}>

                {/* Primera fila: Nombre y Categoría/Canal */}
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px'}}>
                  <div>
                    <label style={{display: 'block', fontWeight: '600', fontSize: '14px', color: '#6366f1', marginBottom: '8px'}}>
                      Nombre de la Plantilla
                    </label>
                    <input
                      type="text"
                      required
                      style={{width: '100%', padding: '12px 16px', fontSize: '14px', border: '2px solid #e5e7eb', borderRadius: '8px', background: 'white', transition: 'border-color 0.2s'}}
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                      placeholder="Ingrese un nombre descriptivo"
                    />
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div>
                      <label style={{display: 'block', fontWeight: '600', fontSize: '14px', color: '#6366f1', marginBottom: '8px'}}>
                        Canal
                      </label>
                      <select
                        style={{width: '100%', padding: '12px 16px', fontSize: '14px', border: '2px solid #e5e7eb', borderRadius: '8px', background: 'white', transition: 'border-color 0.2s'}}
                        value={templateForm.channel}
                        onChange={(e) => setTemplateForm({...templateForm, channel: e.target.value})}
                      >
                        {channels.map(channel => (
                          <option key={channel.id} value={channel.id}>💬 {channel.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{display: 'block', fontWeight: '600', fontSize: '14px', color: '#6366f1', marginBottom: '8px'}}>
                        Categoría
                      </label>
                      <select
                        style={{width: '100%', padding: '12px 16px', fontSize: '14px', border: '2px solid #e5e7eb', borderRadius: '8px', background: 'white', transition: 'border-color 0.2s'}}
                        value={templateForm.category}
                        onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})}
                      >
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>🏷️ {category.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contenido del mensaje completo */}
                <div style={{marginBottom: '24px'}}>
                  <label style={{display: 'block', fontWeight: '600', fontSize: '14px', color: '#6366f1', marginBottom: '8px'}}>
                    Contenido del Mensaje
                  </label>
                  <textarea
                    rows={6}
                    required
                    style={{width: '100%', padding: '12px 16px', fontSize: '14px', border: '2px solid #e5e7eb', borderRadius: '8px', minHeight: '120px', background: 'white', resize: 'vertical', transition: 'border-color 0.2s'}}
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                    placeholder="Escribe el contenido de tu mensaje... Usa {{nombre}}, {{empresa}}, etc. para personalización"
                  />
                  <div style={{marginTop: '6px', fontSize: '12px', color: '#6b7280'}}>
                    💡 <strong>Variables disponibles:</strong> &#123;&#123;nombre&#125;&#125;, &#123;&#123;empresa&#125;&#125;, &#123;&#123;departamento&#125;&#125;, &#123;&#123;cargo&#125;&#125;, &#123;&#123;telefono&#125;&#125;
                  </div>
                </div>

                {/* Sección de Automatización con colores de plantillas */}
                <div style={{borderTop: '2px solid #e5e7eb', paddingTop: '24px'}}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px'}}>
                    <h3 style={{fontSize: '18px', fontWeight: '600', color: '#1f2937', display: 'flex', alignItems: 'center'}}>
                      ⚡ Automatización Inteligente
                    </h3>
                    <label style={{position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer'}}>
                      <input
                        type="checkbox"
                        style={{position: 'absolute', opacity: '0', cursor: 'pointer'}}
                        checked={templateForm.autoTrigger.enabled}
                        onChange={(e) => setTemplateForm({
                          ...templateForm,
                          autoTrigger: {
                            ...templateForm.autoTrigger,
                            enabled: e.target.checked
                          }
                        })}
                      />
                      <div style={{
                        width: '44px',
                        height: '24px',
                        background: templateForm.autoTrigger.enabled ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#d1d5db',
                        borderRadius: '12px',
                        position: 'relative',
                        transition: 'background-color 0.2s'
                      }}>
                        <div style={{
                          content: '""',
                          position: 'absolute',
                          top: '2px',
                          left: templateForm.autoTrigger.enabled ? '22px' : '2px',
                          width: '20px',
                          height: '20px',
                          background: 'white',
                          borderRadius: '50%',
                          transition: 'left 0.2s'
                        }}></div>
                      </div>
                      <span style={{marginLeft: '12px', fontSize: '14px', fontWeight: '500', color: templateForm.autoTrigger.enabled ? '#6366f1' : '#6b7280'}}>
                        {templateForm.autoTrigger.enabled ? '🟢 Activada' : '⚪ Desactivada'}
                      </span>
                    </label>
                  </div>

                  {templateForm.autoTrigger.enabled && (
                    <div style={{background: 'linear-gradient(135deg, #f8fafc 0%, #f3f4f6 100%)', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '24px'}}>
                      {/* Tipo de Trigger */}
                      <div style={{marginBottom: '24px'}}>
                        <label style={{display: 'block', fontWeight: '600', fontSize: '14px', color: '#6366f1', marginBottom: '12px'}}>
                          🎯 Tipo de Activación Automática
                        </label>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px'}}>
                          {triggerTypes.map(triggerType => {
                            const Icon = triggerType.icon;
                            return (
                              <button
                                key={triggerType.id}
                                type="button"
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '16px',
                                  borderRadius: '8px',
                                  border: templateForm.autoTrigger.type === triggerType.id ? '2px solid #6366f1' : '2px solid #d1d5db',
                                  background: templateForm.autoTrigger.type === triggerType.id ? 'linear-gradient(135deg, #eef2ff 0%, #f3f4f6 100%)' : 'white',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onClick={() => setTemplateForm({
                                  ...templateForm,
                                  autoTrigger: {
                                    ...templateForm.autoTrigger,
                                    type: triggerType.id
                                  }
                                })}
                              >
                                <Icon style={{height: '24px', width: '24px', color: '#6366f1', marginBottom: '8px'}} />
                                <span style={{fontSize: '14px', fontWeight: '500', color: '#374151'}}>{triggerType.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Programación condicional */}
                      {templateForm.autoTrigger.type === 'scheduled' && (
                        <div style={{background: 'rgba(255,255,255,0.8)', border: '1px solid #d1d5db', borderRadius: '8px', padding: '20px', marginBottom: '20px'}}>
                          <h4 style={{fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center'}}>
                            ⏰ Programación Automática
                          </h4>
                          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
                            <div>
                              <label style={{display: 'block', fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '6px'}}>
                                Frecuencia
                              </label>
                              <select
                                style={{width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white'}}
                                value={templateForm.autoTrigger.schedule.type}
                                onChange={(e) => setTemplateForm({
                                  ...templateForm,
                                  autoTrigger: {
                                    ...templateForm.autoTrigger,
                                    schedule: {
                                      ...templateForm.autoTrigger.schedule,
                                      type: e.target.value
                                    }
                                  }
                                })}
                              >
                                {scheduleTypes.map(scheduleType => (
                                  <option key={scheduleType.id} value={scheduleType.id}>📅 {scheduleType.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label style={{display: 'block', fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '6px'}}>
                                Hora
                              </label>
                              <input
                                type="time"
                                style={{width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white'}}
                                value={templateForm.autoTrigger.schedule.time}
                                onChange={(e) => setTemplateForm({
                                  ...templateForm,
                                  autoTrigger: {
                                    ...templateForm.autoTrigger,
                                    schedule: {
                                      ...templateForm.autoTrigger.schedule,
                                      time: e.target.value
                                    }
                                  }
                                })}
                              />
                            </div>
                            {templateForm.autoTrigger.schedule.type === 'weekly' && (
                              <div>
                                <label style={{display: 'block', fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '6px'}}>
                                  Día de la semana
                                </label>
                                <select
                                  style={{width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white'}}
                                  value={templateForm.autoTrigger.schedule.dayOfWeek}
                                  onChange={(e) => setTemplateForm({
                                    ...templateForm,
                                    autoTrigger: {
                                      ...templateForm.autoTrigger,
                                      schedule: {
                                        ...templateForm.autoTrigger.schedule,
                                        dayOfWeek: parseInt(e.target.value)
                                      }
                                    }
                                  })}
                                >
                                  <option value="1">📅 Lunes</option>
                                  <option value="2">📅 Martes</option>
                                  <option value="3">📅 Miércoles</option>
                                  <option value="4">📅 Jueves</option>
                                  <option value="5">📅 Viernes</option>
                                  <option value="6">📅 Sábado</option>
                                  <option value="0">📅 Domingo</option>
                                </select>
                              </div>
                            )}
                            {templateForm.autoTrigger.schedule.type === 'monthly' && (
                              <div>
                                <label style={{display: 'block', fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '6px'}}>
                                  Día del mes
                                </label>
                                <select
                                  style={{width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white'}}
                                  value={templateForm.autoTrigger.schedule.dayOfMonth}
                                  onChange={(e) => setTemplateForm({
                                    ...templateForm,
                                    autoTrigger: {
                                      ...templateForm.autoTrigger,
                                      schedule: {
                                        ...templateForm.autoTrigger.schedule,
                                        dayOfMonth: parseInt(e.target.value)
                                      }
                                    }
                                  })}
                                >
                                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                    <option key={day} value={day}>📅 Día {day}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Condiciones de empleados */}
                      <div style={{background: 'rgba(255,255,255,0.8)', border: '1px solid #d1d5db', borderRadius: '8px', padding: '20px'}}>
                        <h4 style={{fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center'}}>
                          👥 Filtros de Destinatarios
                        </h4>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
                          <div>
                            <label style={{display: 'block', fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '6px'}}>
                              🏢 Departamento
                            </label>
                            <input
                              type="text"
                              style={{width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white'}}
                              placeholder="Ej: Ventas, Marketing, IT"
                              value={templateForm.autoTrigger.conditions.department}
                              onChange={(e) => setTemplateForm({
                                ...templateForm,
                                autoTrigger: {
                                  ...templateForm.autoTrigger,
                                  conditions: {
                                    ...templateForm.autoTrigger.conditions,
                                    department: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                          <div>
                            <label style={{display: 'block', fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '6px'}}>
                              📊 Nivel
                            </label>
                            <input
                              type="text"
                              style={{width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white'}}
                              placeholder="Ej: Senior, Junior, Manager"
                              value={templateForm.autoTrigger.conditions.level}
                              onChange={(e) => setTemplateForm({
                                ...templateForm,
                                autoTrigger: {
                                  ...templateForm.autoTrigger,
                                  conditions: {
                                    ...templateForm.autoTrigger.conditions,
                                    level: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                          <div>
                            <label style={{display: 'block', fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '6px'}}>
                              🏠 Modalidad
                            </label>
                            <input
                              type="text"
                              style={{width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white'}}
                              placeholder="Ej: Remoto, Híbrido, Presencial"
                              value={templateForm.autoTrigger.conditions.workMode}
                              onChange={(e) => setTemplateForm({
                                ...templateForm,
                                autoTrigger: {
                                  ...templateForm.autoTrigger,
                                  conditions: {
                                    ...templateForm.autoTrigger.conditions,
                                    workMode: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                          <div>
                            <label style={{display: 'block', fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '6px'}}>
                              📄 Tipo de Contrato
                            </label>
                            <input
                              type="text"
                              style={{width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white'}}
                              placeholder="Ej: Indefinido, Plazo Fijo"
                              value={templateForm.autoTrigger.conditions.contractType}
                              onChange={(e) => setTemplateForm({
                                ...templateForm,
                                autoTrigger: {
                                  ...templateForm.autoTrigger,
                                  conditions: {
                                    ...templateForm.autoTrigger.conditions,
                                    contractType: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                        </div>
                        <div style={{marginTop: '12px', fontSize: '12px', color: '#6b7280'}}>
                          💡 <strong>Deja campos vacíos</strong> para aplicar a todos los empleados que cumplan los demás criterios
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Información destacada con colores de plantillas */}
                <div style={{background: 'linear-gradient(135deg, #fef3c7 0%, #ddd6fe 100%)', border: '2px solid #c4b5fd', borderRadius: '12px', padding: '20px', marginTop: '24px'}}>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
                    <span style={{background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginRight: '12px'}}>
                      💡 INFO
                    </span>
                    <strong style={{fontSize: '16px', color: '#92400e'}}>Características de las Plantillas</strong>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div style={{background: 'rgba(255,255,255,0.8)', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #6366f1'}}>
                      <div style={{fontWeight: '600', color: '#6366f1', fontSize: '14px', marginBottom: '4px'}}>🎨 Personalización</div>
                      <div style={{fontSize: '13px', color: '#78350f'}}>Usa variables como &#123;&#123;nombre&#125;&#125; para mensajes personalizados</div>
                    </div>
                    <div style={{background: 'rgba(255,255,255,0.8)', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #8b5cf6'}}>
                      <div style={{fontWeight: '600', color: '#8b5cf6', fontSize: '14px', marginBottom: '4px'}}>⚡ Automatización</div>
                      <div style={{fontSize: '13px', color: '#78350f'}}>Configura triggers automáticos para envío programado</div>
                    </div>
                    <div style={{background: 'rgba(255,255,255,0.8)', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #10b981'}}>
                      <div style={{fontWeight: '600', color: '#10b981', fontSize: '14px', marginBottom: '4px'}}>📊 Segmentación</div>
                      <div style={{fontSize: '13px', color: '#78350f'}}>Filtra destinatarios por departamento, nivel, etc.</div>
                    </div>
                    <div style={{background: 'rgba(255,255,255,0.8)', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #f59e0b'}}>
                      <div style={{fontWeight: '600', color: '#f59e0b', fontSize: '14px', marginBottom: '4px'}}>🔄 Reutilización</div>
                      <div style={{fontSize: '13px', color: '#78350f'}}>Reutiliza plantillas para mantener consistencia</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer con botones */}
              <div style={{padding: '24px 32px', background: '#f8fafc', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#e2e8f0'}
                  onMouseOut={(e) => e.target.style.background = '#f1f5f9'}
                >
                  ❌ Cancelar
                </button>
                <button
                  type="submit"
                  form="template-form"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🚀 {editingTemplate ? 'Actualizar Plantilla' : 'Crear Plantilla'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form oculto para submit */}
        <form id="template-form" onSubmit={handleSubmitTemplate} style={{display: 'none'}}></form>
      </div>
    </div>
  );
};

export default TemplatesDashboard;