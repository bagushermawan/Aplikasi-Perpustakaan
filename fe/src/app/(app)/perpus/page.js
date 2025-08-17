'use client'
import Sidebar from '@/components/Sidebar'
import Header from '@/app/(app)/Header'

const PerpusPage = () => {
    return (
        <>
            <Header title="Perpus" />
            <div className="flex">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 p-6">
                    <div className="py-12">
                        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6 bg-white border-b border-gray-200">
                                    Ini page perpustakaan
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PerpusPage
