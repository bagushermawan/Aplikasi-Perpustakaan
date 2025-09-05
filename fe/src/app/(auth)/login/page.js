'use client'

import { useAuth } from '@/hooks/auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthSessionStatus from '@/app/(auth)/AuthSessionStatus'

import {
    Anchor,
    Button,
    Checkbox,
    Paper,
    PasswordInput,
    Text,
    TextInput,
    Title,
} from '@mantine/core'
import classes from './AuthenticationCentered.module.css'

export default function LoginPage() {
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

    const submitForm = async e => {
        e.preventDefault()
        login({
            email,
            password,
            remember: shouldRemember,
            setErrors,
            setStatus,
        })
    }

    return (
        <div className={classes.wrapper}>
            {/* Overlay blur */}
            <div className={classes.overlay} />
            <Paper
                className={classes.form}
                radius="md"
                shadow="md"
                p="xl"
                withBorder
                component="form"
                onSubmit={submitForm}>
                <Title order={2} className={classes.title}>
                    Welcome back!
                </Title>

                {/* Status message */}
                <AuthSessionStatus status={status} />

                <TextInput
                    label="Email address"
                    placeholder="hello@gmail.com"
                    size="md"
                    radius="md"
                    value={email}
                    onChange={e => setEmail(e.currentTarget.value)}
                    error={errors.email}
                    required
                    autoFocus
                />

                <PasswordInput
                    label="Password"
                    placeholder="Your password"
                    mt="md"
                    size="md"
                    radius="md"
                    value={password}
                    onChange={e => setPassword(e.currentTarget.value)}
                    error={errors.password}
                    required
                    autoComplete="current-password"
                />

                <Checkbox
                    label="Remember me"
                    mt="xl"
                    size="md"
                    checked={shouldRemember}
                    onChange={e => setShouldRemember(e.currentTarget.checked)}
                />

                <Button type="submit" fullWidth mt="xl" size="md" radius="md">
                    Login
                </Button>

                <Text ta="center" mt="md" fz="sm">
                    <Anchor component={Link} href="/forgot-password" fw={500}>
                        Forgot your password?
                    </Anchor>
                </Text>

                <Text ta="center" mt="xs" fz="sm">
                    Don’t have an account?{' '}
                    <Anchor component={Link} href="/register" fw={500}>
                        Register
                    </Anchor>
                </Text>
            </Paper>
        </div>
    )
}
