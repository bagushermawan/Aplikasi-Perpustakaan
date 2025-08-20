'use client'
import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import api from '@/lib/axios'

const fetcher = url => api.get(url).then(res => res.data)

export default function LoanUserTable() {
    const [user, setUser] = useState(null)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const searchRef = useRef(null)

    const [page, setPage] = useState(1)
    const perPage = 5

    useEffect(() => {
        api.get('/api/auth/user').then(res => setUser(res.data))
    }, [])

    const {
        data: loansResp,
        error,
        mutate,
        isValidating,
    } = useSWR(
        user
            ? `/api/perpus/loans?page=${page}&per_page=${perPage}&user_id=${user.id}${
                  debouncedSearch
                      ? `&search=${encodeURIComponent(debouncedSearch)}`
                      : ''
              }`
            : null,
        fetcher,
        {
            keepPreviousData: true,
            revalidateOnFocus: false,
            dedupingInterval: 500,
        },
    )

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 500)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    if (!user) return <div>Loading user...</div>
    if (error) return <div>Error loading loans</div>

    const loans = loansResp?.data || []
    const meta = loansResp?.meta || {}
    const lastPage = meta.last_page || 1

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

    const grandTotal = loans.reduce((sum, loan) => {
        return sum + Number(loan.book.harga) * loan.quantity
    }, 0)

    return (
        <div className="relative">
            {isFocused && search.length === 0 && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-10"></div>
            )}

            <h2 className="text-xl font-bold mb-4">My Borrowed Books</h2>

            {/* Search */}
            <div className="mb-4">
                <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search borrowed books... (Ctrl+K)"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                        if (search.length === 0) setIsFocused(false)
                    }}
                    className="w-full border p-2 rounded relative z-20"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border text-center">No</th>
                            <th className="p-2 border">Title</th>
                            <th className="p-2 border text-center">
                                Borrowed At
                            </th>
                            <th className="p-2 border text-center">
                                Return Date
                            </th>
                            <th className="p-2 border text-center">Status</th>
                            <th className="p-2 border text-center">Quantity</th>
                            <th className="p-2 border text-center">
                                Harga satuan
                            </th>
                            <th className="p-2 border text-center">
                                Total Harga
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.length > 0 ? (
                            <>
                                {loans.map((loan, index) => (
                                    <tr
                                        key={loan.id}
                                        className="hover:bg-gray-50">
                                        <td className="p-2 border text-center">
                                            {(meta.from ??
                                                (page - 1) * perPage + 1) +
                                                index}
                                        </td>
                                        <td className="p-2 border">
                                            {loan.book.title}
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
                                        <td className="p-2 border text-center">
                                            {loan.quantity}
                                        </td>
                                        <td className="p-2 border text-center">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                                minimumFractionDigits: 2,
                                            }).format(loan.book.harga)}
                                        </td>
                                        <td className="p-2 border text-center">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                                minimumFractionDigits: 2,
                                            }).format(
                                                loan.book.harga * loan.quantity,
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {/* === Baris TOTAL === */}
                                <tr className="bg-gray-100 font-bold">
                                    <td
                                        colSpan={7}
                                        className="p-2 border text-right">
                                        TOTAL SEMUA
                                    </td>
                                    <td className="p-2 border text-center">
                                        {new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                            minimumFractionDigits: 2,
                                        }).format(meta.grand_total)}
                                    </td>
                                </tr>
                            </>
                        ) : (
                            <tr>
                                <td colSpan={8} className="p-2 text-center">
                                    No borrowed books
                                </td>
                            </tr>
                        )}
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
                    <span className="text-sm text-gray-500">Searching…</span>
                ) : (
                    <span>
                        Page {meta.current_page || 1} of {meta.last_page || 1}{' '}
                        <span className="text-gray-500">
                            (Total: {meta.total})
                        </span>
                    </span>
                )}
                <button
                    onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                    disabled={page >= lastPage}
                    className="px-3 py-1 border rounded bg-blue-200 hover:bg-blue-300 disabled:opacity-50">
                    Next
                </button>
            </div>
        </div>
    )
}
