'use client'
import { useCart } from '../app/(app)/context/CartContext'
import { useAuth } from '@/hooks/auth'
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

export default function Cart() {
    const { cart, setCart, removeFromCart, handleCheckout, showCart } =
        useCart()
    const { user } = useAuth({ middleware: 'auth' })
    const { mutate } = useSWR('/api/perpus/books')

    // Hitung total semua item
    const total = cart.reduce((sum, item) => {
        const pricePerItem =
            item.discount && item.discount > 0 ? item.final_price : item.harga
        return sum + pricePerItem * item.quantity
    }, 0)

    return (
        <Card
            shadow="lg"
            radius="md"
            withBorder
            style={{
                position: 'fixed',
                top: rem(224),
                right: rem(12),
                width: rem(320),
                zIndex: 40,
                transform: showCart ? 'translateX(0)' : 'translateX(110%)',
                opacity: showCart ? 1 : 0,
                transition: 'all 0.3s ease',
            }}>
            {/* Header */}
            <Group justify="space-between" mb="sm">
                <Group gap="xs">
                    <FaShoppingCart />
                    <Text fw={600} c="blue.9">
                        Cart
                    </Text>
                </Group>
                <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    onClick={() => setCart([])}>
                    Clear
                </Button>
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
                                            <Text fw={500} size="sm">
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
                                                    {/* Harga coret */}
                                                    <Text
                                                        size="xs"
                                                        td="line-through"
                                                        c="dimmed">
                                                        <NumberFormatter
                                                            value={
                                                                item.harga_formatted
                                                            }
                                                            thousandSeparator
                                                            prefix="Rp "
                                                        />
                                                    </Text>
                                                    {/* Harga setelah diskon */}
                                                    <Text
                                                        fw={600}
                                                        size="sm"
                                                        c="green">
                                                        <NumberFormatter
                                                            value={
                                                                item.final_price_formatted
                                                            }
                                                            thousandSeparator
                                                            prefix="Rp "
                                                        />
                                                    </Text>
                                                </>
                                            ) : (
                                                <Text fw={600} size="sm">
                                                    <NumberFormatter
                                                        value={
                                                            item.harga_formatted
                                                        }
                                                        thousandSeparator
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
