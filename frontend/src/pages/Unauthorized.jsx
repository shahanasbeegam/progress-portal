import { useNavigate } from 'react-router-dom'

export default function Unauthorized() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
      <p className="text-gray-500 text-sm">You don't have permission to view this page.</p>
      <button
        onClick={() => navigate(-1)}
        className="text-primary-600 hover:underline text-sm"
      >
        Go back
      </button>
    </div>
  )
}
