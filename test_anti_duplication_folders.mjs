/**
 * Test para verificar el funcionamiento de la anti-duplicación de carpetas
 * Verifica que unifiedEmployeeFolderService no cree carpetas duplicadas
 */

import unifiedEmployeeFolderService from './src/services/unifiedEmployeeFolderService.js'
import { db, supabase } from './src/lib/supabase.js'

// Datos de prueba
const testEmployeeData = {
  email: 'test.anti.duplication@staffhub.com',
  name: 'Test Anti Duplication',
  position: 'Tester',
  department: 'QA',
  phone: '+56912345678',
  region: 'Metropolitana',
  level: 'Senior',
  work_mode: 'Remoto',
  contract_type: 'Indefinido',
  company_id: null
}

async function testAntiDuplication() {
  console.log('🧪 INICIANDO TEST DE ANTI-DUPLICACIÓN DE CARPETAS')
  console.log('=' .repeat(60))
  
  try {
    // 1. Verificar estado inicial
    console.log('\n📋 PASO 1: Verificando estado inicial...')
    
    // Buscar carpetas existentes para este email
    const existingFolders = await db.userFolders.getByAdministrador(testEmployeeData.email)
    console.log(`   📁 Carpetas existentes para ${testEmployeeData.email}:`, existingFolders?.length || 0)
    
    // 2. Primera creación de carpeta
    console.log('\n🔄 PASO 2: Primera creación de carpeta...')
    const firstResult = await unifiedEmployeeFolderService.createEmployeeFolder(
      testEmployeeData.email, 
      testEmployeeData
    )
    
    console.log('   ✅ Resultado primera creación:', {
      created: firstResult.created,
      updated: firstResult.updated,
      folder: firstResult.folder ? {
        id: firstResult.folder.id,
        nombre: firstResult.folder.nombre,
        administrador: firstResult.folder.administrador
      } : null
    })
    
    // 3. Verificar después de primera creación
    console.log('\n📊 PASO 3: Verificando después de primera creación...')
    const foldersAfterFirst = await db.userFolders.getByAdministrador(testEmployeeData.email)
    console.log(`   📁 Carpetas después de primera creación:`, foldersAfterFirst?.length || 0)
    
    // 4. Segunda creación (debe reutilizar la existente)
    console.log('\n🔄 PASO 4: Segunda creación (debe reutilizar)...')
    const secondResult = await unifiedEmployeeFolderService.createEmployeeFolder(
      testEmployeeData.email, 
      testEmployeeData
    )
    
    console.log('   ✅ Resultado segunda creación:', {
      created: secondResult.created,
      updated: secondResult.updated,
      folder: secondResult.folder ? {
        id: secondResult.folder.id,
        nombre: secondResult.folder.nombre,
        administrador: secondResult.folder.administrador
      } : null
    })
    
    // 5. Verificar después de segunda creación
    console.log('\n📊 PASO 5: Verificando después de segunda creación...')
    const foldersAfterSecond = await db.userFolders.getByAdministrador(testEmployeeData.email)
    console.log(`   📁 Carpetas después de segunda creación:`, foldersAfterSecond?.length || 0)
    
    // 6. Tercera creación para mayor seguridad
    console.log('\n🔄 PASO 6: Tercera creación (debe reutilizar)...')
    const thirdResult = await unifiedEmployeeFolderService.createEmployeeFolder(
      testEmployeeData.email, 
      testEmployeeData
    )
    
    console.log('   ✅ Resultado tercera creación:', {
      created: thirdResult.created,
      updated: thirdResult.updated,
      folder: thirdResult.folder ? {
        id: thirdResult.folder.id,
        nombre: thirdResult.folder.nombre,
        administrador: thirdResult.folder.administrador
      } : null
    })
    
    // 7. Verificación final
    console.log('\n📊 PASO 7: Verificación final...')
    const finalFolders = await db.userFolders.getByAdministrador(testEmployeeData.email)
    console.log(`   📁 Total de carpetas finales:`, finalFolders?.length || 0)
    
    // 8. Limpieza de datos de prueba
    console.log('\n🧹 PASO 8: Limpiando datos de prueba...')
    if (finalFolders && finalFolders.length > 0) {
      for (const folder of finalFolders) {
        try {
          await db.userFolders.delete(folder.id)
          console.log(`   🗑️  Carpeta eliminada: ${folder.nombre}`)
        } catch (error) {
          console.log(`   ⚠️  Error eliminando carpeta ${folder.nombre}:`, error.message)
        }
      }
    }
    
    // 9. Verificación de limpieza
    console.log('\n✅ PASO 9: Verificando limpieza...')
    const cleanedFolders = await db.userFolders.getByAdministrador(testEmployeeData.email)
    console.log(`   📁 Carpetas después de limpieza:`, cleanedFolders?.length || 0)
    
    // 10. Resultado final
    console.log('\n🎯 RESULTADO FINAL DEL TEST:')
    console.log('=' .repeat(60))
    
    const totalCreated = (firstResult.created ? 1 : 0) + (secondResult.created ? 1 : 0) + (thirdResult.created ? 1 : 0)
    const totalUpdated = (firstResult.updated ? 1 : 0) + (secondResult.updated ? 1 : 0) + (thirdResult.updated ? 1 : 0)
    
    console.log(`   📊 Primera creación: ${firstResult.created ? 'CREADA' : firstResult.updated ? 'ACTUALIZADA' : 'NADA'}`)
    console.log(`   📊 Segunda creación: ${secondResult.created ? 'CREADA' : secondResult.updated ? 'ACTUALIZADA' : 'NADA'}`)
    console.log(`   📊 Tercera creación: ${thirdResult.created ? 'CREADA' : thirdResult.updated ? 'ACTUALIZADA' : 'NADA'}`)
    console.log(`   📊 Total creadas: ${totalCreated}`)
    console.log(`   📊 Total actualizadas: ${totalUpdated}`)
    console.log(`   📊 Carpetas finales: ${finalFolders?.length || 0}`)
    
    // Evaluación del resultado
    if (totalCreated === 1 && totalUpdated === 2 && (finalFolders?.length || 0) === 1) {
      console.log('\n🎉 ¡TEST EXITOSO!')
      console.log('   ✅ La anti-duplicación funciona correctamente')
      console.log('   ✅ Solo se creó 1 carpeta, las otras 2 fueron reutilizadas')
      console.log('   ✅ No hay carpetas duplicadas')
      return { success: true, message: 'Anti-duplicación funciona correctamente' }
    } else {
      console.log('\n❌ TEST FALLIDO!')
      console.log('   ❌ La anti-duplicación no funciona como se esperaba')
      console.log(`   ❌ Esperado: 1 creada, 2 actualizadas, 1 final`)
      console.log(`   ❌ Obtenido: ${totalCreated} creadas, ${totalUpdated} actualizadas, ${finalFolders?.length || 0} finales`)
      return { success: false, message: 'Anti-duplicación no funciona correctamente' }
    }
    
  } catch (error) {
    console.error('\n💥 ERROR EN EL TEST:', error)
    return { success: false, message: `Error en el test: ${error.message}` }
  }
}

// Ejecutar el test si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testAntiDuplication()
    .then(result => {
      console.log('\n🏁 TEST COMPLETADO:', result.message)
      process.exit(result.success ? 0 : 1)
    })
    .catch(error => {
      console.error('\n💥 ERROR FATAL:', error)
      process.exit(1)
    })
}

export default testAntiDuplication