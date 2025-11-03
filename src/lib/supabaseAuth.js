import { supabase } from './supabaseClient.js'

// Funciones de autenticación
export const auth = {
  // Registro de usuario
  signUp: async (email, password, userData = {}) => {
    try {
      if (!email || !password) {
        throw new Error('Email y password son requeridos');
      }
      if (!email.includes('@')) {
        throw new Error('Email inválido');
      }
      if (password.length < 6) {
        throw new Error('Password debe tener al menos 6 caracteres');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      return { data, error }
    } catch (error) {
      console.error('Error en signUp:', error);
      return { data: null, error: { message: error.message } }
    }
  },

  // Inicio de sesión
  signIn: async (email, password) => {
    try {
      if (!email || !password) {
        throw new Error('Email y password son requeridos');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { data, error }
    } catch (error) {
      console.error('Error en signIn:', error);
      return { data: null, error: { message: error.message } }
    }
  },

  // Cerrar sesión
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('Error en signOut:', error);
      return { error: { message: error.message } }
    }
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    try {
      return await supabase.auth.getUser()
    } catch (error) {
      console.error('Error en getCurrentUser:', error);
      return { data: { user: null }, error: { message: error.message } }
    }
  },

  // Obtener sesión actual
  getSession: async () => {
    try {
      return await supabase.auth.getSession()
    } catch (error) {
      console.error('Error en getSession:', error);
      return { data: { session: null }, error: { message: error.message } }
    }
  },

  // Escuchar cambios de autenticación
  onAuthStateChange: (callback) => {
    try {
      if (typeof callback !== 'function') {
        throw new Error('Callback debe ser una función');
      }
      return supabase.auth.onAuthStateChange(callback)
    } catch (error) {
      console.error('Error en onAuthStateChange:', error);
      return { data: null, error: { message: error.message } }
    }
  },

  // Recuperación de contraseña
  resetPasswordForEmail: async (email, options = {}) => {
    try {
      if (!email || !email.includes('@')) {
        throw new Error('Email inválido');
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, options)
      return { data, error }
    } catch (error) {
      console.error('Error en resetPasswordForEmail:', error);
      return { data: null, error: { message: error.message } }
    }
  },

  // Actualizar contraseña
  updatePassword: async (password) => {
    try {
      if (!password || password.length < 6) {
        throw new Error('Password debe tener al menos 6 caracteres');
      }

      const { data, error } = await supabase.auth.updateUser({ password })
      return { data, error }
    } catch (error) {
      console.error('Error en updatePassword:', error);
      return { data: null, error: { message: error.message } }
    }
  },

  // Actualizar perfil de usuario
  updateUserProfile: async (userData) => {
    try {
      if (!userData || typeof userData !== 'object') {
        throw new Error('UserData debe ser un objeto');
      }

      const { data, error } = await supabase.auth.updateUser(userData)
      return { data, error }
    } catch (error) {
      console.error('Error en updateUserProfile:', error);
      return { data: null, error: { message: error.message } }
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: async () => {
    try {
      const { data: { session } } = await auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Error en isAuthenticated:', error);
      return false;
    }
  },

  // Obtener ID del usuario actual
  getCurrentUserId: async () => {
    try {
      const { data: { user } } = await auth.getCurrentUser();
      return user?.id || null;
    } catch (error) {
      console.error('Error en getCurrentUserId:', error);
      return null;
    }
  }
}

export default auth;