'use client'

import useSWR from 'swr'
import api from '@/lib/axios'
import { useEffect, useState } from 'react'
import { useCart } from '../app/(app)/context/CartContext'
import toast from 'react-hot-toast'
import { usePathname, useSearchParams } from 'next/navigation'

const fetcher = url => api.get(url).then(res => res.data)

export default function BookList({ filterType }) {
    const pathname = usePathname()
    const { addToCart } = useCart()
    const [user, setUser] = useState(null)

    useEffect(() => {
        api.get('/api/auth/user').then(res => setUser(res.data))
    }, [])

    const [page, setPage] = useState(1)
    const perPage = 8

    const searchParams = useSearchParams()
    const rawSearch = searchParams.get('search') || ''

    const [debouncedSearch, setDebouncedSearch] = useState(rawSearch)
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(rawSearch), 300)
        return () => clearTimeout(t)
    }, [rawSearch])

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

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
                                  : filterType === 'newest'
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
                                    className="relative border rounded-xl shadow-md p-4 flex flex-col bg-white hover:shadow-xl transition duration-200 overflow-hidden">
                                    {/* Promo Pill */}
                                    {book.discount > 0 && (
                                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                                            -{book.discount}%
                                        </span>
                                    )}

                                    {/* Cover */}
                                    <div className="flex-1 mb-3">
                                        {book.cover ? (
                                            <img
                                                src={book.cover}
                                                alt={book.title}
                                                className="w-full h-48 object-cover rounded-md transition-transform duration-200 hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded">
                                                <span className="text-gray-400">
                                                    No Cover
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-base font-semibold line-clamp-2">
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
                                    </h3>

                                    {/* Author */}
                                    <p className="text-sm text-gray-500 italic mb-2">
                                        {(() => {
                                            const author = book.author
                                            const searchTerm = debouncedSearch
                                                .trim()
                                                .toLowerCase()
                                            if (!searchTerm) return author
                                            const parts = author.split(
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
                                    </p>

                                    {/* Info Tambahan */}
                                    <p className="text-xs text-gray-500">
                                        {filterType === 'newest' ? (
                                            <>Diposting: {book.created_at}</>
                                        ) : filterType === 'bestseller' ? (
                                            <>
                                                Terjual:{' '}
                                                <span className="font-semibold">
                                                    {book.terjual}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                Stock:{' '}
                                                <span className="font-semibold">
                                                    {book.available}
                                                </span>{' '}
                                                / {book.stock}
                                            </>
                                        )}
                                    </p>

                                    {/* Harga */}
                                    <div className="mt-2">
                                        {book.discount > 0 ? (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="line-through text-gray-400 text-sm">
                                                    Rp {book.harga_formatted}
                                                </span>
                                                <span className="font-bold text-green-600 text-lg">
                                                    Rp{' '}
                                                    {book.final_price_formatted}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="font-bold text-lg text-gray-800">
                                                Rp {book.harga_formatted}
                                            </span>
                                        )}
                                    </div>

                                    {/* Tombol */}
                                    <div className="mt-3">
                                        {book.available > 0 ? (
                                            <button
                                                onClick={() => addToCart(book)}
                                                className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg shadow transition">
                                                + Keranjang
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full py-2 bg-gray-300 text-gray-600 text-sm font-semibold rounded-lg cursor-not-allowed">
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
