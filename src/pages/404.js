
export default function Custom404() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      padding: '24px' 
    }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        404 - Page Not Found
      </h2>
      <p style={{ marginBottom: '2rem' }}>
        The page you are looking for does not exist.
      </p>
      <a 
        href="/" 
        style={{ color: '#3b82f6', textDecoration: 'underline' }}
      >
        Return Home
      </a>
    </div>
  )
}
