import React, { useState, useEffect } from 'react';
import communicationService from '../../services/communicationService';

const CompanyEmployeeTest = () => {
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('CompanyEmployeeTest: Iniciando carga de datos...');
        setLoading(true);
        setError(null);

        // Cargar empresas
        console.log('CompanyEmployeeTest: Cargando empresas...');
        const companiesData = await communicationService.getCompanies();
        console.log('CompanyEmployeeTest: Empresas cargadas:', companiesData);
        setCompanies(companiesData || []);

        // Cargar empleados
        console.log('CompanyEmployeeTest: Cargando empleados...');
        const employeesData = await communicationService.getEmployees({});
        console.log('CompanyEmployeeTest: Empleados cargados:', employeesData);
        setEmployees(employeesData || []);

        // Cargar empleados por empresa (para verificar)
        if (companiesData && companiesData.length > 0) {
          console.log('CompanyEmployeeTest: Cargando empleados para la primera empresa...');
          const firstCompanyEmployees = await communicationService.getEmployees({ 
            companyId: companiesData[0].id 
          });
          console.log('CompanyEmployeeTest: Empleados de la primera empresa:', firstCompanyEmployees);
        }
      } catch (err) {
        console.error('CompanyEmployeeTest: Error cargando datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Prueba de Carga de Empresas y Empleados</h2>
        <p>Cargando datos de prueba...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Prueba de Carga de Empresas y Empleados</h2>
        <div className="text-red-500">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Prueba de Carga de Empresas y Empleados</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Empresas ({companies.length})</h3>
        {companies.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {companies.map(company => (
              <li key={company.id}>
                {company.name} (ID: {company.id})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No se encontraron empresas</p>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Empleados ({employees.length})</h3>
        {employees.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {employees.slice(0, 10).map(employee => (
              <li key={employee.id}>
                {employee.name} - {employee.company?.name || 'Sin empresa'} ({employee.email})
              </li>
            ))}
            {employees.length > 10 && (
              <li className="text-gray-500">... y {employees.length - 10} más</li>
            )}
          </ul>
        ) : (
          <p className="text-gray-500">No se encontraron empleados</p>
        )}
      </div>
    </div>
  );
};

export default CompanyEmployeeTest;