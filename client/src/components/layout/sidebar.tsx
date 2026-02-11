import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import {
  Rocket,
  LayoutDashboard,
  Grid2X2,
  LineChart,
  Users,
  Settings,
  LogOut,
  X,
  ListChecks,
  Calendar,
  CalendarPlus
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
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-black/60 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] md:static md:z-0 transform transition-all duration-300 ease-in-out overflow-hidden",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        data-tour="main-navigation"
      >
        <div className="flex flex-col h-full overflow-hidden hide-scrollbar">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 mb-2 border-b border-white/5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.3)] border border-primary/20 group">
              <Rocket className="h-5 w-5 text-primary transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold tracking-[0.1em] text-white uppercase">Cohete<span className="text-primary">.AI</span></h1>
              <p className="text-[10px] text-gray-400 tracking-widest uppercase">Command Center</p>
            </div>
            {/* Close button - mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto md:hidden text-gray-400 hover:text-white hover:bg-white/10"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="space-y-1 flex-1 min-h-0 px-3 py-4">
            <NavItem
              href="/"
              icon={<LayoutDashboard className="mr-3 h-5 w-5" />}
              label="Dashboard"
              isActive={location === "/"}
              onClick={onClose}
            />
            <NavItem
              href="/projects"
              icon={<Grid2X2 className="mr-3 h-5 w-5" />}
              label="Proyectos"
              isActive={location === "/projects" || (location.startsWith("/projects/") && !location.includes("/tasks"))}
              onClick={onClose}
            />

            <NavItem
              href="/calendars"
              icon={<CalendarPlus className="mr-3 h-5 w-5" />}
              label="Calendarios"
              isActive={location === "/calendars" || location === "/calendar-creator" || location === "/quick-calendar"}
              onClick={onClose}
            />



            {/* Admin section for Primary users only */}
            {isPrimary && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h2 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  Sistemas
                </h2>
                <NavItem
                  href="/users-management"
                  icon={<Users className="mr-3 h-4 w-4" />}
                  label="Usuarios"
                  isActive={location === "/users-management"}
                  onClick={onClose}
                />
                <NavItem
                  href="/settings"
                  icon={<Settings className="mr-3 h-4 w-4" />}
                  label="Configuración"
                  isActive={location === "/settings"}
                  onClick={onClose}
                />
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="border-t border-white/10 p-4 mt-auto bg-black/20">
            <Link href="/profile">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer group border border-transparent hover:border-white/10">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Users className="h-4 w-4" />
                  <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-black shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-bold text-gray-200 truncate group-hover:text-primary transition-colors tracking-wide">
                    {user?.fullName?.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                    {user?.isPrimary ? "Comandante" : "Piloto"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLogout();
                  }}
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </Link>
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
          "flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 relative overflow-hidden group mb-1",
          isActive
            ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.15)] border border-primary/20"
            : "text-gray-400 hover:bg-white/5 hover:text-white hover:border-white/10 border border-transparent"
        )}
        onClick={onClick}
      >
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
        )}
        <div className="flex items-center w-full relative z-10">
          <div className={cn(
            "transition-colors duration-300",
            isActive
              ? "text-primary drop-shadow-[0_0_5px_rgba(var(--primary),0.5)]"
              : "group-hover:text-primary"
          )}>
            {icon}
          </div>
          <span className={cn(
            "tracking-wide transition-colors duration-300",
            isActive ? "font-bold" : ""
          )}>
            {label}
          </span>
        </div>
      </div>
    </Link>
  );
}
