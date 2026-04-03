'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <div className="home-bg-layer">
        <div className="home-orb-left" />
        <div className="home-orb-right" />
      </div>

      <div className="login-container animate-fade-in-up">
        <div className="login-card">
          <h1 className="login-title">Connexion</h1>
          <p className="login-subtitle">Accédez à vos guides de voyage</p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email" className="login-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                placeholder="votre@email.com"
                required
                autoFocus
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">Mot de passe</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                placeholder="Votre mot de passe"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="login-demo">
            <p className="login-demo-title">Comptes démo</p>
            <div className="login-demo-accounts">
              <button
                type="button"
                onClick={() => { setEmail('admin@henri.trip'); setPassword('admin123'); }}
                className="login-demo-btn"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => { setEmail('user@henri.trip'); setPassword('user123'); }}
                className="login-demo-btn"
              >
                User
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
