import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatBRL = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export type TabId =
  | "cover"
  | "evolution"
  | "staffing"
  | "hr"
  | "early-years"
  | "lower-school"
  | "ms"
  | "hs"
  | "load"
  | "non-teaching"
  | "payroll";
