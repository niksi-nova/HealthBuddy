import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import api from '../../utils/api';

const RELATIONS = [
    'Parent',
    'Spouse',
    'Child',
    'Sibling',
    'Grandparent',
    'Grandchild',
    'Uncle/Aunt',
    'Nephew/Niece',
    'Cousin',
    'Other'
];

const AddMemberModal = ({ isOpen, onClose, onMemberAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        relation: 'Child',
        age: '',
        gender: 'Male',
        existingConditions: ''
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }

            setProfilePicture(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const removeImage = () => {
        setProfilePicture(null);
        setPreviewUrl(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Convert existingConditions string to array
            const conditions = formData.existingConditions
                .split(',')
                .map(c => c.trim())
                .filter(c => c.length > 0);

            // Use FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('relation', formData.relation);
            formDataToSend.append('age', parseInt(formData.age));
            formDataToSend.append('gender', formData.gender);
            formDataToSend.append('existingConditions', JSON.stringify(conditions));

            // Add profile picture if selected
            if (profilePicture) {
                formDataToSend.append('profilePicture', profilePicture);
            }

            const { data } = await api.post('/family/members', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Success - notify parent and close modal
            onMemberAdded(data.member);
            handleClose();
        } catch (err) {
            console.error('Add member error:', err.response?.data);
            const errorMsg = err.response?.data?.errors
                ? err.response.data.errors.map(e => e.msg).join(', ')
                : err.response?.data?.message || 'Failed to add family member';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Reset form
        setFormData({
            name: '',
            relation: 'Child',
            age: '',
            gender: 'Male',
            existingConditions: ''
        });
        setProfilePicture(null);
        setPreviewUrl(null);
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add Family Member">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="text"
                    name="name"
                    label="Full Name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                {/* Profile Picture Upload */}
                <div className="w-full">
                    <label className="block text-sm font-medium text-charcoal mb-2">
                        Profile Picture (Optional)
                    </label>

                    {previewUrl ? (
                        <div className="flex items-center space-x-4">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-20 h-20 rounded-full object-cover border-2 border-sage"
                            />
                            <div className="flex-1">
                                <p className="text-sm text-charcoal/70 mb-2">
                                    {profilePicture?.name}
                                </p>
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="text-sm text-red-500 hover:text-red-700 transition-colors"
                                >
                                    Remove Image
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="profile-picture-input"
                            />
                            <label
                                htmlFor="profile-picture-input"
                                className="flex items-center justify-center w-full px-4 py-3 rounded-input glass-input text-charcoal cursor-pointer hover:border-sage transition-colors"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                Choose Image
                            </label>
                        </div>
                    )}
                    <p className="text-xs text-charcoal/50 mt-1">
                        Max size: 5MB. Supported formats: JPG, PNG, GIF
                    </p>
                </div>

                <div className="w-full">
                    <label className="block text-sm font-medium text-charcoal mb-2">
                        Relation
                    </label>
                    <select
                        name="relation"
                        value={formData.relation}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-input glass-input text-charcoal"
                        required
                    >
                        {RELATIONS.map((relation) => (
                            <option key={relation} value={relation}>
                                {relation}
                            </option>
                        ))}
                    </select>
                </div>

                <Input
                    type="number"
                    name="age"
                    label="Age"
                    placeholder="30"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="0"
                    max="120"
                />

                <div className="w-full">
                    <label className="block text-sm font-medium text-charcoal mb-2">
                        Gender
                    </label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-input glass-input text-charcoal"
                        required
                    >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="w-full">
                    <label className="block text-sm font-medium text-charcoal mb-2">
                        Health Conditions (Optional)
                    </label>
                    <textarea
                        name="existingConditions"
                        value={formData.existingConditions}
                        onChange={handleChange}
                        placeholder="Diabetes, Hypertension (comma-separated)"
                        className="w-full px-4 py-3 rounded-input glass-input text-charcoal placeholder-charcoal/50 min-h-[80px]"
                        rows="3"
                    />
                    <p className="text-xs text-charcoal/50 mt-1">
                        Separate multiple conditions with commas
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-input">
                        {error}
                    </div>
                )}

                <div className="flex space-x-3 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        className="flex-1"
                    >
                        {loading ? 'Adding...' : 'Add Member'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddMemberModal;
