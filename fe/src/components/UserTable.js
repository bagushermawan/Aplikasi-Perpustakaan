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
    Text,
    Avatar,
    FileButton,
    Select,
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

    const [roles, setRoles] = useState([])
    const [avatar, setAvatar] = useState(null)
    const [preview, setPreview] = useState(null)

    useEffect(() => {
        api.get('/api/roles').then(res => {
            const roleOptions = res.data.map(r => ({
                value: r.name,
                label: r.name.charAt(0).toUpperCase() + r.name.slice(1),
            }))
            setRoles(roleOptions)
        })
    }, [])

    // helper: ada avatar jika sudah punya preview ATAU user punya avatar_url
    const hasAvatar = !!(preview || selectedUser?.avatar_url)

    // cleanup objectURL saat berubah/unmount
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview)
        }
    }, [preview])

    const handleAdd = async e => {
        e.preventDefault()
        try {
            const formData = new FormData()
            formData.append('name', selectedUser.name)
            formData.append('email', selectedUser.email)
            formData.append('password', selectedUser.password)
            formData.append('role', selectedUser.role) // hanya single role
            if (avatar) formData.append('avatar', avatar)

            await toast.promise(api.post(`/api/perpus/users`, formData), {
                loading: '📡 Menyimpan user...',
                success: '👤 User ditambahkan!',
                error: '❌ Gagal tambah user',
            })
            mutate()
            setModalType(null)
        } catch (err) {
            console.error(err)
            toast.error('❌ Error simpan user')
        }
    }

    const handleEdit = async e => {
        e.preventDefault()
        try {
            const formData = new FormData()
            formData.append('name', selectedUser.name)
            formData.append('email', selectedUser.email)
            if (selectedUser.password) {
                formData.append('password', selectedUser.password)
            }
            formData.append('role', selectedUser.role)
            if (avatar) formData.append('avatar', avatar)

            await toast.promise(
                api.post(
                    `/api/perpus/users/${selectedUser.id}?_method=PUT`,
                    formData,
                ),
                {
                    loading: '⏳ Update user...',
                    success: '✏️ User diperbarui!',
                    error: '❌ Gagal update user',
                },
            )
            mutate()
            setModalType(null)
        } catch (err) {
            console.error(err)
            toast.error('❌ Error update user')
        }
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
                                <Table.Th>Nama</Table.Th>
                                <Table.Th>Email</Table.Th>
                                <Table.Th>Role</Table.Th>
                                <Table.Th>
                                    <Center>Aksi</Center>
                                </Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {users.map(u => (
                                <Table.Tr key={u.id}>
                                    {/* Checkbox */}
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
                                                <Center>
                                                    <Checkbox
                                                        checked={selectedIds.includes(
                                                            u.id,
                                                        )}
                                                        onChange={() =>
                                                            canDelete(u) &&
                                                            toggleSelect(u.id)
                                                        }
                                                        disabled={!canDelete(u)}
                                                        style={
                                                            !canDelete(u)
                                                                ? {
                                                                      cursor: 'not-allowed',
                                                                      opacity: 0.5,
                                                                  }
                                                                : {}
                                                        }
                                                    />
                                                </Center>
                                            )}
                                        </Center>
                                    </Table.Td>

                                    {/* Name */}
                                    <Table.Td fw={500}>{u.name}</Table.Td>

                                    {/* Email */}
                                    <Table.Td>{u.email}</Table.Td>

                                    {/* Roles => array */}
                                    <Table.Td>
                                        <Group gap="xs">
                                            {u.roles && u.roles.length > 0 ? (
                                                u.roles.map((role, i) => (
                                                    <Text
                                                        key={i}
                                                        tt="capitalize" // Mantine prop untuk text-transform
                                                        size="sm"
                                                        fw={500}>
                                                        {role}
                                                    </Text>
                                                ))
                                            ) : (
                                                <Text c="dimmed" size="sm">
                                                    No role
                                                </Text>
                                            )}
                                        </Group>
                                    </Table.Td>

                                    {/* Action Buttons */}
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
                        <Loader type="dots" />
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
                        {/* Avatar Upload */}
                        <Group justify="center" mb="md">
                            <Avatar
                                src={preview || null}
                                alt={selectedUser?.name}
                                size={80}
                                radius="xl"
                                color="blue">
                                {selectedUser?.name?.charAt(0)?.toUpperCase()}
                            </Avatar>

                            <FileButton
                                onChange={file => {
                                    setAvatar(file)
                                    if (file) {
                                        if (preview)
                                            URL.revokeObjectURL(preview)
                                        setPreview(URL.createObjectURL(file))
                                    } else {
                                        setPreview(null)
                                    }
                                }}
                                accept="image/png,image/jpeg">
                                {props => (
                                    <Button
                                        {...props}
                                        variant="light"
                                        size="xs">
                                        {preview
                                            ? 'Change avatar'
                                            : 'Upload avatar'}
                                    </Button>
                                )}
                            </FileButton>
                        </Group>

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

                        <Select
                            label="Role"
                            data={roles}
                            searchable
                            nothingFoundMessage="Role tidak ditemukan"
                            value={selectedUser?.role || null}
                            onChange={value =>
                                setSelectedUser({
                                    ...selectedUser,
                                    role: value,
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
                        <Group justify="center" mb="md">
                            <Avatar
                                src={
                                    preview || selectedUser?.avatar_url || null
                                }
                                alt={selectedUser?.name}
                                size={80}
                                radius="xl"
                                color="blue">
                                {selectedUser?.name?.charAt(0)?.toUpperCase()}
                            </Avatar>

                            <FileButton
                                onChange={file => {
                                    setAvatar(file)
                                    if (file) {
                                        if (preview)
                                            URL.revokeObjectURL(preview)
                                        setPreview(URL.createObjectURL(file))
                                    } else {
                                        setPreview(null)
                                    }
                                }}
                                accept="image/png,image/jpeg">
                                {props => (
                                    <Button
                                        {...props}
                                        variant="light"
                                        size="xs">
                                        {hasAvatar
                                            ? 'Change avatar'
                                            : 'Upload avatar'}
                                    </Button>
                                )}
                            </FileButton>
                        </Group>

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

                        <Select
                            label="Role"
                            data={roles}
                            searchable
                            nothingFoundMessage="Role tidak ditemukan"
                            value={
                                selectedUser?.role ||
                                (selectedUser?.roles?.[0] ?? null)
                            }
                            onChange={value =>
                                setSelectedUser({
                                    ...selectedUser,
                                    role: value,
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
