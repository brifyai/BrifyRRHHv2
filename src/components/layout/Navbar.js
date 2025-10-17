import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  HomeIcon,
  FolderIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

const Navbar = () => {
  const { signOut } = useAuth()
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

  const isActive = (path) => {
    return location.pathname === path
  }


  // Menú de navegación principal - Solo elementos esenciales en el menú superior
  const navigation = [
    { name: 'Panel Principal', href: '/panel-principal', icon: HomeIcon },
    { name: 'Base de datos', href: '/base-de-datos', icon: FolderIcon },
    { name: 'Búsqueda IA', href: '/busqueda-ia', icon: MagnifyingGlassIcon },
    {
      name: 'Configuración',
      href: '/configuracion',
      icon: Cog6ToothIcon,
      subMenu: [
        { name: 'Empresas', href: '/configuracion/empresas' },
        { name: 'Usuarios', href: '/configuracion/usuarios' },
        { name: 'General', href: '/configuracion/general' },
        { name: 'Notificaciones', href: '/configuracion/notificaciones' },
        { name: 'Seguridad', href: '/configuracion/seguridad' },
        { name: 'Integraciones', href: '/configuracion/integraciones' },
        { name: 'Base de Datos', href: '/configuracion/base-de-datos' }
      ]
    },
    { name: 'Perfil', href: '/perfil', icon: UserIcon }
  ]

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y navegación principal */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/panel-principal" className="flex items-center">
                <div className="flex items-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Brify
                  </span>
                  <span className="text-2xl font-bold text-gray-800 ml-1">
                    AI
                  </span>
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
            {/* Menú de usuario */}
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200 whitespace-nowrap"
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