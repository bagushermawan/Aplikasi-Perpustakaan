'use client'

import {
    Group,
    Box,
    Container,
    Menu,
    Button,
    Text,
    Burger,
    Drawer,
    ScrollArea,
    UnstyledButton,
    ActionIcon,
    Indicator,
    TextInput,
    Avatar,
    Badge,
    Stack,
    Divider,
    Paper,
    Modal,
    CloseButton,
} from '@mantine/core'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/auth'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
    FaShoppingCart,
    FaHeart,
    FaBook,
    FaUserCircle,
    FaHistory,
    FaCog,
    FaSignOutAlt,
    FaTachometerAlt,
    FaUsers,
    FaShieldAlt,
    FaSearch,
    FaBell,
    FaStore,
    FaBookOpen,
    FaTags,
    FaGift,
} from 'react-icons/fa'
import { IoChevronDown, IoLocationSharp, IoGrid } from 'react-icons/io5'
import { useCart } from './context/CartContext'
import api from '@/lib/axios'

const SEARCH_MODAL_ID = 'search-modal'

const Navigation = ({ user }) => {
    const { cart, showCart, setShowCart } = useCart()
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

    const { logout, editProfile } = useAuth()
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [drawerOpened, setDrawerOpened] = useState(false)

    const [userRole, setUserRole] = useState(null)
    useEffect(() => {
        api.get('/api/auth/user').then(res => setUserRole(res.data))
    }, [])
    const role = (userRole?.role ?? user?.role ?? '').toLowerCase()
    const isAdmin = role === 'admin'
    const displayName = userRole?.name ?? user?.name
    const displayEmail = userRole?.email ?? user?.email
    const avatarUrl = userRole?.avatar_url ?? user?.avatar_url

    const [search, setSearch] = useState(searchParams.get('search') || '')
    useEffect(() => {
        setSearch(searchParams.get('search') || '')
    }, [searchParams])

    const [searchOpen, setSearchOpen] = useState(false)
    const [modalSearch, setModalSearch] = useState('')
    const modalSearchRef = useRef(null)

    useEffect(() => {
        setModalSearch(searchParams.get('search') || '')
    }, [searchParams])

    const handleSearchSubmit = value => {
        updateQuery(value)
        setSearchOpen(false)
        setModalSearch('')
    }

    useEffect(() => {
        const handleKey = e => {
            const tag = (e.target?.tagName || '').toLowerCase()
            const isTyping =
                tag === 'input' ||
                tag === 'textarea' ||
                e.target?.isContentEditable
            if (
                !isTyping &&
                (e.ctrlKey || e.metaKey) &&
                e.key.toLowerCase() === 'k'
            ) {
                e.preventDefault()
                setSearchOpen(true)
            }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [])

    useEffect(() => {
        if (searchOpen) {
            setModalSearch(searchParams.get('search') || '')
            setTimeout(() => {
                modalSearchRef.current?.focus()
            }, 150)
        }
    }, [searchOpen, searchParams])

    const updateQuery = value => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value.trim() !== '') {
            params.set('search', value)
        } else {
            params.delete('search')
        }
        const qs = params.toString()
        router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
    }

    const mainMenuItems = [
        { label: 'All Book', icon: IoGrid, href: '/dashboard' },
        {
            label: 'Promo',
            icon: FaTags,
            href: '/dashboard/promo',
            badge: 'Hot',
        },
        { label: 'Best Seller', icon: FaGift, href: '/dashboard/bestseller' },
        { label: 'Buku Baru', icon: FaBookOpen, href: '/dashboard/newest' },
    ]

    const mainMenuisAdminItems = [
        { label: 'Dashboard', icon: IoGrid, href: '/perpus' },
        { label: 'All Users', icon: FaTags, href: '/perpus/users' },
        { label: 'All Books', icon: FaGift, href: '/perpus/books' },
        { label: 'All Loans', icon: FaBookOpen, href: '/perpus/loans' },
    ]

    const userMenuItems = [
        { label: 'Profil Saya', icon: FaUserCircle, href: '/profile' },
        { label: 'Pesanan Saya', icon: FaHistory, href: '/orders' },
        { label: 'Wishlist', icon: FaHeart, href: '/wishlist' },
        { label: 'Pengaturan', icon: FaCog, href: '/settings' },
    ]

    const adminMenuItems = [
        { label: 'Dashboard', icon: FaTachometerAlt, href: '/dashboard' },
        { label: 'Manajemen Role', icon: FaUsers, href: '/roles' },
        { label: 'Permissions', icon: FaShieldAlt, href: '/permissions' },
        { label: 'Kelola Toko', icon: FaStore, href: '/perpus' },
    ]

    return (
        <>
            <Modal
                id={SEARCH_MODAL_ID}
                opened={searchOpen}
                onClose={() => {
                    setSearchOpen(false)
                    setModalSearch('') // Reset saat modal ditutup
                }}
                closeOnClickOutside
                closeOnEscape
                // centered
                size="lg"
                radius="md"
                overlayProps={{ backgroundOpacity: 0.45, blur: 6 }}
                withCloseButton
                title={<Text fw={600}>Cari Buku</Text>}>
                <form
                    onSubmit={e => {
                        e.preventDefault()
                        handleSearchSubmit(modalSearch)
                    }}
                    style={{ width: '100%' }}>
                    <TextInput
                        ref={modalSearchRef}
                        placeholder="Cari judul buku, penulis, atau ISBN..."
                        value={modalSearch}
                        onChange={e => setModalSearch(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleSearchSubmit(modalSearch)
                            }
                        }}
                        size="md"
                        radius="md"
                        leftSection={<FaSearch size={16} />}
                        rightSection={
                            <CloseButton
                                aria-label="Clear input"
                                onClick={() => setModalSearch('')}
                                style={{
                                    display: modalSearch ? undefined : 'none',
                                }}
                            />
                        }
                    />
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>Tekan Enter untuk cari, Esc untuk tutup</span>
                        <div className="hidden sm:flex items-center gap-1">
                            <span className="px-1.5 py-0.5 border rounded">
                                Ctrl
                            </span>
                            <span>+</span>
                            <span className="px-1.5 py-0.5 border rounded">
                                K
                            </span>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Top Bar */}
            <Box bg="gray.0" style={{ borderBottom: '1px solid #e0e0e0' }}>
                <Container size="xl">
                    <Group justify="space-between" h={40}>
                        <Group gap="xs">
                            <IoLocationSharp size={14} />
                            <Text size="xs" c="dimmed">
                                Dikirim dari{' '}
                                <Text span fw={500}>
                                    Xx
                                </Text>
                            </Text>
                        </Group>
                    </Group>
                </Container>
            </Box>

            {/* Main Navigation */}
            <Box
                component="nav"
                bg="pink"
                style={{
                    borderBottom: '2px solid #f0f0f0',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                }}>
                <Container size="xl" py="md">
                    <Group justify="space-between" align="center">
                        {/* Logo & Search */}
                        <Group gap="xl" style={{ flex: 1 }}>
                            <Link
                                href="/dashboard"
                                style={{ textDecoration: 'none' }}>
                                <Group gap="xs">
                                    <FaBook size={32} color="#ffdeeb" />
                                    <Stack gap={0}>
                                        <Text fw={700} size="lg" c="pink.1">
                                            BookStore
                                        </Text>
                                        <Text size="xs" c="pink.1">
                                            Toko Buku Online
                                        </Text>
                                    </Stack>
                                </Group>
                            </Link>

                            {/* Search Input (hiasan) - Desktop */}
                            {pathname.startsWith('/perpus') || (
                                <Box
                                    style={{
                                        flex: 1,
                                        maxWidth: 500,
                                        position: 'relative',
                                    }}
                                    visibleFrom="sm">
                                    <TextInput
                                        placeholder="Cari judul buku atau penulis (Ctrl+K)"
                                        value={search}
                                        readOnly
                                        tabIndex={-1}
                                        radius="xl"
                                        size="md"
                                        leftSection={<FaSearch size={16} />}
                                        rightSection={
                                            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                                                <span className="px-1.5 py-0.5 border rounded">
                                                    Ctrl
                                                </span>
                                                <span>+</span>
                                                <span className="px-1.5 py-0.5 border rounded">
                                                    K
                                                </span>
                                            </div>
                                        }
                                        rightSectionWidth={90}
                                        className="z-10"
                                        styles={{
                                            input: {
                                                pointerEvents: 'none',
                                                cursor: 'text',
                                            },
                                        }}
                                    />
                                    <UnstyledButton
                                        onClick={() => setSearchOpen(true)}
                                        aria-haspopup="dialog"
                                        aria-controls={SEARCH_MODAL_ID}
                                        title="Buka pencarian (Ctrl+K)"
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            zIndex: 20,
                                            cursor: 'text',
                                        }}
                                        onKeyDown={e => {
                                            if (
                                                e.key === 'Enter' ||
                                                e.key === ' '
                                            ) {
                                                e.preventDefault()
                                                setSearchOpen(true)
                                            }
                                        }}
                                    />
                                </Box>
                            )}
                        </Group>

                        {/* Action Icons */}
                        <Group gap="sm" visibleFrom="sm">
                            <ActionIcon
                                size="xl"
                                variant="subtle"
                                color="white"
                                radius="xl">
                                <Indicator
                                    color="indigo"
                                    size={8}
                                    processing
                                    offset={6}>
                                    <FaBell size={20} />
                                </Indicator>
                            </ActionIcon>

                            <ActionIcon
                                size="xl"
                                variant="subtle"
                                color="white"
                                radius="xl"
                                onClick={() => setShowCart(!showCart)}>
                                <Indicator
                                    label={totalItems}
                                    size={18}
                                    disabled={totalItems === 0}
                                    offset={6}
                                    color="indigo">
                                    <FaShoppingCart size={20} />
                                </Indicator>
                            </ActionIcon>

                            <Divider orientation="vertical" />

                            {/* User Menu */}
                            <Menu
                                shadow="md"
                                width={260}
                                position="bottom-end"
                                transitionProps={{
                                    transition: 'pop-top-right',
                                }}>
                                <Menu.Target>
                                    <UnstyledButton>
                                        <Group gap="xs">
                                            <Avatar
                                                src={avatarUrl || null} // kasih url avatar
                                                size="md"
                                                radius="xl"
                                                color="blue">
                                                {!avatarUrl &&
                                                    displayName
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                            </Avatar>

                                            <Stack gap={0} visibleFrom="sm">
                                                <Text
                                                    size="sm"
                                                    fw={500}
                                                    c="white">
                                                    {displayName}
                                                </Text>
                                                <Badge
                                                    size="xs"
                                                    variant="light"
                                                    bg="white"
                                                    color={
                                                        isAdmin ? 'red' : 'blue'
                                                    }>
                                                    {isAdmin ? 'ADMIN' : 'USER'}
                                                </Badge>
                                            </Stack>

                                            <IoChevronDown size={16} />
                                        </Group>
                                    </UnstyledButton>
                                </Menu.Target>

                                <Menu.Dropdown>
                                    <Menu.Label>Akun Saya</Menu.Label>
                                    {userMenuItems.map(item => (
                                        <Menu.Item
                                            key={item.label}
                                            leftSection={
                                                <item.icon size={16} />
                                            }
                                            onClick={item.action}
                                            component={
                                                item.href ? Link : 'button'
                                            }
                                            href={item.href}>
                                            {item.label}
                                        </Menu.Item>
                                    ))}

                                    {isAdmin && (
                                        <>
                                            <Menu.Divider />
                                            <Menu.Label>Admin Panel</Menu.Label>
                                            {adminMenuItems.map(item => (
                                                <Menu.Item
                                                    key={item.label}
                                                    leftSection={
                                                        <item.icon size={16} />
                                                    }
                                                    component={Link}
                                                    href={item.href}>
                                                    {item.label}
                                                </Menu.Item>
                                            ))}
                                        </>
                                    )}

                                    <Menu.Divider />
                                    <Menu.Item
                                        color="red"
                                        leftSection={<FaSignOutAlt size={16} />}
                                        onClick={logout}>
                                        Keluar
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </Group>

                        {/* Burger for mobile */}
                        <Burger
                            opened={drawerOpened}
                            onClick={() => setDrawerOpened(o => !o)}
                            hiddenFrom="sm"
                        />
                    </Group>

                    {/* Search Input (hiasan) - Mobile */}
                    <Box
                        mt="sm"
                        hiddenFrom="sm"
                        style={{ position: 'relative' }}>
                        <TextInput
                            placeholder="Cari buku... (Ctrl+K)"
                            value={search}
                            readOnly
                            tabIndex={-1}
                            radius="xl"
                            size="md"
                            leftSection={<FaSearch size={16} />}
                            styles={{
                                input: {
                                    pointerEvents: 'none',
                                    cursor: 'text',
                                },
                            }}
                        />
                        <UnstyledButton
                            onClick={() => setSearchOpen(true)}
                            aria-haspopup="dialog"
                            aria-controls={SEARCH_MODAL_ID}
                            title="Buka pencarian (Ctrl+K)"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                zIndex: 20,
                                cursor: 'text',
                            }}
                            onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    setSearchOpen(true)
                                }
                            }}
                        />
                    </Box>
                </Container>

                {/* Category Navigation */}
                <Box bg="gray.0" py="xs">
                    <Container size="xl">
                        <ScrollArea>
                            <Group gap="md" wrap="nowrap">
                                {/* menu umum */}
                                {pathname.startsWith('/dashboard') &&
                                    mainMenuItems.map(item => (
                                        <Button
                                            key={item.label}
                                            component={Link}
                                            href={item.href}
                                            color="indigo"
                                            c={
                                                pathname === item.href
                                                    ? 'white'
                                                    : 'indigo.9'
                                            }
                                            variant={
                                                pathname === item.href
                                                    ? 'filled'
                                                    : 'subtle'
                                            }
                                            size="sm"
                                            radius="xl"
                                            leftSection={
                                                <item.icon size={16} />
                                            }
                                            rightSection={
                                                item.badge && (
                                                    <Badge
                                                        size="xs"
                                                        color="red"
                                                        variant="filled">
                                                        {item.badge}
                                                    </Badge>
                                                )
                                            }>
                                            {item.label}
                                        </Button>
                                    ))}

                                {/* menu admin */}
                                {isAdmin &&
                                    pathname.startsWith('/perpus') &&
                                    mainMenuisAdminItems.map(item => (
                                        <Button
                                            key={item.label}
                                            component={Link}
                                            href={item.href}
                                            color="indigo"
                                            c={
                                                pathname === item.href
                                                    ? 'white'
                                                    : 'indigo.9'
                                            }
                                            variant={
                                                pathname === item.href
                                                    ? 'filled'
                                                    : 'subtle'
                                            }
                                            size="sm"
                                            radius="xl"
                                            leftSection={
                                                <item.icon size={16} />
                                            }>
                                            {item.label}
                                        </Button>
                                    ))}
                            </Group>
                        </ScrollArea>
                    </Container>
                </Box>
            </Box>

            {/* Mobile Drawer */}
            <Drawer
                opened={drawerOpened}
                onClose={() => setDrawerOpened(false)}
                size="sm"
                padding="md"
                title={
                    <Group>
                        <Avatar size="md" radius="xl" color="blue">
                            {displayName?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Stack gap={0}>
                            <Text fw={500}>{displayName}</Text>
                            <Text size="xs" c="dimmed">
                                {displayEmail}
                            </Text>
                        </Stack>
                    </Group>
                }
                hiddenFrom="sm"
                zIndex={1001}>
                <ScrollArea style={{ height: 'calc(100vh - 120px)' }}>
                    <Stack gap="xs">
                        <Paper p="xs" radius="md" withBorder>
                            <Stack gap="xs">
                                {mainMenuItems.map(item => (
                                    <Button
                                        key={item.label}
                                        fullWidth
                                        component={Link}
                                        href={item.href}
                                        variant="subtle"
                                        justify="flex-start"
                                        leftSection={<item.icon size={18} />}
                                        onClick={() => setDrawerOpened(false)}>
                                        {item.label}
                                    </Button>
                                ))}
                            </Stack>
                        </Paper>

                        <Divider label="Akun Saya" labelPosition="left" />

                        {userMenuItems.map(item => (
                            <Button
                                key={item.label}
                                fullWidth
                                variant="subtle"
                                justify="flex-start"
                                leftSection={<item.icon size={18} />}
                                onClick={() => {
                                    setDrawerOpened(false)
                                    item.action?.()
                                }}
                                component={item.href ? Link : 'button'}
                                href={item.href}>
                                {item.label}
                            </Button>
                        ))}

                        {isAdmin && (
                            <>
                                <Divider label="Admin" labelPosition="left" />
                                {adminMenuItems.map(item => (
                                    <Button
                                        key={item.label}
                                        fullWidth
                                        variant="subtle"
                                        justify="flex-start"
                                        leftSection={<item.icon size={18} />}
                                        component={Link}
                                        href={item.href}
                                        onClick={() => setDrawerOpened(false)}>
                                        {item.label}
                                    </Button>
                                ))}
                            </>
                        )}

                        <Divider />

                        <Button
                            fullWidth
                            color="red"
                            variant="light"
                            leftSection={<FaSignOutAlt size={18} />}
                            onClick={() => {
                                setDrawerOpened(false)
                                logout()
                            }}>
                            Keluar
                        </Button>
                    </Stack>
                </ScrollArea>
            </Drawer>
        </>
    )
}

export default Navigation
