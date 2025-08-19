'use client'
import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import api from '@/lib/axios'

const fetcher = url => api.get(url).then(res => res.data.data)

export default function AllBooksPage() {
    const { data: books, error, mutate } = useSWR('/api/perpus/books', fetcher)
    const [search, setSearch] = useState('')
    const [selectedBook, setSelectedBook] = useState(null)
    const [modalType, setModalType] = useState(null)
    const [user, setUser] = useState(null)
    const [selectedLoan, setSelectedLoan] = useState(null)

    const [isFocused, setIsFocused] = useState(false)
    const searchRef = useRef(null)

    useEffect(() => {
        api.get('/api/auth/user').then(res => setUser(res.data))
    }, [])

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

    // Hilangkan blur kalau user ngetik
    useEffect(() => {
        if (search.length > 0) {
            setIsFocused(false)
        }
    }, [search])

    if (error) return <div>Error loading books</div>
    if (!books) return <div>Loading...</div>

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()),
    )

    // --- Admin Book Handlers ---
    const handleAdd = async e => {
        e.preventDefault()
        await api.post(`/api/perpus/books`, selectedBook)
        mutate()
        setModalType(null)
    }

    const handleEdit = async e => {
        e.preventDefault()
        await api.put(`/api/perpus/books/${selectedBook.id}`, selectedBook)
        mutate()
        setModalType(null)
    }

    const handleDelete = async id => {
        if (!confirm('Yakin hapus book ini?')) return
        await api.delete(`/api/perpus/books/${id}`)
        mutate()
        setModalType(null)
    }

    // --- User Borrow Handler ---
    const handleBorrow = async e => {
        e.preventDefault()
        try {
            await api.post('/api/perpus/loans', selectedLoan)
            mutate()
            setModalType(null)
        } catch (err) {
            console.error(err)
            alert('Gagal meminjam buku')
        }
    }

    return (
        <div className="relative">
            {isFocused && search.length === 0 && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-10"></div>
            )}
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">All Books</h1>

                {/* Search + Add Button */}
                <div className="grid grid-cols-6 gap-2 mb-4">
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Cari Buku ... (Ctrl+K)"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                            // kalau blur manual & kosong → reset
                            if (search.length === 0) setIsFocused(false)
                        }}
                        className={`px-3 py-2 border rounded relative z-20 ${
                            user?.role === 'admin' ? 'col-span-5' : 'col-span-6'
                        }`}
                    />
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => {
                                setSelectedBook({
                                    title: '',
                                    author: '',
                                    stock: '',
                                })
                                setModalType('add')
                            }}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full">
                            Add Book
                        </button>
                    )}
                </div>

                {/* Book Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 border">No</th>
                                <th className="p-2 border">Title</th>
                                <th className="p-2 border">Author</th>
                                {user?.role === 'admin' && (
                                    <th className="p-2 border">Stock</th>
                                )}
                                <th className="p-2 border">Available</th>
                                <th className="p-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBooks.map((book, index) => (
                                <tr key={book.id} className="hover:bg-gray-50">
                                    <td className="p-2 border text-center">
                                        {index + 1}
                                    </td>
                                    <td className="p-2 border">
                                        {(() => {
                                            const title = book.title
                                            const searchTerm = search
                                                .trim()
                                                .toLowerCase()
                                            if (!searchTerm) return title
                                            const parts = title.split(
                                                new RegExp(
                                                    `(${searchTerm})`,
                                                    'gi',
                                                ),
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
                                    <td className="p-2 border">
                                        {book.author}
                                    </td>
                                    {user?.role === 'admin' && (
                                        <td className="p-2 border text-center">
                                            {book.stock} (borrowed{' '}
                                            {book.borrowed})
                                        </td>
                                    )}
                                    <td className="p-2 border text-center">
                                        {book.available}
                                    </td>
                                    <td className="p-2 border space-x-2 text-center">
                                        {user?.role === 'admin' && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedBook(book)
                                                        setModalType('edit')
                                                    }}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded">
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedBook(book)
                                                        setModalType('delete')
                                                    }}
                                                    className="px-3 py-1 bg-red-500 text-white rounded">
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                        {user?.role === 'user' &&
                                            book.available > 0 && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedBook(book)
                                                        setSelectedLoan({
                                                            user_id: user.id,
                                                            book_id: book.id,
                                                            borrowed_at:
                                                                new Date()
                                                                    .toISOString()
                                                                    .split(
                                                                        'T',
                                                                    )[0],
                                                            return_date: '',
                                                            status: 'borrowed',
                                                        })
                                                        setModalType('borrow')
                                                    }}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded">
                                                    Pinjam Buku
                                                </button>
                                            )}
                                        {user?.role === 'user' &&
                                            book.available <= 0 && (
                                                <button
                                                    disabled
                                                    className="px-3 py-1 bg-gray-400 text-white rounded cursor-not-allowed">
                                                    Borrowed All
                                                </button>
                                            )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- Modals --- */}
                {/* Add Book */}
                {modalType === 'add' &&
                    selectedBook &&
                    user?.role === 'admin' && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white p-6 rounded shadow-md w-96">
                                <h2 className="text-lg font-bold mb-4">
                                    Add Book
                                </h2>
                                <form
                                    onSubmit={handleAdd}
                                    className="space-y-3">
                                    {['title', 'author', 'stock'].map(field => (
                                        <div key={field} className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-700">
                                                {field.charAt(0).toUpperCase() +
                                                    field.slice(1)}
                                            </label>
                                            <input
                                                type={
                                                    field === 'stock'
                                                        ? 'number'
                                                        : 'text'
                                                }
                                                value={selectedBook[field]}
                                                onChange={e =>
                                                    setSelectedBook({
                                                        ...selectedBook,
                                                        [field]: e.target.value,
                                                    })
                                                }
                                                className="w-full border p-2 rounded"
                                            />
                                        </div>
                                    ))}
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
                    )}

                {/* Edit Book */}
                {modalType === 'edit' &&
                    selectedBook &&
                    user?.role === 'admin' && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white p-6 rounded shadow-md w-96">
                                <h2 className="text-lg font-bold mb-4">
                                    Edit Book
                                </h2>
                                <form
                                    onSubmit={handleEdit}
                                    className="space-y-3">
                                    {['title', 'author', 'stock'].map(field => (
                                        <div key={field} className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-700">
                                                {field.charAt(0).toUpperCase() +
                                                    field.slice(1)}
                                            </label>
                                            <input
                                                type={
                                                    field === 'stock'
                                                        ? 'number'
                                                        : 'text'
                                                }
                                                value={selectedBook[field]}
                                                onChange={e =>
                                                    setSelectedBook({
                                                        ...selectedBook,
                                                        [field]: e.target.value,
                                                    })
                                                }
                                                className="w-full border p-2 rounded"
                                            />
                                        </div>
                                    ))}
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

                {/* Delete Book */}
                {modalType === 'delete' &&
                    selectedBook &&
                    user?.role === 'admin' && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white p-6 rounded shadow-md w-80">
                                <h2 className="text-lg font-bold mb-4">
                                    Hapus Book?
                                </h2>
                                <p>
                                    Yakin mau hapus book:{' '}
                                    <b>{selectedBook.title}?</b>
                                </p>
                                <div className="flex justify-end space-x-2 mt-4">
                                    <button
                                        onClick={() => setModalType(null)}
                                        className="px-3 py-1 bg-gray-400 text-white rounded">
                                        Batal
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDelete(selectedBook.id)
                                        }
                                        className="px-3 py-1 bg-red-600 text-white rounded">
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                {/* Borrow Book (User) */}
                {modalType === 'borrow' &&
                    selectedLoan &&
                    user?.role === 'user' && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white p-6 rounded shadow-md w-96">
                                <h2 className="text-lg font-bold mb-4">
                                    Pinjam Buku
                                </h2>
                                <form
                                    onSubmit={handleBorrow}
                                    className="space-y-3">
                                    {/* Book */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Book
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedBook.title}
                                            readOnly
                                            className="w-full border p-2 rounded bg-gray-100"
                                        />
                                    </div>

                                    {/* Borrowed At */}
                                    <div className="space-y-1">
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
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Return Date
                                        </label>
                                        <input
                                            type="date"
                                            value={
                                                selectedLoan.return_date || ''
                                            }
                                            onChange={e =>
                                                setSelectedLoan({
                                                    ...selectedLoan,
                                                    return_date:
                                                        e.target.value || null,
                                                })
                                            }
                                            className="w-full border p-2 rounded"
                                        />
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
                                            Pinjam
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    )
}
