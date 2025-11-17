import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.js'
import googleDrivePermissionsService from '../../services/googleDrivePermissionsService.js'
import {
  UserGroupIcon,
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const GoogleDrivePermissionsConfig = () => {
  const { user, supabase } = useAuth()
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState('')
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newPermission, setNewPermission] = useState({
    employeeEmail: '',
    permissionLevel: 'viewer',
    folderPath: ''
  })

  const permissionTemplates = googleDrivePermissionsService.getPermissionTemplates()

  useEffect(() => {
    loadCompanyData()
  }, [])

  useEffect(() => {
    if (selectedCompany) {
      loadPermissions()
    }
  }, [selectedCompany])

  const loadCompanyData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name')

      if (error) throw error
      setCompanies(data || [])
    } catch (error) {
      console.error('Error loading companies:', error)
      setError('Error al cargar las empresas')
    } finally {
      setLoading(false)
    }
  }

  const loadPermissions = async () => {
    try {
      setLoading(true)
      const permissionsData = await googleDrivePermissionsService.getCompanyPermissions(selectedCompany)
      setPermissions(permissionsData)
    } catch (error) {
      console.error('Error loading permissions:', error)
      setError('Error al cargar los permisos')
    } finally {
      setLoading(false)
    }
  }

  const addPermission = () => {
    if (!newPermission.employeeEmail || !newPermission.permissionLevel) {
      setError('Email y nivel de permiso son requeridos')
      return
    }

    const validationErrors = googleDrivePermissionsService.validatePermissions([newPermission])
    if (validationErrors.length > 0) {
      setError(validationErrors[0])
      return
    }

    setPermissions([...permissions, { ...newPermission, id: Date.now() }])
    setNewPermission({
      employeeEmail: '',
      permissionLevel: 'viewer',
      folderPath: ''
    })
    setError('')
  }

  const removePermission = (index) => {
    setPermissions(permissions.filter((_, i) => i !== index))
  }

  const savePermissions = async () => {
    try {
      setSaving(true)
      setError('')
      
      const validationErrors = googleDrivePermissionsService.validatePermissions(permissions)
      if (validationErrors.length > 0) {
        setError(validationErrors[0])
        return
      }

      await googleDrivePermissionsService.saveCompanyPermissions(selectedCompany, permissions)
      setSuccess('Permisos guardados correctamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error saving permissions:', error)
      setError('Error al guardar los permisos')
    } finally {
      setSaving(false)
    }
  }

  const applyPermissionsToGoogleDrive = async () => {
    try {
      setApplying(true)
      setError('')
      
      // Obtener token de acceso del usuario (esto debería venir del contexto de autenticación)
      const accessToken = localStorage.getItem('google_drive_access_token')
      if (!accessToken) {
        setError('No se encontró token de acceso de Google Drive')
        return
      }

      const folderId = 'root' // ID de la carpeta raíz o carpeta específica
      const results = await googleDrivePermissionsService.applyPermissionsToGoogleDrive(
        accessToken, 
        folderId, 
        permissions
      )

      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length

      if (failed > 0) {
        setError(`${failed} permisos fallaron al aplicarse`)
      }
      
      setSuccess(`${successful} permisos aplicados correctamente`)
      setTimeout(() => setSuccess(''), 5000)
    } catch (error) {
      console.error('Error applying permissions:', error)
      setError('Error al aplicar permisos a Google Drive')
    } finally {
      setApplying(false)
    }
  }

  if (loading && companies.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Configuración de Permisos Google Drive
            </h2>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Configura los permisos de acceso para empleados en Google Drive
          </p>
        </div>

        <div className="p-6">
          {/* Selección de empresa */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar empresa...</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCompany && (
            <>
              {/* Agregar nuevo permiso */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Permiso</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email del empleado
                    </label>
                    <input
                      type="email"
                      value={newPermission.employeeEmail}
                      onChange={(e) => setNewPermission({
                        ...newPermission,
                        employeeEmail: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="empleado@empresa.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nivel de permiso
                    </label>
                    <select
                      value={newPermission.permissionLevel}
                      onChange={(e) => setNewPermission({
                        ...newPermission,
                        permissionLevel: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(permissionTemplates).map(([key, template]) => (
                        <option key={key} value={key}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={addPermission}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Agregar
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ruta de carpeta (opcional)
                  </label>
                  <input
                    type="text"
                    value={newPermission.folderPath}
                    onChange={(e) => setNewPermission({
                      ...newPermission,
                      folderPath: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="/Carpeta/Subcarpeta"
                  />
                </div>
              </div>

              {/* Lista de permisos */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Permisos Configurados ({permissions.length})
                </h3>
                {permissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay permisos configurados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {permissions.map((permission, index) => (
                      <div key={permission.id || index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{permission.employeeEmail}</span>
                            <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {permissionTemplates[permission.permissionLevel]?.name || permission.permissionLevel}
                            </span>
                          </div>
                          {permission.folderPath && (
                            <p className="text-sm text-gray-500 mt-1">
                              Carpeta: {permission.folderPath}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removePermission(index)}
                          className="ml-4 p-2 text-red-600 hover:text-red-800 focus:outline-none"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={savePermissions}
                  disabled={saving || permissions.length === 0}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckIcon className="h-4 w-4 mr-2" />
                  )}
                  {saving ? 'Guardando...' : 'Guardar Permisos'}
                </button>

                <button
                  onClick={applyPermissionsToGoogleDrive}
                  disabled={applying || permissions.length === 0}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {applying ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  )}
                  {applying ? 'Aplicando...' : 'Aplicar a Google Drive'}
                </button>
              </div>
            </>
          )}

          {/* Mensajes de estado */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <XMarkIcon className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <CheckIcon className="h-5 w-5 text-green-400 mr-2" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GoogleDrivePermissionsConfig