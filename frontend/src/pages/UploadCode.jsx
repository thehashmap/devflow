import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { codeAnalysisService } from '../service/codeAnalysisService';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';

const UploadCode = () => {
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'paste'
  const [files, setFiles] = useState([]);
  const [pastedCode, setPastedCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [analysisType, setAnalysisType] = useState('full');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const supportedLanguages = [
    { value: 'javascript', label: 'JavaScript', ext: ['.js', '.jsx', '.ts', '.tsx'] },
    { value: 'python', label: 'Python', ext: ['.py'] },
    { value: 'java', label: 'Java', ext: ['.java'] },
    { value: 'csharp', label: 'C#', ext: ['.cs'] },
    { value: 'cpp', label: 'C++', ext: ['.cpp', '.cc', '.cxx'] },
    { value: 'php', label: 'PHP', ext: ['.php'] },
    { value: 'ruby', label: 'Ruby', ext: ['.rb'] },
    { value: 'go', label: 'Go', ext: ['.go'] },
    { value: 'rust', label: 'Rust', ext: ['.rs'] },
    { value: 'swift', label: 'Swift', ext: ['.swift'] }
  ];

  const analysisTypes = [
    { value: 'full', label: 'Full Analysis', description: 'Complete code quality, security, and performance analysis' },
    { value: 'security', label: 'Security Scan', description: 'Focus on security vulnerabilities and best practices' },
    { value: 'performance', label: 'Performance Check', description: 'Analyze performance bottlenecks and optimizations' },
    { value: 'style', label: 'Code Style', description: 'Check coding standards and formatting' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileSelection(droppedFiles);
  };

  const handleFileSelection = (selectedFiles) => {
    const validFiles = selectedFiles.filter(file => {
      const fileName = file.name.toLowerCase();
      const isValidType = supportedLanguages.some(lang => 
        lang.ext.some(ext => fileName.endsWith(ext))
      );
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        addNotification('error', `Unsupported file type: ${file.name}`);
        return false;
      }
      if (!isValidSize) {
        addNotification('error', `File too large: ${file.name} (max 10MB)`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
    
    // Auto-detect language from first file
    if (validFiles.length > 0 && files.length === 0) {
      const firstFile = validFiles[0];
      const detectedLang = supportedLanguages.find(lang =>
        lang.ext.some(ext => firstFile.name.toLowerCase().endsWith(ext))
      );
      if (detectedLang) {
        setLanguage(detectedLang.value);
      }
    }
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFileSelection(selectedFiles);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (uploadMethod === 'file' && files.length === 0) {
      addNotification('error', 'Please select files to upload');
      return;
    }
    
    if (uploadMethod === 'paste' && !pastedCode.trim()) {
      addNotification('error', 'Please paste some code to analyze');
      return;
    }

    setIsUploading(true);

    try {
      let response;
      
      if (uploadMethod === 'file') {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('language', language);
        formData.append('analysisType', analysisType);
        
        response = await codeAnalysisService.uploadFiles(formData);
      } else {
        response = await codeAnalysisService.analyzePastedCode({
          code: pastedCode,
          language,
          analysisType,
          filename: `pasted_code.${supportedLanguages.find(l => l.value === language)?.ext[0]?.slice(1) || 'txt'}`
        });
      }

      if (response.success) {
        addNotification('success', 'Code uploaded successfully! Analysis started.');
        navigate('/analyses', { 
          state: { 
            newAnalysisId: response.data.analysisId,
            showProgress: true 
          }
        });
      } else {
        addNotification('error', response.message || 'Upload failed');
      }
    } catch (error) {
      addNotification('error', error.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Code for Analysis</h1>
        <p className="text-gray-600">
          Upload your code files or paste code directly for comprehensive quality analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Upload Method Selection */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Upload Method</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setUploadMethod('file')}
              className={`p-4 rounded-lg border-2 transition-all ${
                uploadMethod === 'file'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="text-left">
                  <div className="font-medium">Upload Files</div>
                  <div className="text-sm text-gray-500">Select multiple code files</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setUploadMethod('paste')}
              className={`p-4 rounded-lg border-2 transition-all ${
                uploadMethod === 'paste'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="text-left">
                  <div className="font-medium">Paste Code</div>
                  <div className="text-sm text-gray-500">Copy and paste your code</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* File Upload Section */}
        {uploadMethod === 'file' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">File Upload</h3>
            
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag and drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports: {supportedLanguages.map(lang => lang.ext.join(', ')).join(', ')}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Choose Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                accept={supportedLanguages.flatMap(lang => lang.ext).join(',')}
              />
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Selected Files ({files.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center space-x-3">
                        <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{file.name}</div>
                          <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Paste Code Section */}
        {uploadMethod === 'paste' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Paste Your Code</h3>
            <textarea
              value={pastedCode}
              onChange={(e) => setPastedCode(e.target.value)}
              placeholder="Paste your code here..."
              className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-2 text-sm text-gray-500">
              {pastedCode.trim().split('\n').length} lines, {pastedCode.length} characters
            </div>
          </div>
        )}

        {/* Configuration */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programming Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {supportedLanguages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Analysis Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Type
              </label>
              <select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {analysisTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {analysisTypes.find(t => t.value === analysisType)?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || (uploadMethod === 'file' && files.length === 0) || (uploadMethod === 'paste' && !pastedCode.trim())}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isUploading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Start Analysis</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadCode;