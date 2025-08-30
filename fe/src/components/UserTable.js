'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import {
    Button,
    Group,
    TextInput,
    Table,
    Modal,
    Paper,
    Container,
    Title,
    ScrollArea,
    Stack,
} from '@mantine/core'

const fetcher = url => api.get(url).then(res => res.data)

export default function AllUsersPage() {
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [selectedUser, setSelectedUser] = useState(null)
    const [modalType, setModalType] = useState(null)

    const [page, setPage] = useState(1)
    const perPage = 5

    const {
        data: usersResp,
        error,
        mutate,
        isValidating,
    } = useSWR(
        `/api/perpus/users?page=${page}&per_page=${perPage}${
            debouncedSearch
                ? `&search=${encodeURIComponent(debouncedSearch)}`
                : ''
        }`,
        fetcher,
        {
            keepPreviousData: true,
            revalidateOnFocus: false,
            dedupingInterval: 300,
        },
    )

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    if (error) return <div>❌ Gagal memuat user</div>

    const users = usersResp?.data || []
    const meta = usersResp?.meta || {}
    const lastPage = meta.last_page || 1

    const handleAdd = async e => {
        e.preventDefault()
        await toast.promise(api.post(`/api/perpus/users`, selectedUser), {
            loading: '📡 Menyimpan user...',
            success: '👤 User ditambahkan!',
            error: '❌ Gagal tambah user',
        })
        mutate()
        setModalType(null)
    }

    const handleEdit = async e => {
        e.preventDefault()
        await toast.promise(
            api.put(`/api/perpus/users/${selectedUser.id}`, selectedUser),
            {
                loading: '⏳ Update user...',
                success: '✏️ User diperbarui!',
                error: '❌ Gagal update user',
            },
        )
        mutate()
        setModalType(null)
    }

    const handleDelete = async id => {
        await toast.promise(api.delete(`/api/perpus/users/${id}`), {
            loading: '⏳ Menghapus user...',
            success: '🗑️ User dihapus!',
            error: '❌ Gagal hapus user',
        })
        mutate()
        setModalType(null)
    }

    return (
        <Container size="lg" py="md">
            <Paper shadow="sm" p="md" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                    <Title order={3}>👥 Semua User</Title>
                    <Button
                        color="teal"
                        onClick={() => {
                            setSelectedUser({
                                name: '',
                                email: '',
                                password: '',
                            })
                            setModalType('add')
                        }}>
                        + Tambah User
                    </Button>
                </Group>

                <TextInput
                    placeholder="Cari user..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    mb="md"
                />

                <ScrollArea>
                    <Table
                        striped
                        highlightOnHover
                        withTableBorder
                        withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>No</Table.Th>
                                <Table.Th>Nama</Table.Th>
                                <Table.Th>Email</Table.Th>
                                <Table.Th>Aksi</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {users.map((u, idx) => (
                                <Table.Tr key={u.id}>
                                    <Table.Td>
                                        {(meta.from ??
                                            (page - 1) * perPage + 1) + idx}
                                    </Table.Td>
                                    <Table.Td fw={500}>{u.name}</Table.Td>
                                    <Table.Td>{u.email}</Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            <Button
                                                size="xs"
                                                color="blue"
                                                variant="light"
                                                onClick={() => {
                                                    setSelectedUser(u)
                                                    setModalType('edit')
                                                }}>
                                                Edit
                                            </Button>
                                            <Button
                                                size="xs"
                                                color="red"
                                                variant="light"
                                                onClick={() => {
                                                    setSelectedUser(u)
                                                    setModalType('delete')
                                                }}>
                                                Delete
                                            </Button>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>

                {/* Pagination */}
                <Group mt="md" justify="space-between">
                    <Button
                        variant="default"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}>
                        Prev
                    </Button>
                    {isValidating ? (
                        <span>⏳ Memuat…</span>
                    ) : (
                        <span>
                            Page {meta.current_page} dari {meta.last_page}{' '}
                            (Total: {meta.total})
                        </span>
                    )}
                    <Button
                        variant="default"
                        onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                        disabled={page >= lastPage}>
                        Next
                    </Button>
                </Group>
            </Paper>

            {/* Modal Add */}
            <Modal
                opened={modalType === 'add'}
                onClose={() => setModalType(null)}
                title="➕ Tambah User"
                centered
                radius="md"
                overlayProps={{ blur: 3 }}>
                <form onSubmit={handleAdd}>
                    <Stack>
                        <TextInput
                            label="Nama"
                            value={selectedUser?.name || ''}
                            onChange={e =>
                                setSelectedUser({
                                    ...selectedUser,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                        <TextInput
                            label="Email"
                            type="email"
                            value={selectedUser?.email || ''}
                            onChange={e =>
                                setSelectedUser({
                                    ...selectedUser,
                                    email: e.target.value,
                                })
                            }
                            required
                        />
                        <TextInput
                            label="Password"
                            type="password"
                            value={selectedUser?.password || ''}
                            onChange={e =>
                                setSelectedUser({
                                    ...selectedUser,
                                    password: e.target.value,
                                })
                            }
                            required
                        />
                    </Stack>
                    <Group justify="flex-end" mt="lg">
                        <Button
                            variant="default"
                            onClick={() => setModalType(null)}>
                            Batal
                        </Button>
                        <Button type="submit" color="teal">
                            Simpan
                        </Button>
                    </Group>
                </form>
            </Modal>

            {/* Modal Edit */}
            <Modal
                opened={modalType === 'edit'}
                onClose={() => setModalType(null)}
                title="✏️ Edit User"
                centered
                radius="md"
                overlayProps={{ blur: 3 }}>
                <form onSubmit={handleEdit}>
                    <Stack>
                        <TextInput
                            label="Nama"
                            value={selectedUser?.name || ''}
                            onChange={e =>
                                setSelectedUser({
                                    ...selectedUser,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                        <TextInput
                            label="Email"
                            type="email"
                            value={selectedUser?.email || ''}
                            onChange={e =>
                                setSelectedUser({
                                    ...selectedUser,
                                    email: e.target.value,
                                })
                            }
                            required
                        />
                    </Stack>
                    <Group justify="flex-end" mt="lg">
                        <Button
                            variant="default"
                            onClick={() => setModalType(null)}>
                            Batal
                        </Button>
                        <Button type="submit" color="blue">
                            Update
                        </Button>
                    </Group>
                </form>
            </Modal>

            {/* Modal Delete */}
            <Modal
                opened={modalType === 'delete'}
                onClose={() => setModalType(null)}
                title="⚠️ Hapus User?"
                centered
                radius="md"
                size="sm"
                overlayProps={{ blur: 3 }}>
                <p>
                    Yakin mau hapus user <b>{selectedUser?.name}</b> ?
                </p>
                <Group justify="flex-end" mt="md">
                    <Button
                        variant="default"
                        onClick={() => setModalType(null)}>
                        Batal
                    </Button>
                    <Button
                        color="red"
                        onClick={() => handleDelete(selectedUser.id)}>
                        Hapus
                    </Button>
                </Group>
            </Modal>
        </Container>
    )
}

