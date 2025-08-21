'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'
import api from '@/lib/axios'
import { useState } from 'react'
import {
    AppShell,
    ScrollArea,
    Group,
    Text,
    UnstyledButton,
    ThemeIcon,
    Tooltip,
    Box,
    Stack,
    rem,
} from '@mantine/core'
import {
    FaUsers,
    FaBook,
    FaClipboardList,
    FaHome,
    FaBars,
} from 'react-icons/fa'

const fetcher = url => api.get(url).then(res => res.data)

export default function Layout({ children }) {
    const pathname = usePathname()
    const { data: me, error, isLoading } = useSWR('/api/auth/user', fetcher)

    const [collapsed, setCollapsed] = useState(false)
    const [pinned, setPinned] = useState(false)

    const userRole = me?.role

    const menus = [
        {
            name: 'Dashboard',
            href: '/perpus',
            roles: ['admin', 'user'],
            icon: <FaHome size={16} />,
        },
        {
            name: 'All Users',
            href: '/perpus/users',
            roles: ['admin'],
            icon: <FaUsers size={16} />,
        },
        {
            name: 'All Books',
            href: '/perpus/books',
            roles: ['admin'],
            icon: <FaBook size={16} />,
        },
        {
            name: 'Loans',
            href: '/perpus/loans',
            roles: ['admin', 'user'],
            icon: <FaClipboardList size={16} />,
        },
    ]

    return (
        <AppShell
            // atur navbar behavior
            navbar={{
                width: collapsed ? 80 : 240,
                breakpoint: 'sm',
                collapsed: { mobile: false },
            }}
            padding="md">
            {/* Sidebar */}
            <AppShell.Navbar
                p="md"
                onMouseEnter={() => !pinned && setCollapsed(false)}
                onMouseLeave={() => !pinned && setCollapsed(true)}>
                {/* Header / Logo */}
                <Box mb="lg">
                    <Group>
                        <Text size="xl">📚</Text>
                        {!collapsed && (
                            <Text
                                fw={700}
                                size="lg"
                                component={Link}
                                href="/perpus">
                                Perpustakaan
                            </Text>
                        )}
                    </Group>
                </Box>

                {/* Collapse / Pin toggle */}
                <Box mb="sm">
                    <UnstyledButton
                        onClick={() => {
                            setPinned(!pinned)
                            setCollapsed(pinned ? true : !collapsed)
                        }}
                        style={{ width: '100%' }}>
                        <Group
                            p="xs"
                            style={{
                                borderRadius: rem(6),
                                backgroundColor: '#374151',
                                justifyContent: collapsed
                                    ? 'center'
                                    : 'flex-start',
                                color: '#fff',
                            }}>
                            <FaBars />
                            {!collapsed && <Text size="sm">Menu</Text>}
                        </Group>
                    </UnstyledButton>
                </Box>

                {/* Menu list */}
                <ScrollArea style={{ flexGrow: 1 }}>
                    <Stack gap={4}>
                        {isLoading && (
                            <Text size="sm" c="dimmed">
                                Loading menu...
                            </Text>
                        )}
                        {error && (
                            <Text size="sm" c="red">
                                Failed to load user
                            </Text>
                        )}
                        {!isLoading &&
                            !error &&
                            menus
                                .filter(
                                    menu =>
                                        !menu.roles ||
                                        menu.roles.includes(userRole),
                                )
                                .map(menu => {
                                    const active = pathname === menu.href
                                    const Item = (
                                        <Group
                                            key={menu.href}
                                            component={Link}
                                            href={menu.href}
                                            align="center"
                                            p="xs"
                                            style={{
                                                textDecoration: 'none',
                                                borderRadius: rem(6),
                                                backgroundColor: active
                                                    ? '#2563eb'
                                                    : 'transparent',
                                                color: active
                                                    ? '#fff'
                                                    : undefined,
                                                justifyContent: collapsed
                                                    ? 'center'
                                                    : 'flex-start',
                                            }}>
                                            <ThemeIcon
                                                variant={
                                                    active ? 'filled' : 'light'
                                                }
                                                size="sm"
                                                radius="md"
                                                color={
                                                    active ? 'blue' : 'gray'
                                                }>
                                                {menu.icon}
                                            </ThemeIcon>
                                            {!collapsed && (
                                                <Text size="sm">
                                                    {menu.name}
                                                </Text>
                                            )}
                                        </Group>
                                    )

                                    return collapsed ? (
                                        <Tooltip
                                            label={menu.name}
                                            position="right"
                                            withArrow
                                            key={menu.href}>
                                            {Item}
                                        </Tooltip>
                                    ) : (
                                        Item
                                    )
                                })}
                    </Stack>
                </ScrollArea>
            </AppShell.Navbar>

            {/* Konten utama */}
            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    )
}

