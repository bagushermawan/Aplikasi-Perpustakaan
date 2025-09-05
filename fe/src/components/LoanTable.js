'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import {
    Table,
    Button,
    Modal,
    TextInput,
    Select,
    Group,
    Pagination,
    Loader,
    Checkbox,
    Container,
    Title,
    Center,
    Paper,
} from '@mantine/core'

const fetcher = url => api.get(url).then(res => res.data)

export default function LoansTable() {
    const { data: users = [] } = useSWR('/api/perpus/users/all', fetcher)
    const { data: books = [] } = useSWR('/api/perpus/books/all', fetcher)

    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    const [modalType, setModalType] = useState(null) // add | edit | delete
    const [selectedLoan, setSelectedLoan] = useState(null)
    const [selectedIds, setSelectedIds] = useState([])

    const perPage = 5

    const {
        data: loansResp,
        error,
        isValidating,
        mutate,
    } = useSWR(
        `/api/perpus/loans?page=${page}&per_page=${perPage}${
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

    const loans = loansResp?.data || []
    const meta = loansResp?.meta || {}
    const lastPage = meta.last_page || 1

    // debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => {
        setPage(1)
        setSelectedIds([])
    }, [debouncedSearch])

    if (error) return <div>❌ Error loading loans</div>

    const handleAdd = async e => {
        e.preventDefault()
        await toast.promise(api.post(`/api/perpus/loans`, selectedLoan), {
            loading: '📡 Menyimpan pinjaman...',
            success: '📗 Loan berhasil ditambahkan!',
            error: '❌ Gagal menambah loan',
        })
        mutate()
        setModalType(null)
    }

    const handleEdit = async e => {
        e.preventDefault()
        await toast.promise(
            api.put(`/api/perpus/loans/${selectedLoan.id}`, selectedLoan),
            {
                loading: '⏳ Update loan...',
                success: '✏️ Loan berhasil diperbarui!',
                error: '❌ Gagal update loan',
            },
        )
        mutate()
        setModalType(null)
    }

    const handleDelete = async () => {
        await toast.promise(
            api.delete(`/api/perpus/loans/${selectedLoan.id}`),
            {
                loading: '⏳ Menghapus loan...',
                success: '🗑️ Loan berhasil dihapus!',
                error: '❌ Gagal menghapus loan',
            },
        )
        mutate()
        setModalType(null)
    }

    const handleBulkDelete = async () => {
        await toast.promise(
            api.post('/api/perpus/loans/bulk-delete', { ids: selectedIds }),
            {
                loading: '⏳ Menghapus banyak loan...',
                success: '🗑️ Beberapa loan berhasil dihapus!',
                error: '❌ Gagal menghapus loan',
            },
        )
        mutate()
        setSelectedIds([])
    }

    const toggleSelect = id => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
        )
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === loans.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(loans.map(l => l.id))
        }
    }

    return (
        <Container size="xl" py="md">
            <Paper shadow="md" p="lg" radius="lg" withBorder>
                <Group justify="space-between" mb="lg">
                    <Title order={2}>📚 Semua Loans/Transaksi</Title>
                    <Group>
                        <Button
                            onClick={() => {
                                setSelectedLoan({
                                    user_id: '',
                                    book_id: '',
                                    borrowed_at: new Date()
                                        .toISOString()
                                        .split('T')[0],
                                    return_date: '',
                                    status: 'borrowed',
                                })
                                setModalType('add')
                            }}>
                            + Add Loan
                        </Button>
                        {selectedIds.length > 0 && (
                            <Button color="red" onClick={handleBulkDelete}>
                                Bulk Delete ({selectedIds.length})
                            </Button>
                        )}
                    </Group>
                </Group>

                <TextInput
                    placeholder="🔍 Cari loan..."
                    value={search}
                    onChange={e => setSearch(e.currentTarget.value)}
                    mb="md"
                    radius="md"
                    size="md"
                />

                <Table
                    striped
                    highlightOnHover
                    withColumnBorders
                    withTableBorder
                    verticalSpacing="sm"
                    horizontalSpacing="md">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>
                                <Center>
                                    <Checkbox
                                        checked={
                                            selectedIds.length ===
                                                loans.length && loans.length > 0
                                        }
                                        indeterminate={
                                            selectedIds.length > 0 &&
                                            selectedIds.length < loans.length
                                        }
                                        onChange={toggleSelectAll}
                                    />
                                </Center>
                            </Table.Th>
                            <Table.Th>No</Table.Th>
                            <Table.Th>User</Table.Th>
                            <Table.Th>Book</Table.Th>
                            <Table.Th>Borrowed At</Table.Th>
                            <Table.Th>Return Date</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th ta="center">Aksi</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {loans.map((loan, idx) => (
                            <Table.Tr key={loan.id}>
                                <Table.Td>
                                    <Center>
                                        <Checkbox
                                            checked={selectedIds.includes(
                                                loan.id,
                                            )}
                                            onChange={() =>
                                                toggleSelect(loan.id)
                                            }
                                        />
                                    </Center>
                                </Table.Td>
                                <Table.Td>
                                    {(meta.from ?? (page - 1) * perPage + 1) +
                                        idx}
                                </Table.Td>
                                <Table.Td>{loan.user?.name}</Table.Td>
                                <Table.Td>{loan.book?.title}</Table.Td>
                                <Table.Td>{loan.borrowed_at}</Table.Td>
                                <Table.Td>{loan.return_date || '-'}</Table.Td>
                                <Table.Td>{loan.status}</Table.Td>
                                <Table.Td>
                                    <Group gap="xs" justify="center">
                                        <Button
                                            size="xs"
                                            variant="light"
                                            onClick={() => {
                                                setSelectedLoan({
                                                    ...loan,
                                                    user_id: loan.user?.id,
                                                    book_id: loan.book?.id,
                                                })
                                                setModalType('edit')
                                            }}>
                                            Edit
                                        </Button>
                                        <Button
                                            size="xs"
                                            color="red"
                                            variant="light"
                                            onClick={() => {
                                                setSelectedLoan(loan)
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

                {/* Pagination */}
                <Group mt="sm" justify="space-between">
                    <Button
                        variant="default"
                        disabled={page <= 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}>
                        Prev
                    </Button>
                    {isValidating ? (
                        <Loader type="dots" />
                    ) : (
                        <span>
                            Page {meta.current_page} dari {meta.last_page}{' '}
                            (Total: {meta.total})
                        </span>
                    )}
                    <Button
                        variant="default"
                        disabled={page >= lastPage}
                        onClick={() => setPage(p => Math.min(lastPage, p + 1))}>
                        Next
                    </Button>
                </Group>
            </Paper>

            {/* Modal Add/Edit */}
            <Modal
                opened={modalType === 'add' || modalType === 'edit'}
                onClose={() => setModalType(null)}
                title={modalType === 'add' ? 'Add Loan' : 'Edit Loan'}>
                {selectedLoan && (
                    <form
                        onSubmit={modalType === 'add' ? handleAdd : handleEdit}>
                        <Select
                            label="User"
                            data={users.map(u => ({
                                value: u.id.toString(),
                                label: u.name,
                            }))}
                            value={selectedLoan.user_id?.toString() || ''}
                            onChange={val =>
                                setSelectedLoan({
                                    ...selectedLoan,
                                    user_id: Number(val),
                                })
                            }
                            searchable
                            required
                        />
                        <Select
                            label="Book"
                            data={books.map(b => ({
                                value: b.id.toString(),
                                label: `${b.title} ${
                                    b.available > 0
                                        ? `(Available ${b.available})`
                                        : '(Borrowed All)'
                                }`,
                                disabled: b.available <= 0,
                            }))}
                            value={selectedLoan.book_id?.toString() || ''}
                            onChange={val =>
                                setSelectedLoan({
                                    ...selectedLoan,
                                    book_id: Number(val),
                                })
                            }
                            searchable
                            required
                            mt="sm"
                        />
                        <TextInput
                            label="Borrowed At"
                            type="date"
                            value={selectedLoan.borrowed_at}
                            onChange={e =>
                                setSelectedLoan({
                                    ...selectedLoan,
                                    borrowed_at: e.target.value,
                                })
                            }
                            required
                            mt="sm"
                        />
                        <TextInput
                            label="Return Date"
                            type="date"
                            value={selectedLoan.return_date || ''}
                            onChange={e =>
                                setSelectedLoan({
                                    ...selectedLoan,
                                    return_date: e.target.value,
                                })
                            }
                            mt="sm"
                        />
                        <Select
                            label="Status"
                            data={[
                                { value: 'borrowed', label: 'Borrowed' },
                                { value: 'returned', label: 'Returned' },
                            ]}
                            value={selectedLoan.status}
                            onChange={val =>
                                setSelectedLoan({
                                    ...selectedLoan,
                                    status: val,
                                })
                            }
                            mt="sm"
                            required
                        />
                        <Group justify="end" mt="md">
                            <Button
                                variant="outline"
                                onClick={() => setModalType(null)}>
                                Batal
                            </Button>
                            <Button type="submit">Simpan</Button>
                        </Group>
                    </form>
                )}
            </Modal>

            {/* Modal Delete */}
            <Modal
                opened={modalType === 'delete'}
                onClose={() => setModalType(null)}
                title="Hapus Loan?">
                <p>
                    Yakin mau hapus loan{' '}
                    <b>
                        {selectedLoan?.user?.name} - {selectedLoan?.book?.title}
                    </b>
                    ?
                </p>
                <Group justify="end" mt="md">
                    <Button
                        variant="outline"
                        onClick={() => setModalType(null)}>
                        Batal
                    </Button>
                    <Button color="red" onClick={handleDelete}>
                        Hapus
                    </Button>
                </Group>
            </Modal>
        </Container>
    )
}
