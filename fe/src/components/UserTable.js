'use client'
import { useState, useRef, useEffect } from 'react'
import useSWR from 'swr'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

const fetcher = url => api.get(url).then(res => res.data)

export default function AllUsersPage() {
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    const [selectedUser, setSelectedUser] = useState(null)
    const [modalType, setModalType] = useState(null)

    const [isFocused, setIsFocused] = useState(false)
    const searchRef = useRef(null)

    const [page, setPage] = useState(1)
    const perPage = 5

    const {
        data: usersResp,
        error,
        mutate,
        isValidating,
    } = useSWR(
        `/api/perpus/users?page=${page}&per_page=${perPage}${
            debouncedSearch
                ? `&search=${encodeURIComponent(debouncedSearch)}`
                : ''
        }`,
        fetcher,
        {
            keepPreviousData: true,
            revalidateOnFocus: false,
            dedupingInterval: 300,
        },
    )

    // ─── Events ─────────────────────────────────────────────
    useEffect(() => {
        const handleKey = e => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                setIsFocused(true)
                searchRef.current?.focus()
            }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [])

    // overlay fokus
    useEffect(() => {
        if (search.length > 0) setIsFocused(false)
    }, [search])

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(t)
    }, [search])

    // reset paging saat keyword berubah
    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    // ─── Data helpers ───────────────────────────────────────
    if (error) return <div>Error loading users</div>

    const users = usersResp?.data || []
    const meta = usersResp?.meta || {}
    const lastPage = meta.last_page || 1

    const handleAdd = async e => {
        e.preventDefault()
        await toast.promise(api.post(`/api/perpus/users`, selectedUser), {
            loading: '📡 Menyimpan user...',
            success: '👤 User berhasil ditambahkan!',
            error: '❌ Gagal menambah user',
        })
        mutate()
        setModalType(null)
    }

    const handleEdit = async e => {
        e.preventDefault()
        await toast.promise(
            api.put(`/api/perpus/users/${selectedUser.id}`, selectedUser),
            {
                loading: '⏳ Update user...',
                success: '✏️ User berhasil diperbarui!',
                error: '❌ Gagal update user',
            },
        )
        mutate()
        setModalType(null)
    }

    const handleDelete = async id => {
        await toast.promise(api.delete(`/api/perpus/users/${id}`), {
            loading: '⏳ Menghapus user...',
            success: '🗑️ User berhasil dihapus!',
            error: '❌ Gagal menghapus user',
        })
        mutate()
        setModalType(null)
    }

    return (
        <div className="py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    {isFocused && search.length === 0 && (
                        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-10"></div>
                    )}
                    <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">All Users</h1>

                        {/* Search + Add */}
                        <div className="grid grid-cols-6 gap-2 mb-4">
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Cari user... (Ctrl+K)"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => {
                                    if (search.length === 0) setIsFocused(false)
                                }}
                                className="px-3 py-2 border rounded col-span-5 relative z-20"
                            />
                            <button
                                onClick={() => {
                                    setSelectedUser({
                                        name: '',
                                        email: '',
                                        password: '',
                                    }) // 👈 isi semua field
                                    setModalType('add')
                                }}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full">
                                Add User
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full border">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 border">No</th>
                                        <th className="p-2 border">Name</th>
                                        <th className="p-2 border">Email</th>
                                        <th className="p-2 border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-gray-50">
                                            <td className="p-2 border text-center">
                                                {(meta.from ??
                                                    (page - 1) * perPage + 1) +
                                                    index}
                                            </td>
                                            <td className="p-2 border">
                                                {(() => {
                                                    const name = user.name
                                                    const term = debouncedSearch
                                                        .trim()
                                                        .toLowerCase()
                                                    if (!term) return name
                                                    const parts = name.split(
                                                        new RegExp(
                                                            `(${term})`,
                                                            'gi',
                                                        ),
                                                    )
                                                    return parts.map(
                                                        (part, idx) =>
                                                            part.toLowerCase() ===
                                                            term ? (
                                                                <b
                                                                    key={idx}
                                                                    className="text-blue-600">
                                                                    {part}
                                                                </b>
                                                            ) : (
                                                                part
                                                            ),
                                                    )
                                                })()}
                                            </td>
                                            <td className="p-2 border">
                                                {(() => {
                                                    const email = user.email
                                                    const term = debouncedSearch
                                                        .trim()
                                                        .toLowerCase()
                                                    if (!term) return email
                                                    const parts = email.split(
                                                        new RegExp(
                                                            `(${term})`,
                                                            'gi',
                                                        ),
                                                    )
                                                    return parts.map(
                                                        (part, idx) =>
                                                            part.toLowerCase() ===
                                                            term ? (
                                                                <b
                                                                    key={idx}
                                                                    className="text-blue-600">
                                                                    {part}
                                                                </b>
                                                            ) : (
                                                                part
                                                            ),
                                                    )
                                                })()}
                                            </td>
                                            <td className="p-2 border space-x-2 text-center">
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

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="px-3 py-1 border rounded bg-blue-200 hover:bg-blue-300 disabled:opacity-50">
                                Prev
                            </button>
                            {isValidating ? (
                                <span className="text-sm text-gray-500">
                                    Searching…
                                </span>
                            ) : (
                                <span>
                                    Page {meta.current_page || 1} of{' '}
                                    {meta.last_page || 1}{' '}
                                    <span className="text-gray-500">
                                        (Total: {meta.total})
                                    </span>
                                </span>
                            )}
                            <button
                                onClick={() =>
                                    setPage(p => Math.min(lastPage, p + 1))
                                }
                                disabled={page >= lastPage}
                                className="px-3 py-1 border rounded bg-blue-200 hover:bg-blue-300 disabled:opacity-50">
                                Next
                            </button>
                        </div>

                        {/* Modal Add */}
                        {modalType === 'add' && selectedUser && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
                                <div className="bg-white p-6 rounded shadow-md w-96">
                                    <h2 className="text-lg font-bold mb-4">
                                        Add User
                                    </h2>
                                    <form
                                        onSubmit={handleAdd}
                                        className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            value={selectedUser.name}
                                            onChange={e =>
                                                setSelectedUser({
                                                    ...selectedUser,
                                                    name: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded"
                                            required
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={selectedUser.email}
                                            onChange={e =>
                                                setSelectedUser({
                                                    ...selectedUser,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded"
                                            required
                                        />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={selectedUser.password}
                                            onChange={e =>
                                                setSelectedUser({
                                                    ...selectedUser,
                                                    password: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded"
                                            required
                                        />
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setModalType(null)
                                                }
                                                className="px-3 py-1 bg-gray-400 text-white rounded">
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-3 py-1 bg-green-600 text-white rounded">
                                                Simpan
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Modal Edit */}
                        {modalType === 'edit' && selectedUser && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
                                <div className="bg-white p-6 rounded shadow-md w-96">
                                    <h2 className="text-lg font-bold mb-4">
                                        Edit User
                                    </h2>
                                    <form
                                        onSubmit={handleEdit}
                                        className="space-y-3">
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
                                                onClick={() =>
                                                    setModalType(null)
                                                }
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
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
                                <div className="bg-white p-6 rounded shadow-md w-80">
                                    <h2 className="text-lg font-bold mb-4">
                                        Hapus User?
                                    </h2>
                                    <p>
                                        Yakin mau hapus user:{' '}
                                        <b>{selectedUser.name}</b>?
                                    </p>
                                    <div className="flex justify-end space-x-2 mt-4">
                                        <button
                                            onClick={() => setModalType(null)}
                                            className="px-3 py-1 bg-gray-400 text-white rounded">
                                            Batal
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(selectedUser.id)
                                            }
                                            className="px-3 py-1 bg-red-600 text-white rounded">
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
