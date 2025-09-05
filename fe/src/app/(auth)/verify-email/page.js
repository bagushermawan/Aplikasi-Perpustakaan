'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/auth'

// Mantine components
import {
    Alert,
    Anchor,
    Button,
    Center,
    Container,
    Group,
    Paper,
    Text,
    Title,
} from '@mantine/core'
import { FaInfoCircle, FaCheck } from 'react-icons/fa'

const VerifyEmailPage = () => {
    const { logout, resendEmailVerification } = useAuth({
        middleware: 'auth',
        redirectIfAuthenticated: '/dashboard',
    })

    const [status, setStatus] = useState(null)

    return (
        <Center style={{ minHeight: '100vh' }}>
            <Container size={460} my={40}>
                <Title ta="center" order={2} mb="sm">
                    Verify your email
                </Title>

                <Text c="dimmed" fz="sm" ta="center" mb="xl">
                    Thanks for signing up! Please verify your email address by
                    clicking on the link we just sent. Didn’t get the email? You
                    can request another verification link below.
                </Text>

                <Paper withBorder shadow="md" p="xl" radius="md">
                    {/* Success Message */}
                    {status === 'verification-link-sent' && (
                        <Alert
                            icon={<FaCheck size={16} />}
                            title="Verification link sent"
                            color="green"
                            mb="lg">
                            A new verification link has been sent to the email
                            address you provided during registration.
                        </Alert>
                    )}

                    <Group justify="space-between">
                        <Button
                            leftSection={<FaInfoCircle/>}
                            onClick={() =>
                                resendEmailVerification({ setStatus })
                            }>
                            Resend Verification Email
                        </Button>

                        <Anchor
                            component="button"
                            size="sm"
                            c="dimmed"
                            onClick={logout}>
                            Logout
                        </Anchor>
                    </Group>
                </Paper>
            </Container>
        </Center>
    )
}

export default VerifyEmailPage
