'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Header from '@/app/(app)/Header'

const PermissionsPage = () => {
    const router = useRouter()
    const [permissions, setPermissions] = useState([])
    const [name, setName] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const fetchPermissions = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/permissions', {
                withCredentials: true,
            })
            setPermissions(res.data)
        } catch (err) {
            setMessage('Failed to fetch permissions')
        }
    }

    const addPermission = async () => {
        setLoading(true)
        try {
            const res = await axios.post(
                'http://127.0.0.1:8000/api/permissions',
                { name },
                { withCredentials: true },
            )
            setMessage(res.data.message || 'Permission berhasil ditambahkan!')
            setName('')
            fetchPermissions()
        } catch (err) {
            setMessage('Gagal menambahkan permission')
        } finally {
            setLoading(false)
        }
    }

    const deletePermission = async id => {
        try {
            const res = await axios.delete(
                `http://127.0.0.1:8000/api/permissions/${id}`,
                {
                    withCredentials: true,
                },
            )
            setMessage(res.data.message || 'Permission berhasil dihapus!')
            fetchPermissions()
        } catch (err) {
            setMessage('Gagal menghapus permission')
        }
    }

    useEffect(() => {
        fetchPermissions()
    }, [])

    return (
        <>
            <Header title="All Permissions" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                {message && (
                    <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                        {message}
                    </div>
                )}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex gap-2 mb-4">
                                <input
                                    className="border p-2 rounded"
                                    placeholder="Permission name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                                <button
                                    onClick={addPermission}
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded">
                                    {loading ? 'Adding...' : 'Add'}
                                </button>
                            </div>

                            <ul className="space-y-2">
                                {permissions.map(permission => (
                                    <li
                                        key={permission.id}
                                        className="flex justify-between items-center border p-2 rounded">
                                        <span>{permission.name}</span>
                                        <button
                                            onClick={() => deletePermission(permission.id)}
                                            className="bg-red-600 text-white px-3 py-1 rounded">
                                            Delete
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PermissionsPage
