'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/auth'
import AuthSessionStatus from '@/app/(auth)/AuthSessionStatus'

// Mantine
import {
    Box,
    Button,
    Center,
    Container,
    Group,
    Paper,
    Text,
    Title,
    Anchor,
    TextInput,
} from '@mantine/core'
import { FaArrowLeft } from 'react-icons/fa'
import classes from './FloatingLabelInput.module.css'

export default function ForgotPasswordPage() {
    const { forgotPassword } = useAuth({
        middleware: 'guest',
        redirectIfAuthenticated: '/dashboard',
    })

    const [email, setEmail] = useState('')
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState(null)
    const [focused, setFocused] = useState(false)

    // kondisi apakah label mengambang (floating)
    const floating = email.trim().length !== 0 || focused || undefined

    const submitForm = e => {
        e.preventDefault()
        forgotPassword({ email, setErrors, setStatus })
    }

    return (
        <Center style={{ minHeight: '100vh' }}>
            <Container size={460} p="md">
                <Title ta="center" order={2} mb="sm">
                    Forgot your password?
                </Title>

                <Text c="dimmed" fz="sm" ta="center" mb="xl">
                    No problem. Just enter your email and we’ll send you a reset
                    link.
                </Text>

                <AuthSessionStatus status={status} />

                <Paper
                    withBorder
                    shadow="md"
                    p="xl"
                    radius="md"
                    component="form"
                    onSubmit={submitForm}>
                    <TextInput
                        classNames={classes}
                        label="Email address"
                        placeholder="me@example.com"
                        type="email"
                        value={email}
                        required
                        autoFocus
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        data-floating={floating}
                        labelProps={{ 'data-floating': floating }}
                        onChange={e => setEmail(e.currentTarget.value)}
                        error={errors.email && errors.email[0]}
                    />

                    <Group justify="space-between" mt="lg">
                        <Anchor href="/login" c="dimmed" size="sm">
                            <Center inline>
                                <FaArrowLeft size={12} />
                                <Box ml={5}>Back to login</Box>
                            </Center>
                        </Anchor>

                        <Button type="submit">Send reset link</Button>
                    </Group>
                </Paper>
            </Container>
        </Center>
    )
}
