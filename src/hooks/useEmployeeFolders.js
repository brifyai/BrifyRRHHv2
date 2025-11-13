import { useState, useEffect, useCallback } from 'react';
import employeeFolderService from '../services/employeeFolderService.js';
import organizedDatabaseService from '../services/organizedDatabaseService.js';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

/**
 * Hook personalizado para gestionar la lógica de carpetas de empleados
 * Extrae la complejidad del componente EmployeeFolders
 */
export const useEmployeeFolders = (companyId) => {
  // Estado principal
  const [employees, setEmployees] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFolders, setLoadingFolders] = useState(false);
  
  // Estado de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    companyId: '',
    department: '',
    level: '',
    workMode: '',
    contractType: ''
  });
  
  // Estado de selección
  const [selectedFolders, setSelectedFolders] = useState(new Set());
  const [selectedFolder, setSelectedFolder] = useState(null);
  
  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  
  // Estado de filtros únicos
  const [companies, setCompanies] = useState([]);
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueLevels, setUniqueLevels] = useState([]);
  const [uniqueWorkModes, setUniqueWorkModes] = useState([]);
  const [uniqueContractTypes, setUniqueContractTypes] = useState([]);

  // Cargar empleados
  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🚀 Iniciando carga de empleados...');
      
      // Cargar empresas
      const companyData = await organizedDatabaseService.getCompanies();
      setCompanies(companyData);
      
      // Obtener empleados con filtros
      let employeesData = [];
      if (companyId) {
        employeesData = await organizedDatabaseService.getEmployees({ companyId });
      } else {
        employeesData = await organizedDatabaseService.getEmployees(filters);
      }

      console.log(`📊 Cargados ${employeesData.length} empleados`);
      setEmployees(employeesData);
      setTotalItems(employeesData.filter(emp => emp.email).length);

      // Extraer valores únicos para filtros
      extractUniqueFilters(employeesData);
      
    } catch (error) {
      console.error('❌ Error cargando empleados:', error);
      MySwal.fire({
        title: 'Error',
        text: 'Hubo un problema al cargar los empleados',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#0693e3'
      });
    } finally {
      setLoading(false);
      console.log('🏁 Carga de empleados completada');
    }
  }, [companyId, filters]);

  // Cargar carpetas para página actual
  const loadFoldersForPage = useCallback(async () => {
    try {
      setLoadingFolders(true);
      console.log(`📁 Cargando carpetas para página ${currentPage}...`);
      
      // Filtrar empleados con email y aplicar paginación
      const employeesWithEmail = employees.filter(emp => emp.email);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const employeesForPage = employeesWithEmail.slice(startIndex, endIndex);
      
      console.log(`📄 Procesando ${employeesForPage.length} empleados de ${employeesWithEmail.length} totales`);

      // Procesar carpetas en paralelo
      const folderPromises = employeesForPage.map(async (employee) => {
        try {
          const folder = await employeeFolderService.getEmployeeFolder(employee.email);
          return {
            ...folder,
            employeeName: employee.name,
            employeePosition: employee.position,
            employeeDepartment: employee.department,
            employeePhone: employee.phone,
            employeeRegion: employee.region,
            employeeLevel: employee.level,
            employeeWorkMode: employee.work_mode,
            employeeContractType: employee.contract_type,
            companyName: employee.company?.name || 'Empresa no especificada'
          };
        } catch (error) {
          console.warn(`⚠️ Error cargando carpeta para ${employee.email}, creando carpeta básica:`, error.message);
          return createBasicFolder(employee);
        }
      });

      const foldersData = await Promise.all(folderPromises);
      console.log(`✅ Procesadas ${foldersData.length} carpetas para página ${currentPage}`);
      
      // Actualizar folders
      setFolders(prevFolders => {
        if (currentPage === 1) {
          return foldersData;
        } else {
          const existingFolders = prevFolders.slice(0, startIndex);
          return [...existingFolders, ...foldersData];
        }
      });
      
    } catch (error) {
      console.error('❌ Error cargando carpetas:', error);
      MySwal.fire({
        title: 'Error',
        text: 'Hubo un problema al cargar las carpetas',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#0693e3'
      });
    } finally {
      setLoadingFolders(false);
      console.log('🏁 Carga de carpetas completada');
    }
  }, [currentPage, employees, itemsPerPage]);

  // Crear carpeta básica
  const createBasicFolder = (employee) => ({
    email: employee.email,
    employeeName: employee.name,
    employeePosition: employee.position,
    employeeDepartment: employee.department,
    employeePhone: employee.phone,
    employeeRegion: employee.region,
    employeeLevel: employee.level,
    employeeWorkMode: employee.work_mode,
    employeeContractType: employee.contract_type,
    companyName: employee.company?.name || 'Empresa no especificada',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    knowledgeBase: {
      faqs: [],
      documents: [],
      policies: [],
      procedures: []
    },
    conversationHistory: [],
    settings: {
      notificationPreferences: {
        whatsapp: true,
        telegram: true,
        email: true
      },
      responseLanguage: 'es',
      timezone: 'America/Santiago'
    }
  });

  // Extraer filtros únicos
  const extractUniqueFilters = (employeesData) => {
    const departments = [...new Set(employeesData.map(emp => emp.department).filter(Boolean))];
    const levels = [...new Set(employeesData.map(emp => emp.level).filter(Boolean))];
    const workModes = [...new Set(employeesData.map(emp => emp.work_mode).filter(Boolean))];
    const contractTypes = [...new Set(employeesData.map(emp => emp.contract_type).filter(Boolean))];
    
    setUniqueDepartments(departments.sort());
    setUniqueLevels(levels.sort());
    setUniqueWorkModes(workModes.sort());
    setUniqueContractTypes(contractTypes.sort());
  };

  // Manejar cambios en filtros
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  // Manejar búsqueda
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Obtener empleados filtrados
  const getFilteredEmployees = useCallback(() => {
    return employees.filter(employee => {
      if (!employee.email) return false;
      
      const matchesSearch = !searchTerm ||
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.company?.name && employee.company.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  }, [employees, searchTerm]);

  // Obtener carpetas filtradas
  const getFilteredFolders = useCallback(() => {
    const filteredEmployees = getFilteredEmployees();
    return folders.filter(folder => {
      return filteredEmployees.some(emp => emp.email === folder.email);
    });
  }, [folders, getFilteredEmployees]);

  // Manejar selección de carpetas
  const handleSelectFolder = useCallback((employeeEmail) => {
    setSelectedFolders(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(employeeEmail)) {
        newSelected.delete(employeeEmail);
      } else {
        newSelected.add(employeeEmail);
      }
      return newSelected;
    });
  }, []);

  // Seleccionar todas las carpetas
  const handleSelectAll = useCallback(() => {
    const filteredFolders = getFilteredFolders();
    if (selectedFolders.size === filteredFolders.length) {
      setSelectedFolders(new Set());
    } else {
      const allEmails = new Set(filteredFolders.map(folder => folder.email));
      setSelectedFolders(allEmails);
    }
  }, [selectedFolders.size, getFilteredFolders]);

  // Manejar cambio de página
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    setFolders([]); // Limpiar carpetas al cambiar de página
  }, []);

  // Ver carpeta individual
  const handleViewFolder = useCallback(async (employeeEmail) => {
    try {
      const folder = await employeeFolderService.getEmployeeFolder(employeeEmail);
      setSelectedFolder(folder);
      setSelectedFolders(new Set());
    } catch (error) {
      console.error('Error cargando carpeta:', error);
      MySwal.fire({
        title: 'Error',
        text: 'Hubo un problema al cargar la carpeta del empleado',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#0693e3'
      });
    }
  }, []);

  // Calcular páginas totales
  const getTotalPages = useCallback(() => {
    const filteredEmployees = getFilteredEmployees();
    return Math.ceil(filteredEmployees.length / itemsPerPage);
  }, [getFilteredEmployees, itemsPerPage]);

  // Efectos
  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    if (employees.length > 0 && !loading) {
      loadFoldersForPage();
    }
  }, [currentPage, employees.length, loadFoldersForPage]);

  useEffect(() => {
    const filteredEmployees = getFilteredEmployees();
    setTotalItems(filteredEmployees.length);
    setCurrentPage(1);
    setFolders([]);
  }, [searchTerm, filters, employees.length, getFilteredEmployees]);

  return {
    // Estado
    employees,
    folders,
    loading,
    loadingFolders,
    searchTerm,
    filters,
    selectedFolders,
    selectedFolder,
    currentPage,
    itemsPerPage,
    totalItems,
    companies,
    uniqueDepartments,
    uniqueLevels,
    uniqueWorkModes,
    uniqueContractTypes,
    
    // Acciones
    handleFilterChange,
    handleSearch,
    handleSelectFolder,
    handleSelectAll,
    handlePageChange,
    handleViewFolder,
    setSelectedFolder,
    setSelectedFolders,
    
    // Getters
    getFilteredFolders,
    getFilteredEmployees,
    getTotalPages
  };
};

export default useEmployeeFolders;