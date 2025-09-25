"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Calendar28Props {
  value?: Date;
  onChange?: (isoDate?: string, dateObj?: Date) => void;
}

export function Calendar28({
  value: controlledValue,
  onChange,
}: Calendar28Props) {
  const [open, setOpen] = React.useState(false);

  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [month, setMonth] = React.useState<Date | undefined>(undefined);

  const [isoValue, setIsoValue] = React.useState(""); // start empty!

  const humanReadable = date
    ? `${format(date, "EEE, MMM d, yyyy HH:mm")} (${formatDistanceToNow(date, {
        addSuffix: true,
      })})`
    : "";

  React.useEffect(() => {
    if (controlledValue) {
      setDate(controlledValue);
      setMonth(controlledValue);
      setIsoValue(controlledValue.toISOString());
    }
  }, [controlledValue]);

  const handleSelect = (newDate?: Date) => {
    if (!newDate) return;
    const finalDate = new Date(
      Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())
    );
    setDate(finalDate);
    setMonth(finalDate);
    setIsoValue(finalDate.toISOString());
    setOpen(false);
    onChange?.(finalDate.toISOString(), finalDate);
  };

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="end_time" className="px-1">
        Market Ends Date <span className="text-red-500">*</span>
      </Label>

      <div className="relative flex gap-2">
        <Input
          value={humanReadable}
          readOnly
          placeholder="Pick a date"
          className="bg-background pr-10"
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
              type="button"
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
              disabled={{ before: new Date() }}
            />
          </PopoverContent>
        </Popover>
      </div>

    </div>
  );
}
