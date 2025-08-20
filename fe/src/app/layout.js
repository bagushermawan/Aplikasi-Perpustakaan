import { Nunito } from 'next/font/google'
import '@/app/global.css'
import { CartProvider } from './(app)/context/CartContext'

const nunitoFont = Nunito({
    subsets: ['latin'],
    display: 'swap',
})

const RootLayout = ({ children }) => {
    return (
        <html lang="en" className={nunitoFont.className}>
            <body className="antialiased">
                <CartProvider>
                    {children}
                </CartProvider>
            </body>
        </html>
    )
}

export const metadata = {
    title: 'Laravel',
}

export default RootLayout
