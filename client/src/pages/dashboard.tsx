
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
        description: "No se pudo cargar la información del usuario",
        variant: "destructive"
      });
    }
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
        description: "No se pudo cargar los proyectos",
        variant: "destructive"
      });
    }
  });

  const { data: schedules, error: schedulesError } = useQuery({
    queryKey: ['schedules', 'recent'],
    queryFn: async () => {
      const res = await fetch('/api/schedules/recent');
      if (!res.ok) throw new Error('Error al cargar horarios');
      return res.json();
    },
    retry: 1,
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo cargar los horarios recientes",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="space-y-6 hide-scrollbar">
      <WelcomeSection user={user} />
      <QuickActions />
      <CreateScheduleSection />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentProjects />
        <RecentSchedules />
      </div>
    </div>
  );
}
