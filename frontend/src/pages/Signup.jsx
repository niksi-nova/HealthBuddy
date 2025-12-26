import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        age: '',
        phoneNumber: '',
        gender: 'Male'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signup({
                ...formData,
                age: parseInt(formData.age)
            });
            navigate('/');
        } catch (err) {
            console.error('Signup error:', err.response?.data);
            const errorMsg = err.response?.data?.errors
                ? err.response.data.errors.map(e => e.msg).join(', ')
                : err.response?.data?.message || 'Signup failed';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sand via-sage/10 to-terracotta/10">
            <GlassCard className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-display font-bold text-gradient mb-2">
                        Health Buddy
                    </h1>
                    <p className="text-charcoal/70">Create your account</p>
                </div>

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

                    <Input
                        type="email"
                        name="email"
                        label="Email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        type="password"
                        name="password"
                        label="Password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        type="number"
                        name="age"
                        label="Age"
                        placeholder="30"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        min="18"
                        max="120"
                    />

                    <Input
                        type="tel"
                        name="phoneNumber"
                        label="Phone Number"
                        placeholder="+1234567890"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
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

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-input">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-charcoal/70">
                    Already have an account?{' '}
                    <Link to="/login" className="text-sage hover:text-sage-dark font-medium">
                        Login
                    </Link>
                </p>
            </GlassCard>
        </div>
    );
};

export default Signup;
