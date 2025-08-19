'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/app/(app)/Header'
import api from '@/lib/axios'
import { FaUsers, FaBook, FaClipboardList, FaBookReader } from 'react-icons/fa'

const PerpusPage = () => {
    const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
        api.get('/api/auth/user')
            .then(res => setCurrentUser(res.data))
            .catch(err => console.error(err))
    }, [])
    const [stats, setStats] = useState({
        users: 0,
        books: 0,
        loans: 0,
        borrowedBooks: 0,
    })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const usersRes = await api.get('/api/perpus/users')
                const booksRes = await api.get('/api/perpus/books')
                const loansRes = await api.get('/api/perpus/loans')

                // total pakai meta.total
                const totalUsers = usersRes.data.meta.total
                const totalBooks = booksRes.data.meta.total
                const totalLoans = loansRes.data.meta.total

                // hitung loans yg status borrowed dari item yg sudah difetch
                // NOTE: ini hanya dari satu halaman. Kalau mau global, backend sebaiknya punya endpoint khusus.
                const borrowedRes = await api.get(
                    '/api/perpus/loans?status=borrowed',
                )
                const borrowedBooksCount = borrowedRes.data.meta.total

                setStats({
                    users: totalUsers,
                    books: totalBooks,
                    loans: totalLoans,
                    borrowedBooks: borrowedBooksCount,
                })
            } catch (error) {
                console.error('Failed to fetch stats', error)
            }
        }

        fetchStats()
    }, [])

    return (
        <>
            <Header title="Perpustakaan" />
            <div className="flex">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 p-6">
                    <h1 className="text-2xl font-bold mb-6">
                        Dashboard Perpustakaan
                    </h1>

                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:[grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
                        {/* Total Users */}
                        {currentUser?.role === 'admin' && (
                            <div className="bg-blue-500 text-white rounded-lg p-6 shadow flex items-center">
                                <FaUsers className="text-4xl mr-4" />
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Total Users
                                    </h2>
                                    <p className="mt-2 text-3xl font-bold">
                                        {stats.users}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Total Books */}
                        <div className="bg-green-500 text-white rounded-lg p-6 shadow flex items-center">
                            <FaBook className="text-4xl mr-4" />
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Total Books
                                </h2>
                                <p className="mt-2 text-3xl font-bold">
                                    {stats.books}
                                </p>
                            </div>
                        </div>

                        {/* Total Loans */}
                        <div className="bg-yellow-500 text-white rounded-lg p-6 shadow flex items-center">
                            <FaClipboardList className="text-4xl mr-4" />
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Total Loans
                                </h2>
                                <p className="mt-2 text-3xl font-bold">
                                    {stats.loans}
                                </p>
                            </div>
                        </div>

                        {/* Borrowed Books */}
                        <div className="bg-red-500 text-white rounded-lg p-6 shadow flex items-center">
                            <FaBookReader className="text-4xl mr-4" />
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Currently Borrowed
                                </h2>
                                <p className="mt-2 text-3xl font-bold">
                                    {stats.borrowedBooks}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Optional: welcome message */}
                    <div className="mt-8 bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-2">
                            Selamat Datang!
                        </h2>
                        {currentUser?.role === 'admin' && (
                            <p>
                                Ini adalah dashboard perpustakaan. Kamu bisa
                                melihat jumlah user, jumlah buku, pinjaman
                                aktif, dan statistik lainnya di sini.
                            </p>
                        )}
                        {currentUser?.role === 'user' && (
                            <p>
                                Ini adalah dashboard perpustakaan. Kamu bisa
                                melihat jumlah buku, pinjaman aktif, dan
                                statistik lainnya di sini.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default PerpusPage
