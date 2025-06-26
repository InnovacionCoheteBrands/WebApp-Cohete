import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import WelcomeSection from "@/components/dashboard/welcome-section";
import QuickActions from "@/components/dashboard/quick-actions";
import CreateScheduleSection from "@/components/dashboard/create-schedule-section";
import RecentProjects from "@/components/dashboard/recent-projects";
import RecentSchedules from "@/components/dashboard/recent-schedules";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: user, error: userError } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user');
      if (!res.ok) throw new Error('Error al cargar datos del usuario');
      return res.json();
    },
    retry: 1,
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del usuario",
        variant: "destructive",
      });
    },
  });

  const { data: projects, error: projectsError } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Error al cargar proyectos');
      return res.json();
    },
    retry: 1,
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron cargar los proyectos",
        variant: "destructive",
      });
    },
  });

  const { data: schedules, error: schedulesError } = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const res = await fetch('/api/schedules');
      if (!res.ok) throw new Error('Error al cargar cronogramas');
      return res.json();
    },
    retry: 1,
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron cargar los cronogramas",
        variant: "destructive",
      });
    },
  });

  if (userError || projectsError || schedulesError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error al cargar el dashboard</h1>
          <p className="text-gray-600">Por favor, recarga la página o contacta al soporte técnico.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <WelcomeSection user={user} />
      <QuickActions />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CreateScheduleSection />
        <RecentProjects projects={projects} />
      </div>
      <RecentSchedules schedules={schedules} />
    </div>
  );
}