import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, EmployeeContextType } from '@/types/employee';

const STORAGE_KEY = 'folha:employees';

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployeesState] = useState<Employee[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Carregar do localStorage ao inicializar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setEmployeesState(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setInitialized(true);
  }, []);

  // Salvar no localStorage sempre que mudar, mas só se já inicializou e não for array vazio
  useEffect(() => {
    if (!initialized) return;
    if (employees.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    }
  }, [employees, initialized]);

  // Setter que também salva no localStorage, mas só limpa se explicitamente
  const setEmployees = (emps: Employee[]) => {
    setEmployeesState(emps);
    if (emps.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emps));
    } else {
      // Limpeza explícita
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <EmployeeContext.Provider value={{ employees, setEmployees }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export function useEmployees() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error('useEmployees deve ser usado dentro de EmployeeProvider');
  return ctx;
} 