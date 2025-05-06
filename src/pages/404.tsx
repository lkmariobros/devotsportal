export default function Custom404() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-8">The page you are looking for does not exist.</p>
      <a href="/" className="text-blue-500 hover:underline">
        Return Home
      </a>
    </div>
  )
}
