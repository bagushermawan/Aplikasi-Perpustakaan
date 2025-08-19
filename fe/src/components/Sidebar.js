'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'
import api from '@/lib/axios'

const fetcher = url => api.get(url).then(res => res.data)

const Sidebar = () => {
    const pathname = usePathname()
    const { data: me, error, isLoading } = useSWR('/api/auth/user', fetcher)

    const userRole = me?.role

    const menus = [
        { name: 'All Users', href: '/perpus/users', roles: ['admin'] },
        { name: 'All Books', href: '/perpus/books', roles: ['admin', 'user'] },
        { name: 'Loans', href: '/perpus/loans', roles: ['admin', 'user'] },
    ]

    if (isLoading) {
        return <div className="p-4">Loading menu...</div>
    }

    if (error) {
        return <div className="p-4 text-red-500">Failed to load user</div>
    }

    return (
        <div className="w-64 bg-gray-300 h-screen p-4 rounded-r-xl">
            <Link
                href="/perpus"
                className="block mb-4 text-lg font-bold hover:text-blue-700">
                📚 Perpustakaan
            </Link>
            <ul className="space-y-2">
                {menus
                    .filter(
                        menu => !menu.roles || menu.roles.includes(userRole),
                    )
                    .map(menu => (
                        <li key={menu.href}>
                            <Link
                                href={menu.href}
                                className={`block px-3 py-2 rounded ${
                                    pathname === menu.href
                                        ? 'bg-blue-500 text-white'
                                        : 'hover:bg-gray-200'
                                }`}>
                                {menu.name}
                            </Link>
                        </li>
                    ))}
            </ul>
        </div>
    )
}

export default Sidebar
