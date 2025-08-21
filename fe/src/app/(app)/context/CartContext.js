'use client'

import { createContext, useContext, useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/axios'

const CartContext = createContext()

export function CartProvider({ children }) {
    const [cart, setCart] = useState([])
    const [showCart, setShowCart] = useState(false)

    const addToCart = book => {
        const exist = cart.find(item => item.id === book.id)
        if (exist) {
            if (exist.quantity >= book.available) {
                toast.error(
                    <span>
                        ⚠️ Stok buku <b>{book.title}</b> hanya {book.available}
                    </span>,
                )
                return
            }
            setCart(
                cart.map(item =>
                    item.id === book.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                ),
            )
            toast.success(
                <span>
                    📚 +1 <b>{book.title}</b> ditambahkan
                </span>,
            )
        } else {
            if (book.available <= 0) {
                toast.error(
                    <span>
                        ⚠️ Stok buku <b>{book.title}</b> habis, tidak bisa
                        ditambahkan
                    </span>,
                )
                return
            }
            setCart([...cart, { ...book, quantity: 1 }])
            toast.success(
                <span>
                    <b>{book.title}</b> dimasukkan ke cart
                </span>,
            )
        }
    }

    const removeFromCart = id => {
        setCart(cart.filter(item => item.id !== id))
    }

    const clearCart = () => setCart([])

    const handleCheckout = async (user, mutate) => {
        if (cart.length === 0) {
            toast.error('Keranjang masih kosong')
            return
        }

        try {
            await toast.promise(
                Promise.all(
                    cart.map(item =>
                        api.post('/api/perpus/loans', {
                            user_id: user.id,
                            book_id: item.id,
                            borrowed_at: new Date().toISOString().split('T')[0],
                            return_date: null,
                            status: 'borrowed',
                            quantity: item.quantity,
                        }),
                    ),
                ),
                {
                    loading: '⏳ Proses checkout...',
                    success: '✅ Checkout berhasil!',
                    error: '❌ Gagal checkout',
                },
            )

            setCart([])
            if (mutate) mutate()
        } catch (err) {
            console.error(err)
            toast.error('Checkout gagal')
        }
    }

    return (
        <CartContext.Provider
            value={{
                cart,
                setCart,
                showCart,
                setShowCart,
                addToCart,
                removeFromCart,
                clearCart,
                handleCheckout,
            }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)
