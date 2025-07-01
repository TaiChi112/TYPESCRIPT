'use client'

import { useState } from 'react'
import { User } from '@company/shared-types'
import { apiClient } from '@/lib/api-client'
import { Trash2, Mail, User as UserIcon } from 'lucide-react'

interface UserCardProps {
  user: User
  onDelete: (userId: string) => void
}

export function UserCard({ user, onDelete }: UserCardProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      setDeleting(true)
      await apiClient.delete(`/users/${user.id}`)
      onDelete(user.id)
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <UserIcon className="w-4 h-4 text-gray-500 mr-2" />
            <h3 className="font-semibold text-gray-900">{user.name}</h3>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            <span>{user.email}</span>
          </div>
          
          {user.createdAt && (
            <div className="mt-2 text-xs text-gray-500">
              Created: {new Date(user.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>
        
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
          title="Delete user"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
