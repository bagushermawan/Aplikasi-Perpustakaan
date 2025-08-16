'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Header from '@/app/(app)/Header'

const PermissionsPage = () => {
    const [permissions, setPermissions] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    // Modal states
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [currentPermission, setCurrentPermission] = useState(null)
    const [permissionName, setPermissionName] = useState('')

    // Fetch permissions from API, with optional search query
    const fetchPermissions = async (query = '') => {
        setLoading(true)
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/permissions', {
                params: { search: query },
                withCredentials: true,
            })
            setPermissions(res.data)
        } catch (err) {
            setMessage('Gagal mengambil data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Debounce search
        const delayDebounce = setTimeout(() => {
            fetchPermissions(search)
        }, 300)

        return () => clearTimeout(delayDebounce)
    }, [search])

    // Open edit modal
    const openEditModal = permission => {
        setCurrentPermission(permission)
        setPermissionName(permission.name)
        setIsEditOpen(true)
    }

    // Update permission
    const updatePermission = async () => {
        try {
            await axios.put(
                `http://127.0.0.1:8000/api/permissions/${currentPermission.id}`,
                { name: permissionName },
                { withCredentials: true },
            )
            setMessage('Permission berhasil diupdate')
            setIsEditOpen(false)
            fetchPermissions(search)
        } catch (err) {
            setMessage('Gagal update permission')
        }
    }

    // Open delete modal
    const openDeleteModal = permission => {
        setCurrentPermission(permission)
        setIsDeleteOpen(true)
    }

    // Delete permission
    const deletePermission = async () => {
        try {
            await axios.delete(
                `http://127.0.0.1:8000/api/permissions/${currentPermission.id}`,
                {
                    withCredentials: true,
                },
            )
            setMessage('Permission berhasil dihapus')
            setIsDeleteOpen(false)
            fetchPermissions(search)
        } catch (err) {
            setMessage('Gagal menghapus permission')
        }
    }

    return (
        <>
            <Header title="All Permissions" />
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
                            placeholder="Search permission..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="border p-2 rounded w-1/3"
                        />
                        <button
                            onClick={() =>
                                openEditModal({ id: null, name: '' })
                            }
                            className="bg-blue-600 text-white px-4 py-2 rounded">
                            Add Permission
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
                                        Permission Name
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
                                {permissions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="text-center py-4">
                                            Tidak ada data
                                        </td>
                                    </tr>
                                ) : (
                                    permissions.map(permission => (
                                        <tr
                                            key={permission.id}
                                            className="hover:bg-gray-50">
                                            <td className="py-2 px-4 border-b">
                                                {permission.id}
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                {permission.name}
                                            </td>
                                            {/* <td className="py-2 px-4 border-b">
                                                {permission.guard_name}
                                            </td> */}
                                            <td className="py-2 px-4 border-b space-x-2">
                                                <button
                                                    onClick={() =>
                                                        openEditModal(permission)
                                                    }
                                                    className="bg-yellow-500 text-white px-3 py-1 rounded">
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        openDeleteModal(permission)
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
                            {currentPermission?.id ? 'Edit Permission' : 'Add Permission'}
                        </h2>
                        <input
                            type="text"
                            value={permissionName}
                            onChange={e => setPermissionName(e.target.value)}
                            className="border p-2 w-full rounded mb-4"
                            placeholder="Permission name"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsEditOpen(false)}
                                className="px-4 py-2 rounded bg-gray-300">
                                Cancel
                            </button>
                            <button
                                onClick={
                                    currentPermission?.id
                                        ? updatePermission
                                        : async () => {
                                              // add new permission
                                              try {
                                                  await axios.post(
                                                      'http://127.0.0.1:8000/api/permissions',
                                                      { name: permissionName },
                                                      { withCredentials: true },
                                                  )
                                                  setMessage(
                                                      'Permission berhasil ditambahkan',
                                                  )
                                                  setIsEditOpen(false)
                                                  fetchPermissions(search)
                                              } catch {
                                                  setMessage(
                                                      'Gagal menambahkan permission',
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
                        <h2 className="text-xl font-bold mb-4">Delete Permission</h2>
                        <p>Yakin ingin menghapus permission "{currentPermission?.name}"?</p>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                onClick={() => setIsDeleteOpen(false)}
                                className="px-4 py-2 rounded bg-gray-300">
                                Cancel
                            </button>
                            <button
                                onClick={deletePermission}
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

export default PermissionsPage
