import { useState, useEffect } from 'react';
import { fetchFromAPI } from '../services/api';

const DashboardPage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await fetchFromAPI('/auth/user');
                if (userData && userData.authenticated) {
                    setUser(userData);
                } else {
                    window.location.href = '/'; 
                }
            } catch (err) {
                window.location.href = '/';
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const isAdmin = user?.roles?.includes('ROLE_ADMIN');

    const styles = {
        container: { padding: '40px 20px', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: '100vh' },
        hero: { backgroundColor: '#3498db', color: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '30px' },
        heroTitle: { margin: '0 0 10px 0', fontSize: '32px' },
        heroSub: { margin: 0, fontSize: '18px', opacity: 0.9 },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' },
        card: { backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eef2f5', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' },
        cardIcon: { fontSize: '40px', marginBottom: '15px' },
        cardTitle: { margin: '0 0 10px 0', color: '#2c3e50', fontSize: '20px' },
        cardText: { margin: 0, color: '#7f8c8d', fontSize: '14px', marginBottom: '20px' },
        buttonPrimary: { padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
        buttonAdmin: { padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }
    };

    if (loading) {
        return <div style={{...styles.container, textAlign: 'center', paddingTop: '100px'}}><h2>Loading Dashboard...</h2></div>;
    }

    return (
        <div style={styles.container}>
            {/* Hero Section */}
            <div style={styles.hero}>
                <h1 style={styles.heroTitle}>Welcome back, {user?.name || 'User'}! 👋</h1>
                <p style={styles.heroSub}>Smart Campus Operations Hub</p>
                {isAdmin && <span style={{display: 'inline-block', marginTop: '15px', backgroundColor: '#f1c40f', color: '#2c3e50', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold', fontSize: '12px'}}>ADMINISTRATOR</span>}
            </div>

            {/* Quick Actions Grid */}
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Quick Actions</h2>
            <div style={styles.grid}>
                
                {/* Module A Link (Your Module) */}
                <div style={styles.card} onClick={() => window.location.href = '/facilities'} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={styles.cardIcon}>🏢</div>
                    <h3 style={styles.cardTitle}>Facilities Catalogue</h3>
                    <p style={styles.cardText}>Browse and manage campus lecture halls, labs, and equipment.</p>
                    <button style={isAdmin ? styles.buttonAdmin : styles.buttonPrimary}>
                        {isAdmin ? 'Manage Resources' : 'View Catalogue'}
                    </button>
                </div>

                {/* Module B Link */}
                <div style={styles.card} onClick={() => alert("Module B: Bookings coming soon!")} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={styles.cardIcon}>📅</div>
                    <h3 style={styles.cardTitle}>My Bookings</h3>
                    <p style={styles.cardText}>Request a new room booking or check the status of your requests.</p>
                    <button style={styles.buttonPrimary}>Manage Bookings</button>
                </div>

                {/* Module C Link */}
                <div style={styles.card} onClick={() => alert("Module C: Ticketing coming soon!")} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={styles.cardIcon}>🛠️</div>
                    <h3 style={styles.cardTitle}>Incident Reports</h3>
                    <p style={styles.cardText}>Report a broken projector, AC issue, or facility maintenance request.</p>
                    <button style={styles.buttonPrimary}>Submit Ticket</button>
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;