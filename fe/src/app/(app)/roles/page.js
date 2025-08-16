'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Header from '@/app/(app)/Header'

const RolesPage = () => {
    const router = useRouter()
    const [roles, setRoles] = useState([])
    const [name, setName] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const fetchRoles = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/roles', {
                withCredentials: true,
            })
            setRoles(res.data)
        } catch (err) {
            setMessage('Failed to fetch roles')
        }
    }

    const addRole = async () => {
        setLoading(true)
        try {
            const res = await axios.post(
                'http://127.0.0.1:8000/api/roles',
                { name },
                { withCredentials: true },
            )
            setMessage(res.data.message || 'Role berhasil ditambahkan!')
            setName('')
            fetchRoles()
        } catch (err) {
            setMessage('Gagal menambahkan role')
        } finally {
            setLoading(false)
        }
    }

    const deleteRole = async id => {
        try {
            const res = await axios.delete(
                `http://127.0.0.1:8000/api/roles/${id}`,
                {
                    withCredentials: true,
                },
            )
            setMessage(res.data.message || 'Role berhasil dihapus!')
            fetchRoles()
        } catch (err) {
            setMessage('Gagal menghapus role')
        }
    }

    useEffect(() => {
        fetchRoles()
    }, [])

    return (
        <>
            <Header title="All Roles" />
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
                                    placeholder="Role name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                                <button
                                    onClick={addRole}
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded">
                                    {loading ? 'Adding...' : 'Add'}
                                </button>
                            </div>

                            <ul className="space-y-2">
                                {roles.map(role => (
                                    <li
                                        key={role.id}
                                        className="flex justify-between items-center border p-2 rounded">
                                        <span>{role.name}</span>
                                        <button
                                            onClick={() => deleteRole(role.id)}
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

export default RolesPage
