"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CountryOption {
  iso3: string;
  name: string;
}

interface CountryComboboxProps {
  value?: string | null;          // iso3 code currently selected
  onChange: (iso3: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CountryCombobox({
  value,
  onChange,
  placeholder = "Select country…",
  disabled = false,
}: CountryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<CountryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Load countries once on mount
  useEffect(() => {
    fetch("/api/countries")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: CountryOption[]) => {
        setOptions(data);
        setError(false);
      })
      .catch((err) => {
        console.error("Failed to load countries:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const selected = options.find((o) => o.iso3 === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className="w-full justify-between font-normal h-9"
        >
          {loading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading…
            </span>
          ) : error ? (
            <span className="text-destructive text-sm">
              Failed to load countries
            </span>
          ) : selected ? (
            <span className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {selected.iso3}
              </span>
              {selected.name}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[340px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country…" className="h-9" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {/* Clear option */}
              <CommandItem
                value="__clear__"
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="text-muted-foreground text-sm"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value ? "opacity-100" : "opacity-0"
                  )}
                />
                — None —
              </CommandItem>

              {options.map((o) => (
                <CommandItem
                  key={o.iso3}
                  value={`${o.name} ${o.iso3}`}   // searched string includes both
                  onSelect={() => {
                    onChange(o.iso3 === value ? null : o.iso3);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === o.iso3 ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex items-center gap-2 w-full">
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                      {o.iso3}
                    </span>
                    {o.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
