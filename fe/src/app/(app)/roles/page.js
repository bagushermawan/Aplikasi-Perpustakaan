'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Header from '@/app/(app)/Header'

const RolesPage = () => {
    const [roles, setRoles] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    // Modal states
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [currentRole, setCurrentRole] = useState(null)
    const [roleName, setRoleName] = useState('')

    // Fetch roles from API, with optional search query
    const fetchRoles = async (query = '') => {
        setLoading(true)
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/roles', {
                params: { search: query },
                withCredentials: true,
            })
            setRoles(res.data)
        } catch (err) {
            setMessage('Gagal mengambil data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Debounce search
        const delayDebounce = setTimeout(() => {
            fetchRoles(search)
        }, 300)

        return () => clearTimeout(delayDebounce)
    }, [search])

    // Open edit modal
    const openEditModal = role => {
        setCurrentRole(role)
        setRoleName(role.name)
        setIsEditOpen(true)
    }

    // Update role
    const updateRole = async () => {
        try {
            await axios.put(
                `http://127.0.0.1:8000/api/roles/${currentRole.id}`,
                { name: roleName },
                { withCredentials: true },
            )
            setMessage('Role berhasil diupdate')
            setIsEditOpen(false)
            fetchRoles(search)
        } catch (err) {
            setMessage('Gagal update role')
        }
    }

    // Open delete modal
    const openDeleteModal = role => {
        setCurrentRole(role)
        setIsDeleteOpen(true)
    }

    // Delete role
    const deleteRole = async () => {
        try {
            await axios.delete(
                `http://127.0.0.1:8000/api/roles/${currentRole.id}`,
                {
                    withCredentials: true,
                },
            )
            setMessage('Role berhasil dihapus')
            setIsDeleteOpen(false)
            fetchRoles(search)
        } catch (err) {
            setMessage('Gagal menghapus role')
        }
    }

    return (
        <>
            <Header title="All Roles" />
            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                {message && (
                    <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                        {message}
                    </div>
                )}

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="flex justify-between mb-4">
                        <input
                            type="text"
                            placeholder="Search role..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="border p-2 rounded w-1/3"
                        />
                        <button
                            onClick={() =>
                                openEditModal({ id: null, name: '' })
                            }
                            className="bg-blue-600 text-white px-4 py-2 rounded">
                            Add Role
                        </button>
                    </div>

                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <table className="min-w-full border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-2 px-4 border-b">ID</th>
                                    <th className="py-2 px-4 border-b">
                                        Role Name
                                    </th>
                                    {/* <th className="py-2 px-4 border-b">
                                        Guard
                                    </th> */}
                                    <th className="py-2 px-4 border-b">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="text-center py-4">
                                            Tidak ada data
                                        </td>
                                    </tr>
                                ) : (
                                    roles.map(role => (
                                        <tr
                                            key={role.id}
                                            className="hover:bg-gray-50">
                                            <td className="py-2 px-4 border-b">
                                                {role.id}
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                {role.name}
                                            </td>
                                            {/* <td className="py-2 px-4 border-b">
                                                {role.guard_name}
                                            </td> */}
                                            <td className="py-2 px-4 border-b space-x-2 text-center">
                                                <button
                                                    onClick={() =>
                                                        openEditModal(role)
                                                    }
                                                    className="bg-yellow-500 text-white px-3 py-1 rounded">
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        openDeleteModal(role)
                                                    }
                                                    className="bg-red-600 text-white px-3 py-1 rounded">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">
                            {currentRole?.id ? 'Edit Role' : 'Add Role'}
                        </h2>
                        <input
                            type="text"
                            value={roleName}
                            onChange={e => setRoleName(e.target.value)}
                            className="border p-2 w-full rounded mb-4"
                            placeholder="Role name"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsEditOpen(false)}
                                className="px-4 py-2 rounded bg-gray-300">
                                Cancel
                            </button>
                            <button
                                onClick={
                                    currentRole?.id
                                        ? updateRole
                                        : async () => {
                                              // add new role
                                              try {
                                                  await axios.post(
                                                      'http://127.0.0.1:8000/api/roles',
                                                      { name: roleName },
                                                      { withCredentials: true },
                                                  )
                                                  setMessage(
                                                      'Role berhasil ditambahkan',
                                                  )
                                                  setIsEditOpen(false)
                                                  fetchRoles(search)
                                              } catch {
                                                  setMessage(
                                                      'Gagal menambahkan role',
                                                  )
                                              }
                                          }
                                }
                                className="px-4 py-2 rounded bg-blue-600 text-white">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Delete Role</h2>
                        <p>Yakin ingin menghapus role "{currentRole?.name}"?</p>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                onClick={() => setIsDeleteOpen(false)}
                                className="px-4 py-2 rounded bg-gray-300">
                                Cancel
                            </button>
                            <button
                                onClick={deleteRole}
                                className="px-4 py-2 rounded bg-red-600 text-white">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default RolesPage
