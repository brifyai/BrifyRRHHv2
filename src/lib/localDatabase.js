// Sistema de Base de Datos Local Independiente
// Soporta IndexedDB con fallback a localStorage

class LocalDatabase {
  constructor(dbName = 'brify_database', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
    this.isInitialized = false;
    this.useIndexedDB = this.checkIndexedDBSupport();
  }

  // Verificar si IndexedDB está disponible
  checkIndexedDBSupport() {
    try {
      return typeof window !== 'undefined' && 'indexedDB' in window;
    } catch (e) {
      return false;
    }
  }

  // Inicializar la base de datos
  async init() {
    if (this.isInitialized) return;

    try {
      if (this.useIndexedDB) {
        await this.initIndexedDB();
      } else {
        console.warn('IndexedDB no disponible, usando localStorage como respaldo');
        this.initLocalStorage();
      }
      this.isInitialized = true;
      console.log('Base de datos local inicializada correctamente');
    } catch (error) {
      console.error('Error inicializando base de datos local:', error);
      // Fallback a localStorage
      this.useIndexedDB = false;
      this.initLocalStorage();
      this.isInitialized = true;
    }
  }

  // Inicializar IndexedDB
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Error abriendo IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB abierta correctamente');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Crear stores para diferentes entidades
        const stores = [
          'companies',
          'employees',
          'users',
          'user_credentials',
          'user_tokens_usage',
          'employee_folders',
          'documentos_entrenador',
          'plans',
          'plan_extensiones',
          'google_calendar_subscriptions',
          'google_calendar_events',
          'microsoft365_subscriptions',
          'microsoft365_notifications',
          'communication_logs',
          'message_templates'
        ];

        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });

            // Crear índices comunes
            if (storeName === 'employees') {
              store.createIndex('company_id', 'company_id', { unique: false });
              store.createIndex('email', 'email', { unique: false });
            }

            if (storeName === 'users') {
              store.createIndex('email', 'email', { unique: true });
            }

            if (storeName === 'user_credentials') {
              store.createIndex('user_id', 'user_id', { unique: true });
            }

            if (storeName === 'employee_folders') {
              store.createIndex('employee_email', 'employee_email', { unique: true });
            }
          }
        });

        console.log('IndexedDB actualizada a versión', this.version);
      };
    });
  }

  // Inicializar localStorage como respaldo
  initLocalStorage() {
    // localStorage no necesita inicialización específica
    console.log('Usando localStorage como base de datos');
  }

  // Operaciones CRUD básicas

  // Crear registro
  async create(storeName, data) {
    await this.init();

    if (this.useIndexedDB) {
      return this.createIndexedDB(storeName, data);
    } else {
      return this.createLocalStorage(storeName, data);
    }
  }

  // Leer registro por ID
  async read(storeName, id) {
    await this.init();

    if (this.useIndexedDB) {
      return this.readIndexedDB(storeName, id);
    } else {
      return this.readLocalStorage(storeName, id);
    }
  }

  // Leer todos los registros
  async readAll(storeName, options = {}) {
    await this.init();

    if (this.useIndexedDB) {
      return this.readAllIndexedDB(storeName, options);
    } else {
      return this.readAllLocalStorage(storeName, options);
    }
  }

  // Actualizar registro
  async update(storeName, id, data) {
    await this.init();

    if (this.useIndexedDB) {
      return this.updateIndexedDB(storeName, id, data);
    } else {
      return this.updateLocalStorage(storeName, id, data);
    }
  }

  // Eliminar registro
  async delete(storeName, id) {
    await this.init();

    if (this.useIndexedDB) {
      return this.deleteIndexedDB(storeName, id);
    } else {
      return this.deleteLocalStorage(storeName, id);
    }
  }

  // Buscar registros con filtros
  async find(storeName, filters = {}) {
    await this.init();

    if (this.useIndexedDB) {
      return this.findIndexedDB(storeName, filters);
    } else {
      return this.findLocalStorage(storeName, filters);
    }
  }

  // Operaciones IndexedDB

  async createIndexedDB(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  async readIndexedDB(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async readAllIndexedDB(storeName, options = {}) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result;

        // Aplicar filtros básicos si se proporcionan
        if (options.filter) {
          results = results.filter(options.filter);
        }

        // Aplicar límite si se proporciona
        if (options.limit) {
          results = results.slice(0, options.limit);
        }

        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateIndexedDB(storeName, id, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      // Primero verificar si existe
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        if (getRequest.result) {
          const updatedData = { ...getRequest.result, ...data };
          const putRequest = store.put(updatedData);

          putRequest.onsuccess = () => resolve(updatedData);
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Registro no encontrado'));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteIndexedDB(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async findIndexedDB(storeName, filters = {}) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result;

        // Aplicar filtros
        Object.keys(filters).forEach(key => {
          if (filters[key] !== undefined) {
            results = results.filter(item => item[key] === filters[key]);
          }
        });

        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Operaciones localStorage

  createLocalStorage(storeName, data) {
    const key = `brify_${storeName}`;
    const existing = this.getLocalStorageData(key);
    existing.push(data);
    localStorage.setItem(key, JSON.stringify(existing));
    return data;
  }

  readLocalStorage(storeName, id) {
    const key = `brify_${storeName}`;
    const data = this.getLocalStorageData(key);
    return data.find(item => item.id === id) || null;
  }

  readAllLocalStorage(storeName, options = {}) {
    const key = `brify_${storeName}`;
    let data = this.getLocalStorageData(key);

    // Aplicar filtros
    if (options.filter) {
      data = data.filter(options.filter);
    }

    // Aplicar límite
    if (options.limit) {
      data = data.slice(0, options.limit);
    }

    return data;
  }

  updateLocalStorage(storeName, id, newData) {
    const key = `brify_${storeName}`;
    const data = this.getLocalStorageData(key);
    const index = data.findIndex(item => item.id === id);

    if (index !== -1) {
      data[index] = { ...data[index], ...newData };
      localStorage.setItem(key, JSON.stringify(data));
      return data[index];
    }

    throw new Error('Registro no encontrado');
  }

  deleteLocalStorage(storeName, id) {
    const key = `brify_${storeName}`;
    const data = this.getLocalStorageData(key);
    const filtered = data.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
    return true;
  }

  findLocalStorage(storeName, filters = {}) {
    const key = `brify_${storeName}`;
    let data = this.getLocalStorageData(key);

    // Aplicar filtros
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        data = data.filter(item => item[key] === filters[key]);
      }
    });

    return data;
  }

  getLocalStorageData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error leyendo localStorage:', error);
      return [];
    }
  }

  // Utilidades

  // Limpiar toda la base de datos
  async clear() {
    if (this.useIndexedDB && this.db) {
      const stores = Array.from(this.db.objectStoreNames);
      const transaction = this.db.transaction(stores, 'readwrite');

      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        store.clear();
      });

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } else {
      // Limpiar localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('brify_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  // Obtener estadísticas
  async getStats() {
    await this.init();

    const stats = {
      provider: this.useIndexedDB ? 'IndexedDB' : 'localStorage',
      stores: []
    };

    if (this.useIndexedDB && this.db) {
      const stores = Array.from(this.db.objectStoreNames);
      for (const storeName of stores) {
        const count = await this.getStoreCount(storeName);
        stats.stores.push({ name: storeName, count });
      }
    } else {
      // Contar elementos en localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('brify_')) {
          const storeName = key.replace('brify_', '');
          const data = this.getLocalStorageData(key);
          stats.stores.push({ name: storeName, count: data.length });
        }
      });
    }

    return stats;
  }

  async getStoreCount(storeName) {
    if (this.useIndexedDB) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } else {
      const key = `brify_${storeName}`;
      const data = this.getLocalStorageData(key);
      return data.length;
    }
  }

  // Exportar datos
  async exportData() {
    const stats = await this.getStats();
    const data = {};

    for (const store of stats.stores) {
      data[store.name] = await this.readAll(store.name);
    }

    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        provider: stats.provider,
        version: this.version
      },
      data
    };
  }

  // Importar datos
  async importData(backupData) {
    if (!backupData.data) {
      throw new Error('Datos de respaldo inválidos');
    }

    for (const [storeName, records] of Object.entries(backupData.data)) {
      for (const record of records) {
        try {
          await this.create(storeName, record);
        } catch (error) {
          console.warn(`Error importando registro en ${storeName}:`, error);
        }
      }
    }

    console.log('Datos importados correctamente');
  }
}

// Crear instancia singleton
const localDatabase = new LocalDatabase();

export default localDatabase;