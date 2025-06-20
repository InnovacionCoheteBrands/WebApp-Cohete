
import { sql } from "drizzle-orm";
import { db } from "./server/db.js";

console.log('🚀 Iniciando migración del sistema de equipos...');

try {
  // 1. Crear tabla teams
  console.log('🏢 Creando tabla teams...');
  
  await sql`
    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT NOT NULL UNIQUE,
      description TEXT,
      is_default BOOLEAN DEFAULT FALSE,
      settings JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;

  // 2. Crear tabla team_members
  console.log('👥 Creando tabla team_members...');
  
  await sql`
    CREATE TABLE IF NOT EXISTS team_members (
      id SERIAL PRIMARY KEY,
      team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT DEFAULT 'member',
      joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
      UNIQUE(team_id, user_id)
    );
  `;

  // 3. Crear equipo por defecto para Cohete Brands
  console.log('🏷️ Creando equipo por defecto para Cohete Brands...');
  
  await sql`
    INSERT INTO teams (name, domain, description, is_default)
    VALUES ('Cohete Brands', 'cohetebrands.com', 'Equipo principal de Cohete Brands', true)
    ON CONFLICT (domain) DO NOTHING;
  `;

  // 4. Crear índices para optimizar consultas
  console.log('📊 Creando índices...');
  
  await sql`
    CREATE INDEX IF NOT EXISTS idx_teams_domain ON teams(domain);
    CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
    CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
  `;

  console.log('✅ Migración del sistema de equipos completada exitosamente!');

} catch (error) {
  console.error('❌ Error durante la migración:', error);
  process.exit(1);
}
