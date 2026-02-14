import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiPlus, 
  FiFile, 
  FiTrash2, 
  FiCalendar, 
  FiArrowDown, 
  FiBarChart2, 
  FiDatabase 
} from 'react-icons/fi';

const Home = () => {
  // Mock data - replace with your API data later
  const files = [
    {
      _id: '1',
      originalName: 'sample.las',
      wellInfo: {
        wellName: 'WELL-001',
        startDepth: 8665,
        stopDepth: 20035,
        depthUnit: 'F'
      },
      stats: {
        totalDataPoints: 11371
      },
      curves: new Array(104),
      uploadDate: '2026-02-13T10:30:00.000Z'
    },
    {
      _id: '2',
      originalName: 'test_well.las',
      wellInfo: {
        wellName: 'WELL-002',
        startDepth: 1000,
        stopDepth: 1500,
        depthUnit: 'M'
      },
      stats: {
        totalDataPoints: 500
      },
      curves: new Array(25),
      uploadDate: '2026-02-12T14:20:00.000Z'
    },
    {
      _id: '3',
      originalName: 'deep_well.las',
      wellInfo: {
        wellName: 'WELL-003',
        startDepth: 5000,
        stopDepth: 8000,
        depthUnit: 'F'
      },
      stats: {
        totalDataPoints: 3000
      },
      curves: new Array(50),
      uploadDate: '2026-02-11T09:15:00.000Z'
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleDelete = (fileId, fileName) => {
    if (window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      // Your delete API call here
      console.log('Deleting file:', fileId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              My Well Log Files
            </h1>
            <p className="text-gray-600">
              Manage and visualize your LAS files
            </p>
          </div>
          
          <Link
            to="/upload"
            className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <FiPlus className="mr-2" size={20} />
            Upload New File
          </Link>
        </div>

        {/* Files Grid */}
        {files.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiFile className="w-24 h-24 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No Files Yet
            </h2>
            <p className="text-gray-500 mb-6">
              Upload your first LAS file to get started
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="mr-2" size={20} />
              Upload File
            </Link>
          </div>
        ) : (
          // Files Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
              <div
                key={file._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <FiFile className="text-white" size={32} />
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {file.wellInfo.wellName}
                        </h3>
                        <p className="text-blue-100 text-sm">
                          {file.originalName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Depth Range */}
                  <div className="flex items-center text-gray-700">
                    <FiArrowDown className="mr-2 text-blue-500" size={20} />
                    <span className="text-sm">
                      <span className="font-semibold">Depth:</span>{' '}
                      {file.wellInfo.startDepth.toLocaleString()} - {file.wellInfo.stopDepth.toLocaleString()} {file.wellInfo.depthUnit}
                    </span>
                  </div>

                  {/* Number of Curves */}
                  <div className="flex items-center text-gray-700">
                    <FiBarChart2 className="mr-2 text-green-500" size={20} />
                    <span className="text-sm">
                      <span className="font-semibold">Curves:</span>{' '}
                      {file.curves.length}
                    </span>
                  </div>

                  {/* Data Points */}
                  <div className="flex items-center text-gray-700">
                    <FiDatabase className="mr-2 text-purple-500" size={20} />
                    <span className="text-sm">
                      <span className="font-semibold">Data Points:</span>{' '}
                      {file.stats.totalDataPoints.toLocaleString()}
                    </span>
                  </div>

                  {/* Upload Date */}
                  <div className="flex items-center text-gray-500 text-xs pt-2 border-t">
                    <FiCalendar className="mr-1" size={16} />
                    Uploaded: {formatDate(file.uploadDate)}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-4 pb-4 flex space-x-2">
                  <Link
                    to={`/visualize/${file._id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-center font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Visualize
                  </Link>
                  <button
                    onClick={() => handleDelete(file._id, file.originalName)}
                    className="px-4 py-2 bg-red-100 text-red-600 font-medium rounded-lg hover:bg-red-200 transition-colors duration-200"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;