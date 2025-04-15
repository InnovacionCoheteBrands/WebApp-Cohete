import { User } from "@shared/schema";

interface WelcomeSectionProps {
  user: Omit<User, 'password'> | null;
}

export default function WelcomeSection({ user }: WelcomeSectionProps) {
  return (
    <div className="rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white shadow-lg relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
      
      <div className="flex flex-col space-y-3 relative z-10">
        <span className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider">
          Panel de Control
        </span>
        <h2 className="text-3xl font-bold tracking-tight">
          {user ? `¡Hola, ${user.fullName.split(' ')[0]}!` : 'Bienvenido a Cohete Workflow'}
        </h2>
        <p className="max-w-3xl text-white/80 text-lg">
          Crea, gestiona y organiza tus proyectos de marketing con flujos de trabajo potenciados por IA y programación de contenido.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-primary shadow-sm hover:bg-white/90 transition-all duration-200 active:scale-95">
            Ver Tutorial Rápido
          </button>
          <button className="rounded-md bg-gray-700/50 border border-white/20 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-700/70 transition-all duration-200 active:scale-95">
            Crear Proyecto
          </button>
        </div>
      </div>
    </div>
  );
}
