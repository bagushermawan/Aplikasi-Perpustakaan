'use client'

import { useAuth } from '@/hooks/auth'
import Navigation from '@/app/(app)/Navigation'
import Loading from '@/app/(app)/Loading'
import { Toaster } from 'react-hot-toast'
import Cart from '@/components/Cart'

const AppLayout = ({ children }) => {
    const { user } = useAuth({ middleware: 'auth' })

    if (!user) {
        return <Loading />
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navigation user={user} />
            <Toaster position="top-right" reverseOrder={false} />

            <main>{children}</main>

            <Cart />
        </div>
    )
}

export default AppLayout
