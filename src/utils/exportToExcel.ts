import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], filename: string) => {
    // Determine Worksheet from JSON data
    const ws = XLSX.utils.json_to_sheet(data);

    // Apply basic column widths
    const cols = Object.keys(data[0] || {}).map((key) => ({
        wch: Math.max(key.length, 10) // dynamically set minimum width
    }));
    ws['!cols'] = cols;

    // Build the workbook and attach the sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");

    // Format the date for the filename
    const dateFormatted = new Date().toISOString().split('T')[0];
    const finalFilename = `${filename}_${dateFormatted}.xlsx`;

    // Trigger the file download
    XLSX.writeFile(wb, finalFilename);
};
