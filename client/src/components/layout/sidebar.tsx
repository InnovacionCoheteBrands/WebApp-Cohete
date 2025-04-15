import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  Rocket, 
  LayoutDashboard,
  Grid2X2,
  Image,
  LineChart,
  Users,
  Settings,
  LogOut,
  X,
  ListChecks
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isPrimary = user?.isPrimary;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r bg-card md:static md:z-0 transform transition-transform duration-200 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col space-y-4 p-4 h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
              <Rocket className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold">Cohete Workflow</h1>
              <p className="text-xs text-muted-foreground">Gestión de Marketing</p>
            </div>
            {/* Close button - mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto md:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="space-y-1">
            <NavItem 
              href="/" 
              icon={<LayoutDashboard className="mr-2 h-5 w-5" />} 
              label="Dashboard" 
              isActive={location === "/"} 
              onClick={onClose}
            />
            <NavItem 
              href="/projects" 
              icon={<Grid2X2 className="mr-2 h-5 w-5" />} 
              label="Proyectos" 
              isActive={location === "/projects" || location.startsWith("/projects/")} 
              onClick={onClose}
            />
            <NavItem 
              href="/images" 
              icon={<Image className="mr-2 h-5 w-5" />} 
              label="Imágenes Generadas" 
              isActive={location === "/images"} 
              onClick={onClose}
            />
            <NavItem 
              href="/analytics" 
              icon={<LineChart className="mr-2 h-5 w-5" />} 
              label="Analíticas" 
              isActive={location === "/analytics"} 
              onClick={onClose}
            />
            <NavItem 
              href="/tasks" 
              icon={<ListChecks className="mr-2 h-5 w-5" />} 
              label="Gestor de Tareas" 
              isActive={location === "/tasks"} 
              onClick={onClose}
            />

            {/* Admin section for Primary users only */}
            {isPrimary && (
              <div className="mt-4 border-t pt-4">
                <h2 className="mb-1 px-3 text-xs font-medium text-muted-foreground">
                  Administración
                </h2>
                <NavItem 
                  href="/users" 
                  icon={<Users className="mr-2 h-5 w-5" />} 
                  label="Gestión de Usuarios" 
                  isActive={location === "/users"} 
                  onClick={onClose}
                />
                <NavItem 
                  href="/settings" 
                  icon={<Settings className="mr-2 h-5 w-5" />} 
                  label="Configuración" 
                  isActive={location === "/settings"} 
                  onClick={onClose}
                />
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="mt-auto border-t p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.fullName}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.isPrimary ? 'Usuario Principal' : 'Usuario Secundario'}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-auto rounded-md p-1 hover:bg-accent"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, isActive, onClick }: NavItemProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        onClick={onClick}
      >
        {icon}
        {label}
      </div>
    </Link>
  );
}
