import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import calendarService from '../../services/calendarService.js';
import organizedDatabaseService from '../../services/organizedDatabaseService.js';
import enhancedCommunicationService from '../../services/enhancedCommunicationService.js';

const CreateEventModal = ({ isOpen, onClose, onEventCreated }) => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [sendInvitations, setSendInvitations] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    platform: 'google', // 'google' o 'microsoft'
    attendees: []
  });

  // Cargar empleados al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadEmployees();
      // Resetear formulario
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        location: '',
        platform: 'google',
        attendees: []
      });
      setSelectedEmployees([]);
      setSendInvitations(true);
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    try {
      const employeeData = await organizedDatabaseService.getEmployees();
      setEmployees(employeeData);
    } catch (error) {
      console.error('Error cargando empleados:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleEmployeeSelection = (employeeId) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    }
  };

  const selectAllEmployees = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.startTime || !formData.endTime) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      alert('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }

    setLoading(true);

    try {
      // Preparar datos del evento
      const eventData = {
        title: formData.title,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        attendees: selectedEmployees.map(empId => {
          const employee = employees.find(emp => emp.id === empId);
          return employee ? employee.email || `${employee.name}@company.com` : '';
        }).filter(email => email)
      };

      // Crear evento en el calendario
      const createdEvent = await calendarService.createEvent(userProfile.id, eventData, formData.platform);

      // Enviar invitaciones por WhatsApp si está habilitado
      if (sendInvitations && selectedEmployees.length > 0) {
        const invitationMessage = `Invitación a reunión: "${formData.title}"\n\n📅 Fecha: ${new Date(formData.startTime).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}\n\n📍 Ubicación: ${formData.location || 'Por confirmar'}\n\n${formData.description ? `📝 Descripción: ${formData.description}\n\n` : ''}${createdEvent.meetLink ? `🔗 Enlace: ${createdEvent.meetLink}` : ''}`;

        await enhancedCommunicationService.sendWhatsAppMessage(selectedEmployees, invitationMessage);
      }

      // Notificar éxito
      if (onEventCreated) {
        onEventCreated(createdEvent);
      }

      onClose();

    } catch (error) {
      console.error('Error creando evento:', error);
      alert('Error al crear el evento. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-engage-black">Crear Nuevo Evento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Plataforma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plataforma de Calendario
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="platform"
                  value="google"
                  checked={formData.platform === 'google'}
                  onChange={(e) => handleInputChange('platform', e.target.value)}
                  className="text-engage-blue focus:ring-engage-blue"
                />
                <span className="ml-2 text-sm">Google Calendar</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="platform"
                  value="microsoft"
                  checked={formData.platform === 'microsoft'}
                  onChange={(e) => handleInputChange('platform', e.target.value)}
                  className="text-engage-blue focus:ring-engage-blue"
                />
                <span className="ml-2 text-sm">Microsoft Outlook</span>
              </label>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del Evento *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-engage-blue focus:border-transparent"
              placeholder="Ingrese el título del evento"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-engage-blue focus:border-transparent"
              placeholder="Ingrese la descripción del evento"
            />
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="h-4 w-4 inline mr-1" />
                Fecha y Hora de Inicio *
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-engage-blue focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="h-4 w-4 inline mr-1" />
                Fecha y Hora de Fin *
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-engage-blue focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPinIcon className="h-4 w-4 inline mr-1" />
              Ubicación
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-engage-blue focus:border-transparent"
              placeholder="Sala de reuniones, dirección, o enlace virtual"
            />
          </div>

          {/* Invitados */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                <UserGroupIcon className="h-4 w-4 inline mr-1" />
                Invitados
              </label>
              <button
                type="button"
                onClick={selectAllEmployees}
                className="text-sm text-engage-blue hover:text-engage-yellow"
              >
                {selectedEmployees.length === employees.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
              {employees.slice(0, 20).map((employee) => (
                <label key={employee.id} className="flex items-center py-1">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.id)}
                    onChange={() => toggleEmployeeSelection(employee.id)}
                    className="text-engage-blue focus:ring-engage-blue"
                  />
                  <span className="ml-2 text-sm">{employee.name} - {employee.position}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedEmployees.length} empleados seleccionados
            </p>
          </div>

          {/* Opción de envío de invitaciones */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sendInvitations"
              checked={sendInvitations}
              onChange={(e) => setSendInvitations(e.target.checked)}
              className="text-engage-blue focus:ring-engage-blue"
            />
            <label htmlFor="sendInvitations" className="ml-2 text-sm text-gray-700">
              <PaperAirplaneIcon className="h-4 w-4 inline mr-1" />
              Enviar invitaciones por WhatsApp
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-engage-blue text-white rounded-lg hover:bg-engage-yellow disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Crear Evento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;