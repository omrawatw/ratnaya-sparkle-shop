import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/admin/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(username, password);
    
    if (success) {
      toast.success('Welcome back, Admin!');
      navigate('/admin/dashboard');
    } else {
      toast.error('Invalid username or password');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-gold mb-2">RATNAYA</h1>
          <p className="text-muted-foreground font-body">Admin Portal</p>
        </div>

        <div className="bg-card border border-gold/20 rounded-lg p-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-gold/10 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-gold" />
          </div>

          <h2 className="text-2xl font-display text-cream text-center mb-6">Admin Login</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-cream font-body">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-muted border-gold/20 text-cream pl-10"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-cream font-body">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-muted border-gold/20 text-cream pl-10"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              variant="gold" 
              size="lg" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-muted-foreground font-body text-sm mt-6">
            Default: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
