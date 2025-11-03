// Script para generar 50 empleados por empresa (800 empleados en total)
const fs = require('fs');

// Empresas
const companies = [
  'Ariztia', 'Inchcape', 'Achs', 'Arcoprime', 'Grupo Saesa', 'Colbun', 
  'AFP Habitat', 'Copec', 'Antofagasta Minerals', 'Vida Cámara', 'Enaex', 
  'SQM', 'CMPC', 'Corporación Chilena - Alemana', 'Hogar Alemán', 'Empresas SB'
];

// Regiones de Chile
const regions = [
  'Región Metropolitana', 'Región de Valparaíso', "Región del Libertador General Bernardo O'Higgins",
  'Región del Maule', 'Región del Biobío', 'Región de La Araucanía', 'Región de Los Ríos',
  'Región de Los Lagos', 'Región Aysén del General Carlos Ibáñez del Campo', 'Región de Magallanes y de la Antártica Chilena',
  'Región de Tarapacá', 'Región de Antofagasta', 'Región de Atacama', 'Región de Coquimbo', 'Región de Ñuble'
];

// Departamentos
const departments = [
  'Ventas', 'Marketing', 'Finanzas', 'RRHH', 'Operaciones', 'Logística', 'Calidad', 'Producción',
  'TI', 'Legal', 'Compras', 'Administración', 'Seguridad', 'Mantenimiento', 'Investigación y Desarrollo',
  'Servicio al Cliente', 'Auditoría', 'Contabilidad', 'Tesorería', 'Planificación'
];

// Niveles jerárquicos
const levels = [
  'Gerente', 'Jefatura', 'Supervisor', 'Especialista', 'Asistente', 'Operario', 'Director', 'Coordinador'
];

// Modalidades de trabajo
const workModes = ['Presencial', 'Híbrido', 'Remoto'];

// Tipos de contrato
const contractTypes = ['Indefinido', 'Plazo Fijo', 'Honorarios'];

// Posiciones por departamento
const positionsByDepartment = {
  'Ventas': ['Gerente de Ventas', 'Jefe de Ventas', 'Ejecutivo de Ventas', 'Asistente de Ventas', 'Coordinador de Ventas'],
  'Marketing': ['Gerente de Marketing', 'Jefe de Marketing', 'Especialista en Marketing', 'Asistente de Marketing', 'Coordinador de Marketing'],
  'Finanzas': ['Gerente Financiero', 'Jefe de Finanzas', 'Analista Financiero', 'Asistente Financiero', 'Contador'],
  'RRHH': ['Gerente de RRHH', 'Jefe de RRHH', 'Especialista en RRHH', 'Asistente de RRHH', 'Reclutador'],
  'Operaciones': ['Gerente de Operaciones', 'Jefe de Operaciones', 'Supervisor de Operaciones', 'Operario de Planta', 'Coordinador de Operaciones'],
  'Logística': ['Gerente de Logística', 'Jefe de Logística', 'Supervisor de Logística', 'Especialista en Logística', 'Asistente de Logística'],
  'Calidad': ['Gerente de Calidad', 'Jefe de Calidad', 'Especialista en Calidad', 'Asistente de Calidad', 'Auditor de Calidad'],
  'Producción': ['Gerente de Producción', 'Jefe de Producción', 'Supervisor de Producción', 'Operario de Producción', 'Técnico de Producción'],
  'TI': ['Gerente de TI', 'Jefe de TI', 'Desarrollador', 'Analista de Sistemas', 'Técnico de Soporte'],
  'Legal': ['Gerente Legal', 'Jefe Legal', 'Abogado', 'Asistente Legal', 'Especialista en Cumplimiento'],
  'Compras': ['Gerente de Compras', 'Jefe de Compras', 'Especialista en Compras', 'Asistente de Compras', 'Coordinador de Compras'],
  'Administración': ['Gerente Administrativo', 'Jefe Administrativo', 'Administrativo', 'Asistente Administrativo', 'Coordinador Administrativo'],
  'Seguridad': ['Gerente de Seguridad', 'Jefe de Seguridad', 'Supervisor de Seguridad', 'Guardia de Seguridad', 'Especialista en Seguridad'],
  'Mantenimiento': ['Gerente de Mantenimiento', 'Jefe de Mantenimiento', 'Supervisor de Mantenimiento', 'Técnico de Mantenimiento', 'Asistente de Mantenimiento'],
  'Investigación y Desarrollo': ['Gerente de I+D', 'Jefe de I+D', 'Investigador', 'Desarrollador de Producto', 'Técnico de Laboratorio'],
  'Servicio al Cliente': ['Gerente de Servicio al Cliente', 'Jefe de Servicio al Cliente', 'Ejecutivo de Servicio', 'Asistente de Servicio', 'Coordinador de Servicio'],
  'Auditoría': ['Gerente de Auditoría', 'Jefe de Auditoría', 'Auditor Interno', 'Asistente de Auditoría', 'Especialista en Control Interno'],
  'Contabilidad': ['Gerente Contable', 'Jefe Contable', 'Contador', 'Asistente Contable', 'Auxiliar Contable'],
  'Tesorería': ['Gerente de Tesorería', 'Jefe de Tesorería', 'Tesorero', 'Asistente de Tesorería', 'Analista de Tesorería'],
  'Planificación': ['Gerente de Planificación', 'Jefe de Planificación', 'Planificador', 'Asistente de Planificación', 'Analista de Planificación']
};

// Nombres y apellidos chilenos
const firstNames = [
  'Roberto', 'María', 'Carlos', 'Daniela', 'Francisco', 'Patricio', 'Verónica', 'Gonzalo', 'Tamara', 'Eduardo',
  'Andrés', 'Carolina', 'Felipe', 'Catalina', 'Sebastián', 'Paula', 'Diego', 'Camila', 'Mauricio', 'Valentina',
  'Alejandro', 'Constanza', 'Cristian', 'Macarena', 'Jorge', 'Fernanda', 'Ricardo', 'Claudia', 'Hernán', 'Danielle',
  'Ignacio', 'Romina', 'Pablo', 'Karina', 'Luis', 'Marcela', 'Oscar', 'Silvana', 'Miguel', 'Natalia',
  'Víctor', 'Alejandra', 'Rodrigo', 'Isabel', 'Guillermo', 'Teresa', 'César', 'Graciela', 'Arturo', 'Yolanda'
];

const lastNames = [
  'Silva', 'López', 'Méndez', 'Rojas', 'Pérez', 'Mendoza', 'Castro', 'Morales', 'Ramírez', 'Herrera',
  'Vásquez', 'Fuentes', 'González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Martínez',
  'Sepúlveda', 'Moraga', 'Rodríguez', 'López', 'Fuentes', 'Valenzuela', 'Castro', 'Vargas', 'Gutiérrez', 'Henríquez',
  'Zúñiga', 'Aguilera', 'Parra', 'Leiva', 'Romero', 'Álvarez', 'Pizarro', 'Sánchez', 'Torres', 'Reyes',
  'Guzmán', 'Vera', 'Cortés', 'Ramos', 'Figueroa', 'Hernández', 'Vargas', 'Miranda', 'Rivera', 'Villarroel'
];

// Función para generar un email basado en nombre y apellido
function generateEmail(firstName, lastName, company) {
  const cleanCompany = company.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${cleanCompany}.cl`;
}

// Función para generar un número de teléfono chileno
function generatePhone() {
  const prefixes = ['9', '2', '3', '4', '5', '6', '7'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 100000000);
  return `+56 ${prefix} ${String(number).padStart(8, '0').slice(0, 4)} ${String(number).padStart(8, '0').slice(4)}`;
}

// Función para generar empleados
function generateEmployees() {
  let employees = [];
  let idCounter = 1;
  
  companies.forEach(company => {
    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      const workMode = workModes[Math.floor(Math.random() * workModes.length)];
      const contractType = contractTypes[Math.floor(Math.random() * contractTypes.length)];
      const position = positionsByDepartment[department] ? 
        positionsByDepartment[department][Math.floor(Math.random() * positionsByDepartment[department].length)] : 
        'Empleado';
      
      employees.push({
        id: idCounter++,
        name: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName, company),
        phone: generatePhone(),
        company: company,
        region: region,
        department: department,
        level: level,
        workMode: workMode,
        contractType: contractType,
        position: position
      });
    }
  });
  
  return employees;
}

// Generar empleados
const employees = generateEmployees();

// Función para escapar comillas simples en strings
function escapeString(str) {
  return str.replace(/'/g, "\\'");
}

// Crear contenido del archivo employeeData.js
let fileContent = `// Datos de empleados generados automáticamente
// 50 empleados por empresa (800 empleados en total)

const employees = [
`;

employees.forEach(employee => {
  fileContent += `  {
    id: ${employee.id},
    name: '${escapeString(employee.name)}',
    email: '${escapeString(employee.email)}',
    phone: '${escapeString(employee.phone)}',
    company: '${escapeString(employee.company)}',
    region: '${escapeString(employee.region)}',
    department: '${escapeString(employee.department)}',
    level: '${escapeString(employee.level)}',
    workMode: '${escapeString(employee.workMode)}',
    contractType: '${escapeString(employee.contractType)}',
    position: '${escapeString(employee.position)}'
  },
`;
});

fileContent += `];

export default employees;
`;

// Guardar el archivo
fs.writeFileSync('src/components/communication/employeeData.js', fileContent);

console.log(`Generados ${employees.length} empleados para ${companies.length} empresas.`);
console.log('Archivo employeeData.js actualizado exitosamente.');
