import { supabase } from '../lib/supabase.js';

/**
 * Servicio para gestionar calendarios y eventos
 * Integra con Google Calendar y Microsoft Graph APIs
 */
class CalendarService {
  /**
   * Obtiene eventos próximos de todos los calendarios conectados del usuario
   * @param {string} userId - ID del usuario
   * @param {number} daysAhead - Días hacia adelante para buscar eventos (default: 7)
   * @returns {Promise<Array>} Lista de eventos próximos
   */
  async getUpcomingEvents(userId, daysAhead = 7) {
    try {
      const events = [];

      // Obtener eventos de Google Calendar
      const googleEvents = await this.getGoogleCalendarEvents(userId, daysAhead);
      events.push(...googleEvents);

      // Obtener eventos de Microsoft Outlook
      const microsoftEvents = await this.getMicrosoftCalendarEvents(userId, daysAhead);
      events.push(...microsoftEvents);

      // Ordenar eventos por fecha de inicio
      return events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    } catch (error) {
      console.error('Error obteniendo eventos próximos:', error);
      return [];
    }
  }

  /**
   * Obtiene eventos de Google Calendar
   * @param {string} userId - ID del usuario
   * @param {number} daysAhead - Días hacia adelante
   * @returns {Promise<Array>} Eventos de Google Calendar
   */
  async getGoogleCalendarEvents(userId, daysAhead) {
    try {
      // Obtener credenciales del usuario
      const { data: credentials, error } = await supabase
        .from('user_credentials')
        .select('google_access_token, google_refresh_token')
        .eq('user_id', userId)
        .single();

      if (error || !credentials?.google_access_token) {
        console.log('No hay credenciales de Google para el usuario');
        return [];
      }

      // Calcular fechas
      const now = new Date();
      const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

      const timeMin = now.toISOString();
      const timeMax = futureDate.toISOString();

      // Obtener calendarios del usuario
      const calendarsResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        {
          headers: {
            'Authorization': `Bearer ${credentials.google_access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!calendarsResponse.ok) {
        console.error('Error obteniendo lista de calendarios');
        return [];
      }

      const calendarsData = await calendarsResponse.json();
      const events = [];

      // Obtener eventos de cada calendario
      for (const calendar of calendarsData.items) {
        if (calendar.primary || calendar.selected) {
          const eventsResponse = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.id)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
            {
              headers: {
                'Authorization': `Bearer ${credentials.google_access_token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (eventsResponse.ok) {
            const eventsData = await eventsResponse.json();
            const calendarEvents = eventsData.items?.map(event => ({
              id: event.id,
              title: event.summary || 'Sin título',
              description: event.description || '',
              startTime: event.start?.dateTime || event.start?.date,
              endTime: event.end?.dateTime || event.end?.date,
              location: event.location || '',
              platform: 'Google Calendar',
              calendarName: calendar.summary,
              meetLink: this.extractMeetLink(event.description || '', event.location || ''),
              attendees: event.attendees || [],
              status: event.status
            })) || [];

            events.push(...calendarEvents);
          }
        }
      }

      return events;

    } catch (error) {
      console.error('Error obteniendo eventos de Google Calendar:', error);
      return [];
    }
  }

  /**
   * Obtiene eventos de Microsoft Outlook
   * @param {string} userId - ID del usuario
   * @param {number} daysAhead - Días hacia adelante
   * @returns {Promise<Array>} Eventos de Microsoft Outlook
   */
  async getMicrosoftCalendarEvents(userId, daysAhead) {
    try {
      // Obtener credenciales del usuario
      const { data: credentials, error } = await supabase
        .from('user_credentials')
        .select('microsoft_access_token')
        .eq('user_id', userId)
        .single();

      if (error || !credentials?.microsoft_access_token) {
        console.log('No hay credenciales de Microsoft para el usuario');
        return [];
      }

      // Calcular fechas
      const now = new Date();
      const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

      const startDateTime = now.toISOString();
      const endDateTime = futureDate.toISOString();

      // Obtener eventos del calendario principal
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/events?$filter=start/dateTime ge '${startDateTime}' and start/dateTime le '${endDateTime}'&$orderby=start/dateTime`,
        {
          headers: {
            'Authorization': `Bearer ${credentials.microsoft_access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.error('Error obteniendo eventos de Microsoft Graph');
        return [];
      }

      const data = await response.json();
      const events = data.value?.map(event => ({
        id: event.id,
        title: event.subject || 'Sin título',
        description: event.body?.content || '',
        startTime: event.start?.dateTime,
        endTime: event.end?.dateTime,
        location: event.location?.displayName || '',
        platform: 'Microsoft Outlook',
        calendarName: 'Calendario Principal',
        meetLink: this.extractTeamsLink(event.body?.content || '', event.onlineMeetingUrl || ''),
        attendees: event.attendees || [],
        status: event.showAs
      })) || [];

      return events;

    } catch (error) {
      console.error('Error obteniendo eventos de Microsoft Outlook:', error);
      return [];
    }
  }

  /**
   * Extrae enlace de Google Meet de descripción o ubicación
   * @param {string} description - Descripción del evento
   * @param {string} location - Ubicación del evento
   * @returns {string|null} Enlace de Meet o null
   */
  extractMeetLink(description, location) {
    const meetUrlPattern = /https:\/\/meet\.google\.com\/[a-zA-Z0-9-]+/;
    const hangoutsUrlPattern = /https:\/\/hangouts\.google\.com\/[a-zA-Z0-9-]+/;

    // Buscar en descripción
    let match = description.match(meetUrlPattern) || description.match(hangoutsUrlPattern);
    if (match) return match[0];

    // Buscar en ubicación
    match = location.match(meetUrlPattern) || location.match(hangoutsUrlPattern);
    if (match) return match[0];

    return null;
  }

  /**
   * Extrae enlace de Microsoft Teams de contenido o URL de reunión
   * @param {string} content - Contenido del evento
   * @param {string} meetingUrl - URL de reunión en línea
   * @returns {string|null} Enlace de Teams o null
   */
  extractTeamsLink(content, meetingUrl) {
    if (meetingUrl) return meetingUrl;

    const teamsUrlPattern = /https:\/\/teams\.microsoft\.com\/[^"'\s]+/;
    const match = content.match(teamsUrlPattern);
    return match ? match[0] : null;
  }

  /**
   * Crea un nuevo evento en el calendario especificado
   * @param {string} userId - ID del usuario
   * @param {Object} eventData - Datos del evento
   * @param {string} platform - Plataforma ('google' o 'microsoft')
   * @returns {Promise<Object>} Evento creado
   */
  async createEvent(userId, eventData, platform = 'google') {
    try {
      if (platform === 'google') {
        return await this.createGoogleCalendarEvent(userId, eventData);
      } else if (platform === 'microsoft') {
        return await this.createMicrosoftCalendarEvent(userId, eventData);
      } else {
        throw new Error('Plataforma no soportada');
      }
    } catch (error) {
      console.error('Error creando evento:', error);
      throw error;
    }
  }

  /**
   * Crea evento en Google Calendar
   * @param {string} userId - ID del usuario
   * @param {Object} eventData - Datos del evento
   * @returns {Promise<Object>} Evento creado
   */
  async createGoogleCalendarEvent(userId, eventData) {
    // Obtener credenciales
    const { data: credentials, error } = await supabase
      .from('user_credentials')
      .select('google_access_token')
      .eq('user_id', userId)
      .single();

    if (error || !credentials?.google_access_token) {
      throw new Error('No hay credenciales de Google disponibles');
    }

    // Preparar datos del evento
    const googleEvent = {
      summary: eventData.title,
      description: eventData.description,
      start: {
        dateTime: new Date(eventData.startTime).toISOString(),
        timeZone: 'America/Santiago'
      },
      end: {
        dateTime: new Date(eventData.endTime).toISOString(),
        timeZone: 'America/Santiago'
      },
      location: eventData.location,
      attendees: eventData.attendees?.map(email => ({ email })) || []
    };

    // Crear evento
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.google_access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(googleEvent)
      }
    );

    if (!response.ok) {
      throw new Error('Error creando evento en Google Calendar');
    }

    const createdEvent = await response.json();
    return {
      id: createdEvent.id,
      title: createdEvent.summary,
      startTime: createdEvent.start.dateTime,
      endTime: createdEvent.end.dateTime,
      platform: 'Google Calendar',
      meetLink: this.extractMeetLink(createdEvent.description || '', createdEvent.location || '')
    };
  }

  /**
   * Crea evento en Microsoft Outlook
   * @param {string} userId - ID del usuario
   * @param {Object} eventData - Datos del evento
   * @returns {Promise<Object>} Evento creado
   */
  async createMicrosoftCalendarEvent(userId, eventData) {
    // Obtener credenciales
    const { data: credentials, error } = await supabase
      .from('user_credentials')
      .select('microsoft_access_token')
      .eq('user_id', userId)
      .single();

    if (error || !credentials?.microsoft_access_token) {
      throw new Error('No hay credenciales de Microsoft disponibles');
    }

    // Preparar datos del evento
    const microsoftEvent = {
      subject: eventData.title,
      body: {
        contentType: 'HTML',
        content: eventData.description
      },
      start: {
        dateTime: new Date(eventData.startTime).toISOString(),
        timeZone: 'Pacific SA Standard Time'
      },
      end: {
        dateTime: new Date(eventData.endTime).toISOString(),
        timeZone: 'Pacific SA Standard Time'
      },
      location: {
        displayName: eventData.location
      },
      attendees: eventData.attendees?.map(email => ({
        emailAddress: { address: email },
        type: 'required'
      })) || []
    };

    // Crear evento
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.microsoft_access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(microsoftEvent)
      }
    );

    if (!response.ok) {
      throw new Error('Error creando evento en Microsoft Outlook');
    }

    const createdEvent = await response.json();
    return {
      id: createdEvent.id,
      title: createdEvent.subject,
      startTime: createdEvent.start.dateTime,
      endTime: createdEvent.end.dateTime,
      platform: 'Microsoft Outlook',
      meetLink: createdEvent.onlineMeetingUrl
    };
  }

  /**
   * Verifica el estado de conexión de las integraciones de calendario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Estado de conexiones
   */
  async getConnectionStatus(userId) {
    try {
      const { data: credentials, error } = await supabase
        .from('user_credentials')
        .select('google_access_token, microsoft_access_token')
        .eq('user_id', userId)
        .single();

      if (error) {
        return {
          google: false,
          microsoft: false
        };
      }

      return {
        google: !!(credentials.google_access_token),
        microsoft: !!(credentials.microsoft_access_token)
      };

    } catch (error) {
      console.error('Error verificando estado de conexiones:', error);
      return {
        google: false,
        microsoft: false
      };
    }
  }
}

const calendarService = new CalendarService();
export default calendarService;