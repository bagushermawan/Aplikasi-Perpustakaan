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
    Checkbox,
    Center,
    Loader,
} from '@mantine/core'

const fetcher = url => api.get(url).then(res => res.data)

export default function AllUsersPage() {
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [selectedUser, setSelectedUser] = useState(null)
    const [modalType, setModalType] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    const [selectedIds, setSelectedIds] = useState([])

    const [page, setPage] = useState(1)
    const perPage = 5

    useEffect(() => {
        api.get('/api/auth/user')
            .then(res => setCurrentUser(res.data))
            .catch(err => console.error('Gagal ambil user login', err))
    }, [])

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

    const canDelete = u => {
        if (!currentUser) return false
        if (u.id === currentUser.id) return false // tidak boleh hapus diri sendiri
        // if (currentUser.role === 'admin' && u.role === 'admin') return false // admin tidak boleh hapus admin lain
        return true
    }

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

    const toggleSelect = id => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
        )
    }

    const toggleSelectAll = () => {
        const deletableIds = users.filter(u => canDelete(u)).map(u => u.id)

        if (selectedIds.length === deletableIds.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(deletableIds)
        }
    }

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return
        await toast.promise(
            api.post(`/api/perpus/users/bulk-delete`, { ids: selectedIds }),
            {
                loading: '⏳ Menghapus user-user...',
                success: '🗑️ User dipilih dihapus!',
                error: '❌ Gagal hapus user',
            },
        )
        setSelectedIds([])
        mutate()
    }

    return (
        <Container size="xl" py="md">
            <Paper shadow="md" p="lg" radius="lg" withBorder>
                {/* Header */}
                <Group justify="space-between" mb="lg">
                    <Title order={2}>👥 Semua User</Title>
                    <Group gap="sm">
                        <Button
                            leftSection="➕"
                            color="teal"
                            onClick={() => {
                                setSelectedUser({
                                    name: '',
                                    email: '',
                                    password: '',
                                })
                                setModalType('add')
                            }}>
                            Tambah
                        </Button>
                        <Button
                            leftSection="🗑️"
                            color="red"
                            // variant="outline"
                            disabled={selectedIds.length === 0}
                            onClick={handleDeleteSelected}>
                            Hapus Terpilih ({selectedIds.length})
                        </Button>
                    </Group>
                </Group>

                {/* Search */}
                <TextInput
                    placeholder="🔍 Cari user..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    mb="md"
                    radius="md"
                    size="md"
                />

                {/* Table */}
                <ScrollArea>
                    <Table
                        highlightOnHover
                        striped
                        withTableBorder
                        withColumnBorders
                        verticalSpacing="sm"
                        horizontalSpacing="md">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>
                                    <Center>
                                        <Checkbox
                                            checked={
                                                users.length > 0 &&
                                                selectedIds.length ===
                                                    users.filter(canDelete)
                                                        .length
                                            }
                                            indeterminate={
                                                selectedIds.length > 0 &&
                                                selectedIds.length <
                                                    users.filter(canDelete)
                                                        .length
                                            }
                                            onChange={toggleSelectAll}
                                        />
                                    </Center>
                                </Table.Th>
                                <Table.Th>No</Table.Th>
                                <Table.Th>Nama</Table.Th>
                                <Table.Th>Email</Table.Th>
                                <Table.Th>
                                    <Center>Aksi</Center>
                                </Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {users.map((u, idx) => (
                                <Table.Tr key={u.id}>
                                    <Table.Td>
                                        <Center>
                                            {canDelete(u) ? (
                                                <Checkbox
                                                    checked={selectedIds.includes(
                                                        u.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleSelect(u.id)
                                                    }
                                                />
                                            ) : (
                                                <Checkbox
                                                    disabled
                                                    style={{
                                                        cursor: 'not-allowed',
                                                        opacity: 0.5,
                                                    }}
                                                />
                                            )}
                                        </Center>
                                    </Table.Td>
                                    <Table.Td>
                                        {(meta.from ??
                                            (page - 1) * perPage + 1) + idx}
                                    </Table.Td>
                                    <Table.Td fw={500}>{u.name}</Table.Td>
                                    <Table.Td>{u.email}</Table.Td>
                                    <Table.Td>
                                        <Group gap="xs" justify="center">
                                            <Button
                                                size="xs"
                                                variant="light"
                                                color="blue"
                                                onClick={() => {
                                                    setSelectedUser(u)
                                                    setModalType('edit')
                                                }}>
                                                Edit
                                            </Button>
                                            {canDelete(u) && (
                                                <Button
                                                    size="xs"
                                                    variant="light"
                                                    color="red"
                                                    onClick={() => {
                                                        setSelectedUser(u)
                                                        setModalType('delete')
                                                    }}>
                                                    Hapus
                                                </Button>
                                            )}
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>

                {/* Pagination */}
                <Group mt="lg" justify="space-between">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}>
                        Prev
                    </Button>
                    {isValidating ? (
                        <Loader type='dots'/>
                    ) : (
                        <span>
                            Page <b>{meta.current_page}</b> dari{' '}
                            <b>{meta.last_page}</b> (Total: {meta.total} user)
                        </span>
                    )}
                    <Button
                        variant="default"
                        size="sm"
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
                radius="lg"
                overlayProps={{ blur: 4 }}>
                <form onSubmit={handleAdd}>
                    <Stack>
                        <TextInput
                            label="Nama"
                            placeholder="Masukkan nama"
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
                            placeholder="Masukkan email"
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
                            placeholder="Minimal 6 karakter"
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
                radius="lg"
                overlayProps={{ blur: 4 }}>
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
                radius="lg"
                size="sm"
                overlayProps={{ blur: 4 }}>
                <Stack gap="xs">
                    <p>
                        Yakin mau hapus user <b>{selectedUser?.name}</b>?
                    </p>
                    <Group justify="flex-end">
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
                </Stack>
            </Modal>
        </Container>
    )
}
