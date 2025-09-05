'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/axios'
import { useRouter } from 'next/navigation'
import {
    TextInput,
    PasswordInput,
    Button,
    Paper,
    Group,
    Stack,
    Title,
    Text,
    Container,
    Avatar,
    FileButton,
} from '@mantine/core'

export default function SettingPage() {
    const router = useRouter()
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    })
    const [avatar, setAvatar] = useState(null) // file avatar
    const [preview, setPreview] = useState(null) // untuk preview image
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    // Ambil data user aktif
    useEffect(() => {
        api.get('/api/auth/user')
            .then(res => {
                console.log('tes', res.data)
                setForm(prev => ({
                    ...prev,
                    name: res.data.name,
                    email: res.data.email,
                }))
                if (res.data.avatar_url) {
                    setPreview(res.data.avatar_url)
                }
            })
            .catch(err => console.error(err))
    }, [])

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value })
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const formData = new FormData()
            formData.append('name', form.name)
            formData.append('email', form.email)
            if (form.password) formData.append('password', form.password)
            if (form.password_confirmation)
                formData.append(
                    'password_confirmation',
                    form.password_confirmation,
                )
            if (avatar) formData.append('avatar', avatar)

            formData.append('_method', 'PUT') // penting untuk Laravel

            const res = await api.post('/api/user/profile', formData)

            setMessage(res.data.message)
            // update preview jika sukses & API return avatar_url
            if (res.data.avatar_url) {
                setPreview(res.data.avatar_url)
            }
        } catch (err) {
            setMessage(err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container size="sm" py="xl">
            <Paper withBorder shadow="sm" p="xl" radius="md">
                <Group justify="space-between" mb="md">
                    <Title order={3}>👤 My Profile</Title>
                    <Button
                        variant="subtle"
                        size="xs"
                        onClick={() => router.back()}>
                        Back
                    </Button>
                </Group>

                {message && (
                    <Text
                        mb="sm"
                        size="sm"
                        c={
                            message.toLowerCase().includes('wrong') ||
                            message.toLowerCase().includes('error')
                                ? 'red'
                                : 'green'
                        }>
                        {message}
                    </Text>
                )}

                <form onSubmit={handleSubmit}>
                    <Stack>
                        {/* Avatar + Upload */}
                        <Group justify="center" mb="md">
                            <Avatar
                                src={preview}
                                alt={form.name}
                                size={80}
                                radius="xl"
                                color="blue">
                                {form.name?.charAt(0)?.toUpperCase()}
                            </Avatar>

                            <FileButton
                                onChange={file => {
                                    setAvatar(file)
                                    if (file) {
                                        const url = URL.createObjectURL(file)
                                        setPreview(url)
                                    }
                                }}
                                accept="image/png,image/jpeg">
                                {props => (
                                    <Button
                                        {...props}
                                        variant="light"
                                        size="xs">
                                        {preview
                                            ? 'Change avatar'
                                            : 'Upload avatar'}
                                    </Button>
                                )}
                            </FileButton>
                        </Group>

                        <TextInput
                            label="Name"
                            placeholder="Enter your name"
                            value={form.name}
                            onChange={e => handleChange('name', e.target.value)}
                            required
                        />

                        <TextInput
                            label="Email"
                            placeholder="Enter your email"
                            type="email"
                            value={form.email}
                            onChange={e =>
                                handleChange('email', e.target.value)
                            }
                            required
                        />

                        <PasswordInput
                            label="Password (leave empty if not changing)"
                            placeholder="Enter new password"
                            value={form.password}
                            onChange={e =>
                                handleChange('password', e.target.value)
                            }
                        />

                        <PasswordInput
                            label="Confirm Password"
                            placeholder="Re-enter new password"
                            value={form.password_confirmation}
                            onChange={e =>
                                handleChange(
                                    'password_confirmation',
                                    e.target.value,
                                )
                            }
                        />

                        <Group justify="flex-end" mt="md">
                            <Button type="submit" loading={loading}>
                                {loading ? 'Updating…' : 'Update Profile'}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Paper>
        </Container>
    )
}
