import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import inMemoryEmployeeService from '../../services/inMemoryEmployeeService'
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const CompanyForm = ({ company, onSuccess, onCancel }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    telegram_bot: '',
    whatsapp_number: '',
    is_active: true
  })
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [employeesPerPage] = useState(10)

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        description: company.description || '',
        telegram_bot: company.telegram_bot || '',
        whatsapp_number: company.whatsapp_number || '',
        is_active: company.is_active !== false
      })
      loadEmployees()
    } else {
      // Nueva empresa - agregar un empleado por defecto
      setEmployees([{
        id: 'temp-' + Date.now(),
        name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        isNew: true
      }])
    }
  }, [company])

  const loadEmployees = async () => {
    if (!company) return

    try {
      // Intentar cargar desde Supabase primero
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('company_id', company.id)
          .order('name')

        if (!error && data && data.length > 0) {
          setEmployees(data)
          return
        }
      } catch (supabaseError) {
        // Silenciar errores de Supabase
      }

      // Fallback: cargar empleados desde el servicio local
      const allEmployees = await inMemoryEmployeeService.getEmployees()
      const companyEmployees = allEmployees.filter(emp => emp.company_id === company.id)
      setEmployees(companyEmployees)

    } catch (error) {
      console.error('Error loading employees:', error)
      toast.error('Error al cargar empleados')
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addEmployee = () => {
    setEmployees(prev => [...prev, {
      id: 'temp-' + Date.now(),
      name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      isNew: true
    }])
  }

  const updateEmployee = (index, field, value) => {
    // Calcular el índice global basado en la página actual
    const globalIndex = indexOfFirstEmployee + index
    setEmployees(prev => prev.map((emp, i) =>
      i === globalIndex ? { ...emp, [field]: value } : emp
    ))
  }

  const removeEmployee = (index) => {
    // Calcular el índice global basado en la página actual
    const globalIndex = indexOfFirstEmployee + index
    setEmployees(prev => prev.filter((_, i) => i !== globalIndex))
  }

  // Calcular empleados de la página actual
  const indexOfLastEmployee = currentPage * employeesPerPage
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage
  const currentEmployees = employees.slice(indexOfFirstEmployee, indexOfLastEmployee)

  // Calcular total de páginas
  const totalPages = Math.ceil(employees.length / employeesPerPage)

  // Funciones de paginación
  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre de la empresa es obligatorio')
      return false
    }

    // Validar empleados
    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i]
      if (!emp.name.trim() || !emp.email.trim()) {
        toast.error(`El empleado ${i + 1} debe tener nombre y email`)
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      let companyId = company?.id

      // Crear o actualizar empresa
      if (company) {
        // Actualizar empresa existente
        const { error } = await supabase
          .from('companies')
          .update({
            name: formData.name,
            description: formData.description,
            telegram_bot: formData.telegram_bot,
            whatsapp_number: formData.whatsapp_number,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', company.id)

        if (error) throw error
      } else {
        // Crear nueva empresa
        const { data, error } = await supabase
          .from('companies')
          .insert({
            name: formData.name,
            description: formData.description,
            telegram_bot: formData.telegram_bot,
            whatsapp_number: formData.whatsapp_number,
            is_active: formData.is_active,
            user_id: user.id
          })
          .select()
          .single()

        if (error) throw error
        companyId = data.id
      }

      // Procesar empleados
      for (const emp of employees) {
        if (emp.isNew) {
          // Crear nuevo empleado
          const { error } = await supabase
            .from('employees')
            .insert({
              company_id: companyId,
              name: emp.name,
              email: emp.email,
              phone: emp.phone || null,
              department: emp.department || null,
              position: emp.position || null,
              is_active: true
            })

          if (error) throw error
        } else {
          // Actualizar empleado existente
          const { error } = await supabase
            .from('employees')
            .update({
              name: emp.name,
              email: emp.email,
              phone: emp.phone || null,
              department: emp.department || null,
              position: emp.position || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', emp.id)

          if (error) throw error
        }
      }

      toast.success(company ? 'Empresa actualizada exitosamente' : 'Empresa creada exitosamente')
      onSuccess()
    } catch (error) {
      console.error('Error saving company:', error)
      toast.error('Error al guardar la empresa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onCancel}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Volver
        </button>

        <div className="flex items-center">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mr-4">
            <BuildingOfficeIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {company ? 'Editar Empresa' : 'Nueva Empresa'}
            </h1>
            <p className="text-gray-600">
              {company ? 'Modifica los datos de la empresa' : 'Crea una nueva empresa con sus empleados'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información de la Empresa */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <BuildingOfficeIcon className="h-6 w-6 mr-3 text-blue-600" />
            Información de la Empresa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Ej: Empresa XYZ"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={() => handleInputChange('is_active', true)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Activa</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_active"
                    checked={!formData.is_active}
                    onChange={() => handleInputChange('is_active', false)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inactiva</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Descripción opcional de la empresa"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                Bot de Telegram
              </label>
              <input
                type="url"
                value={formData.telegram_bot}
                onChange={(e) => handleInputChange('telegram_bot', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="https://t.me/tu_bot"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Número de WhatsApp
              </label>
              <input
                type="tel"
                value={formData.whatsapp_number}
                onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="+56912345678"
              />
            </div>
          </div>
        </div>

        {/* Empleados */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <UserGroupIcon className="h-6 w-6 mr-3 text-green-600" />
              Empleados ({employees.length})
            </h2>
            <button
              type="button"
              onClick={addEmployee}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Agregar Empleado
            </button>
          </div>

          <div className="space-y-4">
            {currentEmployees.map((employee, index) => (
              <div key={employee.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Empleado {index + 1}
                  </h3>
                  {employees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmployee(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar empleado"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={employee.name}
                      onChange={(e) => updateEmployee(index, 'name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Juan Pérez González"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={employee.email}
                      onChange={(e) => updateEmployee(index, 'email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="juan.perez@empresa.cl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={employee.phone}
                      onChange={(e) => updateEmployee(index, 'phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="+56912345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento
                    </label>
                    <input
                      type="text"
                      value={employee.department}
                      onChange={(e) => updateEmployee(index, 'department', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Operaciones"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cargo
                    </label>
                    <input
                      type="text"
                      value={employee.position}
                      onChange={(e) => updateEmployee(index, 'position', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Jefe de Operaciones"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Mostrando {indexOfFirstEmployee + 1}-{Math.min(indexOfLastEmployee, employees.length)} de {employees.length} empleados
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                {/* Números de página */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      currentPage === number
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="h-5 w-5 mr-2" />
            {loading ? 'Guardando...' : (company ? 'Actualizar Empresa' : 'Crear Empresa')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CompanyForm