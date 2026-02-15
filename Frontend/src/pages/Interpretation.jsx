import React from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  FiArrowLeft,
  FiCopy,
  FiDownload,
  FiCheckCircle,
  FiFileText,
  FiCalendar,
  FiMapPin,
  FiLayers,
} from "react-icons/fi";

const Interpretation = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const interpretationData = location.state?.interpretation;

  if (!interpretationData) {
    navigate(`/well/${id}`);
  }
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(interpretationData.interpretation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([interpretationData.interpretation], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = `${interpretationData.wellName}_interpretation_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate(`/well/${id}`)}
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" size={20} />
          Back to Well Details
        </button>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-opacity-20 p-4 rounded-lg">
                    <FiFileText className="text-white" size={60} />
                  </div>
                  <div className="text-white">
                    <h1 className="text-3xl font-bold mb-1">
                      AI Interpretation Report
                    </h1>
                    <p className="text-green-100 text-lg">
                      {interpretationData.wellName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                {copied ? (
                  <>
                    <FiCheckCircle className="mr-2" size={20} />
                    Copied!
                  </>
                ) : (
                  <>
                    <FiCopy className="mr-2" size={20} />
                    Copy Report
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg"
              >
                <FiDownload className="mr-2" size={20} />
                Download Report
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Analysis Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FiLayers className="text-blue-600" size={20} />
                  <span className="text-sm font-medium text-gray-600">
                    Depth Range
                  </span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {interpretationData.depthRange.start.toLocaleString()} -{" "}
                  {interpretationData.depthRange.end.toLocaleString()}{" "}
                  {interpretationData.depthRange.unit}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FiFileText className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-gray-600">
                    Curves Analyzed
                  </span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {interpretationData.analyzedCurves.length} Curves
                </p>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {interpretationData.analyzedCurves.join(", ")}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FiMapPin className="text-purple-600" size={20} />
                  <span className="text-sm font-medium text-gray-600">
                    Data Points
                  </span>
                </div>
                <p className="text-lg font-bold text-purple-600">
                  {interpretationData.dataPointsAnalyzed.toLocaleString()}
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FiCalendar className="text-orange-600" size={20} />
                  <span className="text-sm font-medium text-gray-600">
                    Generated
                  </span>
                </div>
                <p className="text-sm font-semibold text-orange-600">
                  {formatDate(interpretationData.timestamp)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-100 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Detailed Interpretation
              </h2>
            </div>
            <div className="p-6 prose prose-sm md:prose-base lg:prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1
                      className="text-3xl font-bold text-gray-900 mb-4 mt-6"
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      className="text-2xl font-bold text-gray-800 mb-3 mt-6 pb-2 border-b-2 border-blue-500"
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      className="text-xl font-bold text-gray-800 mb-2 mt-4"
                      {...props}
                    />
                  ),
                  h4: ({ node, ...props }) => (
                    <h4
                      className="text-lg font-semibold text-gray-700 mb-2 mt-3"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p
                      className="text-gray-700 mb-4 leading-relaxed"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul
                      className="list-disc list-inside mb-4 space-y-2 text-gray-700"
                      {...props}
                    />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol
                      className="list-decimal list-inside mb-4 space-y-2 text-gray-700"
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="ml-4" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-gray-900" {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <em className="italic text-gray-800" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4"
                      {...props}
                    />
                  ),
                  code: ({ node, inline, ...props }) =>
                    inline ? (
                      <code
                        className="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono"
                        {...props}
                      />
                    ) : (
                      <code
                        className="block bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto"
                        {...props}
                      />
                    ),
                  hr: ({ node, ...props }) => (
                    <hr
                      className="my-6 border-t-2 border-gray-300"
                      {...props}
                    />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4">
                      <table
                        className="min-w-full border border-gray-300"
                        {...props}
                      />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th
                      className="bg-gray-100 border border-gray-300 px-4 py-2 font-semibold text-left"
                      {...props}
                    />
                  ),
                  td: ({ node, ...props }) => (
                    <td
                      className="border border-gray-300 px-4 py-2"
                      {...props}
                    />
                  ),
                }}
              >
                {interpretationData.interpretation}
              </ReactMarkdown>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(`/visualize/${id}`)}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              View Visualization
            </button>
            <button
              onClick={() => navigate(`/well/${id}`)}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors shadow-md hover:shadow-lg"
            >
              Back to Well Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interpretation;
