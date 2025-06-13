import { ReactNode, useState, useEffect } from "react";
import { Menu, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Detecta el scroll para aplicar efectos visuales sutiles
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Agrega el evento al elemento main con scroll
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar mejorado - hidden on mobile unless toggled */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Main content con mejoras visuales */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-background/50 transition-all duration-300 min-h-0 subtle-pattern hide-scrollbar">
          {/* Menu toggle para móvil con animaciones mejoradas */}
          <div className="md:hidden flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={toggleSidebar}
              className="flex items-center gap-3 rounded-md p-2 hover:bg-accent interactive-element"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-md dark:dark-glow">
                <Menu className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold tracking-tight">Cohete Workflow</span>
              </div>
            </Button>
          </div>

          {/* Contenedor principal con transiciones y elevación */}
          <div 
            className={`w-full max-w-7xl mx-auto transition-all duration-300 fade-in-effect ${
              scrolled ? 'pt-2' : 'pt-3'
            }`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
