'use client'
import { useCart } from '../app/(app)/context/CartContext'
import { useAuth } from '@/hooks/auth'
import useSWR from 'swr'

export default function Cart() {
    const { cart, setCart, removeFromCart, handleCheckout, showCart } =
        useCart()
        const { user } = useAuth({ middleware: 'auth' })
        const { mutate } = useSWR('/api/perpus/books')

    return (
        <div
            className={`
        fixed top-28 right-3 w-80 bg-white shadow-lg border-l z-40 flex flex-col rounded-xl
        transform transition-all duration-300 ease-in-out
        ${showCart ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}>
            <div className="p-4 border-b bg-gray-300 flex justify-between items-center rounded-t-xl shadow-sm">
                <h3 className="font-bold text-blue-950">🛒 Cart</h3>
                <button
                    onClick={() => setCart([])}
                    className="text-red-500 text-sm">
                    Clear
                </button>
            </div>

            {/* List Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {cart.length === 0 ? (
                    <p className="text-gray-500 text-sm">Cart masih kosong</p>
                ) : (
                    cart.map(item => (
                        <div
                            key={item.id}
                            className="border-b pb-2 flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-sm">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        by {item.author}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-xs text-red-600">
                                    Hapus
                                </button>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="font-bold">
                                    {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                    }).format(item.harga * item.quantity)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={item.quantity <= 1}
                                        onClick={() =>
                                            setCart(
                                                cart.map(b =>
                                                    b.id === item.id
                                                        ? {
                                                              ...b,
                                                              quantity:
                                                                  b.quantity -
                                                                  1,
                                                          }
                                                        : b,
                                                ),
                                            )
                                        }
                                        className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center disabled:opacity-50">
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        disabled={
                                            item.quantity >= item.available
                                        }
                                        onClick={() =>
                                            setCart(
                                                cart.map(b =>
                                                    b.id === item.id
                                                        ? {
                                                              ...b,
                                                              quantity:
                                                                  b.quantity +
                                                                  1,
                                                          }
                                                        : b,
                                                ),
                                            )
                                        }
                                        className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center disabled:opacity-50">
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Total */}
            <div className="p-4 border-t space-y-2">
                <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>
                        {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                        }).format(
                            cart.reduce(
                                (sum, item) => sum + item.harga * item.quantity,
                                0,
                            ),
                        )}
                    </span>
                </div>
                <button
                    onClick={() => handleCheckout(user, mutate)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm">
                    Checkout
                </button>
            </div>
        </div>
    )
}

