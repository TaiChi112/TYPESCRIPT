'use client'

import { useState, useEffect } from 'react'
import { User } from '@company/shared-types'
import { UserCard } from '@/components/UserCard'
import { CreateUserForm } from '@/components/CreateUserForm'
import { apiClient } from '@/lib/api-client'

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/users')
      setUsers(response.data)
    } catch (err) {
      setError('Failed to fetch users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUserCreated = (newUser: User) => {
    setUsers(prev => [...prev, newUser])
  }

  const handleUserDeleted = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Polyrepo Frontend
          </h1>
          <p className="text-lg text-gray-600">
            Next.js 15 + TypeScript + Bun + Tailwind CSS
          </p>
          <div className="mt-4 flex justify-center space-x-4 text-sm text-gray-500">
            <span className="bg-blue-100 px-3 py-1 rounded-full">Next.js 15</span>
            <span className="bg-green-100 px-3 py-1 rounded-full">TypeScript</span>
            <span className="bg-purple-100 px-3 py-1 rounded-full">Bun</span>
            <span className="bg-cyan-100 px-3 py-1 rounded-full">Tailwind</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create User Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Create New User</h2>
              <CreateUserForm onUserCreated={handleUserCreated} />
            </div>
          </div>

          {/* Users List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Users ({users.length})
              </h2>
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No users found. Create your first user!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {users.map(user => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onDelete={handleUserDeleted}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Connected to Backend API
          </div>
        </div>
      </div>
    </main>
  )
}
