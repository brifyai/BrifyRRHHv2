import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useUserExtensions } from '../../hooks/useUserExtensions'
import {
  HomeIcon,
  FolderIcon,
  CreditCardIcon,
  UserIcon,
  ScaleIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const Navbar = () => {
  const { signOut, user, userProfile, hasActivePlan } = useAuth()
  const { hasExtension } = useUserExtensions()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Función para manejar el clic en "Enviar Mensajes"
  const handleSendMessagesClick = (e) => {
    e.preventDefault();
    
    // Verificar si hay empleados seleccionados
    if (window.tempSelectedEmployees && window.tempSelectedEmployees.length > 0) {
      // Si hay empleados seleccionados, navegar a la página de envío con los datos
      navigate('/communication/send', { 
        state: { selectedEmployees: window.tempSelectedEmployees } 
      });
    } else if (window.selectedEmployeesData && window.selectedEmployeesData.length > 0) {
      // Si no hay empleados en tempSelectedEmployees, verificar selectedEmployeesData
      navigate('/communication/send', { 
        state: { selectedEmployees: window.selectedEmployeesData.map(emp => emp.id) }
      });
    } else {
      // Si no hay empleados seleccionados, mostrar alerta con SweetAlert
      MySwal.fire({
        title: 'Advertencia',
        text: 'Debe seleccionar al menos un empleado en la Base de Datos antes de poder enviar mensajes',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#fcb900'
      }).then(() => {
        // Después de cerrar la alerta, redirigir a la base de datos
        navigate('/communication/database');
      });
    }
  };

  const isActive = (path) => {
    return location.pathname === path
  }

  const getPlanName = () => {
    if (!userProfile || !userProfile.current_plan_id) return 'Sin plan'
    
    // This would normally come from a plans context or API
    // For now we'll return a generic name
    return 'Plan Activo'
  }

  // Menú de navegación principal - Solo elementos esenciales en el menú superior
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Base de datos', href: '/communication/dashboard', icon: FolderIcon },
    ...(hasActivePlan() ? [{ name: 'Búsqueda IA', href: '/search', icon: MagnifyingGlassIcon }] : []),
    ...(hasExtension('Abogados') ? [{ name: 'Abogado', href: '/abogado', icon: ScaleIcon }] : []),
    { name: 'Configuración', href: '/settings', icon: Cog6ToothIcon },
    { name: 'Planes', href: '/plans', icon: CreditCardIcon },
    { name: 'Perfil', href: '/profile', icon: UserIcon }
  ]

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y navegación principal */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <div className="logo-container">
                  <img 
                    src="/images/Mesa-de-trabajo-105-1.png" 
                    alt="Logo" 
                    className="logo-image"
                  />
                </div>
              </Link>
            </div>
            
            {/* Navegación desktop */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                // Si el item tiene una función onClick, usar un botón en lugar de un enlace
                if (item.onClick) {
                  return (
                    <button
                      key={item.name}
                      onClick={item.onClick}
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                        isActive(item.href)
                          ? 'bg-engage-blue/10 text-engage-blue'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate max-w-[100px]">{item.name}</span>
                    </button>
                  )
                }
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                      isActive(item.href)
                        ? 'bg-engage-blue/10 text-engage-blue'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate max-w-[100px]">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Información del usuario y menú */}
          <div className="hidden sm:flex sm:items-center sm:space-x-2">
            {/* Información del plan */}
            {userProfile && (
              <div className="hidden md:flex items-center text-sm">
                <span className="font-medium text-gray-700 truncate max-w-[80px]">
                  {getPlanName()}
                </span>
                {userProfile.is_active && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-engage-blue text-white whitespace-nowrap">
                    Activo
                  </span>
                )}
              </div>
            )}

            {/* Menú de usuario */}
            <div className="flex items-center">
              <span className="hidden xl:block text-sm font-medium text-gray-700 truncate max-w-[100px]">
                {user && user.email ? user.email : 'Usuario'}
              </span>
              <button
                onClick={handleSignOut}
                className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200 whitespace-nowrap"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span className="hidden lg:inline ml-1">Salir</span>
              </button>
            </div>
          </div>

          {/* Botón menú móvil */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-engage-blue"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              // Si el item tiene una función onClick, usar un botón en lugar de un enlace
              if (item.onClick) {
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      item.onClick()
                      setIsMobileMenuOpen(false)
                    }}
                    className={`block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive(item.href)
                        ? 'bg-engage-blue/10 border-engage-blue text-engage-blue'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </div>
                  </button>
                )
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-engage-blue/10 border-engage-blue text-engage-blue'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </div>
          
          {/* Información del usuario en móvil */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-engage-blue/10 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-engage-blue" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {user && user.email ? user.email : 'Usuario'}
                </div>
                {userProfile && (
                  <div className="text-sm text-gray-500">
                    {getPlanName()}
                    {userProfile.is_active && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-engage-blue text-white">
                        Activo
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleSignOut}
                className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-engage-blue hover:bg-gray-50 w-full text-left"
              >
                <div className="flex items-center">
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                  Cerrar Sesión
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar