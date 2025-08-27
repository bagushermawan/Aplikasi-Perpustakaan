'use client'

import { useState, useRef, useEffect } from 'react'
import useSWR from 'swr'
import api from '@/lib/axios'
import Select from 'react-select'
import {
    HiMiniArrowsUpDown,
    HiMiniArrowSmallUp,
    HiMiniArrowSmallDown,
} from 'react-icons/hi2'
import toast from 'react-hot-toast'

const fetcher = url => api.get(url).then(res => res.data)

export default function LoansTable() {
    const { data: users = [] } = useSWR('/api/perpus/users/all', fetcher)
    const { data: books = [] } = useSWR('/api/perpus/books/all', fetcher)

    const [sortBy, setSortBy] = useState('loans.created_at')
    const [sortDir, setSortDir] = useState('null')

    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    const [selectedLoan, setSelectedLoan] = useState(null)
    const [modalType, setModalType] = useState(null)

    const [isFocused, setIsFocused] = useState(false)
    const searchRef = useRef(null)
    const [page, setPage] = useState(1)
    const perPage = 5

    const {
        data: loansResp,
        error,
        mutate,
        isValidating,
    } = useSWR(
        `/api/perpus/loans?page=${page}&per_page=${perPage}${
            debouncedSearch
                ? `&search=${encodeURIComponent(debouncedSearch)}`
                : ''
        }${sortBy && sortDir ? `&sort_by=${sortBy}&sort_dir=${sortDir}` : ''}`,
        fetcher,
        {
            keepPreviousData: true,
            revalidateOnFocus: false,
            dedupingInterval: 300,
        },
    )

    const toggleSort = column => {
        if (sortBy !== column) {
            // 1st click → set asc
            setSortBy(column)
            setSortDir('asc')
        } else if (sortDir === 'asc') {
            // 2nd click → set desc
            setSortDir('desc')
        } else if (sortDir === 'desc') {
            // 3rd click → reset
            setSortBy(null)
            setSortDir(null)
        }
    }

    // shortcut CTRL+K fokus ke search
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

    useEffect(() => {
        if (search.length > 0) {
            setIsFocused(false)
        }
    }, [search])

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    if (error) return <div>Error loading loans</div>

    const loans = loansResp?.data || []
    const meta = loansResp?.meta || {}
    const lastPage = meta.last_page || 1

    const handleAdd = async e => {
        e.preventDefault()
        await toast.promise(api.post(`/api/perpus/loans`, selectedLoan), {
            loading: '📡 Menyimpan pinjaman...',
            success: '📗 Loan berhasil ditambahkan!',
            error: '❌ Gagal menambah loan',
        })
        mutate()
        setModalType(null)
    }

    const handleEdit = async e => {
        e.preventDefault()
        await toast.promise(
            api.put(`/api/perpus/loans/${selectedLoan.id}`, selectedLoan),
            {
                loading: '⏳ Update loan...',
                success: '✏️ Loan berhasil diperbarui!',
                error: '❌ Gagal update loan',
            },
        )
        mutate()
        setModalType(null)
    }

    const handleDelete = async id => {
        await toast.promise(api.delete(`/api/perpus/loans/${id}`), {
            loading: '⏳ Menghapus loan...',
            success: '🗑️ Loan berhasil dihapus!',
            error: '❌ Gagal menghapus loan',
        })
        mutate()
        setModalType(null)
    }

    return (
        <div className="py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    {/* Overlay blur */}
                    {isFocused && search.length === 0 && (
                        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-10 transition-opacity"></div>
                    )}

                    <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">All Loans</h1>

                        {/* Search + Add */}
                        <div className="grid grid-cols-6 gap-2 mb-4">
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Cari loan ... (Ctrl+K)"
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
                                    setSelectedLoan({
                                        user_id: '',
                                        book_id: '',
                                        borrowed_at: '',
                                        return_date: '',
                                        status: 'borrowed',
                                    })
                                    setModalType('add')
                                }}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full">
                                Add Loan
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full border">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 border">No</th>
                                        <th
                                            className="p-2 border cursor-pointer select-none"
                                            onClick={() =>
                                                toggleSort('users.name')
                                            }>
                                            <div className="flex items-center justify-center gap-1">
                                                <span>User</span>
                                                {sortBy !== 'users.name' && (
                                                    <span>
                                                        <HiMiniArrowsUpDown />
                                                    </span>
                                                )}
                                                {sortBy === 'users.name' &&
                                                    sortDir === 'asc' && (
                                                        <span>
                                                            <HiMiniArrowSmallUp />
                                                        </span>
                                                    )}
                                                {sortBy === 'users.name' &&
                                                    sortDir === 'desc' && (
                                                        <span>
                                                            <HiMiniArrowSmallDown />
                                                        </span>
                                                    )}
                                            </div>
                                        </th>
                                        <th
                                            className="p-2 border cursor-pointer select-none"
                                            onClick={() =>
                                                toggleSort('books.title')
                                            }>
                                            <div className="flex items-center justify-center gap-1">
                                                <span>Book</span>
                                                {sortBy !== 'books.title' && (
                                                    <span>
                                                        <HiMiniArrowsUpDown />
                                                    </span>
                                                )}
                                                {sortBy === 'books.title' &&
                                                    sortDir === 'asc' && (
                                                        <span>
                                                            <HiMiniArrowSmallUp />
                                                        </span>
                                                    )}
                                                {sortBy === 'books.title' &&
                                                    sortDir === 'desc' && (
                                                        <span>
                                                            <HiMiniArrowSmallDown />
                                                        </span>
                                                    )}
                                            </div>
                                        </th>
                                        <th className="p-2 border">
                                            Borrowed At
                                        </th>
                                        <th className="p-2 border">
                                            Return Date
                                        </th>
                                        <th
                                            className="p-2 border cursor-pointer select-none"
                                            onClick={() =>
                                                toggleSort('loans.status')
                                            }>
                                            <div className="flex items-center justify-center gap-1">
                                                <span>Status </span>
                                                {sortBy !== 'loans.status' && (
                                                    <span>
                                                        <HiMiniArrowsUpDown />
                                                    </span>
                                                )}
                                                {sortBy === 'loans.status' &&
                                                    sortDir === 'asc' && (
                                                        <span>
                                                            <HiMiniArrowSmallUp />
                                                        </span>
                                                    )}
                                                {sortBy === 'loans.status' &&
                                                    sortDir === 'desc' && (
                                                        <span>
                                                            <HiMiniArrowSmallDown />
                                                        </span>
                                                    )}
                                            </div>
                                        </th>
                                        <th className="p-2 border">Quantity</th>
                                        <th className="p-2 border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loans.map((loan, index) => (
                                        <tr
                                            key={loan.id}
                                            className="hover:bg-gray-50">
                                            <td className="p-2 border text-center">
                                                {(meta.from ??
                                                    (page - 1) * perPage + 1) +
                                                    index}
                                            </td>
                                            {/* User */}
                                            <td className="p-2 border">
                                                {(() => {
                                                    const name =
                                                        loan.user?.name || ''
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
                                            {/* Book */}
                                            <td className="p-2 border">
                                                {(() => {
                                                    const title =
                                                        loan.book?.title || ''
                                                    const term = debouncedSearch
                                                        .trim()
                                                        .toLowerCase()
                                                    if (!term) return title
                                                    const parts = title.split(
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
                                            <td className="p-2 border text-center">
                                                {loan.borrowed_at}
                                            </td>
                                            <td className="p-2 border text-center">
                                                {loan.return_date || '-'}
                                            </td>
                                            <td className="p-2 border capitalize text-center">
                                                {loan.status}
                                            </td>
                                            <td className="p-2 border capitalize text-center">
                                                {loan.quantity}
                                            </td>
                                            <td className="p-2 border space-x-2 text-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedLoan({
                                                            ...loan,
                                                            user_id:
                                                                loan.user?.id, // pastikan ada ID user
                                                            book_id:
                                                                loan.book?.id, // pastikan ada ID book
                                                        })
                                                        setModalType('edit')
                                                    }}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded">
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedLoan(loan)
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
                        {modalType === 'add' && selectedLoan && (
                            <LoanModal
                                title="Add Loan"
                                selectedLoan={selectedLoan}
                                setSelectedLoan={setSelectedLoan}
                                setModalType={setModalType}
                                handleSubmit={handleAdd}
                                users={users}
                                books={books}
                            />
                        )}

                        {/* Modal Edit */}
                        {modalType === 'edit' && selectedLoan && (
                            <LoanModal
                                title="Edit Loan"
                                selectedLoan={selectedLoan}
                                setSelectedLoan={setSelectedLoan}
                                setModalType={setModalType}
                                handleSubmit={handleEdit}
                                users={users}
                                books={books}
                            />
                        )}

                        {/* Modal Delete */}
                        {modalType === 'delete' && selectedLoan && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
                                <div className="bg-white p-6 rounded shadow-md w-80">
                                    <h2 className="text-lg font-bold mb-4">
                                        Hapus Loan?
                                    </h2>
                                    <p>
                                        Yakin mau hapus loan:{' '}
                                        <b>
                                            {selectedLoan.user?.name} -{' '}
                                            {selectedLoan.book?.title}
                                        </b>
                                        ?
                                    </p>
                                    <div className="flex justify-end space-x-2 mt-4">
                                        <button
                                            onClick={() => setModalType(null)}
                                            className="px-3 py-1 bg-gray-400 text-white rounded">
                                            Batal
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(selectedLoan.id)
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

// 🔧 Ekstrak Modal Add/Edit supaya tidak duplikat
function LoanModal({
    title,
    selectedLoan,
    setSelectedLoan,
    setModalType,
    handleSubmit,
    users,
    books,
}) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-white p-6 rounded shadow-md w-96">
                <h2 className="text-lg font-bold mb-4">{title}</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* User Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            User
                        </label>
                        <Select
                            options={users.map(u => ({
                                value: u.id,
                                label: u.name,
                            }))}
                            value={
                                users
                                    .map(u => ({ value: u.id, label: u.name }))
                                    .find(
                                        opt =>
                                            opt.value === selectedLoan.user_id,
                                    ) || null
                            }
                            onChange={opt =>
                                setSelectedLoan({
                                    ...selectedLoan,
                                    user_id: opt.value,
                                })
                            }
                            placeholder="Select User"
                            isSearchable
                        />
                    </div>

                    {/* Book Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Book
                        </label>
                        <Select
                            options={books.map(b => ({
                                value: b.id,
                                label: `${b.title} ${
                                    b.available > 0
                                        ? `(Available ${b.available})`
                                        : '(Borrowed All)'
                                }`,
                                isDisabled: b.available <= 0,
                            }))}
                            value={
                                books
                                    .map(b => ({
                                        value: b.id,
                                        label: `${b.title} ${
                                            b.available > 0
                                                ? `(Available ${b.available})`
                                                : '(Borrowed All)'
                                        }`,
                                    }))
                                    .find(
                                        opt =>
                                            opt.value === selectedLoan.book_id,
                                    ) || null
                            }
                            onChange={opt =>
                                setSelectedLoan({
                                    ...selectedLoan,
                                    book_id: opt.value,
                                })
                            }
                            placeholder="Select Book"
                            isSearchable
                        />
                    </div>

                    {/* Borrowed At */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Borrowed At
                        </label>
                        <input
                            type="date"
                            value={selectedLoan.borrowed_at}
                            onChange={e =>
                                setSelectedLoan({
                                    ...selectedLoan,
                                    borrowed_at: e.target.value,
                                })
                            }
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>

                    {/* Return Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Return Date
                        </label>
                        <input
                            type="date"
                            value={selectedLoan.return_date || ''}
                            onChange={e =>
                                setSelectedLoan({
                                    ...selectedLoan,
                                    return_date: e.target.value || null,
                                })
                            }
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            value={selectedLoan.status}
                            onChange={e =>
                                setSelectedLoan({
                                    ...selectedLoan,
                                    status: e.target.value,
                                })
                            }
                            className="w-full border p-2 rounded">
                            <option value="borrowed">Borrowed</option>
                            <option value="returned">Returned</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => setModalType(null)}
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
    )
}
