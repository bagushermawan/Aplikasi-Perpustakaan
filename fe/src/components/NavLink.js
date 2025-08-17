'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NavLink = ({ href, children, exact = false, ...props }) => {
    const pathname = usePathname()

    // cek apakah aktif
    const isActive = exact ? pathname === href : pathname.startsWith(href)

    return (
        <Link
            href={href}
            {...props}
            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 focus:outline-none transition duration-150 ease-in-out ${
                isActive
                    ? 'border-indigo-400 text-gray-900 focus:border-indigo-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300'
            }`}>
            {children}
        </Link>
    )
}

export default NavLink
