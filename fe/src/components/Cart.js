'use client'
import { useCart } from '../app/(app)/context/CartContext'
import { useAuth } from '@/hooks/auth'
import { useMediaQuery } from '@mantine/hooks'
import useSWR from 'swr'
import {
    Card,
    Group,
    Text,
    Stack,
    ScrollArea,
    Button,
    ActionIcon,
    NumberFormatter,
    Divider,
    rem,
} from '@mantine/core'
import { FaTrash, FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa'
import { FiTrash2, FiMinimize2 } from 'react-icons/fi'

export default function Cart() {
    const { cart, setCart, removeFromCart, handleCheckout, showCart } =
        useCart()
    const { user } = useAuth({ middleware: 'auth' })
    const { mutate } = useSWR('/api/perpus/books')
    const { setShowCart } = useCart()

    // Hitung total semua item
    const total = cart.reduce((sum, item) => {
        const pricePerItem =
            item.discount && item.discount > 0 ? item.final_price : item.harga
        return sum + pricePerItem * item.quantity
    }, 0)
    const isMobile = useMediaQuery('(max-width: 768px)')

    return (
        <Card
            shadow="xl"
            radius="md"
            withBorder
            style={{
                position: 'fixed',
                bottom: isMobile ? rem(0) : 'auto',
                top: isMobile ? 'auto' : rem(224),
                right: isMobile ? 'auto' : rem(12), // 👉 jangan 0 di mobile
                left: isMobile ? '50%' : 'auto', // 👉 taruh titik anchor di tengah layar
                width: isMobile ? '90%' : rem(320),
                height: isMobile ? '60%' : 'auto',
                zIndex: 40,

                transform: showCart
                    ? isMobile
                        ? 'translate(-50%, 0)' // 👉 geser balik biar benar² center
                        : 'translateX(0)'
                    : isMobile
                      ? 'translate(-50%, 110%)' // 👉 pas hidden tetap relatif tengah
                      : 'translateX(110%)',

                opacity: showCart ? 1 : 0,
                transition: 'all 0.5s ease',
            }}>
            {/* Header */}
            <Group justify="space-between" mb="sm">
                <Group gap="xs">
                    <FaShoppingCart />
                    <Text fw={600}>
                        Cart
                    </Text>
                </Group>

                <Group gap="xs">
                    <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => setCart([])}>
                        <FiTrash2 size={16} />
                    </ActionIcon>
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => setShowCart(false)}>
                        <FiMinimize2 size={16} />
                    </ActionIcon>
                </Group>
            </Group>

            <Divider mb="sm" />

            {/* Items */}
            <ScrollArea h={250}>
                <Stack gap="sm">
                    {cart.length === 0 ? (
                        <Text c="dimmed" size="sm">
                            Cart masih kosong...
                        </Text>
                    ) : (
                        cart.map(item => {
                            const pricePerItem =
                                item.discount && item.discount > 0
                                    ? item.final_price
                                    : item.harga

                            return (
                                <Card
                                    key={item.id}
                                    withBorder
                                    radius="sm"
                                    p="xs"
                                    style={{ fontSize: '0.85rem' }}>
                                    <Group
                                        justify="space-between"
                                        align="flex-start">
                                        <div>
                                            <Text
                                                fw={500}
                                                size="sm"
                                                lineClamp={1}>
                                                {item.title}
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                by {item.author}
                                            </Text>
                                        </div>
                                        <ActionIcon
                                            size="sm"
                                            variant="subtle"
                                            color="red"
                                            onClick={() =>
                                                removeFromCart(item.id)
                                            }>
                                            <FaTrash size={12} />
                                        </ActionIcon>
                                    </Group>

                                    <Group justify="space-between" mt={6}>
                                        <Stack gap={2}>
                                            {item.discount &&
                                            item.discount > 0 ? (
                                                <>
                                                    {/* Harga coret (per item) */}
                                                    <Text
                                                        size="xs"
                                                        td="line-through"
                                                        c="dimmed">
                                                        <NumberFormatter
                                                            value={item.harga}
                                                            thousandSeparator="."
                                                            decimalSeparator=","
                                                            prefix="Rp "
                                                        />
                                                    </Text>

                                                    {/* Harga setelah diskon (x quantity) */}
                                                    <Text
                                                        fw={600}
                                                        size="sm"
                                                        c="green">
                                                        <NumberFormatter
                                                            value={
                                                                item.final_price *
                                                                item.quantity
                                                            }
                                                            thousandSeparator="."
                                                            decimalSeparator=","
                                                            prefix="Rp "
                                                        />
                                                    </Text>
                                                </>
                                            ) : (
                                                <Text fw={600} size="sm">
                                                    <NumberFormatter
                                                        value={
                                                            item.harga *
                                                            item.quantity
                                                        }
                                                        thousandSeparator="."
                                                        decimalSeparator=","
                                                        prefix="Rp "
                                                    />
                                                </Text>
                                            )}
                                        </Stack>

                                        {/* Tombol qty */}
                                        <Group gap={4}>
                                            <ActionIcon
                                                size="sm"
                                                variant="light"
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
                                                }>
                                                <FaMinus size={10} />
                                            </ActionIcon>
                                            <Text fw={500}>
                                                {item.quantity}
                                            </Text>
                                            <ActionIcon
                                                size="sm"
                                                variant="light"
                                                disabled={
                                                    item.quantity >=
                                                    item.available
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
                                                }>
                                                <FaPlus size={10} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>
                                </Card>
                            )
                        })
                    )}
                </Stack>
            </ScrollArea>

            <Divider my="sm" />

            {/* Total & Checkout */}
            <Stack gap="xs">
                <Group justify="space-between">
                    <Text fw={600}>Total:</Text>
                    <Text fw={700} c="blue">
                        <NumberFormatter
                            value={total}
                            thousandSeparator
                            prefix="Rp "
                        />
                    </Text>
                </Group>
                <Button
                    disabled={cart.length === 0}
                    fullWidth
                    color="blue"
                    onClick={() => handleCheckout(user, mutate)}>
                    Checkout
                </Button>
            </Stack>
        </Card>
    )
}
