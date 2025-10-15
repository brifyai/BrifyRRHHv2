import { v4 as uuidv4 } from 'uuid';

class InMemoryDraftService {
  // Datos en memoria para borradores de mensajes
  drafts = [
    {
      id: 'draft-1',
      title: 'Actualización de Políticas Laborales',
      message: 'Estimado equipo, les informamos sobre la actualización de nuestras políticas laborales. Por favor revisen el documento adjunto.',
      selectedEmployeeIds: ['1', '2', '3', '4', '5'],
      filters: {
        companyId: '1',
        department: 'Operaciones',
        level: 'Especialista'
      },
      company: {
        id: '1',
        name: 'Ariztia'
      },
      media: null,
      status: 'draft', // draft, sent, scheduled
      createdBy: 'user-admin',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      recipientCount: 5
    },
    {
      id: 'draft-2',
      title: 'Recordatorio de Reunión Semanal',
      message: 'Hola equipo, les recuerdo que mañana tenemos reunión semanal a las 10:00 AM. Agenda: revisión de objetivos y próximos proyectos.',
      selectedEmployeeIds: ['6', '7', '8', '9', '10', '11', '12'],
      filters: {
        companyId: '2',
        region: 'Región Metropolitana'
      },
      company: {
        id: '2',
        name: 'Inchcape'
      },
      media: null,
      status: 'draft',
      createdBy: 'user-director-1',
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      recipientCount: 7
    },
    {
      id: 'draft-3',
      title: 'Felicitaciones por Resultados',
      message: '¡Felicitaciones a todo el equipo por los excelentes resultados del trimestre! Hemos superado todas las metas propuestas.',
      selectedEmployeeIds: ['13', '14', '15'],
      filters: {
        companyId: '3',
        department: 'Ventas'
      },
      company: {
        id: '3',
        name: 'Achs'
      },
      media: null,
      status: 'draft',
      createdBy: 'user-executive-1',
      createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 horas atrás
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      recipientCount: 3
    }
  ];

  // Obtener todos los borradores
  async getDrafts(userId = null) {
    let filteredDrafts = [...this.drafts];

    // Si se especifica userId, filtrar por usuario
    if (userId) {
      filteredDrafts = filteredDrafts.filter(draft => draft.createdBy === userId);
    }

    // Ordenar por fecha de actualización (más recientes primero)
    filteredDrafts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return filteredDrafts;
  }

  // Obtener borrador por ID
  async getDraftById(draftId) {
    return this.drafts.find(draft => draft.id === draftId);
  }

  // Crear nuevo borrador
  async createDraft(draftData) {
    const newDraft = {
      id: uuidv4(),
      title: draftData.title || 'Borrador sin título',
      message: draftData.message || '',
      selectedEmployeeIds: draftData.selectedEmployeeIds || [],
      filters: draftData.filters || {},
      company: draftData.company || null,
      media: draftData.media || null,
      status: 'draft',
      createdBy: draftData.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recipientCount: draftData.selectedEmployeeIds?.length || 0
    };

    this.drafts.push(newDraft);
    return newDraft;
  }

  // Actualizar borrador
  async updateDraft(draftId, draftData) {
    const draftIndex = this.drafts.findIndex(d => d.id === draftId);
    if (draftIndex === -1) throw new Error('Borrador no encontrado');

    const updatedDraft = {
      ...this.drafts[draftIndex],
      ...draftData,
      updatedAt: new Date().toISOString(),
      recipientCount: draftData.selectedEmployeeIds?.length || this.drafts[draftIndex].recipientCount
    };

    this.drafts[draftIndex] = updatedDraft;
    return updatedDraft;
  }

  // Eliminar borrador
  async deleteDraft(draftId) {
    const draftIndex = this.drafts.findIndex(d => d.id === draftId);
    if (draftIndex === -1) throw new Error('Borrador no encontrado');

    this.drafts.splice(draftIndex, 1);
    return true;
  }

  // Marcar borrador como enviado
  async markAsSent(draftId) {
    const draftIndex = this.drafts.findIndex(d => d.id === draftId);
    if (draftIndex === -1) throw new Error('Borrador no encontrado');

    this.drafts[draftIndex].status = 'sent';
    this.drafts[draftIndex].updatedAt = new Date().toISOString();

    return this.drafts[draftIndex];
  }

  // Buscar borradores
  async searchDrafts(query, userId = null) {
    let filteredDrafts = await this.getDrafts(userId);

    if (!query) return filteredDrafts;

    const lowercaseQuery = query.toLowerCase();
    return filteredDrafts.filter(draft =>
      draft.title.toLowerCase().includes(lowercaseQuery) ||
      draft.message.toLowerCase().includes(lowercaseQuery) ||
      draft.company?.name.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Obtener borradores por empresa
  async getDraftsByCompany(companyId, userId = null) {
    let filteredDrafts = await this.getDrafts(userId);
    return filteredDrafts.filter(draft => draft.company?.id === companyId);
  }

  // Obtener estadísticas de borradores
  async getDraftStats(userId = null) {
    const drafts = await this.getDrafts(userId);

    return {
      total: drafts.length,
      drafts: drafts.filter(d => d.status === 'draft').length,
      sent: drafts.filter(d => d.status === 'sent').length,
      scheduled: drafts.filter(d => d.status === 'scheduled').length
    };
  }

  // Limpiar borradores antiguos (más de 30 días)
  async cleanupOldDrafts(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const initialCount = this.drafts.length;
    this.drafts = this.drafts.filter(draft =>
      new Date(draft.updatedAt) > cutoffDate || draft.status === 'sent'
    );

    return initialCount - this.drafts.length; // Retorna cantidad eliminada
  }
}

export default new InMemoryDraftService();