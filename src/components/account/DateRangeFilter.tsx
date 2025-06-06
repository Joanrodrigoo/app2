

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  dateRange: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
}

const DateRangeFilter = ({ dateRange, onChange }: DateRangeFilterProps) => {
  const [mode, setMode] = useState<"single" | "range">("range");
  const [isOpen, setIsOpen] = useState(false);

  const today = new Date();
  
  const presets = [
    {
      label: "Hoy",
      value: "today",
      range: { from: today, to: today }
    },
    {
      label: "Este mes",
      value: "this-month",
      range: { from: startOfMonth(today), to: today }
    },
    {
      label: "Último mes",
      value: "last-month",
      range: { from: startOfMonth(subMonths(today, 1)), to: endOfMonth(subMonths(today, 1)) }
    },
    {
      label: "Este año",
      value: "this-year",
      range: { from: startOfYear(today), to: today }
    }
  ];

  const handlePresetSelect = (value: string) => {
    const preset = presets.find(p => p.value === value);
    if (preset) {
      onChange(preset.range);
      setIsOpen(false);
    }
  };

  const handleCalendarSelect = (selected: any) => {
    console.log("Calendar selected:", selected);
    
    if (mode === "single" && selected) {
      onChange({ from: selected, to: selected });
      setIsOpen(false);
    } else if (mode === "range") {
      // Si no hay selección, no hacer nada
      if (!selected) return;
      
      // Si solo hay 'from' (primera fecha seleccionada), mantener abierto
      if (selected.from && !selected.to) {
        console.log("Primera fecha seleccionada, manteniendo calendario abierto");
        // No cerrar el popover, esperar a la segunda selección
        return;
      }
      
      // Si hay ambas fechas, cerrar el popover
      if (selected.from && selected.to) {
        console.log("Ambas fechas seleccionadas, cerrando calendario");
        onChange({ from: selected.from, to: selected.to });
        setIsOpen(false);
      }
    }
  };

  const formatDateDisplay = () => {
    if (dateRange.from.getTime() === dateRange.to.getTime()) {
      return format(dateRange.from, "dd/MM/yy");
    }
    return `${format(dateRange.from, "dd/MM/yy")} - ${format(dateRange.to, "dd/MM/yy")}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateDisplay()}
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex gap-2 mb-3">
            <Button
              variant={mode === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("single")}
            >
              Día específico
            </Button>
            <Button
              variant={mode === "range" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("range")}
            >
              Rango de fechas
            </Button>
          </div>
          
          {mode === "range" && (
            <Select onValueChange={handlePresetSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Opciones rápidas" />
              </SelectTrigger>
              <SelectContent>
                {presets.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="p-0">
          {mode === "single" ? (
            <Calendar
              mode="single"
              selected={dateRange.from}
              onSelect={handleCalendarSelect}
              disabled={(date) => date > today}
              className={cn("pointer-events-auto")}
            />
          ) : (
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              disabled={(date) => date > today}
              className={cn("pointer-events-auto")}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeFilter;
