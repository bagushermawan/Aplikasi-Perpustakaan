'use client'
import Header from '@/app/(app)/Header'
import Sidebar from '@/components/Sidebar'
import BookTable from '@/components/BookTable'

const BooksPage = () => {
    return (
        <>
            <Header title="All Books" />
            <div className="flex">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 p-6">
                    <BookTable />
                </div>
            </div>
        </>
    )
}

export default BooksPage
