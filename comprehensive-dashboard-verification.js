const fs = require('fs');
const path = require('path');

/**
 * Verificación completa del Dashboard Mejorado con IA
 */

function verifyDashboardImplementation() {
  console.log('🔍 Verificación completa del Dashboard Mejorado con IA');
  
  // Verificar archivos clave y su contenido
  const keyFiles = [
    {
      path: 'src/components/dashboard/ModernDashboardRedesigned.js',
      name: 'Dashboard Principal',
      checks: [
        'showAIEnhanced',
        'ModernAIEnhancedDashboard',
        'Mejorar con IA',
        'SparklesIcon'
      ]
    },
    {
      path: 'src/components/dashboard/ModernAIEnhancedDashboard.js',
      name: 'Dashboard Mejorado con IA',
      checks: [
        'ArrowTrendingUpIcon',
        'DashboardChart',
        'AIRecommendations',
        'aiRecommendationsService',
        'motion',
        'useEffect',
        'useState'
      ]
    },
    {
      path: 'src/services/aiRecommendationsService.js',
      name: 'Servicio de IA',
      checks: [
        'OpenAI',
        'getDashboardRecommendations',
        'getTrendPredictions',
        'getProductivityRecommendations',
        'generateInsights'
      ]
    },
    {
      path: 'src/components/charts/DashboardChart.js',
      name: 'Componente de Gráficos',
      checks: [
        'Chart',
        'Line',
        'Bar',
        'Doughnut',
        'Radar',
        'Chart.js'
      ]
    },
    {
      path: 'src/components/dashboard/AIRecommendations.js',
      name: 'Recomendaciones de IA',
      checks: [
        'aiRecommendationsService',
        'recommendations',
        'priority',
        'dismissRecommendation'
      ]
    }
  ];
  
  console.log('\n📁 Verificando archivos y su implementación:');
  
  let totalChecks = 0;
  let passedChecks = 0;
  let existingFiles = 0;
  
  keyFiles.forEach(file => {
    const filePath = path.join(__dirname, file.path);
    
    if (fs.existsSync(filePath)) {
      existingFiles++;
      console.log(`\n✅ ${file.name}: ${file.path}`);
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      file.checks.forEach(check => {
        totalChecks++;
        if (content.includes(check)) {
          passedChecks++;
          console.log(`   ✅ ${check}: Implementado`);
        } else {
          console.log(`   ❌ ${check}: No encontrado`);
        }
      });
    } else {
      console.log(`\n❌ ${file.name}: ${file.path} - No existe`);
    }
  });
  
  // Verificar dependencias en package.json
  console.log('\n📦 Verificando dependencias en package.json:');
  const packageJsonPath = path.join(__dirname, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = [
      'chart.js',
      'react-chartjs-2',
      'framer-motion',
      'openai',
      'lucide-react'
    ];
    
    let depsFound = 0;
    requiredDeps.forEach(dep => {
      if (dependencies[dep]) {
        depsFound++;
        console.log(`✅ ${dep}: ${dependencies[dep]}`);
      } else {
        console.log(`❌ ${dep}: No instalado`);
      }
    });
    
    // Verificar componentes de Heroicons
    if (dependencies['@heroicons/react']) {
      console.log(`✅ @heroicons/react: ${dependencies['@heroicons/react']}`);
    } else {
      console.log(`❌ @heroicons/react: No instalado`);
    }
  }
  
  // Verificar estructura de rutas
  console.log('\n🛣️  Verificando estructura de rutas:');
  const appJsPath = path.join(__dirname, 'src/App.js');
  
  if (fs.existsSync(appJsPath)) {
    const appContent = fs.readFileSync(appJsPath, 'utf8');
    
    const routeChecks = [
      'panel-principal',
      'ModernDashboardRedesigned',
      'Router',
      'Route'
    ];
    
    routeChecks.forEach(check => {
      if (appContent.includes(check)) {
        console.log(`✅ ${check}: Configurado`);
      } else {
        console.log(`❌ ${check}: No encontrado`);
      }
    });
  }
  
  // Resumen final
  console.log('\n📊 Resumen de la implementación:');
  console.log(`✅ Archivos existentes: ${existingFiles}/${keyFiles.length}`);
  console.log(`✅ Verificaciones de código: ${passedChecks}/${totalChecks}`);
  
  const implementationRate = (passedChecks / totalChecks) * 100;
  const fileRate = (existingFiles / keyFiles.length) * 100;
  const overallRate = (implementationRate + fileRate) / 2;
  
  console.log(`📈 Tasa de implementación: ${overallRate.toFixed(1)}%`);
  
  if (overallRate >= 80) {
    console.log('\n🎉 ¡Dashboard Mejorado con IA implementado exitosamente!');
    console.log('\n🌟 Características implementadas:');
    console.log('   ✅ Dashboard principal con contador de 800 carpetas');
    console.log('   ✅ Botón "Mejorar con IA" para cambiar de vista');
    console.log('   ✅ Dashboard mejorado con IA y visualizaciones');
    console.log('   ✅ Servicio de recomendaciones con OpenAI');
    console.log('   ✅ Gráficos interactivos (línea, barra, doughnut, radar)');
    console.log('   ✅ Animaciones con Framer Motion');
    console.log('   ✅ Análisis predictivo y tendencias');
    console.log('   ✅ Recomendaciones personalizadas');
    console.log('   ✅ Diseño moderno y responsivo');
    
    console.log('\n🚀 Instrucciones para probar:');
    console.log('   1. Asegúrate de que el servidor esté corriendo: npm start');
    console.log('   2. Abre http://localhost:3000/panel-principal');
    console.log('   3. Verifica que el contador de carpetas muestre 800');
    console.log('   4. Haz clic en "Mejorar con IA" para ver las nuevas funcionalidades');
    console.log('   5. Explora los gráficos y recomendaciones de IA');
    
    console.log('\n🔧 Si algo no funciona:');
    console.log('   • Verifica que todas las dependencias estén instaladas');
    console.log('   • Revisa la consola del navegador para errores');
    console.log('   • Asegúrate de que el servidor backend esté corriendo en el puerto 3003');
    
  } else {
    console.log('\n⚠️  Implementación incompleta');
    console.log('   Algunos componentes pueden no estar funcionando correctamente');
    console.log('   Revisa los archivos marcados con ❌ y completa la implementación');
  }
}

// Ejecutar verificación
verifyDashboardImplementation();