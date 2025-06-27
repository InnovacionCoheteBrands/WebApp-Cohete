import { createContext, useContext, useState, ReactNode } from 'react';

interface AppTourContextType {
  startTour: (tourType: string) => void;
  isActive: boolean;
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
}

const AppTourContext = createContext<AppTourContextType | undefined>(undefined);

export function AppTourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startTour = (tourType: string) => {
    setIsActive(true);
    setCurrentStep(0);
    // TODO: Implement tour logic based on tourType
    console.log(`Starting tour: ${tourType}`);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const endTour = () => {
    setIsActive(false);
    setCurrentStep(0);
  };

  return (
    <AppTourContext.Provider value={{
      startTour,
      isActive,
      currentStep,
      nextStep,
      prevStep,
      endTour
    }}>
      {children}
    </AppTourContext.Provider>
  );
}

export function useAppTourContext() {
  const context = useContext(AppTourContext);
  if (context === undefined) {
    throw new Error('useAppTourContext must be used within an AppTourProvider');
  }
  return context;
}