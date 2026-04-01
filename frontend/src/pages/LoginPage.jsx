import { useState } from 'react';
import { fetchFromAPI } from '../services/api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Handles both Login and Registration based on which button is clicked
    const handleStandardAuth = async (e, action) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (!email || !password) {
            setError('Please enter both email and password.');
            setLoading(false);
            return;
        }

        try {
            const endpoint = action === 'login' ? '/auth/login' : '/auth/register';
            const response = await fetchFromAPI(endpoint, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            // The backend returns { success: true/false, message: "..." }
            if (response && response.success) {
                if (action === 'login') {
                    // Success! Go to the Gatekeeper
                    window.location.href = '/dashboard';
                } else {
                    // Registration worked!
                    setMessage('Registration successful! You can now log in.');
                    setPassword(''); // Clear the password box for safety
                }
            } else {
                setError(response?.message || 'Authentication failed.');
            }
        } catch (err) {
            setError('Could not connect to the server. Is Spring Boot running?');
        } finally {
            setLoading(false);
        }
    };

    // The original Google Login
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    // UI Styles
    const styles = {
        container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
        card: { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' },
        header: { color: '#2c3e50', margin: '0 0 10px 0', fontSize: '24px' },
        subHeader: { color: '#7f8c8d', margin: '0 0 30px 0', fontSize: '14px' },
        input: { width: '100%', padding: '12px', margin: '10px 0', borderRadius: '8px', border: '1px solid #dcdde1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
        buttonRow: { display: 'flex', gap: '10px', marginTop: '10px' },
        btnPrimary: { flex: 1, padding: '12px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
        btnSecondary: { flex: 1, padding: '12px', backgroundColor: '#ecf0f1', color: '#2c3e50', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
        divider: { margin: '25px 0', borderBottom: '1px solid #e1e8ed', position: 'relative' },
        dividerText: { position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', padding: '0 10px', color: '#95a5a6', fontSize: '12px' },
        googleBtn: { width: '100%', padding: '12px', backgroundColor: '#fff', color: '#333', border: '1px solid #dcdde1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
        errorMsg: { color: '#e74c3c', fontSize: '14px', marginBottom: '15px', fontWeight: 'bold' },
        successMsg: { color: '#27ae60', fontSize: '14px', marginBottom: '15px', fontWeight: 'bold' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.header}>Smart Campus Hub</h2>
                <p style={styles.subHeader}>Sign in to access the Facilities Catalogue</p>

                {error && <div style={styles.errorMsg}>{error}</div>}
                {message && <div style={styles.successMsg}>{message}</div>}

                <form>
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        style={styles.input} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        style={styles.input} 
                        required 
                    />
                    
                    <div style={styles.buttonRow}>
                        <button 
                            type="submit" 
                            onClick={(e) => handleStandardAuth(e, 'login')} 
                            style={styles.btnPrimary}
                            disabled={loading}
                        >
                            {loading ? '...' : 'Login'}
                        </button>
                        <button 
                            type="button" 
                            onClick={(e) => handleStandardAuth(e, 'register')} 
                            style={styles.btnSecondary}
                            disabled={loading}
                        >
                            Register
                        </button>
                    </div>
                </form>

                <div style={styles.divider}>
                    <span style={styles.dividerText}>OR</span>
                </div>

                <button onClick={handleGoogleLogin} style={styles.googleBtn}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google Logo" style={{ width: '18px' }} />
                    Continue with Google
                </button>
            </div>
        </div>
    );
};

export default LoginPage;