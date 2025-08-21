'use client'

import { useAuth } from '@/hooks/auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthSessionStatus from '@/app/(auth)/AuthSessionStatus'

import {
    Button,
    TextInput,
    PasswordInput,
    Checkbox,
    Stack,
    Group,
    Anchor,
} from '@mantine/core'

const Login = () => {
    const router = useRouter()

    const { login } = useAuth({
        middleware: 'guest',
        redirectIfAuthenticated: '/dashboard',
    })

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [shouldRemember, setShouldRemember] = useState(false)
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState(null)

    useEffect(() => {
        if (router.reset?.length > 0 && Object.keys(errors).length === 0) {
            setStatus(atob(router.reset))
        } else {
            setStatus(null)
        }
    }, [router.reset, errors])

    const submitForm = async event => {
        event.preventDefault()

        login({
            email,
            password,
            remember: shouldRemember,
            setErrors,
            setStatus,
        })
    }

    return (
        <>
            <AuthSessionStatus status={status} />

            <form onSubmit={submitForm}>
                <Stack spacing="md">
                    {/* Email */}
                    <TextInput
                        label="Email"
                        id="email"
                        type="email"
                        value={email}
                        onChange={event => setEmail(event.currentTarget.value)}
                        required
                        autoFocus
                        error={errors.email}
                    />

                    {/* Password */}
                    <PasswordInput
                        label="Password"
                        id="password"
                        value={password}
                        onChange={event =>
                            setPassword(event.currentTarget.value)
                        }
                        required
                        autoComplete="current-password"
                        error={errors.password}
                    />

                    {/* Remember Me */}
                    <Checkbox
                        label="Remember me"
                        id="remember_me"
                        checked={shouldRemember}
                        onChange={event =>
                            setShouldRemember(event.currentTarget.checked)
                        }
                    />

                    {/* Actions */}
                    <Group justify="flex-end" spacing="lg" mt="md">
                        <Anchor
                            component={Link}
                            href="/forgot-password"
                            size="sm">
                            Forgot your password?
                        </Anchor>
                        <Button type="submit" color="rgba(50, 50, 84, 1)">
                            Login
                        </Button>
                    </Group>
                </Stack>
            </form>
        </>
    )
}

export default Login
