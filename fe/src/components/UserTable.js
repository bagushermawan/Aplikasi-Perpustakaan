'use client'
import { useState } from 'react'
import useSWR from 'swr'
import api from '@/lib/axios'

const fetcher = url => api.get(url).then(res => res.data.data)

export default function AllUsersPage() {
    const { data: users, error, mutate } = useSWR('/api/perpus/users', fetcher)
    const [search, setSearch] = useState('')
    const [selectedUser, setSelectedUser] = useState(null)
    const [modalType, setModalType] = useState(null)

    if (error) return <div>Error loading users</div>
    if (!users) return <div>Loading...</div>

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()),
    )

    const handleDelete = async id => {
        if (!confirm('Yakin hapus user ini?')) return
        await api.delete(`/api/perpus/users/${id}`)
        mutate()
        setModalType(null)
    }

    const handleEdit = async e => {
        e.preventDefault()
        await api.put(`/api/perpus/users/${selectedUser.id}`, selectedUser)
        mutate()
        setModalType(null)
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">All Users</h1>

            {/* Search */}
            <input
                type="text"
                placeholder="Cari user..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="mb-4 p-2 border rounded w-full"
            />

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Email</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="p-2 border">{user.id}</td>
                                <td className="p-2 border">{user.name}</td>
                                <td className="p-2 border">{user.email}</td>
                                <td className="p-2 border space-x-2">
                                    <button
                                        onClick={() => {
                                            setSelectedUser(user)
                                            setModalType('edit')
                                        }}
                                        className="px-3 py-1 bg-blue-500 text-white rounded">
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedUser(user)
                                            setModalType('delete')
                                        }}
                                        className="px-3 py-1 bg-red-500 text-white rounded">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Edit */}
            {modalType === 'edit' && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h2 className="text-lg font-bold mb-4">Edit User</h2>
                        <form onSubmit={handleEdit} className="space-y-3">
                            <input
                                type="text"
                                value={selectedUser.name}
                                onChange={e =>
                                    setSelectedUser({
                                        ...selectedUser,
                                        name: e.target.value,
                                    })
                                }
                                className="w-full border p-2 rounded"
                            />
                            <input
                                type="email"
                                value={selectedUser.email}
                                onChange={e =>
                                    setSelectedUser({
                                        ...selectedUser,
                                        email: e.target.value,
                                    })
                                }
                                className="w-full border p-2 rounded"
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setModalType(null)}
                                    className="px-3 py-1 bg-gray-400 text-white rounded">
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-3 py-1 bg-blue-600 text-white rounded">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Delete */}
            {modalType === 'delete' && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-md w-80">
                        <h2 className="text-lg font-bold mb-4">Hapus User?</h2>
                        <p>Yakin mau hapus user: {selectedUser.name}?</p>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                onClick={() => setModalType(null)}
                                className="px-3 py-1 bg-gray-400 text-white rounded">
                                Batal
                            </button>
                            <button
                                onClick={() => handleDelete(selectedUser.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded">
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
