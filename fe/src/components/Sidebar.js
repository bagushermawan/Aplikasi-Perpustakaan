'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import api from '@/lib/axios'

const Sidebar = () => {
    const pathname = usePathname()
    const [userRole, setUserRole] = useState(null)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/api/auth/user')
                setUserRole(res.data.role)
            } catch (error) {
                console.error(error)
            }
        }
        fetchUser()
    }, [])

    const menus = [
        { name: 'All Users', href: '/perpus/users', roles: ['admin'] },
        { name: 'All Books', href: '/perpus/books', roles: ['admin', 'user'] },
        { name: 'Loans', href: '/perpus/loans', roles: ['admin', 'user'] },
    ]


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
