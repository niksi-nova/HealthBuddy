import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
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
                    <p className="text-charcoal/70">Welcome back</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="email"
                        label="Email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

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
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-charcoal/70">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-sage hover:text-sage-dark font-medium">
                        Sign up
                    </Link>
                </p>
            </GlassCard>
        </div>
    );
};

export default Login;
