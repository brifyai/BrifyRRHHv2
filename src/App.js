import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext.js'
import CacheCleanup from './components/CacheCleanup.js'
import { ensureCorrectSupabaseConfig } from './utils/clearSupabaseCache.js'
// Importar el interceptor forzado para asegurar el uso del proyecto correcto
import './lib/forcedSupabaseClient.js'

// Componentes
import ForgotPassword from './components/auth/ForgotPassword.js'
import ResetPassword from './components/auth/ResetPassword.js'
import Plans from './components/plans/Plans.js'
import Folders from './components/folders/Folders.js'
import Files from './components/files/Files.js'
import Profile from './components/profile/Profile.js'
import SemanticSearch from './components/embeddings/SemanticSearch.js'
import Abogado from './components/legal/Abogado.js'
import LoadingSpinner from './components/common/LoadingSpinner.js'
import Navbar from './components/layout/Navbar.js'
import GoogleAuthCallback from './components/auth/GoogleAuthCallback.js'
// Componentes auxiliares
// Nuevo Home Moderno
import HomeStaffHubSEO from './components/home/HomeStaffHubSEO.js';

// Manejo de errores y carga
import ReactErrorBoundary from './components/error/ReactErrorBoundary.js'
import SuspenseWrapper from './components/common/SuspenseWrapper.js'
// Componentes de autenticación innovadores
import LoginUltraModern from './components/auth/LoginRedesigned.js'
import RegisterInnovador from './components/auth/RegisterInnovador.js'
// Componente de dashboard innovador
// import DashboardInnovador from './components/dashboard/DashboardInnovador.js'
import ModernDashboard from './components/dashboard/ModernDashboardRedesigned.js'
// Componentes de prueba de empresas (no implementados aún)
// import TestCompanyData from './components/dashboard/TestCompanyData'
// import DebugCompanyData from './components/dashboard/DebugCompanyData'
import CompanyEmployeeTest from './components/dashboard/CompanyEmployeeTest.js'
// Componente de prueba de sincronización de empresas
import CompanySyncTest from './components/test/CompanySyncTest.js'
// Componente de prueba de WhatsApp APIs
import WhatsAppAPITest from './components/test/WhatsAppAPITest.js'
// Nuevo componente de comunicación Webrify
import WebrifyCommunicationDashboard from './components/communication/WebrifyCommunicationDashboard.js'
// Componente de configuración
import Settings from './components/settings/Settings.js'
// Dashboard de estadísticas de Brevo
import BrevoStatisticsDashboard from './components/communication/BrevoStatisticsDashboard.js'
// Gestor de plantillas de Brevo
import BrevoTemplatesManager from './components/communication/BrevoTemplatesManager.js'
// Asistente de configuración fácil de WhatsApp Business
import WhatsAppOnboarding from './components/whatsapp/WhatsAppOnboarding.js'
// Gestor multi-WhatsApp para agencias (solo para usuarios avanzados)
import MultiWhatsAppManager from './components/whatsapp/MultiWhatsAppManager.js'


// Limpiar configuración incorrecta de Supabase al iniciar la aplicación
console.log('🔍 Verificando configuración de Supabase al iniciar...')
const configCheck = ensureCorrectSupabaseConfig()
if (configCheck.success) {
  console.log('✅ Configuración de Supabase verificada correctamente')
} else {
  console.warn('⚠️ Hubo problemas al verificar la configuración de Supabase:', configCheck)
}

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />
}

// Componente para rutas públicas (solo para usuarios no autenticados)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  return !isAuthenticated ? children : <Navigate to="/panel-principal" />
}

// Layout principal para rutas autenticadas
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

function App() {
  return (
    <ReactErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <CacheCleanup />
            <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4aed88',
                },
              },
              error: {
                duration: 4000,
                theme: {
                  primary: '#ff4b4b',
                },
              },
            }}
          />
          
          <Routes>
            {/* Nuevo Home Moderno - página principal */}
            <Route
              path="/"
              element={
                <SuspenseWrapper
                  message="Cargando página principal..."
                  fullScreen={true}
                >
                  <HomeStaffHubSEO />
                </SuspenseWrapper>
              }
            />

            {/* Rutas públicas */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginUltraModern />
                </PublicRoute>
              }
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterInnovador />
                </PublicRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                <ResetPassword />
              } 
            />
            
            {/* Callback de Google Auth */}
            <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
            
            {/* Rutas protegidas */}
            <Route
              path="/panel-principal"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <SuspenseWrapper message="Cargando dashboard...">
                      <ModernDashboard />
                    </SuspenseWrapper>
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route 
              path="/plans" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Plans />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/folders" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Folders />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/files" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Files />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Profile />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Settings />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion/empresas"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Settings activeTab="companies" />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion/empresas/:companyId"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Settings activeTab="companies" companyId={true} />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion/usuarios"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Settings activeTab="users" />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion/general"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Settings activeTab="general" />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion/notificaciones"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Settings activeTab="notifications" />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion/seguridad"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Settings activeTab="security" />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion/integraciones"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Settings activeTab="integrations" />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion/base-de-datos"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Settings activeTab="database" />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/integraciones"
              element={
                <ProtectedRoute>
                  <Navigate to="/configuracion/integraciones" replace />
                </ProtectedRoute>
              }
            />
              <Route
                path="/busqueda-ia"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <SemanticSearch />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lawyer"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <Abogado />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              {/* Ruta de prueba de colores */}
              {/* Rutas de comunicación interna - Sistema moderno unificado */}
            <Route 
              path="/communication" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <WebrifyCommunicationDashboard activeTab="dashboard" />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route
              path="/base-de-datos"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <WebrifyCommunicationDashboard activeTab="dashboard" />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/base-de-datos/database"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <WebrifyCommunicationDashboard activeTab="database" />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route 
              path="/communication/send" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <WebrifyCommunicationDashboard activeTab="send" />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/communication/folders" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <WebrifyCommunicationDashboard activeTab="folders" />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/communication/templates" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <WebrifyCommunicationDashboard activeTab="templates" />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/communication/bulk-upload" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <WebrifyCommunicationDashboard activeTab="bulk-upload" />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/communication/reports" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <WebrifyCommunicationDashboard activeTab="reports" />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />


            
            {/* Dashboard de estadísticas de Brevo */}
            <Route
              path="/estadisticas-brevo"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <BrevoStatisticsDashboard />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            {/* Gestor de plantillas de Brevo */}
            <Route
              path="/plantillas-brevo"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <BrevoTemplatesManager />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            {/* Rutas de redirección para configuración */}
            <Route
              path="/configuracion/estadisticas-brevo"
              element={
                <ProtectedRoute>
                  <Navigate to="/estadisticas-brevo" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion/plantillas-brevo"
              element={
                <ProtectedRoute>
                  <Navigate to="/plantillas-brevo" replace />
                </ProtectedRoute>
              }
            />
            
            {/* Asistente de configuración fácil de WhatsApp Business */}
            <Route
              path="/whatsapp/setup"
              element={
                <ProtectedRoute>
                  <WhatsAppOnboarding />
                </ProtectedRoute>
              }
            />

            {/* Gestor Multi-WhatsApp para agencias (solo para usuarios avanzados) */}
            <Route
              path="/whatsapp/multi-manager"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <MultiWhatsAppManager />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            {/* Redirección de la ruta antigua para compatibilidad */}
            <Route
              path="/whatsapp/setup-wizard"
              element={
                <Navigate to="/whatsapp/setup" replace />
              }
            />

            {/* Ruta de prueba de empresas y empleados */}
            <Route 
              path="/test-company-employee" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <CompanyEmployeeTest />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta de prueba de sincronización de empresas */}
            <Route
              path="/test-company-sync"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <CompanySyncTest />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Ruta de prueba de WhatsApp APIs */}
            <Route
              path="/test-whatsapp-apis"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <WhatsAppAPITest />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Ruta 404 */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Página no encontrada</p>
                    <a
                      href="/panel-principal"
                      className="btn-primary inline-block"
                    >
                      Volver al Panel Principal
                    </a>
                  </div>
                </div>
              } 
            />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ReactErrorBoundary>
  )
}

export default App