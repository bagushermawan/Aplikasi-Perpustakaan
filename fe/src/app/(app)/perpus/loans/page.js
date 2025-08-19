'use client'
import Header from '@/app/(app)/Header'
import Sidebar from '@/components/Sidebar'
import LoanTable from '@/components/LoanTable'
import LoanUserTable from '@/components/LoanUserTable'
import { useState, useEffect } from 'react'
import api from '@/lib/axios'

const LoansPage = () => {
    const [userRole, setUserRole] = useState(null)

    useEffect(() => {
        api.get('/api/auth/user').then(res => setUserRole(res.data))
    }, [])
    return (
        <>
            <Header title="All Loans" />
            <div className="flex">
                {/* Sidebar */}
                <Sidebar />

                {/* Admin Content */}
                {userRole?.role === 'admin' && (
                    <div className="flex-1 p-6">
                        <LoanTable />
                    </div>
                )}

                {/* User Content */}
                {userRole?.role === 'user' && (
                    <div className="flex-1 p-6">
                        <LoanUserTable />
                    </div>
                )}
            </div>
        </>
    )
}

export default LoansPage
