import { useParams } from 'react-router-dom'

export default function TeamProfile() {
  const { teamId } = useParams()
  
  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Team Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Team ID: {teamId}</p>
        <p className="text-gray-500 mt-4">Team profile details coming soon...</p>
      </div>
    </div>
  )
}

