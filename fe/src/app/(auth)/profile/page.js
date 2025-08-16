'use client'
import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import { RiArrowGoBackFill } from 'react-icons/ri'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
    const router = useRouter()
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    // Ambil user login
    useEffect(() => {
        axios.get('/api/user/profile').then(res => {
            setForm({
                ...form,
                name: res.data.name,
                email: res.data.email,
            })
        })
    }, [])

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const res = await axios.put('/api/user/profile', form)
            setMessage(res.data.message)
        } catch (err) {
            if (err.response?.data?.errors) {
                setMessage(JSON.stringify(err.response.data.errors))
            } else {
                setMessage('Something went wrong')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto">
            <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-blue-600 mb-5">
                <RiArrowGoBackFill className="text-xl mr-2" />
                <span className="text-xs">Back</span>
            </button>
            <h1 className="text-xl font-bold mb-4">Update Profile</h1>
            {message && <div className="mb-4 text-green-600">{message}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label>Name</label>
                    <input
                        className="border rounded w-full p-2"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Email</label>
                    <input
                        className="border rounded w-full p-2"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Password (leave empty if not changing)</label>
                    <input
                        className="border rounded w-full p-2"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Confirm Password</label>
                    <input
                        className="border rounded w-full p-2"
                        type="password"
                        name="password_confirmation"
                        value={form.password_confirmation}
                        onChange={handleChange}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded">
                    {loading ? 'Updating...' : 'Update'}
                </button>
            </form>
        </div>
    )
}
