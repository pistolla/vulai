import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ExportButtonsProps {
  data: any[];
  headers: string[];
  filename: string;
}

export default function ExportButtons({ data, headers, filename }: ExportButtonsProps) {
  const exportToCSV = () => {
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header] || '';
          // Escape quotes and wrap in quotes if contains comma or quote
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`${filename} Export`, 14, 16);

    const tableData = data.map(row => headers.map(header => row[header] || ''));

    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="flex space-x-2 mb-4">
      <button
        onClick={exportToCSV}
        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
      >
        Export CSV
      </button>
      <button
        onClick={exportToJSON}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
      >
        Export JSON
      </button>
      <button
        onClick={exportToPDF}
        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
      >
        Export PDF
      </button>
    </div>
  );
}