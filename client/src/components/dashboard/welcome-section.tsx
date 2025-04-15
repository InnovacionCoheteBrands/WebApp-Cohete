import { User } from "@shared/schema";

interface WelcomeSectionProps {
  user: Omit<User, 'password'> | null;
}

export default function WelcomeSection({ user }: WelcomeSectionProps) {
  return (
    <div className="rounded-lg bg-gradient-to-r from-primary/90 to-secondary/90 p-6 text-primary-foreground">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold">
          {user ? `Bienvenido, ${user.fullName}` : 'Bienvenido a Cohete Workflow'}
        </h2>
        <p className="max-w-3xl">
          Crea, gestiona y organiza tus proyectos de marketing con flujos de trabajo potenciados por IA y programación de contenido.
        </p>
        <div className="mt-4">
          <button className="rounded-md bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-white/90">
            Ver Tutorial Rápido
          </button>
        </div>
      </div>
    </div>
  );
}
