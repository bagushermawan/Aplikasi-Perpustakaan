'use client'

import Header from '@/app/(app)/Header'
import useSWR from 'swr'
import api from '@/lib/axios'
import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'

const fetcher = url => api.get(url).then(res => res.data)
const Dashboard = () => {
    const [modalType, setModalType] = useState(null)
    const [user, setUser] = useState(null)
    const [selectedBook, setSelectedBook] = useState(null)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const searchRef = useRef(null)
    const [page, setPage] = useState(1)
    const perPage = 12
    const [cart, setCart] = useState([])
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

    if (error) return <div className="p-6">⚠️ Gagal memuat data buku</div>
    const books = booksResp?.data || []
    const meta = booksResp?.meta || {}
    const lastPage = meta.last_page || 1

    // handler admin
    const handleAdd = async e => {
        e.preventDefault()
        try {
            const formData = new FormData()
            formData.append('title', selectedBook.title)
            formData.append('author', selectedBook.author)
            formData.append('stock', selectedBook.stock)
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
    const handleBorrow = async book => {
        const newLoan = {
            user_id: user.id,
            book_id: book.id,
            borrowed_at: new Date().toISOString().split('T')[0],
            return_date: null,
            status: 'borrowed',
        }
        await toast.promise(api.post('/api/perpus/loans', newLoan), {
            loading: '⏳ Meminjam buku...',
            success: '📖 Buku berhasil dipinjam!',
            error: '❌ Gagal meminjam buku',
        })
        mutate() // refresh daftar buku
        setModalType(null)
    }
    const addToCart = book => {
        const exist = cart.find(item => item.id === book.id)
        if (exist) {
            setCart(
                cart.map(item =>
                    item.id === book.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                ),
            )
        } else {
            setCart([...cart, { ...book, quantity: 1 }])
        }
        toast.success(`📚 ${book.title} ditambahkan ke cart`)
    }
    const removeFromCart = id => {
        setCart(cart.filter(item => item.id !== id))
        toast.success('Item dihapus dari cart')
    }
    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error('Keranjang masih kosong')
            return
        }

        try {
            await toast.promise(
                Promise.all(
                    cart.map(book => {
                        const newLoan = {
                            user_id: user.id,
                            book_id: book.id,
                            borrowed_at: new Date().toISOString().split('T')[0],
                            return_date: null,
                            status: 'borrowed',
                        }
                        return api.post('/api/perpus/loans', newLoan)
                    }),
                ),
                {
                    loading: '⏳ Checkout...',
                    success: '✅ Berhasil checkout!',
                    error: '❌ Gagal checkout',
                },
            )

            setCart([]) // kosongkan cart
            mutate() // refresh daftar buku
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <>
            <div className="py-12 relative">
                {isFocused && search.length === 0 && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-10"></div>
                )}
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h2 className="text-xl font-bold mb-4">
                                📚 Daftar Buku
                            </h2>
                            {/* Search */}
                            <div className="grid grid-cols-6 gap-2 mb-4">
                                <input
                                    ref={searchRef}
                                    type="text"
                                    placeholder="Cari Buku ... (Ctrl+K)"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => {
                                        if (search.length === 0)
                                            setIsFocused(false)
                                    }}
                                    className={`px-3 py-2 border rounded relative z-20 ${
                                        user?.role === 'admin'
                                            ? 'col-span-5'
                                            : 'col-span-6'
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
                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full z-30">
                                        Add Book
                                    </button>
                                )}
                            </div>
                            {isValidating && booksResp && (
                                <div className="text-xs text-gray-500 mb-3">
                                    Searching…
                                </div>
                            )}
                            {/* Table */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {books.map(book => (
                                    <div
                                        key={book.id}
                                        className="border rounded-lg shadow hover:shadow-lg p-4 flex flex-col">
                                        <div className="flex-1 mb-3">
                                            {book.cover ? (
                                                <img
                                                    src={book.cover}
                                                    alt={book.title}
                                                    className="w-full h-48 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded">
                                                    <span className="text-gray-500">
                                                        No Cover
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold">
                                            {(() => {
                                                const title = book.title
                                                const searchTerm =
                                                    debouncedSearch
                                                        .trim()
                                                        .toLowerCase()
                                                if (!searchTerm) return title

                                                // pecah string berdasarkan searchTerm
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
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            by {book.author}
                                        </p>
                                        <p className="text-sm mt-2">
                                            Stock:{' '}
                                            <span className="font-bold">
                                                {book.available}
                                            </span>{' '}
                                            / {book.stock}
                                        </p>
                                        <p className="text-sm mt-2">
                                            Harga:{' '}
                                            <span className="font-bold">
                                                {new Intl.NumberFormat(
                                                    'id-ID',
                                                    {
                                                        style: 'currency',
                                                        currency: 'IDR',
                                                        minimumFractionDigits: 2,
                                                    },
                                                ).format(book.harga)}
                                            </span>
                                        </p>

                                        {/* Action buttons */}
                                        <div className="mt-3 flex space-x-2">
                                            {user?.role === 'admin' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedBook(
                                                                book,
                                                            )
                                                            setModalType('edit')
                                                        }}
                                                        className="flex-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded">
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedBook(
                                                                book,
                                                            )
                                                            setModalType(
                                                                'delete',
                                                            )
                                                        }}
                                                        className="flex-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded">
                                                        Hapus
                                                    </button>
                                                </>
                                            )}

                                            {user?.role === 'user' && (
                                                <>
                                                    {book.available > 0 ? (
                                                        <button
                                                            onClick={() =>
                                                                addToCart(book)
                                                            }
                                                            className="flex-1 px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded">
                                                            Tambah ke Cart
                                                        </button>
                                                    ) : (
                                                        <button
                                                            disabled
                                                            className="flex-1 px-2 py-1 bg-gray-400 text-white text-sm rounded cursor-not-allowed">
                                                            Habis
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {/* Floating Cart */}
                                <div className="fixed top-28 right-3  w-80 bg-white shadow-lg border-l z-40 flex flex-col">
                                    <div className="p-4 border-b bg-gray-100 flex justify-between items-center">
                                        <h3 className="font-bold">🛒 Cart</h3>
                                        <button
                                            onClick={() => setCart([])}
                                            className="text-red-500 text-sm">
                                            Clear
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                        {cart.length === 0 ? (
                                            <p className="text-gray-500 text-sm">
                                                Cart masih kosong
                                            </p>
                                        ) : (
                                            cart.map(item => (
                                                <div
                                                    key={item.id}
                                                    className="border-b pb-2 flex flex-col gap-1">
                                                    {/* Judul */}
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-medium text-sm">
                                                                {item.title}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                by {item.author}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                removeFromCart(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="text-xs text-red-600">
                                                            Hapus
                                                        </button>
                                                    </div>

                                                    {/* Quantity control */}
                                                    <div className="flex justify-between items-center text-sm">
                                                        {/* Harga × Quantity */}
                                                        <div className="font-bold">
                                                            {new Intl.NumberFormat(
                                                                'id-ID',
                                                                {
                                                                    style: 'currency',
                                                                    currency:
                                                                        'IDR',
                                                                    minimumFractionDigits: 2,
                                                                },
                                                            ).format(
                                                                item.harga *
                                                                    item.quantity,
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                disabled={
                                                                    item.quantity <=
                                                                    1
                                                                }
                                                                onClick={() =>
                                                                    setCart(
                                                                        cart.map(
                                                                            b =>
                                                                                b.id ===
                                                                                item.id
                                                                                    ? {
                                                                                          ...b,
                                                                                          quantity:
                                                                                              b.quantity -
                                                                                              1,
                                                                                      }
                                                                                    : b,
                                                                        ),
                                                                    )
                                                                }
                                                                className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center disabled:opacity-50">
                                                                -
                                                            </button>
                                                            <span>
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                disabled={
                                                                    item.quantity >=
                                                                    item.stock
                                                                } // 🔥 batasi stock
                                                                onClick={() =>
                                                                    setCart(
                                                                        cart.map(
                                                                            b =>
                                                                                b.id ===
                                                                                item.id
                                                                                    ? {
                                                                                          ...b,
                                                                                          quantity:
                                                                                              b.quantity +
                                                                                              1,
                                                                                      }
                                                                                    : b,
                                                                        ),
                                                                    )
                                                                }
                                                                className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center disabled:opacity-50">
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-4 border-t space-y-2">
                                        <div className="flex justify-between font-semibold">
                                            <span>Total:</span>
                                            <span>
                                                {new Intl.NumberFormat(
                                                    'id-ID',
                                                    {
                                                        style: 'currency',
                                                        currency: 'IDR',
                                                        minimumFractionDigits: 2,
                                                    },
                                                ).format(
                                                    cart.reduce(
                                                        (sum, item) =>
                                                            sum +
                                                            item.harga *
                                                                item.quantity,
                                                        0,
                                                    ),
                                                )}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleCheckout}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm">
                                            Checkout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-center mt-6 space-x-4">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="px-3 py-1 border rounded bg-blue-200 hover:bg-blue-300 disabled:opacity-50">
                                Prev
                            </button>

                            {isValidating ? (
                                <span className="text-sm text-gray-500">
                                    Loading…
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
                                                            title: e.target
                                                                .value,
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
                                                            author: e.target
                                                                .value,
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
                                                            cover: e.target
                                                                .files[0],
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
                                                            stock: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="w-full border p-2 rounded"
                                                    required
                                                />
                                            </div>

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
                                                            title: e.target
                                                                .value,
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
                                                            author: e.target
                                                                .value,
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
                                                            src={
                                                                selectedBook.cover
                                                            }
                                                            alt={
                                                                selectedBook.title
                                                            }
                                                            className="w-20 h-28 object-cover rounded mb-2"
                                                        />
                                                    )}

                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e =>
                                                        setSelectedBook({
                                                            ...selectedBook,
                                                            cover: e.target
                                                                .files[0], // file baru
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
                                                            stock: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="w-full border p-2 rounded"
                                                    required
                                                />
                                            </div>

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
                                                onClick={() =>
                                                    setModalType(null)
                                                }
                                                className="px-3 py-1 bg-gray-400 text-white rounded">
                                                Batal
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        selectedBook.id,
                                                    )
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
        </>
    )
}

export default Dashboard
