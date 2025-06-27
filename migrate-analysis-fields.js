
const { neon } = require('@neondatabase/serverless');

async function addAnalysisFields() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('Agregando campos de análisis faltantes...');
    
    // Agregar nuevos campos a la tabla analysis_results
    await sql`
      ALTER TABLE analysis_results 
      ADD COLUMN IF NOT EXISTS communication_objectives TEXT,
      ADD COLUMN IF NOT EXISTS buyer_persona TEXT,
      ADD COLUMN IF NOT EXISTS archetypes JSONB,
      ADD COLUMN IF NOT EXISTS social_networks JSONB,
      ADD COLUMN IF NOT EXISTS marketing_strategies TEXT,
      ADD COLUMN IF NOT EXISTS brand_communication_style TEXT,
      ADD COLUMN IF NOT EXISTS response_policy_positive TEXT,
      ADD COLUMN IF NOT EXISTS response_policy_negative TEXT
    `;
    
    console.log('✅ Campos de análisis agregados exitosamente');
    
  } catch (error) {
    console.error('❌ Error agregando campos de análisis:', error);
    throw error;
  }
}

addAnalysisFields().catch(console.error);
