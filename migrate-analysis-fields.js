
const { neon } = require('@neondatabase/serverless');

async function addAnalysisFields() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL no está definida en las variables de entorno');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔄 Iniciando migración de campos de análisis...');
    
    // Verificar si la tabla analysis_results existe
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'analysis_results'
      )
    `;
    
    if (!tableExists[0].exists) {
      console.error('❌ Error: La tabla analysis_results no existe');
      process.exit(1);
    }

    console.log('📋 Verificando campos existentes...');
    
    // Verificar qué campos ya existen
    const existingColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'analysis_results'
      AND column_name IN (
        'communication_objectives',
        'buyer_persona', 
        'archetypes',
        'social_networks',
        'marketing_strategies',
        'brand_communication_style',
        'response_policy_positive',
        'response_policy_negative'
      )
    `;
    
    const existingColumnNames = existingColumns.map(col => col.column_name);
    console.log('📊 Campos ya existentes:', existingColumnNames);
    
    // Lista de campos a agregar con sus tipos
    const fieldsToAdd = [
      { name: 'communication_objectives', type: 'TEXT' },
      { name: 'buyer_persona', type: 'TEXT' },
      { name: 'archetypes', type: 'JSONB' },
      { name: 'social_networks', type: 'JSONB' },
      { name: 'marketing_strategies', type: 'TEXT' },
      { name: 'brand_communication_style', type: 'TEXT' },
      { name: 'response_policy_positive', type: 'TEXT' },
      { name: 'response_policy_negative', type: 'TEXT' }
    ];
    
    // Agregar solo los campos que no existen
    const fieldsToCreate = fieldsToAdd.filter(field => 
      !existingColumnNames.includes(field.name)
    );
    
    if (fieldsToCreate.length === 0) {
      console.log('✅ Todos los campos ya existen en la tabla analysis_results');
      return;
    }
    
    console.log(`🔧 Agregando ${fieldsToCreate.length} campos faltantes...`);
    
    // Agregar campos uno por uno para mejor control de errores
    for (const field of fieldsToCreate) {
      try {
        console.log(`   - Agregando campo: ${field.name} (${field.type})`);
        await sql`ALTER TABLE analysis_results ADD COLUMN ${sql(field.name)} ${sql.unsafe(field.type)}`;
        console.log(`   ✅ Campo ${field.name} agregado exitosamente`);
      } catch (fieldError) {
        console.error(`   ❌ Error agregando campo ${field.name}:`, fieldError.message);
        // Continuar con los demás campos en lugar de fallar completamente
      }
    }
    
    // Verificar que los campos se agregaron correctamente
    const finalColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'analysis_results'
      ORDER BY column_name
    `;
    
    console.log('📋 Campos finales en analysis_results:');
    finalColumns.forEach(col => {
      const isNew = fieldsToCreate.some(field => field.name === col.column_name);
      console.log(`   ${isNew ? '🆕' : '📄'} ${col.column_name}`);
    });
    
    console.log('✅ Migración de campos de análisis completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    console.error('🔍 Detalles del error:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    process.exit(1);
  }
}

// Ejecutar la migración
addAnalysisFields()
  .then(() => {
    console.log('🎉 Script de migración completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal en el script:', error);
    process.exit(1);
  });
