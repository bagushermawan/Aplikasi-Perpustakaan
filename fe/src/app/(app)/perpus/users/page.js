'use client'
import Header from '@/app/(app)/Header'
import Sidebar from '@/components/Sidebar'
import UserTable from '@/components/UserTable'

const UsersPage = () => {
    return (
        <>
            <Header title="All Users" />
            <div className="flex">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 p-6">
                    <UserTable />
                </div>
            </div>
        </>
    )
}

export default UsersPage
