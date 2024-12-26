'use client'

import { useState, useEffect } from 'react'
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import MemberModal from '@/components/member-modal'
import DeleteConfirmationModal from '@/components/delete-confirmation-modal'

interface Member {
  id: string
  name: string
  email: string
  phone?: string
  createdAt: string
  status?: 'active' | 'inactive'
  subscriptions?: {
    id: string
    status: string
    membershipPlan: {
      name: string
    }
  }[]
}

export default function MembersPage() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/members')
      if (!response.ok) {
        throw new Error('Failed to fetch members')
      }
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      toast.error('Failed to load members')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMember = () => {
    setSelectedMember(null)
    setIsModalOpen(true)
  }

  const handleEditMember = (member: Member) => {
    setSelectedMember(member)
    setIsModalOpen(true)
  }

  const handleDeleteMember = (member: Member) => {
    setMemberToDelete(member)
    setIsDeleteModalOpen(true)
  }

  const handleSaveMember = async (memberData: Omit<Member, 'id'>) => {
    try {
      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      })

      if (!response.ok) {
        throw new Error('Failed to save member')
      }

      const savedMember = await response.json()
      
      if (selectedMember) {
        setMembers(members.map(member =>
          member.id === selectedMember.id ? savedMember : member
        ))
        toast.success('Member updated successfully')
      } else {
        setMembers([savedMember, ...members])
        toast.success('Member added successfully')
      }
      setIsModalOpen(false)
    } catch (error) {
      toast.error('Failed to save member')
      console.error(error)
    }
  }

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return

    try {
      const response = await fetch(`/api/admin/members/${memberToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete member')
      }

      setMembers(members.filter(member => member.id !== memberToDelete.id))
      toast.success('Member deleted successfully')
    } catch (error) {
      toast.error('Failed to delete member')
      console.error(error)
    } finally {
      setIsDeleteModalOpen(false)
      setMemberToDelete(null)
    }
  }

  const filteredMembers = members.filter(member => 
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="animate-pulse p-4 dark:bg-gray-900 transition-colors duration-200">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 dark:bg-gray-900 transition-colors duration-200">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Members</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            A list of all the members in your gym including their name, email, status, and membership plan.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={handleAddMember}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 sm:w-auto"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add Member
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mt-6 mb-4">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-600" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search members..."
            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-10 pr-3 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg dark:ring-gray-700">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Join Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Plan</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                  {filteredMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{member.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          member.subscriptions?.[0]?.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {member.subscriptions?.[0]?.status || 'inactive'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {member.subscriptions?.[0]?.membershipPlan.name || 'No Plan'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Member Modal */}
      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        member={selectedMember}
        onSave={handleSaveMember}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setMemberToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Member"
        description={`Are you sure you want to delete ${memberToDelete?.name}? This action cannot be undone.`}
      />
    </div>
  )
}
