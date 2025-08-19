'use client'
import { useState, useEffect } from 'react'
import useSWR from 'swr'
import api from '@/lib/axios'

const fetcher = url => api.get(url).then(res => res.data.data)

export default function LoanUserTable() {
    const [user, setUser] = useState(null)
    const [search, setSearch] = useState('')

    const {
        data: loans,
        error,
        mutate,
    } = useSWR(user ? `/api/perpus/loans?user_id=${user.id}` : null, fetcher)

    useEffect(() => {
        // Ambil data user login
        api.get('/api/auth/user').then(res => setUser(res.data))
    }, [])

    if (!user) return <div>Loading user...</div>
    if (error) return <div>Error loading loans</div>
    if (!loans) return <div>Loading loans...</div>

    // Filter hanya yang sedang dipinjam dan sesuai search
    const borrowedLoans = loans.filter(
        loan =>
            loan.status === 'borrowed' &&
            loan.book.title.toLowerCase().includes(search.toLowerCase()),
    )

    const handleReturn = async loanId => {
        if (!confirm('Apakah ingin mengembalikan buku ini?')) return
        try {
            await api.put(`/api/perpus/loans/${loanId}`, { status: 'returned' })
            mutate()
        } catch (err) {
            console.error(err)
            alert('Gagal mengembalikan buku')
        }
    }

    return (
        <div className="overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">My Borrowed Books</h2>

            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search borrowed books..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border p-2 rounded"
                />
            </div>

            <table className="min-w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 border text-center">No</th>
                        <th className="p-2 border">Title</th>
                        <th className="p-2 border text-center">Borrowed At</th>
                        <th className="p-2 border text-center">Return Date</th>
                        <th className="p-2 border text-center">Status</th>
                        {user?.role === 'admin' && (
                            <th className="p-2 border text-center">Actions</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {borrowedLoans.length > 0 ? (
                        borrowedLoans.map((loan, index) => (
                            <tr key={loan.id} className="hover:bg-gray-50">
                                <td className="p-2 border text-center">
                                    {index + 1}
                                </td>
                                <td className="p-2 border">
                                    {(() => {
                                        const title = loan.book.title
                                        const searchTerm = search
                                            .trim()
                                            .toLowerCase()
                                        if (!searchTerm) return title
                                        const parts = title.split(
                                            new RegExp(`(${searchTerm})`, 'gi'),
                                        )
                                        return parts.map((part, idx) =>
                                            part.toLowerCase() ===
                                            searchTerm ? (
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
                                <td className="p-2 border text-center">
                                    {loan.borrowed_at}
                                </td>
                                <td className="p-2 border text-center">
                                    {loan.return_date || '-'}
                                </td>
                                <td className="p-2 border text-center capitalize">
                                    {loan.status}
                                </td>
                                {user?.role === 'admin' && (
                                    <td className="p-2 border text-center">
                                        {loan.status === 'borrowed' && (
                                            <button
                                                onClick={() =>
                                                    handleReturn(loan.id)
                                                }
                                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                                                Return
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="p-2 text-center">
                                No borrowed books
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
