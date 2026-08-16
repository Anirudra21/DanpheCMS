'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/cms-utils';
import { Label } from '@/components/ui/label';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Pick a date',
}: DatePickerProps) {
  const date = value ? new Date(value) : undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm font-medium text-slate-700">{label}</Label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'h-9 w-full justify-start text-left font-normal text-sm',
              !date && 'text-slate-400'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'MMM d, yyyy') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (d) {
                onChange(d.toISOString());
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
