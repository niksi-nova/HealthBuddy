import { useState } from 'react';
import api from '../../utils/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import GlassCard from '../ui/GlassCard';

const ReportUpload = ({ memberId, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [reportDate, setReportDate] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (selectedFile) => {
        // Validate file type
        if (selectedFile.type !== 'application/pdf') {
            setError('Please select a PDF file');
            return;
        }

        // Validate file size (10MB max)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        setFile(selectedFile);
        setError('');
        setSuccess('');
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!file) {
            setError('Please select a file');
            return;
        }

        if (!reportDate) {
            setError('Please select a report date');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('report', file);
            formData.append('reportDate', reportDate);

            const { data } = await api.post(`/medical/upload/${memberId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess(`✓ Successfully extracted ${data.markerCount} biomarkers`);
            setFile(null);
            setReportDate('');

            // Notify parent component
            if (onUploadSuccess) {
                onUploadSuccess(data);
            }

        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <GlassCard className="p-4 md:p-5 h-full">
            <h2 className="text-lg md:text-xl font-display font-bold text-sage mb-4">
                Upload New Report
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* File Upload Area */}
                <div
                    className={`border-2 border-dashed rounded-card p-4 md:p-6 text-center transition-all ${dragActive
                        ? 'border-sage bg-sage/10'
                        : 'border-sage/30 hover:border-sage/50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileInput}
                        className="hidden"
                        id="file-upload"
                    />

                    {!file ? (
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer block"
                        >
                            <div className="text-3xl md:text-4xl mb-2">📄</div>
                            <p className="text-charcoal font-medium mb-1 text-sm">
                                Drop PDF here or click
                            </p>
                            <p className="text-xs text-charcoal/60">
                                Max 10MB
                            </p>
                        </label>
                    ) : (
                        <div className="space-y-2">
                            <div className="text-3xl md:text-4xl">✓</div>
                            <p className="font-medium text-charcoal text-sm">
                                {file.name}
                            </p>
                            <p className="text-xs text-charcoal/60">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <button
                                type="button"
                                onClick={() => setFile(null)}
                                className="text-xs text-red-500 hover:text-red-700 transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </div>

                {/* Report Date */}
                <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                        Report Date
                    </label>
                    <input
                        type="date"
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 rounded-input glass-input text-charcoal focus:outline-none focus:ring-2 focus:ring-sage transition-all text-sm md:text-base"
                        required
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 md:p-4 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-red-700 text-sm md:text-base">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="p-3 md:p-4 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-green-700 text-sm md:text-base">{success}</p>
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={!file || !reportDate || uploading}
                    className="w-full text-sm md:text-base"
                >
                    {uploading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        '🔍 Upload & Extract'
                    )}
                </Button>
            </form>
        </GlassCard>
    );
};

export default ReportUpload;
