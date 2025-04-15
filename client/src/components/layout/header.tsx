import { Link, useLocation } from "wouter";
import { Menu, Bell, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  // Generate title based on current path
  const getTitle = () => {
    if (location === "/") return "Dashboard";
    if (location === "/projects") return "Proyectos";
    if (location.startsWith("/projects/")) return "Detalles del Proyecto";
    return "Cohete Workflow";
  };

  return (
    <header className="border-b bg-card px-4 py-3 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMenuClick}
            className="rounded-md p-2 hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold">Cohete Workflow</span>
        </div>
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold">{getTitle()}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="relative">
            <Button variant="ghost" size="icon" className="rounded-md p-2 hover:bg-accent">
              <Bell className="h-5 w-5" />
              <Badge variant="destructive" className="absolute -right-0 -top-0 flex h-4 w-4 items-center justify-center rounded-full text-xs font-semibold">
                2
              </Badge>
            </Button>
          </div>
          <div className="flex items-center rounded-md border bg-background px-3 py-1.5">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Buscar proyectos..." 
              className="w-32 border-0 bg-transparent text-sm outline-none shadow-none p-0 h-auto sm:w-64" 
            />
          </div>
        </div>
      </div>
    </header>
  );
}
