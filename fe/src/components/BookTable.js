'use client'
import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

const fetcher = url => api.get(url).then(res => res.data)

export default function AllBooksPage() {
    const [search, setSearch] = useState('')
    const [selectedBook, setSelectedBook] = useState(null)
    const [modalType, setModalType] = useState(null)
    const [user, setUser] = useState(null)
    const [selectedLoan, setSelectedLoan] = useState(null)
    const [debouncedSearch, setDebouncedSearch] = useState('')

    const [isFocused, setIsFocused] = useState(false)
    const searchRef = useRef(null)

    const [page, setPage] = useState(1)
    const perPage = 5

    const {
        data: booksResp,
        error,
        mutate,
        isValidating,
    } = useSWR(
        `/api/perpus/books?page=${page}&per_page=${perPage}${
            debouncedSearch
                ? `&search=${encodeURIComponent(debouncedSearch)}`
                : ''
        }`,
        fetcher,
        {
            keepPreviousData: true,
            revalidateOnFocus: false,
            dedupingInterval: 500,
        },
    )

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

    if (error) return <div>Error loading books</div>

    const books = booksResp?.data || []
    const meta = booksResp?.meta || {}
    const lastPage = meta.last_page || 1

    // --- Admin Book Handlers ---
    const handleAdd = async e => {
        e.preventDefault()
        try {
            const formData = new FormData()
            formData.append('title', selectedBook.title)
            formData.append('author', selectedBook.author)
            formData.append('stock', selectedBook.stock)
            formData.append('harga', selectedBook.harga)
            if (selectedBook.cover) {
                formData.append('cover', selectedBook.cover)
            }

            await toast.promise(
                api.post(`/api/perpus/books`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }),
                {
                    loading: '📡 Menyimpan buku...',
                    success: '📚 Buku berhasil ditambahkan!',
                    error: '❌ Gagal menambah buku',
                },
            )
            mutate()
            setModalType(null)
        } catch (err) {
            console.error(err)
            toast.error('❌ Gagal menambah buku')
        }
    }

    const handleEdit = async e => {
        e.preventDefault()
        try {
            const formData = new FormData()
            formData.append('title', selectedBook.title)
            formData.append('author', selectedBook.author)
            formData.append('stock', selectedBook.stock)
            formData.append('harga', selectedBook.harga)

            if (selectedBook.cover instanceof File) {
                formData.append('cover', selectedBook.cover)
            }

            await toast.promise(
                api.post(
                    `/api/perpus/books/${selectedBook.id}?_method=PUT`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } },
                ),
                {
                    loading: '⏳ Update buku...',
                    success: '✏️ Buku berhasil diperbarui!',
                    error: '❌ Gagal update buku',
                },
            )

            mutate()
            setModalType(null)
        } catch (err) {
            console.error(err)
            toast.error('❌ Gagal update buku')
        }
    }

    const handleDelete = async id => {
        try {
            await toast.promise(api.delete(`/api/perpus/books/${id}`), {
                loading: '⏳ Menghapus...',
                success: '🗑️ Buku berhasil dihapus!',
                error: '❌ Gagal menghapus buku',
            })

            mutate()
            setModalType(null)
        } catch (err) {
            console.error(err)
            toast.error('❌ Gagal menghapus buku')
        }
    }

    // --- User Borrow Handler ---
    const handleBorrow = async e => {
        e.preventDefault()

        await toast.promise(api.post('/api/perpus/loans', selectedLoan), {
            loading: '⏳ Meminjam buku...',
            success: '📖 Buku berhasil dipinjam!',
            error: '❌ Gagal meminjam buku',
        })

        mutate()
        setModalType(null)
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
                                    harga: '',
                                })
                                setModalType('add')
                            }}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full">
                            Add Book
                        </button>
                    )}
                </div>
                {isValidating && booksResp && (
                    <div className="text-xs text-gray-500 mb-3">Searching…</div>
                )}

                {/* Book Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 border">No</th>
                                <th className="p-2 border">Title</th>
                                <th className="p-2 border">Cover</th>
                                <th className="p-2 border">Author</th>
                                {user?.role === 'admin' && (
                                    <th className="p-2 border">Stock</th>
                                )}
                                <th className="p-2 border">Available</th>
                                <th className="p-2 border">Harga</th>
                                <th className="p-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map((book, index) => (
                                <tr key={book.id} className="hover:bg-gray-50">
                                    <td className="p-2 border text-center">
                                        {(meta.from ??
                                            (page - 1) * perPage + 1) + index}
                                    </td>
                                    <td className="p-2 border">
                                        {(() => {
                                            const title = book.title
                                            const searchTerm = debouncedSearch
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
                                    <td className="p-2 border text-center">
                                        {book.cover ? (
                                            <img
                                                src={book.cover}
                                                alt={book.title}
                                                className="w-16 h-20 object-cover rounded mx-auto"
                                            />
                                        ) : (
                                            <span className="text-gray-400">
                                                No cover
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-2 border">
                                        {book.author}
                                    </td>
                                    {user?.role === 'admin' && (
                                        <td className="p-2 border text-center">
                                            <span className="font-bold">
                                                {book.stock}
                                            </span>{' '}
                                            {book.borrowed > 0 && (
                                                <span className="text-gray-500">
                                                    (dibeli {book.borrowed})
                                                </span>
                                            )}
                                        </td>
                                    )}
                                    <td className="p-2 border text-center">
                                        {book.available === book.stock ? (
                                            <span className="font-bold">
                                                All
                                            </span>
                                        ) : (
                                            <span className="font-bold">
                                                {book.available}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-2 border text-center">
                                        <span className="font-bold">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                                minimumFractionDigits: 2,
                                            }).format(book.harga)}
                                        </span>
                                    </td>
                                    <td className="p-2 border space-x-2 text-center">
                                        {user?.role === 'admin' && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedBook(book)
                                                        setModalType('edit')
                                                    }}
                                                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded">
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedBook(book)
                                                        setModalType('delete')
                                                    }}
                                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded">
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
                        onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                        disabled={page >= lastPage}
                        className="px-3 py-1 border rounded bg-blue-200 hover:bg-blue-300 disabled:opacity-50">
                        Next
                    </button>
                </div>

                {/* --- Modals --- */}
                {/* Add Book */}
                {modalType === 'add' &&
                    selectedBook &&
                    user?.role === 'admin' && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
                            <div className="bg-white p-6 rounded shadow-md w-96">
                                <h2 className="text-lg font-bold mb-4">
                                    Add Book
                                </h2>
                                <form
                                    onSubmit={handleAdd}
                                    className="space-y-3">
                                    {/* Title */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedBook.title}
                                            onChange={e =>
                                                setSelectedBook({
                                                    ...selectedBook,
                                                    title: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded"
                                            required
                                        />
                                    </div>

                                    {/* Author */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Author
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedBook.author}
                                            onChange={e =>
                                                setSelectedBook({
                                                    ...selectedBook,
                                                    author: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded"
                                        />
                                    </div>

                                    {/* Cover Upload */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Cover
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e =>
                                                setSelectedBook({
                                                    ...selectedBook,
                                                    cover: e.target.files[0],
                                                })
                                            }
                                            className="w-full border p-2 rounded"
                                        />
                                    </div>

                                    {/* Stock */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Stock
                                        </label>
                                        <input
                                            type="number"
                                            value={selectedBook.stock}
                                            onChange={e =>
                                                setSelectedBook({
                                                    ...selectedBook,
                                                    stock: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded"
                                            required
                                        />
                                    </div>

                                    {/* Price */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Harga
                                        </label>
                                        <input
                                            type="number"
                                            value={selectedBook.harga}
                                            onChange={e =>
                                                setSelectedBook({
                                                    ...selectedBook,
                                                    harga: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded"
                                            required
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
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
                            <div className="bg-white p-6 rounded shadow-md w-96">
                                <h2 className="text-lg font-bold mb-4">
                                    Edit Book
                                </h2>
                                <form
                                    onSubmit={handleEdit}
                                    className="space-y-3">
                                    {/* Title */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedBook.title}
                                            onChange={e =>
                                                setSelectedBook({
                                                    ...selectedBook,
                                                    title: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded"
                                            required
                                        />
                                    </div>

                                    {/* Author */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Author
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedBook.author}
                                            onChange={e =>
                                                setSelectedBook({
                                                    ...selectedBook,
                                                    author: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded"
                                        />
                                    </div>

                                    {/* Cover Upload */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Cover
                                        </label>

                                        {/* preview cover lama */}
                                        {selectedBook.cover &&
                                            typeof selectedBook.cover ===
                                                'string' && (
                                                <img
                                                    src={selectedBook.cover}
                                                    alt={selectedBook.title}
                                                    className="w-20 h-28 object-cover rounded mb-2"
                                                />
                                            )}

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e =>
                                                setSelectedBook({
                                                    ...selectedBook,
                                                    cover: e.target.files[0], // file baru
                                                })
                                            }
                                            className="w-full border p-2 rounded"
                                        />
                                    </div>

                                    {/* Stock */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Stock
                                        </label>
                                        <input
                                            type="number"
                                            value={selectedBook.stock}
                                            onChange={e =>
                                                setSelectedBook({
                                                    ...selectedBook,
                                                    stock: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded"
                                            required
                                        />
                                    </div>

                                    {/* Price */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Harga
                                        </label>
                                        <input
                                            type="number"
                                            value={selectedBook.harga}
                                            onChange={e =>
                                                setSelectedBook({
                                                    ...selectedBook,
                                                    harga: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded"
                                            required
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
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
                            <div className="bg-white p-6 rounded shadow-md w-80">
                                <h2 className="text-lg font-bold mb-4">
                                    Delete Book?
                                </h2>
                                {/* Cover Preview */}
                                {selectedBook.cover && (
                                    <img
                                        src={
                                            selectedBook.cover.startsWith(
                                                'http',
                                            )
                                                ? selectedBook.cover
                                                : `/storage/${selectedBook.cover}`
                                        }
                                        alt={selectedBook.title}
                                        className="w-32 h-48 object-cover rounded mx-auto mb-4 shadow"
                                    />
                                )}
                                <p className="text-center">
                                    Yakin mau hapus buku:{' '}
                                    <b>{selectedBook.title}</b>?
                                </p>

                                <div className="flex justify-center space-x-2 mt-6">
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
