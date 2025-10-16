import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext.js'

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
import ColorClasses from './components/layout/ColorClasses.js'
import PruebaColores from './components/layout/PruebaColores.js'
// Página de prueba
import TestHome from './components/home/TestHome.js'
// Página innovadora
import LandingInnovadora from './components/layout/LandingInnovadora.js'
// Componentes de autenticación innovadores
import LoginInnovador from './components/auth/LoginInnovador.js'
import RegisterInnovador from './components/auth/RegisterInnovador.js'
// Componente de dashboard innovador
// import DashboardInnovador from './components/dashboard/DashboardInnovador.js'
import ModernDashboard from './components/dashboard/ModernDashboard.js'
// Componentes de prueba de empresas (no implementados aún)
// import TestCompanyData from './components/dashboard/TestCompanyData'
// import DebugCompanyData from './components/dashboard/DebugCompanyData'
import CompanyEmployeeTest from './components/dashboard/CompanyEmployeeTest.js'
// Componente de verificación de estilos
import VerificarEstilos from './components/layout/VerificarEstilos.js'
// Componente de prueba de Tailwind
import PruebaTailwind from './components/layout/PruebaTailwind.js'
// Componente de prueba básica
import PruebaBasica from './components/layout/PruebaBasica.js'
// Nuevo componente de comunicación Webrify
import WebrifyCommunicationDashboard from './components/communication/WebrifyCommunicationDashboard.js'
// Componente de configuración
import Settings from './components/settings/Settings.js'


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
      {/* Componente auxiliar oculto para forzar generación de clases */}
      <ColorClasses />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
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
            {/* Página de inicio - Redirigir directamente al login */}
            <Route
              path="/"
              element={<Navigate to="/login" replace />}
            />
            
            {/* Página de prueba básica */}
            <Route 
              path="/prueba-basica" 
              element={<PruebaBasica />} 
            />
            
            {/* Página de inicio innovadora - siempre accesible */}
            <Route 
              path="/landing-prueba" 
              element={<LandingInnovadora />} 
            />
            
            {/* Ruta de prueba de Tailwind */}
            <Route
              path="/prueba-tailwind"
              element={<PruebaTailwind />}
            />
            
            {/* Ruta de prueba del Home Moderno */}
            <Route
              path="/test-home"
              element={<TestHome />}
            />
            
            {/* Rutas públicas */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginInnovador />
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
                    <ModernDashboard />
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
              <Route
                path="/prueba-colores"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <PruebaColores />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              {/* Ruta de verificación de estilos */}
              <Route
                path="/verificar-estilos"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <VerificarEstilos />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

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
  )
}

export default App