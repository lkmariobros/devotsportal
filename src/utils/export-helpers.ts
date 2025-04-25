/**
 * Utility functions for exporting data to different formats
 */

// Export data to CSV format
export function exportToCsv(data: any, filename: string) {
  // Convert data to CSV format
  const csvContent = convertToCSV(data);
  
  // Create a blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export data to Excel format
export function exportToExcel(data: any, filename: string) {
  // For Excel export, you might want to use a library like xlsx
  // This is a placeholder - in a real implementation, you'd use a library
  console.log('Excel export not implemented yet');
  alert('Excel export not implemented yet');
}

// Helper function to convert JSON to CSV
function convertToCSV(objArray: any) {
  if (!objArray || typeof objArray !== 'object') return '';
  
  // Handle nested objects by flattening them
  const flattenedData = flattenObject(objArray);
  
  // Get headers
  const headers = Object.keys(flattenedData).join(',');
  
  // Get values
  const values = Object.values(flattenedData)
    .map(value => typeof value === 'string' ? `"${value}"` : value)
    .join(',');
  
  return headers + '\n' + values;
}

// Helper function to flatten nested objects
function flattenObject(obj: any, prefix = '') {
  return Object.keys(obj).reduce((acc: any, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}
