import { useParams, useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';

const MemberHealthDashboard = () => {
    const { memberId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-sand via-sage/10 to-terracotta/10 p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <Button variant="ghost" onClick={() => navigate('/')}>
                    ← Back to Family Tree
                </Button>
            </div>

            {/* Health Dashboard */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Section */}
                <GlassCard className="lg:col-span-1">
                    <h2 className="text-xl font-display font-bold text-sage mb-4">
                        Upload Medical Report
                    </h2>
                    <div className="border-2 border-dashed border-sage/30 rounded-card p-8 text-center">
                        <p className="text-charcoal/70 mb-4">
                            Drag & drop or click to upload
                        </p>
                        <p className="text-sm text-charcoal/50">
                            PDF or Image files (max 10MB)
                        </p>
                    </div>
                </GlassCard>

                {/* Records View */}
                <GlassCard className="lg:col-span-2">
                    <h2 className="text-xl font-display font-bold text-sage mb-4">
                        Medical Records
                    </h2>
                    <p className="text-charcoal/70">
                        No records uploaded yet. Upload your first medical report to get started.
                    </p>
                </GlassCard>

                {/* AI Chatbot */}
                <GlassCard className="lg:col-span-3">
                    <h2 className="text-xl font-display font-bold text-sage mb-4">
                        AI Health Assistant
                    </h2>
                    <div className="h-96 flex items-center justify-center text-charcoal/70">
                        Upload medical records to start asking questions
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default MemberHealthDashboard;
