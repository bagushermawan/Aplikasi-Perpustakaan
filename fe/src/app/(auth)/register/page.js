'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/auth'

// Mantine
import {
    Anchor,
    Button,
    Center,
    Container,
    Group,
    Paper,
    Text,
    TextInput,
    PasswordInput,
    Title,
} from '@mantine/core'

const RegisterPage = () => {
    const { register } = useAuth({
        middleware: 'guest',
        redirectIfAuthenticated: '/dashboard',
    })

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [errors, setErrors] = useState({})

    const submitForm = event => {
        event.preventDefault()

        register({
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
            setErrors,
        })
    }

    return (
        <Center style={{ minHeight: '100vh' }}>
            <Container size={460} my={40}>
                <Title ta="center" order={2} mb="sm">
                    Create an account
                </Title>

                <Text c="dimmed" fz="sm" ta="center" mb="xl">
                    Fill out the form below to get started.
                </Text>

                <Paper
                    withBorder
                    shadow="md"
                    p="xl"
                    radius="md"
                    component="form"
                    onSubmit={submitForm}>
                    {/* Name */}
                    <TextInput
                        id="name"
                        label="Name"
                        placeholder="Your full name"
                        value={name}
                        onChange={e => setName(e.currentTarget.value)}
                        required
                        autoFocus
                        mb="md"
                        error={errors.name && errors.name[0]}
                    />

                    {/* Email */}
                    <TextInput
                        id="email"
                        label="Email"
                        placeholder="you@example.com"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.currentTarget.value)}
                        required
                        mb="md"
                        error={errors.email && errors.email[0]}
                    />

                    {/* Password */}
                    <PasswordInput
                        id="password"
                        label="Password"
                        placeholder="Your password"
                        value={password}
                        onChange={e => setPassword(e.currentTarget.value)}
                        required
                        autoComplete="new-password"
                        mb="md"
                        error={errors.password && errors.password[0]}
                    />

                    {/* Confirm Password */}
                    <PasswordInput
                        id="passwordConfirmation"
                        label="Confirm Password"
                        placeholder="Re-enter your password"
                        value={passwordConfirmation}
                        onChange={e =>
                            setPasswordConfirmation(e.currentTarget.value)
                        }
                        required
                        mb="md"
                        error={
                            errors.password_confirmation &&
                            errors.password_confirmation[0]
                        }
                    />

                    {/* Footer */}
                    <Group justify="space-between" mt="lg">
                        <Anchor href="/login" c="dimmed" size="sm">
                            Already registered? Sign in
                        </Anchor>

                        <Button type="submit">Register</Button>
                    </Group>
                </Paper>
            </Container>
        </Center>
    )
}

export default RegisterPage
