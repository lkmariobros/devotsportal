export default function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/" style={{ color: 'blue', textDecoration: 'underline', marginTop: '1rem', display: 'inline-block' }}>
        Return Home
      </a>
    </div>
  )
}