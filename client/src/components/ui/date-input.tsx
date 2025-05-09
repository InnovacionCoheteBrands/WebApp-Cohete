import React from "react";
import { CalendarIcon } from "lucide-react";

interface DateInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DateInput({ value, onChange, placeholder = "Seleccionar fecha" }: DateInputProps) {
  // Esta función garantiza que la fecha seleccionada se preserve tal cual
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      // Directamente usamos el valor del input, que ya viene en formato YYYY-MM-DD
      // Evitamos crear un objeto Date para prevenir ajustes por zona horaria
      onChange(e.target.value);
    }
  };

  // Para mostrar la fecha en formato español, necesitamos convertirla pero sólo para visualización
  const getFormattedDate = () => {
    if (!value) return placeholder;
    
    try {
      // Separamos los componentes de la fecha directamente del string
      const [year, month, day] = value.split('-').map(Number);
      
      // Creamos la fecha asegurando que se usa la fecha exacta
      // Usamos mes-1 porque en JS los meses son base 0 (enero=0)
      return new Date(year, month-1, day).toLocaleDateString('es-ES');
    } catch (e) {
      return placeholder;
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <div className="relative w-full h-11">
        <input
          type="date"
          className="absolute inset-0 w-full h-11 cursor-pointer pl-10 pr-4 py-2 border rounded-md dark:bg-[#1e293b] dark:border-[#3e4a6d] dark:text-white"
          value={value || ''}
          onChange={handleChange}
        />
        {/* Esta div sólo es visual y muestra la fecha formateada */}
        <div className="absolute inset-0 h-11 w-full flex items-center pointer-events-none px-3 pl-10 dark:text-white">
          {getFormattedDate()}
        </div>
      </div>
    </div>
  );
}