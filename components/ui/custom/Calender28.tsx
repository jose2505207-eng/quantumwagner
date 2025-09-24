"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function formatISO(date: Date | undefined) {
  if (!date) return "";
  const midnightUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return midnightUTC.toISOString();
}

function isValidDate(date: Date | undefined) {
  return date instanceof Date && !isNaN(date.getTime());
}

interface Calendar28Props {
  value?: Date;
  onChange?: (isoDate?: string, dateObj?: Date) => void; 
}

export function Calendar28({
  value: controlledValue,
  onChange,
}: Calendar28Props) {
  const [open, setOpen] = React.useState(false);

  const [date, setDate] = React.useState<Date | undefined>(
    controlledValue ?? new Date("2025-06-01")
  );
  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [inputValue, setInputValue] = React.useState(formatISO(date));

  React.useEffect(() => {
    if (controlledValue) {
      setDate(controlledValue);
      setMonth(controlledValue);
      setInputValue(formatISO(controlledValue));
    }
  }, [controlledValue]);

  const handleSelect = (newDate?: Date) => {
    if (!newDate) return;
    const midnightUTC = new Date(Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()));
    setDate(midnightUTC);
    setMonth(midnightUTC);
    setInputValue(formatISO(midnightUTC));
    setOpen(false);
    onChange?.(midnightUTC.toISOString(), midnightUTC);
  };

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1">
        Subscription Date
      </Label>
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={inputValue}
          placeholder="2025-09-30T00:00:00.000Z"
          className="bg-background pr-10"
          onChange={(e) => {
            const newDate = new Date(e.target.value);
            setInputValue(e.target.value);
            if (isValidDate(newDate)) {
              handleSelect(newDate);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={handleSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
