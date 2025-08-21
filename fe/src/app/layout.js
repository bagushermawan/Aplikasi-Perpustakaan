import { Nunito } from 'next/font/google'
import '@/app/global.css'
import { CartProvider } from './(app)/context/CartContext'
import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'

const nunitoFont = Nunito({
    subsets: ['latin'],
    display: 'swap',
})

const RootLayout = ({ children }) => {
    return (
        <html lang="en" className={nunitoFont.className}>
            <body className="antialiased">
                <MantineProvider>
                    <CartProvider>{children}</CartProvider>
                </MantineProvider>
            </body>
        </html>
    )
}

export const metadata = {
    title: 'Laravel',
}

export default RootLayout
