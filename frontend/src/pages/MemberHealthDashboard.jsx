import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import ReportUpload from '../components/medical/ReportUpload';
import MedicalChatbot from '../components/medical/MedicalChatbot';
import HealthOverview from '../components/health/HealthOverview';

const MemberHealthDashboard = () => {
    const { memberId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [member, setMember] = useState(null);
    const [reports, setReports] = useState([]);
    const [labResults, setLabResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Delete confirmation state
    const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false);
    const [showDeleteReportModal, setShowDeleteReportModal] = useState(false);
    const [reportToDelete, setReportToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchMemberData();
        fetchReports();
    }, [memberId]);

    const fetchMemberData = async () => {
        try {
            const { data } = await api.get(`/family/members/${memberId}`);
            setMember(data.member);
        } catch (error) {
            console.error('Error fetching member:', error);
        }
    };

    const fetchReports = async () => {
        try {
            const { data } = await api.get(`/medical/reports/${memberId}`);
            setReports(data.reports);

            if (data.reports.length > 0) {
                fetchLabResults(data.reports[0]._id);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLabResults = async (reportId) => {
        try {
            const { data } = await api.get(`/medical/trends/${memberId}/all`);
            setLabResults(data.results || []);
            setSelectedReport(reportId);
        } catch (error) {
            console.log('Using fallback method for lab results');
        }
    };

    const handleReportUploaded = () => {
        fetchReports();
    };

    // Delete member
    const handleDeleteMember = async () => {
        setDeleting(true);
        try {
            await api.delete(`/family/members/${memberId}`);
            navigate('/');
        } catch (error) {
            console.error('Error deleting member:', error);
            alert('Failed to delete member. Please try again.');
        } finally {
            setDeleting(false);
            setShowDeleteMemberModal(false);
        }
    };

    // Delete report
    const handleDeleteReport = async () => {
        if (!reportToDelete) return;
        setDeleting(true);
        try {
            await api.delete(`/medical/report/${reportToDelete}`);
            setReports(reports.filter(r => r._id !== reportToDelete));
            if (selectedReport === reportToDelete) {
                setSelectedReport(null);
                setLabResults([]);
            }
            setReportToDelete(null);
        } catch (error) {
            console.error('Error deleting report:', error);
            alert('Failed to delete report. Please try again.');
        } finally {
            setDeleting(false);
            setShowDeleteReportModal(false);
        }
    };

    const confirmDeleteReport = (reportId, e) => {
        e.stopPropagation();
        setReportToDelete(reportId);
        setShowDeleteReportModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sand via-white to-sage/10">
                <div className="text-charcoal">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sand via-white to-sage/10 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        onClick={() => navigate('/')}
                        className="mb-4 text-sm"
                    >
                        ← Back to Family Tree
                    </Button>

                    <GlassCard className="p-4 md:p-5">
                        <div className="flex items-center space-x-4">
                            {member?.profilePicture ? (
                                <img
                                    src={`http://localhost:3002${member.profilePicture}`}
                                    alt={member.name}
                                    className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-sage"
                                />
                            ) : (
                                <div
                                    className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                                    style={{ backgroundColor: member?.avatarColor || '#8B9D83' }}
                                >
                                    {member?.name?.charAt(0)}
                                </div>
                            )}

                            <div className="flex-1">
                                <h1 className="text-xl md:text-2xl font-display font-bold text-gradient">
                                    {member?.name}'s Health Records
                                </h1>
                                <p className="text-charcoal/70 text-sm">
                                    {member?.relation} • {member?.age} years
                                </p>
                            </div>

                            {/* Delete Member Button */}
                            {!member?.isAdmin && (
                                <button
                                    onClick={() => setShowDeleteMemberModal(true)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Member"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="flex space-x-2 border-b border-sage/20">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'overview'
                                ? 'text-sage border-b-2 border-sage'
                                : 'text-charcoal/60 hover:text-charcoal'
                                }`}
                        >
                            📊 Health Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'reports'
                                ? 'text-sage border-b-2 border-sage'
                                : 'text-charcoal/60 hover:text-charcoal'
                                }`}
                        >
                            📄 Reports & Results
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'chat'
                                ? 'text-sage border-b-2 border-sage'
                                : 'text-charcoal/60 hover:text-charcoal'
                                }`}
                        >
                            💬 Health Assistant
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' ? (
                    /* Health Overview Tab */
                    <HealthOverview memberId={memberId} />
                ) : activeTab === 'reports' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {/* Upload Section */}
                        <div className="lg:col-span-1">
                            <ReportUpload
                                memberId={memberId}
                                onUploadSuccess={handleReportUploaded}
                            />
                        </div>

                        {/* Reports List */}
                        <div className="lg:col-span-1">
                            <GlassCard className="p-4 md:p-5 h-full">
                                <h2 className="text-lg md:text-xl font-display font-bold text-sage mb-4">
                                    Reports History
                                </h2>

                                {reports.length === 0 ? (
                                    <div className="text-center py-8 text-charcoal/60">
                                        <div className="text-4xl mb-2">📋</div>
                                        <p className="text-sm">No reports yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                        {reports.map((report) => (
                                            <div
                                                key={report._id}
                                                onClick={() => fetchLabResults(report._id)}
                                                className={`p-3 rounded-lg cursor-pointer transition-all ${selectedReport === report._id
                                                    ? 'bg-sage/20 border-2 border-sage'
                                                    : 'bg-white/30 hover:bg-white/50 border-2 border-transparent'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-charcoal text-sm truncate">
                                                            {report.fileName}
                                                        </p>
                                                        <p className="text-xs text-charcoal/60 mt-1">
                                                            {new Date(report.reportDate).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs whitespace-nowrap ${report.extractionStatus === 'completed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : report.extractionStatus === 'failed'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {report.extractionStatus === 'completed' && `${report.markerCount} markers`}
                                                        {report.extractionStatus === 'failed' && 'Failed'}
                                                        {report.extractionStatus === 'processing' && 'Processing'}
                                                    </span>

                                                    {/* Delete Report Button */}
                                                    <button
                                                        onClick={(e) => confirmDeleteReport(report._id, e)}
                                                        className="ml-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete Report"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        </div>

                        {/* Extracted Lab Results */}
                        <div className="lg:col-span-2">
                            <GlassCard className="p-4 md:p-5">
                                <h2 className="text-lg md:text-xl font-display font-bold text-sage mb-4">
                                    Extracted Biomarkers
                                </h2>

                                {labResults.length === 0 ? (
                                    <div className="text-center py-12 text-charcoal/60">
                                        <div className="text-5xl mb-3">🧪</div>
                                        <p className="text-base">No lab results yet</p>
                                        <p className="text-sm mt-1">Upload a medical report to see extracted biomarkers</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {labResults.map((result, index) => (
                                            <div
                                                key={index}
                                                className="p-4 rounded-lg bg-gradient-to-br from-white/40 to-white/20 border border-sage/20 hover:border-sage/40 transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="font-semibold text-charcoal text-sm leading-tight flex-1">
                                                        {result.marker}
                                                    </h3>
                                                    {result.isAbnormal && (
                                                        <span className="ml-2 text-xs text-red-500">⚠️</span>
                                                    )}
                                                </div>
                                                <div className="flex items-baseline space-x-1">
                                                    <span className="text-2xl font-bold text-sage">
                                                        {result.value}
                                                    </span>
                                                    {result.unit && (
                                                        <span className="text-sm text-charcoal/60">
                                                            {result.unit}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-charcoal/50 mt-2">
                                                    {new Date(result.testDate).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        </div>
                    </div>
                ) : (
                    /* Chat Tab */
                    <div className="h-[600px]">
                        <MedicalChatbot memberId={memberId} />
                    </div>
                )}
            </div>

            {/* Delete Member Confirmation Modal */}
            {showDeleteMemberModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-xl font-bold text-charcoal mb-4">Delete Family Member</h3>
                        <p className="text-charcoal/70 mb-6">
                            Are you sure you want to delete <strong>{member?.name}</strong>?
                            This will also delete all their medical reports and lab results.
                            This action cannot be undone.
                        </p>
                        <div className="flex space-x-3 justify-end">
                            <button
                                onClick={() => setShowDeleteMemberModal(false)}
                                className="px-4 py-2 text-charcoal/70 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteMember}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete Member'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Report Confirmation Modal */}
            {showDeleteReportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-xl font-bold text-charcoal mb-4">Delete Report</h3>
                        <p className="text-charcoal/70 mb-6">
                            Are you sure you want to delete this report?
                            All associated lab results will also be deleted.
                            This action cannot be undone.
                        </p>
                        <div className="flex space-x-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteReportModal(false);
                                    setReportToDelete(null);
                                }}
                                className="px-4 py-2 text-charcoal/70 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteReport}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberHealthDashboard;
