const Loading = () => {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-900">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-10 h-10 border-4 border-cyan-400 border-dotted rounded-full animate-spin"></div>
                <p className="text-cyan-300 text-lg font-semibold tracking-wide animate-pulse">
                    Loading...
                </p>
            </div>
        </div>
    )
}

export default Loading
