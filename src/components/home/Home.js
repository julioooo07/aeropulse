function Home() {
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <header style={{
        background: 'white',
        padding: '20px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ color: '#1E88E5' }}>Cold Air</h1>
        <button onClick={handleLogout} style={{
          background: '#dc3545',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Logout
        </button>
      </header>
      <main style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Welcome to Cold Air!</h2>
        <p>You have successfully logged in.</p>
      </main>
    </div>
  );
}

export default Home;