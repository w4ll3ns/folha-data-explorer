import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Checkbox } from './checkbox';

interface MultiSelectProps {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ options, value, onChange, placeholder, disabled }) => {
  const [open, setOpen] = useState(false);
  const [temp, setTemp] = useState<string[]>(value);

  const handleConfirm = () => {
    onChange(temp);
    setOpen(false);
  };

  const handleToggle = (val: string) => {
    setTemp(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  React.useEffect(() => {
    if (!open) setTemp(value);
  }, [open, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-64 justify-between" disabled={disabled}>
          <span className="truncate">
            {value.length === 0 ? (placeholder || 'Selecione...') :
              options.filter(o => value.includes(o.value)).map(o => o.label).join(', ')}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 space-y-2">
        <div className="max-h-60 overflow-y-auto space-y-1">
          {options.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-muted">
              <Checkbox checked={temp.includes(opt.value)} onCheckedChange={() => handleToggle(opt.value)} />
              <span className="truncate">{opt.label}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button size="sm" onClick={handleConfirm}>Confirmar</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}; 