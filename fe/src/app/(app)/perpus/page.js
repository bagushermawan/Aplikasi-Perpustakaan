'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/axios'
import useSWR from 'swr'
import Link from 'next/link'
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

    // config cards
    const cards = [
        ...(currentUser?.role === 'admin'
            ? [
                  {
                      label: 'Total Users',
                      icon: FaUsers,
                      value: stats.users,
                      loading: loadingUsers,
                      color: '#3b82f6',
                      hover: '#2563eb',
                      href: '/perpus/users',
                  },
              ]
            : []),
        {
            label: 'Total Books',
            icon: FaBook,
            value: stats.books,
            loading: loadingBooks,
            color: '#22c55e',
            hover: '#16a34a',
            href: '/perpus/books',
        },
        {
            label: 'Total Loans',
            icon: FaClipboardList,
            value: stats.loans,
            loading: loadingLoans,
            color: '#eab308',
            hover: '#ca8a04',
            href: '/perpus/loans',
        },
        {
            label: 'Currently Borrowed',
            icon: FaBookReader,
            value: stats.borrowedBooks,
            loading: loadingBorrowed,
            color: '#ef4444',
            hover: '#dc2626',
            href: '/perpus/loans?status=borrowed',
        },
    ]

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
                    {cards.map(card => (
                        <Link
                            key={card.label}
                            href={card.href}
                            style={{ textDecoration: 'none' }}>
                            <Card
                                shadow="sm"
                                radius="md"
                                p="md"
                                style={{
                                    backgroundColor: card.color,
                                    transition: 'background-color 0.3s',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={e =>
                                    (e.currentTarget.style.backgroundColor =
                                        card.hover)
                                }
                                onMouseLeave={e =>
                                    (e.currentTarget.style.backgroundColor =
                                        card.color)
                                }>
                                <Group align="center">
                                    <card.icon size={36} color="white" />
                                    <div>
                                        <Text fw={500} c="white">
                                            {card.label}
                                        </Text>
                                        <Text size="xl" fw={700} c="white">
                                            {card.loading ? (
                                                <Loader
                                                    size="xs"
                                                    color="white"
                                                />
                                            ) : (
                                                card.value
                                            )}
                                        </Text>
                                    </div>
                                </Group>
                            </Card>
                        </Link>
                    ))}
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
