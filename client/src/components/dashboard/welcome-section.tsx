import { User } from "@shared/schema";
import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, CheckCircle, Target, Calendar, LayoutDashboard, PenTool, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeSectionProps {
  user: Omit<User, 'password'> | null;
}

export default function WelcomeSection({ user }: WelcomeSectionProps) {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [_, setLocation] = useLocation();
  
  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsTutorialOpen(false);
      setCurrentStep(1);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const goToCreateProject = () => {
    setLocation("/projects");
  };
  
  return (
    <>
      <div className="rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white shadow-lg relative overflow-hidden dark:from-[#1e293b] dark:to-[#0f172a] dark:border dark:border-[#3e4a6d] dark:shadow-[0_0_25px_rgba(0,0,0,0.3)]">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl dark:bg-[#65cef5]/10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full -ml-32 -mb-32 blur-3xl dark:bg-[#65cef5]/10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-30 dark:bg-[#65cef5]/5 dark:opacity-40"></div>
        
        <div className="flex flex-col space-y-3 relative z-10">
          <span className="text-xs font-medium uppercase tracking-wider bg-primary/20 text-primary-foreground px-3 py-1 rounded-full inline-block dark:bg-[#65cef5]/30 dark:text-white">
            Panel de Control
          </span>
          <h2 className="text-3xl font-bold tracking-tight dark:text-white">
            {user ? `¡Hola, ${user.fullName.split(' ')[0]}!` : 'Bienvenido a Cohete Workflow'}
          </h2>
          <p className="max-w-3xl text-white/90 text-lg dark:text-white/90">
            Crea, gestiona y organiza tus proyectos de marketing con flujos de trabajo potenciados por IA y programación de contenido.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button 
              className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-primary shadow-sm hover:bg-white/90 transition-all duration-200 active:scale-95 dark:bg-[#65cef5] dark:text-[#1a1d2d] dark:hover:bg-[#5bb7dd] dark:shadow-[0_0_10px_rgba(101,206,245,0.3)]"
              onClick={() => setIsTutorialOpen(true)}
            >
              Ver Tutorial Rápido
            </button>
            <button 
              className="rounded-md bg-gray-700/50 border border-white/20 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-700/70 transition-all duration-200 active:scale-95 dark:bg-[#2a3349] dark:border-[#3e4a6d] dark:text-white dark:hover:bg-[#374151]"
              onClick={goToCreateProject}
            >
              Crear Proyecto
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal de Tutorial */}
      <Dialog open={isTutorialOpen} onOpenChange={setIsTutorialOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-amber-700 dark:text-amber-400 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
              Tutorial Rápido - Cohete Workflow
            </DialogTitle>
            <DialogDescription>
              Aprende a usar las principales funcionalidades de Cohete Workflow en 5 pasos rápidos
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2">
            {/* Indicador de pasos */}
            <div className="flex justify-center mb-4">
              {[...Array(totalSteps)].map((_, index) => (
                <div 
                  key={index} 
                  className={`h-2 w-16 mx-1 rounded-full transition-all ${
                    index + 1 === currentStep 
                      ? 'bg-amber-500' 
                      : index + 1 < currentStep 
                        ? 'bg-amber-300' 
                        : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
            
            {/* Contenido de los pasos */}
            <div className="mt-4">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                      <Target className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">Proyectos y Objetivos</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Comienza creando un proyecto para tu cliente o campaña. Cada proyecto te permite:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Definir objetivos claros y públicos objetivo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Cargar documentos de referencia para análisis con IA</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Centralizar toda la información y tareas del proyecto</span>
                    </li>
                  </ul>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                      <LayoutDashboard className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">Análisis Inteligente</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Nuestra IA puede analizar documentos y extraer información clave para tus campañas:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Análisis automático de misión, visión y objetivos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Identificación de públicos objetivo y tono de comunicación</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Extracción de palabras clave para optimizar el contenido</span>
                    </li>
                  </ul>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">Cronogramas de Contenido</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Crea y gestiona cronogramas de contenido para redes sociales:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Generación automática de contenido para múltiples plataformas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Personalización con título, copys internos y externos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Instrucciones para diseño y hashtags optimizados</span>
                    </li>
                  </ul>
                </div>
              )}
              
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                      <PenTool className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">Edición y Regeneración</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Revisa y mejora el contenido creado:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Añade instrucciones adicionales para mejorar el contenido</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Regenera publicaciones individuales o cronogramas completos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Agrega comentarios para mejorar iteraciones futuras</span>
                    </li>
                  </ul>
                </div>
              )}
              
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">¡Listo para Comenzar!</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Ya conoces las funcionalidades principales de Cohete Workflow. Ahora puedes:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Crear tu primer proyecto y definir sus características</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Generar un cronograma de contenido optimizado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Exportar tus cronogramas a Excel o PDF para compartir</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex justify-between items-center mt-6">
            <div>
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={handlePrevStep}
                  className="gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Anterior
                </Button>
              )}
            </div>
            <Button 
              onClick={handleNextStep}
              className="bg-amber-600 text-white hover:bg-amber-700 gap-1"
            >
              {currentStep < totalSteps ? (
                <>Siguiente <ArrowRight className="h-4 w-4" /></>
              ) : (
                <>Finalizar <CheckCircle className="h-4 w-4" /></>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
