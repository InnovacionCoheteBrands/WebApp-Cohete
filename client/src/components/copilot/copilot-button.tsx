import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, X } from "lucide-react";
import CopilotDrawer from "./copilot-drawer";

export default function CopilotButton() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Button
        onClick={toggleDrawer}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-40"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </Button>

      <CopilotDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}