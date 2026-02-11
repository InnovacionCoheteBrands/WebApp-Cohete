import { User } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { PlayCircle, Rocket, Sparkles } from "lucide-react";
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

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="relative overflow-hidden py-12 noise-texture"
      data-tour="dashboard-welcome"
    >
      {/* Deep Space Radial Gradient Background */}
      <div className="absolute inset-0 bg-radial-amber opacity-60"></div>

      {/* Subtle Animated Ambient Glow */}
      <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow"></div>

      <div className="relative z-10 max-w-5xl">
        {/* Typography-First Hero - No Container Box */}
        <div className="space-y-6">
          {/* Greeting Text with Subtle Top Lighting */}
          <h1 className="title-premium text-6xl md:text-7xl lg:text-8xl text-white leading-none">
            <span className="block text-2xl md:text-3xl font-normal text-muted-foreground mb-3 tracking-normal">
              {getGreeting()},
            </span>
            <span className="gradient-text-amber">
              {user ? user.fullName.split(' ')[0] : 'Comandante'}
            </span>
          </h1>

          {/* Subtitle with Amber Accent */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed">
            Tus sistemas de marketing están{' '}
            <span className="text-primary font-semibold glow-text">en línea</span>.
            <br className="hidden md:block" />
            Gestiona proyectos y cronogramas con IA avanzada.
          </p>

          {/* Premium CTA Buttons with Amber Glow */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Button
              className="btn-amber-glow h-14 px-8 text-base font-bold uppercase tracking-wider group"
              onClick={() => startTour('dashboard')}
            >
              <PlayCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Iniciar Recorrido
            </Button>

            <Button
              className="h-14 px-8 glass-premium hover-glow-amber text-white font-semibold backdrop-blur-xl border-white/10 hover:border-primary/40 transition-all duration-300 group"
              onClick={goToCreateProject}
            >
              <Rocket className="mr-2 h-5 w-5 group-hover:-translate-y-1 transition-transform" />
              Nuevo Proyecto
            </Button>
          </div>
        </div>

        {/* Floating 3D Icon with Amber Glow - Repositioned */}
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 hidden xl:block">
          <div className="relative h-48 w-48 animate-float">
            {/* Outer Rotating Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-dashed animate-[spin_20s_linear_infinite]"></div>

            {/* Middle Ring */}
            <div className="absolute inset-6 rounded-full border border-primary/30 animate-[spin_15s_linear_infinite_reverse]"></div>

            {/* Inner Glass Circle with Icon */}
            <div className="absolute inset-12 rounded-full glass-premium flex items-center justify-center glow-amber">
              <Sparkles className="h-20 w-20 text-primary icon-3d-amber animate-pulse-glow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}