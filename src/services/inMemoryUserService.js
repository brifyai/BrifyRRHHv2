import { v4 as uuidv4 } from 'uuid';

class InMemoryUserService {
  // Datos en memoria para usuarios con roles y permisos
  roles = [
    {
      id: 'role-super-admin',
      name: 'super_admin',
      name_es: 'Super Administrador',
      description: 'Acceso completo a todas las funciones del sistema',
      hierarchy_level: 100
    },
    {
      id: 'role-director',
      name: 'director',
      name_es: 'Director',
      description: 'Acceso administrativo con algunas restricciones',
      hierarchy_level: 80
    },
    {
      id: 'role-executive',
      name: 'executive',
      name_es: 'Ejecutivo',
      description: 'Acceso operativo avanzado',
      hierarchy_level: 60
    },
    {
      id: 'role-redactor',
      name: 'redactor',
      name_es: 'Redactor',
      description: 'Acceso limitado a funciones de contenido',
      hierarchy_level: 40
    }
  ];

  permissions = [
    // Dashboard
    { id: 'perm-dashboard-view', name: 'dashboard.view', name_es: 'Ver Dashboard', category: 'dashboard' },
    { id: 'perm-dashboard-edit', name: 'dashboard.edit', name_es: 'Editar Dashboard', category: 'dashboard' },

    // Comunicación
    { id: 'perm-comm-view', name: 'communication.view', name_es: 'Ver Comunicación', category: 'communication' },
    { id: 'perm-comm-send', name: 'communication.send', name_es: 'Enviar Mensajes', category: 'communication' },
    { id: 'perm-comm-templates', name: 'communication.templates', name_es: 'Gestionar Plantillas', category: 'communication' },
    { id: 'perm-comm-reports', name: 'communication.reports', name_es: 'Ver Reportes', category: 'communication' },
    { id: 'perm-comm-bulk', name: 'communication.bulk_upload', name_es: 'Carga Masiva', category: 'communication' },

    // Archivos
    { id: 'perm-files-view', name: 'files.view', name_es: 'Ver Archivos', category: 'files' },
    { id: 'perm-files-upload', name: 'files.upload', name_es: 'Subir Archivos', category: 'files' },
    { id: 'perm-files-download', name: 'files.download', name_es: 'Descargar Archivos', category: 'files' },
    { id: 'perm-files-delete', name: 'files.delete', name_es: 'Eliminar Archivos', category: 'files' },

    // Google Drive
    { id: 'perm-drive-view', name: 'drive.view', name_es: 'Ver Google Drive', category: 'drive' },
    { id: 'perm-drive-connect', name: 'drive.connect', name_es: 'Conectar Google Drive', category: 'drive' },
    { id: 'perm-drive-sync', name: 'drive.sync', name_es: 'Sincronizar Drive', category: 'drive' },

    // Planes
    { id: 'perm-plans-view', name: 'plans.view', name_es: 'Ver Planes', category: 'plans' },
    { id: 'perm-plans-upgrade', name: 'plans.upgrade', name_es: 'Actualizar Plan', category: 'plans' },
    { id: 'perm-plans-billing', name: 'plans.billing', name_es: 'Ver Facturación', category: 'plans' },

    // Configuración
    { id: 'perm-settings-view', name: 'settings.view', name_es: 'Ver Configuración', category: 'settings' },
    { id: 'perm-settings-companies', name: 'settings.companies', name_es: 'Gestionar Empresas', category: 'settings' },
    { id: 'perm-settings-users', name: 'settings.users', name_es: 'Gestionar Usuarios', category: 'settings' },
    { id: 'perm-settings-system', name: 'settings.system', name_es: 'Configuración Sistema', category: 'settings' },

    // Perfil
    { id: 'perm-profile-view', name: 'profile.view', name_es: 'Ver Perfil', category: 'profile' },
    { id: 'perm-profile-edit', name: 'profile.edit', name_es: 'Editar Perfil', category: 'profile' },

    // Búsqueda e IA
    { id: 'perm-search-view', name: 'search.view', name_es: 'Ver Búsqueda', category: 'search' },
    { id: 'perm-search-ai', name: 'search.ai', name_es: 'Usar IA', category: 'search' },

    // Legal
    { id: 'perm-legal-view', name: 'legal.view', name_es: 'Ver Legal', category: 'legal' },
    { id: 'perm-legal-consult', name: 'legal.consult', name_es: 'Consultar Legal', category: 'legal' }
  ];

  // Relación rol-permisos
  rolePermissions = [
    // Super Admin: Todos los permisos
    ...this.permissions.map(p => ({ role_id: 'role-super-admin', permission_id: p.id })),

    // Director: La mayoría menos configuración avanzada
    ...this.permissions
      .filter(p => !['perm-settings-system', 'perm-plans-billing'].includes(p.id))
      .map(p => ({ role_id: 'role-director', permission_id: p.id })),

    // Ejecutivo: Permisos operativos principales
    ...this.permissions
      .filter(p => ['dashboard', 'communication', 'files', 'drive', 'plans', 'profile', 'search'].includes(p.category))
      .filter(p => !['perm-comm-bulk', 'perm-settings-users', 'perm-settings-system'].includes(p.id))
      .map(p => ({ role_id: 'role-executive', permission_id: p.id })),

    // Redactor: Permisos limitados
    ...this.permissions
      .filter(p => [
        'perm-dashboard-view', 'perm-comm-view', 'perm-comm-templates',
        'perm-files-view', 'perm-files-upload', 'perm-profile-view',
        'perm-profile-edit', 'perm-search-view'
      ].includes(p.id))
      .map(p => ({ role_id: 'role-redactor', permission_id: p.id }))
  ];

  // Usuarios del sistema
  users = [
    {
      id: 'user-admin',
      email: 'admin@empresa.cl',
      full_name: 'Administrador Sistema',
      role_id: 'role-super-admin',
      is_active: true,
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      permissions: [] // Se calcula dinámicamente
    },
    {
      id: 'user-director-1',
      email: 'director@empresa.cl',
      full_name: 'María González',
      role_id: 'role-director',
      is_active: true,
      last_login: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
      created_at: new Date(Date.now() - 604800000).toISOString(), // 1 semana atrás
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      permissions: []
    },
    {
      id: 'user-executive-1',
      email: 'ejecutivo@empresa.cl',
      full_name: 'Carlos Rodríguez',
      role_id: 'role-executive',
      is_active: true,
      last_login: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
      created_at: new Date(Date.now() - 259200000).toISOString(), // 3 días atrás
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      permissions: []
    },
    {
      id: 'user-redactor-1',
      email: 'redactor@empresa.cl',
      full_name: 'Ana López',
      role_id: 'role-redactor',
      is_active: true,
      last_login: new Date(Date.now() - 7200000).toISOString(), // 2 horas atrás
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
      updated_at: new Date(Date.now() - 7200000).toISOString(),
      permissions: []
    }
  ];

  constructor() {
    // Calcular permisos para cada usuario basado en su rol
    this.users = this.users.map(user => ({
      ...user,
      permissions: this.getUserPermissions(user.id)
    }));
  }

  // Obtener todos los roles
  async getRoles() {
    return [...this.roles];
  }

  // Obtener rol por ID
  async getRoleById(roleId) {
    return this.roles.find(role => role.id === roleId);
  }

  // Obtener todos los permisos
  async getPermissions() {
    return [...this.permissions];
  }

  // Obtener permisos por categoría
  async getPermissionsByCategory() {
    const categories = {};
    this.permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  }

  // Obtener permisos de un rol
  async getRolePermissions(roleId) {
    const rolePerms = this.rolePermissions
      .filter(rp => rp.role_id === roleId)
      .map(rp => this.permissions.find(p => p.id === rp.permission_id))
      .filter(Boolean);

    return rolePerms;
  }

  // Obtener permisos de un usuario
  getUserPermissions(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return [];

    return this.getRolePermissionsSync(user.role_id);
  }

  // Versión síncrona para uso interno
  getRolePermissionsSync(roleId) {
    return this.rolePermissions
      .filter(rp => rp.role_id === roleId)
      .map(rp => this.permissions.find(p => p.id === rp.permission_id))
      .filter(Boolean);
  }

  // Obtener todos los usuarios
  async getUsers() {
    return [...this.users].map(user => ({
      ...user,
      role: this.roles.find(r => r.id === user.role_id),
      permissions: this.getUserPermissions(user.id)
    }));
  }

  // Obtener usuario por ID
  async getUserById(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;

    return {
      ...user,
      role: this.roles.find(r => r.id === user.role_id),
      permissions: this.getUserPermissions(user.id)
    };
  }

  // Crear nuevo usuario
  async createUser(userData) {
    const newUser = {
      id: uuidv4(),
      email: userData.email,
      full_name: userData.full_name,
      role_id: userData.role_id,
      is_active: userData.is_active !== false,
      last_login: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      permissions: this.getRolePermissionsSync(userData.role_id)
    };

    this.users.push(newUser);
    return { ...newUser, role: this.roles.find(r => r.id === newUser.role_id) };
  }

  // Actualizar usuario
  async updateUser(userId, userData) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('Usuario no encontrado');

    const updatedUser = {
      ...this.users[userIndex],
      ...userData,
      updated_at: new Date().toISOString(),
      permissions: userData.role_id ?
        this.getRolePermissionsSync(userData.role_id) :
        this.users[userIndex].permissions
    };

    this.users[userIndex] = updatedUser;
    return { ...updatedUser, role: this.roles.find(r => r.id === updatedUser.role_id) };
  }

  // Eliminar usuario
  async deleteUser(userId) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('Usuario no encontrado');

    this.users.splice(userIndex, 1);
    return true;
  }

  // Cambiar estado activo/inactivo
  async toggleUserStatus(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) throw new Error('Usuario no encontrado');

    user.is_active = !user.is_active;
    user.updated_at = new Date().toISOString();

    return user;
  }

  // Verificar si un usuario tiene un permiso específico
  async userHasPermission(userId, permissionName) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;

    const userPermissions = this.getUserPermissions(user.id);
    return userPermissions.some(p => p.name === permissionName);
  }

  // Obtener usuarios por rol
  async getUsersByRole(roleId) {
    return this.users
      .filter(u => u.role_id === roleId)
      .map(user => ({
        ...user,
        role: this.roles.find(r => r.id === user.role_id),
        permissions: this.getUserPermissions(user.id)
      }));
  }

  // Buscar usuarios
  async searchUsers(query) {
    const lowercaseQuery = query.toLowerCase();
    return this.users
      .filter(user =>
        user.email.toLowerCase().includes(lowercaseQuery) ||
        user.full_name.toLowerCase().includes(lowercaseQuery)
      )
      .map(user => ({
        ...user,
        role: this.roles.find(r => r.id === user.role_id),
        permissions: this.getUserPermissions(user.id)
      }));
  }
}

const inMemoryUserService = new InMemoryUserService();
export default inMemoryUserService;