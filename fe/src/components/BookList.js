'use client'

import useSWR from 'swr'
import api from '@/lib/axios'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useCart } from '../app/(app)/context/CartContext'

const fetcher = url => api.get(url).then(res => res.data)

export default function BookList({ filterType }) {
    const { addToCart } = useCart()
    const [user, setUser] = useState(null)

    useEffect(() => {
        api.get('/api/auth/user').then(res => setUser(res.data))
    }, [])

    const [page, setPage] = useState(1)
    const perPage = 8
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState(search)

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(t)
    }, [search])

    const endpoint = `/api/perpus/books?page=${page}&per_page=${perPage}${
        debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''
    }${filterType ? `&filter=${filterType}` : ''}`

    const {
        data: booksResp,
        error,
        mutate,
        isValidating,
    } = useSWR(endpoint, fetcher, {
        keepPreviousData: true,
        revalidateOnFocus: false,
        dedupingInterval: 500,
    })

    if (error) return <div className="p-6">⚠️ Gagal memuat data buku</div>

    const books = booksResp?.data || []
    const meta = booksResp?.meta || {}
    const lastPage = meta.last_page || 1

    return (
        <div className="py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-6 bg-white border-b border-gray-200">
                        {/* Title */}
                        <h2 className="text-xl font-bold mb-4">
                            {filterType === 'bestseller'
                                ? '📈 Best Seller'
                                : filterType === 'promo'
                                  ? '🔥 Promo Spesial'
                                  : filterType === 'new-arrivals'
                                    ? '🆕 Buku Baru'
                                    : '📚 Semua Buku'}
                        </h2>

                        {isValidating && booksResp && (
                            <div className="text-xs text-gray-500 mb-3">
                                Loading…
                            </div>
                        )}

                        {/* Grid Buku */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {books.map(book => (
                                <div
                                    key={book.id}
                                    className="border rounded-lg shadow p-4 flex flex-col">
                                    {/* Cover */}
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
                                        {book.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        by {book.author}
                                    </p>

                                    <p className="text-sm mt-2">
                                        {filterType === 'bestseller'
                                            ? 'Terjual: '
                                            : 'Stock: '}
                                        <span className="font-bold">
                                            {book.borrowed}
                                        </span>
                                        /{book.stock}
                                    </p>
                                    <p className="text-sm mt-2">
                                        Harga:{' '}
                                        <span className="font-bold">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                            }).format(book.harga)}
                                        </span>
                                    </p>

                                    {book.discount > 0 && (
                                        <p className="text-sm text-red-600 font-bold">
                                            Diskon: {book.discount}%
                                        </p>
                                    )}

                                    {/* Button */}
                                    <div className="mt-3">
                                        {book.available > 0 ? (
                                            <button
                                                onClick={() => addToCart(book)}
                                                className="w-full px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded">
                                                Tambah ke Cart
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full px-2 py-1 bg-gray-400 text-white text-sm rounded cursor-not-allowed">
                                                Habis
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-center my-6 space-x-4">
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
                </div>
            </div>
        </div>
    )
}
