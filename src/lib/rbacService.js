/**
 * Role-Based Access Control (RBAC) Service
 * Implementación de control de acceso basado en roles
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

class RBACService {
  constructor() {
    this.roles = new Map() // roleId -> role
    this.permissions = new Map() // permissionId -> permission
    this.userRoles = new Map() // userId -> [roleId]
    this.rolePermissions = new Map() // roleId -> [permissionId]
    this.auditLogs = [] // Array de auditoría
    this.delegations = new Map() // delegatorId -> [delegation]
    
    this.initializeDefaultRoles()
    this.initializeDefaultPermissions()
  }

  /**
   * Inicializar roles por defecto
   */
  initializeDefaultRoles() {
    const defaultRoles = [
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Acceso completo al sistema',
        level: 100,
        isSystem: true,
        createdAt: Date.now()
      },
      {
        id: 'manager',
        name: 'Manager',
        description: 'Gestión de equipos y recursos',
        level: 80,
        isSystem: true,
        createdAt: Date.now()
      },
      {
        id: 'user',
        name: 'User',
        description: 'Acceso básico a funcionalidades',
        level: 50,
        isSystem: true,
        createdAt: Date.now()
      },
      {
        id: 'viewer',
        name: 'Viewer',
        description: 'Solo lectura de información',
        level: 20,
        isSystem: true,
        createdAt: Date.now()
      }
    ]

    defaultRoles.forEach(role => {
      this.roles.set(role.id, role)
    })
  }

  /**
   * Inicializar permisos por defecto
   */
  initializeDefaultPermissions() {
    const defaultPermissions = [
      // Permisos de Usuario
      { id: 'user.create', name: 'Crear usuarios', category: 'user', level: 80 },
      { id: 'user.read', name: 'Ver usuarios', category: 'user', level: 20 },
      { id: 'user.update', name: 'Actualizar usuarios', category: 'user', level: 80 },
      { id: 'user.delete', name: 'Eliminar usuarios', category: 'user', level: 100 },
      { id: 'user.assign_roles', name: 'Asignar roles', category: 'user', level: 80 },
      
      // Permisos de Empresa
      { id: 'company.create', name: 'Crear empresas', category: 'company', level: 80 },
      { id: 'company.read', name: 'Ver empresas', category: 'company', level: 20 },
      { id: 'company.update', name: 'Actualizar empresas', category: 'company', level: 80 },
      { id: 'company.delete', name: 'Eliminar empresas', category: 'company', level: 100 },
      
      // Permisos de Empleados
      { id: 'employee.create', name: 'Crear empleados', category: 'employee', level: 50 },
      { id: 'employee.read', name: 'Ver empleados', category: 'employee', level: 20 },
      { id: 'employee.update', name: 'Actualizar empleados', category: 'employee', level: 50 },
      { id: 'employee.delete', name: 'Eliminar empleados', category: 'employee', level: 80 },
      
      // Permisos de Comunicación
      { id: 'communication.send', name: 'Enviar comunicaciones', category: 'communication', level: 50 },
      { id: 'communication.read', name: 'Ver comunicaciones', category: 'communication', level: 20 },
      { id: 'communication.manage', name: 'Gestionar comunicaciones', category: 'communication', level: 80 },
      
      // Permisos de Archivos
      { id: 'file.upload', name: 'Subir archivos', category: 'file', level: 50 },
      { id: 'file.read', name: 'Ver archivos', category: 'file', level: 20 },
      { id: 'file.update', name: 'Actualizar archivos', category: 'file', level: 50 },
      { id: 'file.delete', name: 'Eliminar archivos', category: 'file', level: 80 },
      
      // Permisos de Reportes
      { id: 'report.create', name: 'Crear reportes', category: 'report', level: 50 },
      { id: 'report.read', name: 'Ver reportes', category: 'report', level: 20 },
      { id: 'report.export', name: 'Exportar reportes', category: 'report', level: 50 },
      
      // Permisos de Configuración
      { id: 'config.read', name: 'Ver configuración', category: 'config', level: 80 },
      { id: 'config.update', name: 'Actualizar configuración', category: 'config', level: 100 },
      
      // Permisos de Seguridad
      { id: 'security.audit', name: 'Ver auditoría de seguridad', category: 'security', level: 80 },
      { id: 'security.manage', name: 'Gestionar seguridad', category: 'security', level: 100 }
    ]

    defaultPermissions.forEach(permission => {
      this.permissions.set(permission.id, {
        ...permission,
        createdAt: Date.now()
      })
    })

    // Asignar permisos a roles por defecto
    this.assignDefaultPermissions()
  }

  /**
   * Asignar permisos por defecto a roles
   */
  assignDefaultPermissions() {
    // Admin: Todos los permisos
    const allPermissions = Array.from(this.permissions.keys())
    this.rolePermissions.set('admin', allPermissions)

    // Manager: Permisos de gestión
    const managerPermissions = Array.from(this.permissions.keys()).filter(id => {
      const perm = this.permissions.get(id)
      return perm.level <= 80
    })
    this.rolePermissions.set('manager', managerPermissions)

    // User: Permisos básicos
    const userPermissions = Array.from(this.permissions.keys()).filter(id => {
      const perm = this.permissions.get(id)
      return perm.level <= 50
    })
    this.rolePermissions.set('user', userPermissions)

    // Viewer: Solo lectura
    const viewerPermissions = Array.from(this.permissions.keys()).filter(id => {
      const perm = this.permissions.get(id)
      return perm.level <= 20
    })
    this.rolePermissions.set('viewer', viewerPermissions)
  }

  /**
   * Crear nuevo rol
   * @param {Object} roleData - Datos del rol
   * @returns {Object} Rol creado
   */
  createRole(roleData) {
    try {
      const role = {
        id: roleData.id || `role_${Date.now()}`,
        name: roleData.name,
        description: roleData.description || '',
        level: roleData.level || 50,
        isSystem: false,
        createdAt: Date.now(),
        createdBy: roleData.createdBy
      }

      this.roles.set(role.id, role)
      this.logAudit('role_created', role.createdBy, { roleId: role.id, roleName: role.name })

      return role
    } catch (error) {
      console.error('Error creating role:', error)
      throw new Error('Failed to create role')
    }
  }

  /**
   * Actualizar rol existente
   * @param {string} roleId - ID del rol
   * @param {Object} updates - Datos a actualizar
   * @returns {Object} Rol actualizado
   */
  updateRole(roleId, updates) {
    try {
      const role = this.roles.get(roleId)
      if (!role) {
        throw new Error('Role not found')
      }

      if (role.isSystem) {
        throw new Error('Cannot update system role')
      }

      const updatedRole = {
        ...role,
        ...updates,
        updatedAt: Date.now(),
        updatedBy: updates.updatedBy
      }

      this.roles.set(roleId, updatedRole)
      this.logAudit('role_updated', updates.updatedBy, { roleId, roleName: role.name, updates })

      return updatedRole
    } catch (error) {
      console.error('Error updating role:', error)
      throw error
    }
  }

  /**
   * Eliminar rol
   * @param {string} roleId - ID del rol
   * @param {string} deletedBy - Usuario que elimina
   * @returns {boolean} True si se eliminó
   */
  deleteRole(roleId, deletedBy) {
    try {
      const role = this.roles.get(roleId)
      if (!role) {
        throw new Error('Role not found')
      }

      if (role.isSystem) {
        throw new Error('Cannot delete system role')
      }

      // Verificar que no haya usuarios con este rol
      for (const [userId, userRoleIds] of this.userRoles.entries()) {
        if (userRoleIds.includes(roleId)) {
          throw new Error('Cannot delete role: users assigned to this role')
        }
      }

      this.roles.delete(roleId)
      this.rolePermissions.delete(roleId)
      this.logAudit('role_deleted', deletedBy, { roleId, roleName: role.name })

      return true
    } catch (error) {
      console.error('Error deleting role:', error)
      throw error
    }
  }

  /**
   * Asignar rol a usuario
   * @param {string} userId - ID del usuario
   * @param {string} roleId - ID del rol
   * @param {string} assignedBy - Usuario que asigna
   * @returns {boolean} True si se asignó
   */
  assignRole(userId, roleId, assignedBy) {
    try {
      const role = this.roles.get(roleId)
      if (!role) {
        throw new Error('Role not found')
      }

      if (!this.userRoles.has(userId)) {
        this.userRoles.set(userId, [])
      }

      const userRoleIds = this.userRoles.get(userId)
      if (!userRoleIds.includes(roleId)) {
        userRoleIds.push(roleId)
        this.logAudit('role_assigned', assignedBy, { userId, roleId, roleName: role.name })
      }

      return true
    } catch (error) {
      console.error('Error assigning role:', error)
      throw error
    }
  }

  /**
   * Revocar rol de usuario
   * @param {string} userId - ID del usuario
   * @param {string} roleId - ID del rol
   * @param {string} revokedBy - Usuario que revoca
   * @returns {boolean} True si se revocó
   */
  revokeRole(userId, roleId, revokedBy) {
    try {
      if (!this.userRoles.has(userId)) {
        return false
      }

      const userRoleIds = this.userRoles.get(userId)
      const index = userRoleIds.indexOf(roleId)
      if (index !== -1) {
        userRoleIds.splice(index, 1)
        const role = this.roles.get(roleId)
        this.logAudit('role_revoked', revokedBy, { userId, roleId, roleName: role?.name })
        return true
      }

      return false
    } catch (error) {
      console.error('Error revoking role:', error)
      throw error
    }
  }

  /**
   * Verificar si usuario tiene permiso
   * @param {string} userId - ID del usuario
   * @param {string} permissionId - ID del permiso
   * @returns {boolean} True si tiene permiso
   */
  hasPermission(userId, permissionId) {
    try {
      const userRoleIds = this.userRoles.get(userId) || []
      const allPermissions = new Set()

      userRoleIds.forEach(roleId => {
        const rolePerms = this.rolePermissions.get(roleId) || []
        rolePerms.forEach(permId => allPermissions.add(permId))
      })

      return allPermissions.has(permissionId)
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  /**
   * Obtener todos los permisos de usuario
   * @param {string} userId - ID del usuario
   * @returns {Array} Array de permisos
   */
  getUserPermissions(userId) {
    try {
      const userRoleIds = this.userRoles.get(userId) || []
      const allPermissions = new Set()

      userRoleIds.forEach(roleId => {
        const rolePerms = this.rolePermissions.get(roleId) || []
        rolePerms.forEach(permId => allPermissions.add(permId))
      })

      return Array.from(allPermissions).map(permId => this.permissions.get(permId))
    } catch (error) {
      console.error('Error getting user permissions:', error)
      return []
    }
  }

  /**
   * Obtener roles de usuario
   * @param {string} userId - ID del usuario
   * @returns {Array} Array de roles
   */
  getUserRoles(userId) {
    try {
      const userRoleIds = this.userRoles.get(userId) || []
      return userRoleIds.map(roleId => this.roles.get(roleId)).filter(Boolean)
    } catch (error) {
      console.error('Error getting user roles:', error)
      return []
    }
  }

  /**
   * Delegar rol a otro usuario
   * @param {string} delegatorId - ID del usuario que delega
   * @param {string} delegateeId - ID del usuario que recibe delegación
   * @param {string} roleId - ID del rol a delegar
   * @param {Object} options - Opciones de delegación
   * @returns {Object} Delegación creada
   */
  delegateRole(delegatorId, delegateeId, roleId, options = {}) {
    try {
      // Verificar que delegador tenga el rol
      if (!this.userRoles.get(delegatorId)?.includes(roleId)) {
        throw new Error('Delegator does not have this role')
      }

      // Verificar que se pueda delegar
      const role = this.roles.get(roleId)
      if (role.level >= 80) {
        throw new Error('Cannot delegate high-level roles')
      }

      const delegation = {
        id: `delegation_${Date.now()}`,
        delegatorId,
        delegateeId,
        roleId,
        delegatedAt: Date.now(),
        expiresAt: options.expiresAt || Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 días
        isActive: true,
        conditions: options.conditions || {}
      }

      if (!this.delegations.has(delegatorId)) {
        this.delegations.set(delegatorId, [])
      }

      this.delegations.get(delegatorId).push(delegation)
      this.logAudit('role_delegated', delegatorId, { delegateeId, roleId, delegationId: delegation.id })

      return delegation
    } catch (error) {
      console.error('Error delegating role:', error)
      throw error
    }
  }

  /**
   * Registrar evento de auditoría
   * @param {string} action - Acción realizada
   * @param {string} userId - ID del usuario
   * @param {Object} details - Detalles del evento
   */
  logAudit(action, userId, details = {}) {
    try {
      const auditEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action,
        userId,
        details,
        timestamp: Date.now(),
        ip: details.ip || 'unknown',
        userAgent: details.userAgent || 'unknown'
      }

      this.auditLogs.push(auditEntry)

      // Mantener solo últimos 10,000 logs
      if (this.auditLogs.length > 10000) {
        this.auditLogs = this.auditLogs.slice(-10000)
      }
    } catch (error) {
      console.error('Error logging audit:', error)
    }
  }

  /**
   * Obtener logs de auditoría
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Array} Logs filtrados
   */
  getAuditLogs(filters = {}) {
    try {
      let logs = [...this.auditLogs]

      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId)
      }

      if (filters.action) {
        logs = logs.filter(log => log.action === filters.action)
      }

      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate)
      }

      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate)
      }

      // Ordenar por timestamp descendente
      logs.sort((a, b) => b.timestamp - a.timestamp)

      // Limitar resultados
      const limit = filters.limit || 100
      return logs.slice(0, limit)
    } catch (error) {
      console.error('Error getting audit logs:', error)
      return []
    }
  }

  /**
   * Obtener todos los roles
   * @returns {Array} Array de roles
   */
  getAllRoles() {
    try {
      return Array.from(this.roles.values())
    } catch (error) {
      console.error('Error getting all roles:', error)
      return []
    }
  }

  /**
   * Obtener todos los permisos
   * @returns {Array} Array de permisos
   */
  getAllPermissions() {
    try {
      return Array.from(this.permissions.values())
    } catch (error) {
      console.error('Error getting all permissions:', error)
      return []
    }
  }

  /**
   * Obtener estadísticas de RBAC
   * @returns {Object} Estadísticas
   */
  getStats() {
    try {
      const roleStats = {}
      this.roles.forEach((role, roleId) => {
        roleStats[roleId] = {
          name: role.name,
          userCount: 0,
          permissionCount: this.rolePermissions.get(roleId)?.length || 0
        }
      })

      this.userRoles.forEach((roleIds, userId) => {
        roleIds.forEach(roleId => {
          if (roleStats[roleId]) {
            roleStats[roleId].userCount++
          }
        })
      })

      return {
        totalRoles: this.roles.size,
        totalPermissions: this.permissions.size,
        totalUsers: this.userRoles.size,
        totalAuditLogs: this.auditLogs.length,
        totalDelegations: Array.from(this.delegations.values()).reduce((sum, delegations) => sum + delegations.length, 0),
        roleStats
      }
    } catch (error) {
      console.error('Error getting RBAC stats:', error)
      return {}
    }
  }
}

// Crear instancia singleton
const rbacService = new RBACService()

export default rbacService
