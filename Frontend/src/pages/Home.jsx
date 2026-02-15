import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiFile,
} from "react-icons/fi";
import axios from "axios";
import { ApiContext } from "../context/ApiContext.jsx";

const Home = () => {
  const {url} = useContext(ApiContext);

  const [files, setFiles] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFile = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${url}/data/getallfiles`);
        // console.log("Fetched files:", response.data.data);
        if (!response.data.success) {
          console.error("Failed to fetch files:", response.data.error);
        }
        setFiles(response.data.data);
        setCount(response.data.count);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
      finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleViewDetails = (fileId) => {
    navigate(`/well/${fileId}`);
  }

  const handleVisualize = (fileId) => {
    navigate(`/visualize/${fileId}`);
  }

  const handleDelete = async (fileId, fileName) => {
    if (window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      try {
        const response = await axios.delete(`${url}/data/delete/${fileId}`);
        //    console.log(response)
        if (response.data.success) {
          setFiles(files.filter((file) => file._id !== fileId));
          setCount(count - 1);
        } else {
          console.error("Failed to delete file:", response.data.error);
        }
      } catch (error) {
        console.error("Error deleting file:", error);
      }
      console.log("Deleting file:", fileId);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Well Log Files
            </h1>
            <p className="text-gray-800">Visualize and analyze LAS files</p>
          </div>

          <button
            onClick={() => {navigate("/upload")}}
            className="mt-2 md:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-100 shadow-md hover:shadow-lg"
          >
            <FiPlus className="mr-2" size={20} />
            Upload New File
          </button>
        </div>

        {count === 0 ? (
          // Empty
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiFile className="w-24 h-24 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No Files Yet
            </h2>
            <p className="text-gray-500 mb-6">
              Upload your first LAS file to get started
            </p>
          </div>
        ) : (
          // Files Grid
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {files.map((file) => (
              <div
                key={file._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className="bg-blue-600 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <FiFile className="text-white" size={32} />
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {file.wellInfo.wellName}
                        </h3>
                        <p className="text-white text-sm">
                          {file.originalName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center text-gray-700">
                    <span className="text-md">
                      <span className="font-bold">Depth: </span>
                      {file.wellInfo.startDepth.toLocaleString()} - {file.wellInfo.stopDepth.toLocaleString()} {file.wellInfo.depthUnit}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <span className="text-md">
                      <span className="font-bold">Data Points: </span>
                      {file.stats.totalDataPoints.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-500 text-xs pt-2 border-t">
                    Uploaded: {formatDate(file.uploadDate)}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 px-4 pb-4">
                  <button
                    onClick={() => handleVisualize(file._id)}
                    className="flex-1 px-4 py-2 bg-blue-200 text-blue-600 font-medium rounded-lg hover:bg-blue-300 transition-colors duration-100"
                  >
                    Visualize
                  </button>

                  <button
                    onClick={() => handleViewDetails(file._id)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-100"
                  >
                    Details
                  </button>

                  <button
                    onClick={() => handleDelete(file._id, file.originalName)}
                    className="flex-1 px-4 py-2 bg-red-100 text-red-600 font-medium rounded-lg hover:bg-red-300 transition-colors duration-100"
                  >
                    Delete
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
