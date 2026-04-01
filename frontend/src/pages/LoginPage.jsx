const LoginPage = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f4f7f6' }}>
            <h1 style={{ color: '#2c3e50' }}>Smart Campus Operations Hub</h1>
            <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>Please login to access the Facilities Catalogue</p>
            <a href="http://localhost:8080/oauth2/authorization/google" 
               style={{ padding: '15px 30px', background: '#4285F4', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                Sign in with Google
            </a>
        </div>
    );
};
export default LoginPage;