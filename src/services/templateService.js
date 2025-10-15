// Servicio para gestionar plantillas de mensajes
const templateService = {
  // Plantillas mockeadas (simulando datos de base de datos)
  templates: [
    {
      id: 1,
      name: 'Mensaje de Bienvenida',
      content: '¡Hola {{nombre}}! Bienvenido/a a nuestra empresa. Estamos encantados de tenerte con nosotros.',
      channel: 'whatsapp',
      category: 'welcome',
      autoTrigger: {
        enabled: true,
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
      },
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Recordatorio de Reunión',
      content: 'Hola {{nombre}}, solo para recordarte que tienes una reunión programada para hoy a las 15:00 hrs.',
      channel: 'telegram',
      category: 'notification',
      autoTrigger: {
        enabled: true,
        type: 'scheduled',
        schedule: {
          type: 'daily',
          time: '08:00',
          dayOfWeek: 1,
          dayOfMonth: 1
        },
        conditions: {
          department: '',
          level: '',
          workMode: '',
          contractType: ''
        }
      },
      createdAt: '2024-01-10',
      updatedAt: '2024-01-12'
    },
    {
      id: 3,
      name: 'Promoción Especial',
      content: '¡Tenemos una promoción especial solo para ti, {{nombre}}! Descuento del 20% en todos nuestros servicios esta semana.',
      channel: 'whatsapp',
      category: 'promotion',
      autoTrigger: {
        enabled: false,
        type: 'event_based',
        schedule: {
          type: 'weekly',
          time: '10:00',
          dayOfWeek: 3,
          dayOfMonth: 1
        },
        conditions: {
          department: 'Ventas',
          level: '',
          workMode: '',
          contractType: ''
        }
      },
      createdAt: '2024-01-05',
      updatedAt: '2024-01-05'
    }
  ],

  // Obtener todas las plantillas
  getTemplates: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(templateService.templates);
      }, 100); // Simular delay de red
    });
  },

  // Obtener conteo de plantillas
  getTemplatesCount: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(templateService.templates.length);
      }, 50); // Simular delay de red más corto
    });
  },

  // Crear nueva plantilla
  createTemplate: async (templateData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTemplate = {
          id: Date.now(),
          ...templateData,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
        templateService.templates.push(newTemplate);
        resolve(newTemplate);
      }, 200);
    });
  },

  // Actualizar plantilla
  updateTemplate: async (id, templateData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = templateService.templates.findIndex(t => t.id === id);
        if (index !== -1) {
          templateService.templates[index] = {
            ...templateService.templates[index],
            ...templateData,
            updatedAt: new Date().toISOString().split('T')[0]
          };
          resolve(templateService.templates[index]);
        } else {
          reject(new Error('Plantilla no encontrada'));
        }
      }, 200);
    });
  },

  // Eliminar plantilla
  deleteTemplate: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = templateService.templates.findIndex(t => t.id === id);
        if (index !== -1) {
          templateService.templates.splice(index, 1);
          resolve(true);
        } else {
          reject(new Error('Plantilla no encontrada'));
        }
      }, 100);
    });
  }
};

export default templateService;