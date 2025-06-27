import { User } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { useAppTourContext } from "@/hooks/use-app-tour";

interface WelcomeSectionProps {
  user: Omit<User, 'password'> | null;
}

export default function WelcomeSection({ user }: WelcomeSectionProps) {
  const [, setLocation] = useLocation();
  const { startTour } = useAppTourContext();

  const goToCreateProject = () => {
    setLocation("/projects");
  };

  return (
    <div className="rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white shadow-lg relative overflow-hidden dark:from-[#1e293b] dark:to-[#0f172a] dark:border dark:border-[#3e4a6d] dark:shadow-[0_0_25px_rgba(0,0,0,0.3)]"
         data-tour="dashboard-welcome"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl dark:bg-[#65cef5]/10"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full -ml-32 -mb-32 blur-3xl dark:bg-[#65cef5]/10"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-30 dark:bg-[#65cef5]/5 dark:opacity-40"></div>

      <div className="flex flex-col space-y-3 relative z-10">
        <span className="text-xs font-medium uppercase tracking-wider bg-primary/20 text-primary-foreground px-3 py-1 rounded-full self-start block dark:bg-[#65cef5]/30 dark:text-white">
          Panel de Control
        </span>
        <h2 className="text-3xl font-bold tracking-tight dark:text-white">
          {user ? `¡Hola, ${user.fullName.split(' ')[0]}!` : 'Bienvenido a Cohete Workflow'}
        </h2>
        <p className="max-w-3xl text-white/90 text-lg dark:text-white/90">
          Crea, gestiona y organiza tus proyectos de marketing con flujos de trabajo potenciados por IA y programación de contenido.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-primary shadow-sm hover:bg-white/90 transition-all duration-200 active:scale-95 dark:bg-[#65cef5] dark:text-[#1a1d2d] dark:hover:bg-[#5bb7dd] dark:shadow-[0_0_10px_rgba(101,206,245,0.2)] flex items-center gap-1.5"
            onClick={() => startTour('dashboard')}
          >
            <PlayCircle className="h-4 w-4" />
            Recorrido Guiado
          </Button>
          <Button
            className="rounded-md bg-gray-700/50 border-white/20 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-700/70 transition-all duration-200 active:scale-95 dark:bg-[#2a3349] dark:border-[#3e4a6d] dark:text-white dark:hover:bg-[#37415b]"
            onClick={goToCreateProject}
          >
            Empezar Proyecto
          </Button>
        </div>
      </div>
    </div>
  );
}