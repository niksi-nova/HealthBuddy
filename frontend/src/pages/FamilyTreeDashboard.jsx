import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useFamilyStore from '../store/familyStore';
import api from '../utils/api';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import AddMemberModal from '../components/family/AddMemberModal';
import FamilyTreeVisualization from '../components/family/FamilyTreeVisualization';

const FamilyTreeDashboard = () => {
    const { user, logout } = useAuth();
    const { members, admin, setMembers, setAdmin, addMember } = useFamilyStore();
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFamilyMembers();
    }, []);

    const fetchFamilyMembers = async () => {
        try {
            const { data } = await api.get('/family/members');
            setMembers(data.members);
            setAdmin(data.admin);
        } catch (error) {
            console.error('Failed to fetch family members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleMemberAdded = (newMember) => {
        addMember(newMember);
        setIsModalOpen(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sand via-sage/10 to-terracotta/10 p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-gradient">
                            Health Buddy
                        </h1>
                        <p className="text-charcoal/70 mt-2">Welcome back, {user?.name}</p>
                    </div>
                    <Button variant="ghost" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>

            {/* Family Tree Visualization */}
            <div className="max-w-7xl mx-auto">
                <GlassCard className="min-h-[700px] p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-display font-bold text-sage mb-4">
                            Your Family Tree
                        </h2>
                        <p className="text-charcoal/70 mb-8">
                            {members.length === 0
                                ? 'Add your first family member to grow your tree'
                                : `Growing strong with ${members.length} family member${members.length !== 1 ? 's' : ''}`
                            }
                        </p>
                    </div>

                    {/* Tree Visualization */}
                    {admin && (
                        <FamilyTreeVisualization admin={admin} members={members} />
                    )}
                </GlassCard>
            </div>

            {/* Floating Add Button */}
            <button
                className="floating-btn"
                onClick={() => setIsModalOpen(true)}
                title="Add Family Member"
            >
                +
            </button>

            {/* Add Member Modal */}
            <AddMemberModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onMemberAdded={handleMemberAdded}
            />
        </div>
    );
};

export default FamilyTreeDashboard;
