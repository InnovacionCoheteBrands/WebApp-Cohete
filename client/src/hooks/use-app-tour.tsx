import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, Step, STATUS } from 'react-joyride';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

type TourStep = {
  target: string;
  content: React.ReactNode;
  title?: string;
  disableBeacon?: boolean;
  placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right';
  offset?: number;
};

const defaultSteps: TourStep[] = [
  {
    target: '[data-tour="dashboard-welcome"]',
    content: 'Bienvenido al Panel de Control de Cohete Workflow. Aquí puedes ver un resumen de tus proyectos y actividades recientes.',
    title: 'Panel de Control',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="main-navigation"]',
    content: 'Utiliza la navegación principal para acceder a las diferentes secciones de la aplicación.',
    title: 'Navegación Principal',
    placement: 'right',
  },
  {
    target: '[data-tour="create-project-button"]',
    content: 'Crea un nuevo proyecto para empezar a trabajar con un cliente o una campaña específica.',
    title: 'Crear Proyecto',
    placement: 'top',
  },
  {
    target: '[data-tour="recent-schedules"]',
    content: 'Aquí puedes ver tus cronogramas de contenido recientes y acceder rápidamente a ellos.',
    title: 'Cronogramas Recientes',
    placement: 'top-start',
  },
  {
    target: '[data-tour="user-menu"]',
    content: 'Accede a tu perfil, configuración y otras opciones desde este menú.',
    title: 'Menú de Usuario',
    placement: 'bottom-end',
  },
];

const projectSteps: TourStep[] = [
  {
    target: '[data-tour="project-list"]',
    content: 'Aquí verás todos tus proyectos. Puedes filtrarlos y buscar por nombre o cliente.',
    title: 'Lista de Proyectos',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="new-project-button"]',
    content: 'Crea un nuevo proyecto con toda la información necesaria.',
    title: 'Nuevo Proyecto',
    placement: 'left',
  },
  {
    target: '[data-tour="project-card"]',
    content: 'Cada tarjeta muestra la información básica del proyecto. Haz clic para ver todos los detalles.',
    title: 'Tarjeta de Proyecto',
    placement: 'top',
  },
];

const scheduleSteps: TourStep[] = [
  {
    target: '[data-tour="schedule-header"]',
    content: 'Revisa el nombre y la información básica del cronograma.',
    title: 'Información del Cronograma',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="schedule-entries-list"]',
    content: 'Aquí verás todas las entradas del cronograma organizadas por fecha y plataforma.',
    title: 'Lista de Entradas',
    placement: 'left',
  },
  {
    target: '[data-tour="schedule-entry-detail"]',
    content: 'Selecciona una entrada para ver todos sus detalles, incluyendo títulos, copys y hashtags.',
    title: 'Detalle de Entrada',
    placement: 'top',
  },
  {
    target: '[data-tour="schedule-instructions"]',
    content: 'Agrega instrucciones adicionales para mejorar la generación de contenido con IA.',
    title: 'Instrucciones Adicionales',
    placement: 'top',
  },
  {
    target: '[data-tour="schedule-actions"]',
    content: 'Desde aquí puedes descargar el cronograma, regenerarlo o entrar en modo de revisión.',
    title: 'Acciones del Cronograma',
    placement: 'bottom',
  },
];

export type AppTourType = 'dashboard' | 'projects' | 'schedule' | 'tasks' | 'analytics';

export function useAppTour() {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [tourType, setTourType] = useState<AppTourType>('dashboard');
  const { toast } = useToast();
  const [location] = useLocation();

  // Convertir los pasos básicos en el formato que espera react-joyride
  const formatSteps = (tourSteps: TourStep[]): Step[] => {
    return tourSteps.map(step => ({
      target: step.target,
      content: (
        <div className="space-y-2">
          {step.title && <h3 className="text-lg font-medium text-amber-700 dark:text-amber-400">{step.title}</h3>}
          <p className="text-gray-700 dark:text-gray-300">{step.content}</p>
        </div>
      ),
      disableBeacon: step.disableBeacon,
      placement: step.placement,
      offset: step.offset,
    }));
  };

  // Determinar qué pasos mostrar según la ruta actual
  useEffect(() => {
    let pathTourSteps: TourStep[] = [];
    
    if (location === '/') {
      pathTourSteps = defaultSteps;
      setTourType('dashboard');
    } else if (location.includes('/projects')) {
      pathTourSteps = projectSteps;
      setTourType('projects');
    } else if (location.includes('/schedules')) {
      pathTourSteps = scheduleSteps;
      setTourType('schedule');
    }
    
    if (pathTourSteps.length > 0) {
      setSteps(formatSteps(pathTourSteps));
    }
  }, [location]);

  const startTour = (type?: AppTourType) => {
    if (type) {
      setTourType(type);
      
      // Establecer los pasos según el tipo de tour
      switch (type) {
        case 'dashboard':
          setSteps(formatSteps(defaultSteps));
          break;
        case 'projects':
          setSteps(formatSteps(projectSteps));
          break;
        case 'schedule':
          setSteps(formatSteps(scheduleSteps));
          break;
        // Agregar más casos según sea necesario
        default:
          setSteps(formatSteps(defaultSteps));
      }
    }
    
    setRun(true);
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    // Tipos específicos para comparar correctamente
    const FINISHED_STATUS = STATUS.FINISHED as string;
    const SKIPPED_STATUS = STATUS.SKIPPED as string;
    
    if (status === FINISHED_STATUS || status === SKIPPED_STATUS) {
      setRun(false);
      
      if (status === FINISHED_STATUS) {
        toast({
          title: 'Recorrido completado',
          description: '¡Has completado el recorrido de la aplicación!',
          variant: 'default',
        });
      }
    }
  };

  const TourComponent = () => (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#d97706', // amber-600
          textColor: '#1f2937', // gray-800
          backgroundColor: '#ffffff',
          arrowColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        },
        buttonNext: {
          backgroundColor: '#d97706',
          color: '#ffffff',
          fontSize: '14px',
        },
        buttonBack: {
          marginRight: '10px',
          color: '#6b7280',
          fontSize: '14px',
        },
        buttonSkip: {
          color: '#6b7280',
          fontSize: '14px',
        },
      }}
      locale={{
        back: 'Anterior',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Omitir',
      }}
    />
  );

  return {
    startTour,
    tourType,
    run,
    setRun,
    TourComponent,
  };
}