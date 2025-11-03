// Script de prueba para las integraciones de Microsoft 365, Zoom y Google Calendar
// Simula llamadas a webhooks con datos de ejemplo

import axios from 'axios';

const BASE_URL = 'http://localhost:3002'; // Ajustar según el puerto del servidor

// Datos de prueba para Microsoft 365
const microsoft365TestData = {
  value: [
    {
      subscriptionId: 'test-subscription-123',
      resource: 'Users/test-user@domain.com/Events/event-123',
      changeType: 'created',
      clientState: 'test-state'
    }
  ]
};

// Datos de prueba para Zoom
const zoomTestData = {
  event: 'meeting.created',
  payload: {
    account_id: 'test-account-123',
    object: {
      id: 123456789,
      uuid: 'test-uuid-123',
      host_id: 'test-host-123',
      topic: 'Reunión de Prueba',
      start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hora desde ahora
      join_url: 'https://zoom.us/j/123456789',
      password: 'test123'
    }
  }
};

// Datos de prueba para Google Calendar
const googleCalendarTestData = {
  // Los headers se pasan por separado en el request
};

// Datos de prueba para extensiones de Google Meet
const googleMeetExtensionsTestData = {
  type: 'meeting_started',
  data: {
    meetingId: 'meet-123456789',
    title: 'Reunión de Proyecto Alpha',
    participants: [
      { name: 'Juan Pérez', email: 'juan@empresa.com' },
      { name: 'María García', email: 'maria@empresa.com' }
    ],
    startTime: new Date().toISOString()
  },
  userId: 'test-user-123'
};

// Datos de prueba para tiempo real de Google Meet
const googleMeetRealtimeTestData = {
  eventType: 'meeting_detected',
  meetingData: {
    title: 'Reunión de Ventas Q1',
    participantCount: 5,
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    startTime: new Date().toISOString()
  },
  userId: 'test-user-123',
  timestamp: new Date().toISOString()
};

async function testMicrosoft365Integration() {
  try {
    console.log('🧪 Probando integración Microsoft 365...');

    const response = await axios.post(
      `${BASE_URL}/api/webhook/microsoft365-notifications`,
      microsoft365TestData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Respuesta Microsoft 365:', response.data);

  } catch (error) {
    console.error('❌ Error en Microsoft 365:', error.response?.data || error.message);
  }
}

async function testZoomIntegration() {
  try {
    console.log('🧪 Probando integración Zoom...');

    const response = await axios.post(
      `${BASE_URL}/api/webhook/zoom-notifications`,
      zoomTestData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Respuesta Zoom:', response.data);

  } catch (error) {
    console.error('❌ Error en Zoom:', error.response?.data || error.message);
  }
}

async function testGoogleCalendarIntegration() {
  try {
    console.log('🧪 Probando integración Google Calendar...');

    const response = await axios.post(
      `${BASE_URL}/api/webhook/google-calendar-notifications`,
      googleCalendarTestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-channel-id': 'test-channel-123',
          'x-goog-resource-id': 'test-resource-123',
          'x-goog-resource-state': 'update'
        }
      }
    );

    console.log('✅ Respuesta Google Calendar:', response.data);

  } catch (error) {
    console.error('❌ Error en Google Calendar:', error.response?.data || error.message);
  }
}

async function testExistingDriveIntegration() {
  try {
    console.log('🧪 Probando integración Google Drive existente...');

    const driveTestData = {
      headers: {
        'x-goog-channel-id': 'test-drive-channel-123',
        'x-goog-resource-state': 'update',
        'x-goog-changed': 'children'
      }
    };

    const response = await axios.post(
      `${BASE_URL}/api/webhook/drive-notifications`,
      driveTestData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Respuesta Google Drive:', response.data);

  } catch (error) {
    console.error('❌ Error en Google Drive:', error.response?.data || error.message);
  }
}

async function testGoogleMeetExtensionsIntegration() {
  try {
    console.log('🧪 Probando extensiones de Google Meet...');

    const response = await axios.post(
      `${BASE_URL}/api/webhook/google-meet-extensions`,
      googleMeetExtensionsTestData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Respuesta extensiones de Google Meet:', response.data);

  } catch (error) {
    console.error('❌ Error en extensiones de Google Meet:', error.response?.data || error.message);
  }
}

async function testGoogleMeetRealtimeIntegration() {
  try {
    console.log('🧪 Probando tiempo real de Google Meet...');

    const response = await axios.post(
      `${BASE_URL}/api/webhook/google-meet-realtime`,
      googleMeetRealtimeTestData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Respuesta tiempo real de Google Meet:', response.data);

  } catch (error) {
    console.error('❌ Error en tiempo real de Google Meet:', error.response?.data || error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando pruebas de integraciones...\n');

  await testMicrosoft365Integration();
  console.log('');

  await testZoomIntegration();
  console.log('');

  await testGoogleCalendarIntegration();
  console.log('');

  await testGoogleMeetExtensionsIntegration();
  console.log('');

  await testGoogleMeetRealtimeIntegration();
  console.log('');

  await testExistingDriveIntegration();
  console.log('');

  console.log('🏁 Pruebas completadas.');
}

// Ejecutar pruebas si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export {
  testMicrosoft365Integration,
  testZoomIntegration,
  testGoogleCalendarIntegration,
  testGoogleMeetExtensionsIntegration,
  testGoogleMeetRealtimeIntegration,
  testExistingDriveIntegration,
  runAllTests
};