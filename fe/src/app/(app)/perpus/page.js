'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/axios'
import useSWR from 'swr'
import { FaUsers, FaBook, FaClipboardList, FaBookReader } from 'react-icons/fa'
import {
    Card,
    Group,
    Text,
    SimpleGrid,
    Title,
    Container,
    Loader,
} from '@mantine/core'

const fetcher = url => api.get(url).then(res => res.data)

const PerpusPage = () => {
    const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
        api.get('/api/auth/user')
            .then(res => setCurrentUser(res.data))
            .catch(err => console.error(err))
    }, [])

    // pakai SWR untuk masing-masing data
    const { data: usersResp, isValidating: loadingUsers } = useSWR(
        '/api/perpus/users',
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 500 },
    )
    const { data: booksResp, isValidating: loadingBooks } = useSWR(
        '/api/perpus/books',
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 500 },
    )
    const { data: loansResp, isValidating: loadingLoans } = useSWR(
        '/api/perpus/loans',
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 500 },
    )
    const { data: borrowedResp, isValidating: loadingBorrowed } = useSWR(
        '/api/perpus/loans?status=borrowed',
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 500 },
    )

    const isLoading =
        loadingUsers || loadingBooks || loadingLoans || loadingBorrowed

    const stats = {
        users: usersResp?.meta?.total ?? 0,
        books: booksResp?.meta?.total ?? 0,
        loans: loansResp?.meta?.total ?? 0,
        borrowedBooks: borrowedResp?.meta?.total ?? 0,
    }

    return (
        <Container size="lg" py="xl">
            <Card shadow="sm" p="lg" radius="md" withBorder>
                <Title order={2} mb="md">
                    Dashboard Perpustakaan
                </Title>

                <SimpleGrid
                    cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
                    spacing="lg"
                    mb="lg">
                    {/* Total Users */}
                    {currentUser?.role === 'admin' && (
                        <Card
                            shadow="sm"
                            radius="md"
                            p="md"
                            style={{
                                backgroundColor: '#3b82f6',
                                transition: 'background-color 0.3s',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={e =>
                                (e.currentTarget.style.backgroundColor =
                                    '#2563eb')
                            }
                            onMouseLeave={e =>
                                (e.currentTarget.style.backgroundColor =
                                    '#3b82f6')
                            }>
                            <Group align="center">
                                <FaUsers size={36} color="white" />
                                <div>
                                    <Text fw={500} c="white">
                                        Total Users
                                    </Text>
                                    <Text size="xl" fw={700} c="white">
                                        {loadingUsers ? (
                                            <Loader size="xs" color="white" />
                                        ) : (
                                            stats.users
                                        )}
                                    </Text>
                                </div>
                            </Group>
                        </Card>
                    )}

                    {/* Total Books */}
                    <Card
                        shadow="sm"
                        radius="md"
                        p="md"
                        style={{
                            backgroundColor: '#22c55e',
                            transition: 'background-color 0.3s',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={e =>
                            (e.currentTarget.style.backgroundColor = '#16a34a')
                        }
                        onMouseLeave={e =>
                            (e.currentTarget.style.backgroundColor = '#22c55e')
                        }>
                        <Group align="center">
                            <FaBook size={36} color="white" />
                            <div>
                                <Text fw={500} c="white">
                                    Total Books
                                </Text>
                                <Text size="xl" fw={700} c="white">
                                    {loadingBooks ? (
                                        <Loader size="xs" color="white" />
                                    ) : (
                                        stats.books
                                    )}
                                </Text>
                            </div>
                        </Group>
                    </Card>

                    {/* Total Loans */}
                    <Card
                        shadow="sm"
                        radius="md"
                        p="md"
                        style={{
                            backgroundColor: '#eab308',
                            transition: 'background-color 0.3s',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={e =>
                            (e.currentTarget.style.backgroundColor = '#ca8a04')
                        }
                        onMouseLeave={e =>
                            (e.currentTarget.style.backgroundColor = '#eab308')
                        }>
                        <Group align="center">
                            <FaClipboardList size={36} color="white" />
                            <div>
                                <Text fw={500} c="white">
                                    Total Loans
                                </Text>
                                <Text size="xl" fw={700} c="white">
                                    {loadingLoans ? (
                                        <Loader size="xs" color="white" />
                                    ) : (
                                        stats.loans
                                    )}
                                </Text>
                            </div>
                        </Group>
                    </Card>

                    {/* Borrowed Books */}
                    <Card
                        shadow="sm"
                        radius="md"
                        p="md"
                        style={{
                            backgroundColor: '#ef4444',
                            transition: 'background-color 0.3s',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={e =>
                            (e.currentTarget.style.backgroundColor = '#dc2626')
                        }
                        onMouseLeave={e =>
                            (e.currentTarget.style.backgroundColor = '#ef4444')
                        }>
                        <Group align="center">
                            <FaBookReader size={36} color="white" />
                            <div>
                                <Text fw={500} c="white">
                                    Currently Borrowed
                                </Text>
                                <Text size="xl" fw={700} c="white">
                                    {loadingBorrowed ? (
                                        <Loader size="xs" color="white" />
                                    ) : (
                                        stats.borrowedBooks
                                    )}
                                </Text>
                            </div>
                        </Group>
                    </Card>
                </SimpleGrid>
            </Card>

            <Card mt="lg" shadow="sm" p="lg" radius="md" withBorder>
                <Title order={3} mb="sm">
                    Selamat Datang!
                </Title>
                {currentUser?.role === 'admin' && (
                    <Text>
                        Ini adalah dashboard perpustakaan. Kamu bisa melihat
                        jumlah user, jumlah buku, pinjaman aktif, dan statistik
                        lainnya di sini.
                    </Text>
                )}
                {currentUser?.role === 'user' && (
                    <Text>
                        Ini adalah dashboard perpustakaan. Kamu bisa melihat
                        jumlah buku, pinjaman aktif, dan statistik lainnya di
                        sini.
                    </Text>
                )}
            </Card>
        </Container>
    )
}

export default PerpusPage
