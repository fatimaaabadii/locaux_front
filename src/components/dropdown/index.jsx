"use client";

import { Button } from "/src/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "/src/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "/src/components/ui/popover";
import { cn } from "/src/lib/utils";
import { FaArrowDown } from "react-icons/fa";
import { MdCheckCircleOutline } from "react-icons/md";
const Dropdown = ({ comboBoxOpen, setComboBoxOpen, value, data, setValue }) => {
  return (
    <Popover open={comboBoxOpen} onOpenChange={setComboBoxOpen}>
      <PopoverTrigger asChild>
        <Button
          id="userInfo"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? data.find((framework) => framework.value === value)?.label
            : "Select data..."}
          <FaArrowDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[46vw] p-0">
        <Command>
          <CommandEmpty>No Users found.</CommandEmpty>
          <CommandGroup>
            {data.map((framework) => (
              <CommandItem
                key={framework.value}
                value={framework.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setComboBoxOpen(false);
                }}
              >
                {framework.label}
                <MdCheckCircleOutline
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === framework.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default Dropdown;
