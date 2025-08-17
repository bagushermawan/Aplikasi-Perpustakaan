// components/Sidebar.js
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Sidebar = () => {
    const pathname = usePathname()

    const menus = [
        { name: 'All Users', href: '/perpus/users' },
        { name: 'All Buku', href: '/perpus/books' },
        { name: 'Pinjaman', href: '/perpus/loans' },
    ]

    return (
        <div className="w-64 bg-gray-300 h-screen p-4 rounded-r-xl">
            <h2 className="text-lg font-bold mb-4">📚 Perpustakaan</h2>
            <ul className="space-y-2">
                {menus.map(menu => (
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
