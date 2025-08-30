'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import {
    Button,
    Group,
    TextInput,
    NumberInput,
    FileInput,
    Table,
    Modal,
    Stack,
    Paper,
    Badge,
    Container,
    Title,
    ScrollArea,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks'

const fetcher = url => api.get(url).then(res => res.data)

export default function AllBooksPage() {
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [selectedBook, setSelectedBook] = useState(null)
    const [selectedLoan, setSelectedLoan] = useState(null)
    const [modalType, setModalType] = useState(null)
    const [user, setUser] = useState(null)
    const searchRef = useRef(null)

    const [page, setPage] = useState(1)
    const perPage = 5

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

    // debounce
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    if (error) return <div>❌ Gagal load buku</div>

    const books = booksResp?.data || []
    const meta = booksResp?.meta || {}
    const lastPage = meta.last_page || 1

    // --- Handlers (Add/Edit/Delete/Borrow) sama seperti sebelumnya ---
    const handleAdd = async e => {
        e.preventDefault()
        try {
            const formData = new FormData()
            formData.append('title', selectedBook.title)
            formData.append('author', selectedBook.author)
            formData.append('stock', selectedBook.stock)
            formData.append('harga', selectedBook.harga)
            if (selectedBook.cover instanceof File)
                formData.append('cover', selectedBook.cover)
            if (selectedBook.discount)
                formData.append('discount', selectedBook.discount)

            await toast.promise(api.post(`/api/perpus/books`, formData), {
                loading: '📡 Menyimpan...',
                success: '📚 Buku ditambahkan!',
                error: '❌ Gagal simpan',
            })
            mutate()
            setModalType(null)
        } catch (err) {
            console.error(err)
            toast.error('❌ Error simpan')
        }
    }

    const handleEdit = async e => {
        e.preventDefault()
        try {
            const formData = new FormData()
            formData.append('title', selectedBook.title)
            formData.append('author', selectedBook.author)
            formData.append('stock', selectedBook.stock)
            formData.append('harga', selectedBook.harga)
            if (selectedBook.cover instanceof File)
                formData.append('cover', selectedBook.cover)
            if (selectedBook.discount)
                formData.append('discount', selectedBook.discount)

            await toast.promise(
                api.post(
                    `/api/perpus/books/${selectedBook.id}?_method=PUT`,
                    formData,
                ),
                {
                    loading: '⏳ Update...',
                    success: '✏️ Buku diperbarui!',
                    error: '❌ Update gagal',
                },
            )
            mutate()
            setModalType(null)
        } catch (err) {
            console.error(err)
            toast.error('❌ Error update')
        }
    }

    const handleDelete = async () => {
        try {
            await toast.promise(
                api.delete(`/api/perpus/books/${selectedBook.id}`),
                {
                    loading: '🗑 Menghapus...',
                    success: '✅ Buku dihapus',
                    error: '❌ Hapus gagal',
                },
            )
            mutate()
            setModalType(null)
        } catch (err) {
            console.error(err)
        }
    }

    const handleBorrow = async () => {
        try {
            await toast.promise(api.post('/api/perpus/loans', selectedLoan), {
                loading: '⏳ Meminjam buku...',
                success: '📖 Berhasil dipinjam',
                error: '❌ Pinjam gagal',
            })
            mutate()
            setModalType(null)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <Container size="xl" py="md">
            <Paper shadow="sm" p="md" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                    <Title order={3}>📚 Semua Buku</Title>
                    {user?.role === 'admin' && (
                        <Button
                            color="teal"
                            onClick={() => {
                                setSelectedBook({
                                    title: '',
                                    author: '',
                                    stock: 0,
                                    harga: 0,
                                    discount: 0,
                                })
                                setModalType('add')
                            }}>
                            + Tambah Buku
                        </Button>
                    )}
                </Group>

                <TextInput
                    placeholder="Cari Buku..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    mb="md"
                />

                <ScrollArea>
                    <Table
                        striped
                        highlightOnHover
                        withColumnBorders
                        withTableBorder
                        verticalSpacing="sm"
                        horizontalSpacing="md">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>No</Table.Th>
                                <Table.Th>Judul</Table.Th>
                                <Table.Th>Cover</Table.Th>
                                <Table.Th>Penulis</Table.Th>
                                <Table.Th>Stok</Table.Th>
                                <Table.Th>Available</Table.Th>
                                <Table.Th>Discount</Table.Th>
                                <Table.Th>Harga</Table.Th>
                                <Table.Th>Aksi</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {books.map((book, idx) => (
                                <Table.Tr key={book.id}>
                                    <Table.Td>
                                        {(meta.from ??
                                            (page - 1) * perPage + 1) + idx}
                                    </Table.Td>
                                    <Table.Td fw={600}>{book.title}</Table.Td>
                                    <Table.Td>
                                        {book.cover ? (
                                            <img
                                                src={book.cover}
                                                width={50}
                                                height={70}
                                                style={{
                                                    objectFit: 'cover',
                                                    borderRadius: 4,
                                                }}
                                            />
                                        ) : (
                                            <Badge color="gray" variant="light">
                                                No Cover
                                            </Badge>
                                        )}
                                    </Table.Td>
                                    <Table.Td>{book.author || '-'}</Table.Td>
                                    <Table.Td>
                                        <Badge
                                            color={
                                                book.stock > 5
                                                    ? 'green'
                                                    : 'yellow'
                                            }>
                                            {book.stock}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge
                                            color={
                                                book.available > 0
                                                    ? 'blue'
                                                    : 'red'
                                            }>
                                            {book.available}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        {book.discount > 0 ? (
                                            <Badge
                                                color="pink"
                                                variant="filled">
                                                {book.discount}%
                                            </Badge>
                                        ) : (
                                            <span>-</span>
                                        )}
                                    </Table.Td>
                                    <Table.Td>
                                        <span
                                            style={{
                                                color: 'green',
                                                fontWeight: 600,
                                            }}>
                                            Rp{' '}
                                            {Number(book.harga).toLocaleString(
                                                'id-ID',
                                            )}
                                        </span>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            <Button
                                                size="xs"
                                                variant="light"
                                                color="blue"
                                                onClick={() => {
                                                    setSelectedBook(book)
                                                    setModalType('edit')
                                                }}>
                                                Edit
                                            </Button>
                                            <Button
                                                size="xs"
                                                variant="light"
                                                color="red"
                                                onClick={() => {
                                                    setSelectedBook(book)
                                                    setModalType('delete')
                                                }}>
                                                Hapus
                                            </Button>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>

                {/* Pagination */}
                <Group mt="sm" justify="space-between">
                    <Button
                        variant="default"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}>
                        Prev
                    </Button>
                    {isValidating ? (
                        <span>⏳ Loading…</span>
                    ) : (
                        <span>
                            Hal {meta.current_page} dari {meta.last_page}{' '}
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

            {/* Mantine Modals */}
            <Modal
                opened={modalType === 'add'}
                onClose={() => setModalType(null)}
                title="➕ Tambah Buku"
                radius="md"
                size="md"
                overlayProps={{ blur: 3 }}
                centered>
                <form onSubmit={handleAdd}>
                    <Stack>
                        <TextInput
                            label="Judul"
                            placeholder="Masukkan judul buku"
                            value={selectedBook?.title || ''}
                            onChange={e =>
                                setSelectedBook({
                                    ...selectedBook,
                                    title: e.target.value,
                                })
                            }
                            required
                        />
                        <TextInput
                            label="Penulis"
                            placeholder="Masukkan nama penulis"
                            value={selectedBook?.author || ''}
                            onChange={e =>
                                setSelectedBook({
                                    ...selectedBook,
                                    author: e.target.value,
                                })
                            }
                        />

                        {/* Preview cover */}
                        {selectedBook?.cover && (
                            <div style={{ marginTop: 10 }}>
                                <img
                                    src={
                                        selectedBook.cover instanceof File
                                            ? URL.createObjectURL(
                                                  selectedBook.cover,
                                              )
                                            : selectedBook.cover
                                    }
                                    alt="Preview Cover"
                                    style={{
                                        width: 120,
                                        height: 170,
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                        boxShadow: '0 0 6px rgba(0,0,0,0.2)',
                                    }}
                                />
                            </div>
                        )}
                        <FileInput
                            label="Cover Buku"
                            placeholder="Pilih file cover"
                            accept="image/*"
                            onChange={file =>
                                setSelectedBook({
                                    ...selectedBook,
                                    cover: file,
                                })
                            }
                            clearable
                        />

                        <NumberInput
                            label="Harga"
                            placeholder="100000"
                            value={selectedBook?.harga || 0}
                            onChange={val =>
                                setSelectedBook({ ...selectedBook, harga: val })
                            }
                            min={0}
                            required
                        />
                        <NumberInput
                            label="Diskon (%)"
                            value={selectedBook?.discount || 0}
                            onChange={val =>
                                setSelectedBook({
                                    ...selectedBook,
                                    discount: val,
                                })
                            }
                            min={0}
                            max={100}
                        />
                        <NumberInput
                            label="Stok"
                            placeholder="0"
                            value={selectedBook?.stock || 0}
                            onChange={val =>
                                setSelectedBook({ ...selectedBook, stock: val })
                            }
                            min={0}
                            required
                        />
                    </Stack>

                    <Group justify="flex-end" mt="lg">
                        <Button
                            variant="default"
                            onClick={() => setModalType(null)}>
                            Batal
                        </Button>
                        <Button type="submit" color="green">
                            Simpan
                        </Button>
                    </Group>
                </form>
            </Modal>

            <Modal
                opened={modalType === 'edit'}
                onClose={() => setModalType(null)}
                title="✏️ Edit Buku"
                radius="md"
                size="md"
                overlayProps={{ blur: 3 }}
                centered>
                <form onSubmit={handleEdit}>
                    <Stack>
                        <TextInput
                            label="Judul"
                            value={selectedBook?.title || ''}
                            onChange={e =>
                                setSelectedBook({
                                    ...selectedBook,
                                    title: e.target.value,
                                })
                            }
                            required
                        />
                        <TextInput
                            label="Penulis"
                            value={selectedBook?.author || ''}
                            onChange={e =>
                                setSelectedBook({
                                    ...selectedBook,
                                    author: e.target.value,
                                })
                            }
                        />
                        {/* Preview cover lama atau baru */}
                        {selectedBook?.cover && (
                            <div style={{ marginTop: 10 }}>
                                <img
                                    src={
                                        selectedBook.cover instanceof File
                                            ? URL.createObjectURL(
                                                  selectedBook.cover,
                                              ) // preview file baru
                                            : selectedBook.cover // URL cover lama
                                    }
                                    alt="Preview Cover"
                                    style={{
                                        width: 120,
                                        height: 170,
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                        boxShadow: '0 0 6px rgba(0,0,0,0.2)',
                                    }}
                                />
                            </div>
                        )}
                        <FileInput
                            label="Cover Buku"
                            placeholder="Pilih cover baru"
                            accept="image/*"
                            onChange={file =>
                                setSelectedBook({
                                    ...selectedBook,
                                    cover: file,
                                })
                            }
                            clearable
                        />
                        <NumberInput
                            label="Harga"
                            value={selectedBook?.harga || 0}
                            onChange={val =>
                                setSelectedBook({ ...selectedBook, harga: val })
                            }
                            min={0}
                            required
                        />
                        <NumberInput
                            label="Diskon (%)"
                            value={selectedBook?.discount || 0}
                            onChange={val =>
                                setSelectedBook({
                                    ...selectedBook,
                                    discount: val,
                                })
                            }
                            min={0}
                            max={100}
                        />
                        <NumberInput
                            label="Stok"
                            value={selectedBook?.stock || 0}
                            onChange={val =>
                                setSelectedBook({ ...selectedBook, stock: val })
                            }
                            min={0}
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

            <Modal
                opened={modalType === 'delete'}
                onClose={() => setModalType(null)}
                title="⚠️ Hapus Buku?"
                radius="md"
                size="sm"
                overlayProps={{ blur: 3, backgroundOpacity: 0.55 }}
                centered>
                <Stack align="center" spacing="sm">
                    {selectedBook?.cover && (
                        <img
                            src={selectedBook.cover}
                            alt={selectedBook.title}
                            style={{
                                width: 100,
                                height: 140,
                                objectFit: 'cover',
                                borderRadius: 8,
                            }}
                        />
                    )}
                    <Title order={5}>
                        Yakin mau hapus buku:{' '}
                        <span style={{ color: 'red' }}>
                            {selectedBook?.title}
                        </span>{' '}
                        ?
                    </Title>
                </Stack>
                <Group justify="flex-end" mt="lg">
                    <Button
                        variant="default"
                        onClick={() => setModalType(null)}>
                        Batal
                    </Button>
                    <Button color="red" onClick={handleDelete}>
                        Hapus
                    </Button>
                </Group>
            </Modal>

            <Modal
                opened={modalType === 'borrow'}
                onClose={() => setModalType(null)}
                title="Pinjam Buku"
                centered>
                <form onSubmit={handleBorrow}>
                    <TextInput
                        label="Buku"
                        value={selectedBook?.title || ''}
                        readOnly
                    />
                    <DateInput
                        label="Tanggal Pinjam"
                        value={
                            selectedLoan?.borrowed_at
                                ? new Date(selectedLoan.borrowed_at)
                                : null
                        }
                        onChange={d =>
                            setSelectedLoan({
                                ...selectedLoan,
                                borrowed_at: d.toISOString().split('T')[0],
                            })
                        }
                    />
                    <DateInput
                        label="Tanggal Kembali"
                        value={
                            selectedLoan?.return_date
                                ? new Date(selectedLoan.return_date)
                                : null
                        }
                        onChange={d =>
                            setSelectedLoan({
                                ...selectedLoan,
                                return_date: d
                                    ? d.toISOString().split('T')[0]
                                    : null,
                            })
                        }
                    />
                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="default"
                            onClick={() => setModalType(null)}>
                            Batal
                        </Button>
                        <Button type="submit">Pinjam</Button>
                    </Group>
                </form>
            </Modal>
        </Container>
    )
}
