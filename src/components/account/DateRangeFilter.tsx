
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  dateRange: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
}

const DateRangeFilter = ({ dateRange, onChange }: DateRangeFilterProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[260px] justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange.from && dateRange.to ? (
            <>
              {format(dateRange.from, "dd/MM/yy")} - {format(dateRange.to, "dd/MM/yy")}
            </>
          ) : (
            <span>Seleccionar período</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <Calendar
            mode="range"
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onChange({ from: range.from, to: range.to });
              }
            }}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeFilter;
