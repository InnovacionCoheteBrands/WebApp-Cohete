import React from "react";
import { CalendarIcon } from "lucide-react";

interface DateInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DateInput({ value, onChange, placeholder = "Seleccionar fecha" }: DateInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const selectedDate = new Date(e.target.value);
      selectedDate.setHours(12);
      onChange(selectedDate.toISOString().split('T')[0]);
    }
  };

  const formattedValue = value ? new Date(value).toLocaleDateString('es-ES') : placeholder;

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <div className="relative w-full h-11">
        <input
          type="date"
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
          value={value || ''}
          onChange={handleChange}
        />
        <div className="h-11 w-full flex items-center border rounded-md px-3 pl-10 dark:bg-[#1e293b] dark:border-[#3e4a6d] dark:text-white">
          {formattedValue}
        </div>
      </div>
    </div>
  );
}