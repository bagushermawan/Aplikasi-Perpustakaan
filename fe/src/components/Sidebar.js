'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'
import api from '@/lib/axios'
import { useState } from 'react'
import {
    FaUsers,
    FaBook,
    FaClipboardList,
    FaHome,
    FaBars,
} from 'react-icons/fa'

const fetcher = url => api.get(url).then(res => res.data)

const Sidebar = () => {
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
            icon: <FaHome />,
        },
        {
            name: 'All Users',
            href: '/perpus/users',
            roles: ['admin'],
            icon: <FaUsers />,
        },
        {
            name: 'All Books',
            href: '/perpus/books',
            roles: ['admin'],
            icon: <FaBook />,
        },
        {
            name: 'Loans',
            href: '/perpus/loans',
            roles: ['admin', 'user'],
            icon: <FaClipboardList />,
        },
    ]

    if (isLoading)
        return <div className="p-4 text-gray-600">Loading menu...</div>
    if (error)
        return <div className="p-4 text-red-500">Failed to load user</div>

    return (
        <div
            onMouseEnter={() => !pinned && setCollapsed(false)}
            onMouseLeave={() => !pinned && setCollapsed(true)}
            className={`
        ${collapsed ? 'w-20' : 'w-64'}
        bg-gradient-to-b from-gray-800 to-gray-900 text-gray-200
        h-screen p-4 shadow-lg flex flex-col transition-all duration-300
      `}>
            {/* Header / Logo */}
            <div
                className={`flex items-center mb-8 px-2 transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}>
                <span className="text-2xl mr-2">📚</span>
                {!collapsed && (
                    <Link
                        href="/perpus"
                        className="text-xl font-bold tracking-wide hover:text-white">
                        Perpustakaan
                    </Link>
                )}
            </div>

            {/* Toggle button */}
            <div className="mb-4">
                <button
                    onClick={() => {
                        setPinned(!pinned)
                        setCollapsed(pinned ? true : !collapsed)
                    }}
                    className={`
                        w-full flex items-center ${collapsed ? 'justify-center p-2' : 'justify-start px-4 py-2'}
                        bg-gray-700 rounded hover:bg-gray-600 gap-2 transition-all duration-300
                        `}>
                            <FaBars />
                    {!collapsed && (
                        <span className="text-sm font-medium">Menu</span>
                    )}
                    </button>
            </div>

            {/* Menu */}
            <ul className="space-y-1 flex-1">
                {menus
                    .filter(
                        menu => !menu.roles || menu.roles.includes(userRole),
                    )
                    .map(menu => {
                        const active = pathname === menu.href
                        return (
                            <li key={menu.href}>
                                <Link
                                    href={menu.href}
                                    className={`
                    flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200
                    ${active ? 'bg-blue-600 text-white shadow' : 'hover:bg-gray-700 hover:text-white'}
                    ${collapsed ? 'justify-center' : ''}
                  `}>
                                    <span className="text-lg">{menu.icon}</span>
                                    {!collapsed && (
                                        <span className="font-medium">
                                            {menu.name}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        )
                    })}
            </ul>
        </div>
    )
}

export default Sidebar
