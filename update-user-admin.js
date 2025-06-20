
import { neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import ws from 'ws';
import * as schema from './shared/schema.js';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function updateUserToAdmin() {
  console.log('🔍 Buscando usuario @innovación...');
  
  try {
    // Buscar usuario por username
    const user = await db.select()
      .from(schema.users)
      .where(eq(schema.users.username, 'innovación'))
      .limit(1);
    
    if (user.length === 0) {
      // Buscar con @ incluido
      const userWithAt = await db.select()
        .from(schema.users)
        .where(eq(schema.users.username, '@innovación'))
        .limit(1);
      
      if (userWithAt.length === 0) {
        console.log('❌ Usuario @innovación no encontrado');
        console.log('📋 Usuarios disponibles:');
        
        const allUsers = await db.select({
          id: schema.users.id,
          username: schema.users.username,
          fullName: schema.users.fullName,
          role: schema.users.role,
          isPrimary: schema.users.isPrimary
        }).from(schema.users);
        
        allUsers.forEach(u => {
          console.log(`  - ${u.username} (${u.fullName}) - Role: ${u.role}, Admin: ${u.isPrimary}`);
        });
        
        return;
      }
      user.push(userWithAt[0]);
    }
    
    const targetUser = user[0];
    console.log(`✅ Usuario encontrado: ${targetUser.username} (${targetUser.fullName})`);
    console.log(`📊 Estado actual: Role=${targetUser.role}, isPrimary=${targetUser.isPrimary}`);
    
    // Actualizar a Admin
    const updatedUser = await db.update(schema.users)
      .set({
        role: 'admin',
        isPrimary: true,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, targetUser.id))
      .returning();
    
    if (updatedUser.length > 0) {
      console.log('🎉 Usuario actualizado exitosamente!');
      console.log(`📊 Nuevo estado: Role=${updatedUser[0].role}, isPrimary=${updatedUser[0].isPrimary}`);
      console.log(`👤 Usuario: ${updatedUser[0].username} (${updatedUser[0].fullName})`);
    } else {
      console.log('❌ Error al actualizar el usuario');
    }
    
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
  } finally {
    await pool.end();
  }
}

updateUserToAdmin();
