import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

export function exportToCSV(data: any[], fileName: string) {
  if (data.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  // Get all unique keys from all objects to ensure consistent columns
  const allKeys = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));

  const headers = allKeys.join(';');
  const rows = data.map(obj =>
    allKeys.map(key => {
      const val = obj[key];
      let cell = val === null || val === undefined ? '' : String(val);
      cell = cell.replace(/"/g, '""');
      if (cell.includes(';') || cell.includes('\n') || cell.includes('"')) {
        cell = `"${cell}"`;
      }
      return cell;
    }).join(';')
  ).join('\r\n');

  const csvContent = "\uFEFF" + headers + "\r\n" + rows;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
