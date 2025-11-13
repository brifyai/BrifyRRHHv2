/**
 * RBAC Utilities
 * Utilidades para Control de Acceso Basado en Roles
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

import rbacService from '../lib/rbacService.js'

/**
 * Verificar si usuario tiene permiso
 * @param {string} userId - ID del usuario
 * @param {string} permissionId - ID del permiso
 * @returns {boolean} True si tiene permiso
 */
export const hasPermission = (userId, permissionId) => {
  try {
    return rbacService.hasPermission(userId, permissionId)
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

/**
 * Verificar si usuario tiene rol específico
 * @param {string} userId - ID del usuario
 * @param {string} roleId - ID del rol
 * @returns {boolean} True si tiene el rol
 */
export const hasRole = (userId, roleId) => {
  try {
    const userRoles = rbacService.getUserRoles(userId)
    return userRoles.some(role => role.id === roleId)
  } catch (error) {
    console.error('Error checking role:', error)
    return false
  }
}

/**
 * Verificar si usuario tiene al menos uno de los roles
 * @param {string} userId - ID del usuario
 * @param {Array} roleIds - Array de IDs de roles
 * @returns {boolean} True si tiene al menos un rol
 */
export const hasAnyRole = (userId, roleIds) => {
  try {
    const userRoles = rbacService.getUserRoles(userId)
    const userRoleIds = userRoles.map(role => role.id)
    return roleIds.some(roleId => userRoleIds.includes(roleId))
  } catch (error) {
    console.error('Error checking any role:', error)
    return false
  }
}

/**
 * Verificar si usuario tiene todos los roles
 * @param {string} userId - ID del usuario
 * @param {Array} roleIds - Array de IDs de roles
 * @returns {boolean} True si tiene todos los roles
 */
export const hasAllRoles = (userId, roleIds) => {
  try {
    const userRoles = rbacService.getUserRoles(userId)
    const userRoleIds = userRoles.map(role => role.id)
    return roleIds.every(roleId => userRoleIds.includes(roleId))
  } catch (error) {
    console.error('Error checking all roles:', error)
    return false
  }
}

/**
 * Obtener todos los permisos de usuario
 * @param {string} userId - ID del usuario
 * @returns {Array} Array de permisos
 */
export const getUserPermissions = (userId) => {
  try {
    return rbacService.getUserPermissions(userId)
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
export const getUserRoles = (userId) => {
  try {
    return rbacService.getUserRoles(userId)
  } catch (error) {
    console.error('Error getting user roles:', error)
    return []
  }
}

/**
 * Obtener nivel máximo de usuario
 * @param {string} userId - ID del usuario
 * @returns {number} Nivel máximo
 */
export const getUserMaxLevel = (userId) => {
  try {
    const userRoles = rbacService.getUserRoles(userId)
    if (userRoles.length === 0) return 0
    return Math.max(...userRoles.map(role => role.level))
  } catch (error) {
    console.error('Error getting user max level:', error)
    return 0
  }
}

/**
 * Asignar rol a usuario
 * @param {string} userId - ID del usuario
 * @param {string} roleId - ID del rol
 * @param {string} assignedBy - Usuario que asigna
 * @returns {boolean} True si se asignó
 */
export const assignRole = (userId, roleId, assignedBy) => {
  try {
    return rbacService.assignRole(userId, roleId, assignedBy)
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
export const revokeRole = (userId, roleId, revokedBy) => {
  try {
    return rbacService.revokeRole(userId, roleId, revokedBy)
  } catch (error) {
    console.error('Error revoking role:', error)
    throw error
  }
}

/**
 * Crear nuevo rol
 * @param {Object} roleData - Datos del rol
 * @returns {Object} Rol creado
 */
export const createRole = (roleData) => {
  try {
    return rbacService.createRole(roleData)
  } catch (error) {
    console.error('Error creating role:', error)
    throw error
  }
}

/**
 * Actualizar rol existente
 * @param {string} roleId - ID del rol
 * @param {Object} updates - Datos a actualizar
 * @returns {Object} Rol actualizado
 */
export const updateRole = (roleId, updates) => {
  try {
    return rbacService.updateRole(roleId, updates)
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
export const deleteRole = (roleId, deletedBy) => {
  try {
    return rbacService.deleteRole(roleId, deletedBy)
  } catch (error) {
    console.error('Error deleting role:', error)
    throw error
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
export const delegateRole = (delegatorId, delegateeId, roleId, options = {}) => {
  try {
    return rbacService.delegateRole(delegatorId, delegateeId, roleId, options)
  } catch (error) {
    console.error('Error delegating role:', error)
    throw error
  }
}

/**
 * Obtener logs de auditoría
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Array} Logs filtrados
 */
export const getAuditLogs = (filters = {}) => {
  try {
    return rbacService.getAuditLogs(filters)
  } catch (error) {
    console.error('Error getting audit logs:', error)
    return []
  }
}

/**
 * Obtener todos los roles
 * @returns {Array} Array de roles
 */
export const getAllRoles = () => {
  try {
    return rbacService.getAllRoles()
  } catch (error) {
    console.error('Error getting all roles:', error)
    return []
  }
}

/**
 * Obtener todos los permisos
 * @returns {Array} Array de permisos
 */
export const getAllPermissions = () => {
  try {
    return rbacService.getAllPermissions()
  } catch (error) {
    console.error('Error getting all permissions:', error)
    return []
  }
}

/**
 * Obtener permisos por categoría
 * @param {string} category - Categoría de permisos
 * @returns {Array} Array de permisos filtrados
 */
export const getPermissionsByCategory = (category) => {
  try {
    const allPermissions = rbacService.getAllPermissions()
    return allPermissions.filter(perm => perm.category === category)
  } catch (error) {
    console.error('Error getting permissions by category:', error)
    return []
  }
}

/**
 * Obtener estadísticas de RBAC
 * @returns {Object} Estadísticas
 */
export const getRBACStats = () => {
  try {
    return rbacService.getStats()
  } catch (error) {
    console.error('Error getting RBAC stats:', error)
    return {}
  }
}

/**
 * Verificar si usuario puede acceder a recurso específico
 * @param {string} userId - ID del usuario
 * @param {string} resource - Recurso a acceder
 * @param {string} action - Acción a realizar
 * @returns {boolean} True si puede acceder
 */
export const canAccess = (userId, resource, action) => {
  try {
    const permissionId = `${resource}.${action}`
    return rbacService.hasPermission(userId, permissionId)
  } catch (error) {
    console.error('Error checking access:', error)
    return false
  }
}

/**
 * Middleware para verificar permisos
 * @param {string} permissionId - ID del permiso requerido
 * @returns {Function} Middleware
 */
export const requirePermission = (permissionId) => {
  return (userId) => {
    return hasPermission(userId, permissionId)
  }
}

/**
 * Middleware para verificar rol
 * @param {string} roleId - ID del rol requerido
 * @returns {Function} Middleware
 */
export const requireRole = (roleId) => {
  return (userId) => {
    return hasRole(userId, roleId)
  }
}

/**
 * Middleware para verificar nivel mínimo
 * @param {number} minLevel - Nivel mínimo requerido
 * @returns {Function} Middleware
 */
export const requireLevel = (minLevel) => {
  return (userId) => {
    return getUserMaxLevel(userId) >= minLevel
  }
}

/**
 * Obtener información de acceso para UI
 * @param {string} userId - ID del usuario
 * @returns {Object} Información formateada
 */
export const getAccessInfo = (userId) => {
  try {
    const userRoles = getUserRoles(userId)
    const userPermissions = getUserPermissions(userId)
    const maxLevel = getUserMaxLevel(userId)

    return {
      userId,
      roles: userRoles.map(role => ({
        id: role.id,
        name: role.name,
        level: role.level
      })),
      permissions: userPermissions.map(perm => ({
        id: perm.id,
        name: perm.name,
        category: perm.category
      })),
      maxLevel,
      canCreate: hasPermission(userId, 'user.create'),
      canRead: hasPermission(userId, 'user.read'),
      canUpdate: hasPermission(userId, 'user.update'),
      canDelete: hasPermission(userId, 'user.delete'),
      isAdmin: hasRole(userId, 'admin'),
      isManager: hasRole(userId, 'manager'),
      isUser: hasRole(userId, 'user'),
      isViewer: hasRole(userId, 'viewer')
    }
  } catch (error) {
    console.error('Error getting access info:', error)
    return {
      userId,
      roles: [],
      permissions: [],
      maxLevel: 0,
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      isAdmin: false,
      isManager: false,
      isUser: false,
      isViewer: false
    }
  }
}

/**
 * Filtrar recursos por permisos de usuario
 * @param {Array} resources - Array de recursos
 * @param {string} userId - ID del usuario
 * @param {string} action - Acción a verificar
 * @returns {Array} Recursos filtrados
 */
export const filterByPermission = (resources, userId, action = 'read') => {
  try {
    return resources.filter(resource => {
      const permissionId = `${resource.type}.${action}`
      return hasPermission(userId, permissionId)
    })
  } catch (error) {
    console.error('Error filtering by permission:', error)
    return []
  }
}

/**
 * Configurar RBAC para usuario inicial
 * @param {string} userId - ID del usuario
 * @param {string} initialRole - Rol inicial
 * @param {string} assignedBy - Usuario que asigna
 * @returns {boolean} True si se configuró
 */
export const setupInitialRBAC = (userId, initialRole = 'user', assignedBy = 'system') => {
  try {
    return assignRole(userId, initialRole, assignedBy)
  } catch (error) {
    console.error('Error setting up initial RBAC:', error)
    throw error
  }
}

/**
 * Promover usuario a rol superior
 * @param {string} userId - ID del usuario
 * @param {string} newRole - Nuevo rol
 * @param {string} promotedBy - Usuario que promueve
 * @returns {boolean} True si se promovió
 */
export const promoteUser = (userId, newRole, promotedBy) => {
  try {
    const currentLevel = getUserMaxLevel(userId)
    const newRoleData = getAllRoles().find(role => role.id === newRole)
    
    if (!newRoleData) {
      throw new Error('Role not found')
    }

    if (newRoleData.level <= currentLevel) {
      throw new Error('New role must be higher level')
    }

    return assignRole(userId, newRole, promotedBy)
  } catch (error) {
    console.error('Error promoting user:', error)
    throw error
  }
}

/**
 * Degradar usuario a rol inferior
 * @param {string} userId - ID del usuario
 * @param {string} newRole - Nuevo rol
 * @param {string} degradedBy - Usuario que degrada
 * @returns {boolean} True si se degradó
 */
export const demoteUser = (userId, newRole, degradedBy) => {
  try {
    const currentLevel = getUserMaxLevel(userId)
    const newRoleData = getAllRoles().find(role => role.id === newRole)
    
    if (!newRoleData) {
      throw new Error('Role not found')
    }

    if (newRoleData.level >= currentLevel) {
      throw new Error('New role must be lower level')
    }

    // Revocar roles superiores
    const userRoles = getUserRoles(userId)
    userRoles.forEach(role => {
      if (role.level > newRoleData.level) {
        revokeRole(userId, role.id, degradedBy)
      }
    })

    return assignRole(userId, newRole, degradedBy)
  } catch (error) {
    console.error('Error demoting user:', error)
    throw error
  }
}

export default {
  hasPermission,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  getUserPermissions,
  getUserRoles,
  getUserMaxLevel,
  assignRole,
  revokeRole,
  createRole,
  updateRole,
  deleteRole,
  delegateRole,
  getAuditLogs,
  getAllRoles,
  getAllPermissions,
  getPermissionsByCategory,
  getRBACStats,
  canAccess,
  requirePermission,
  requireRole,
  requireLevel,
  getAccessInfo,
  filterByPermission,
  setupInitialRBAC,
  promoteUser,
  demoteUser
}
