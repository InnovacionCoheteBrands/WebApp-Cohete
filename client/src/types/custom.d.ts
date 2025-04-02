declare module '*/copilot-drawer' {
  interface CopilotDrawerProps {
    isOpen: boolean;
    onClose: () => void;
  }
  const CopilotDrawer: React.FC<CopilotDrawerProps>;
  export default CopilotDrawer;
}