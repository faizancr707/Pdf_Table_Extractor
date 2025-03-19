
import React, { useState } from 'react';
import { Upload, Database } from 'lucide-react';

function App() {
  const [tableData, setTableData] = useState(null);
  const [savedTables, setSavedTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to process PDF');

      const data = await response.json();
      setTableData({
        headers: data.tableData[0],
        rows: data.tableData.slice(1),
      });
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedTables = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tables');
      const data = await res.json();
      setSavedTables(data);
    } catch {
      setError('Failed to fetch saved tables');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">PDF Table Extractor</h1>

          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 mb-6">
            <Upload className="w-8 h-8 mb-4 text-gray-500" />
            <p className="text-sm">Click to upload PDF</p>
            <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
          </label>

          <button
            onClick={fetchSavedTables}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6"
          >
            <Database className="w-5 h-5 mr-2" /> Fetch Saved Tables
          </button>

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {tableData && <TableDisplay tableData={tableData} />}
          {savedTables.map((entry, index) => (
            <TableDisplay key={index} tableData={{
              headers: entry.tableData[0],
              rows: entry.tableData.slice(1),
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

const TableDisplay = ({ tableData }) => (
  <div className="overflow-x-auto mb-8">
    <table className="min-w-full border">
      <thead className="bg-gray-200">
        <tr>
          {tableData.headers.map((header, index) => (
            <th key={index} className="border px-4 py-2">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tableData.rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="border px-4 py-2">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default App;
