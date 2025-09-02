import Axios from 'axios'

const axios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
})

axios.interceptors.request.use(config => {
    const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'))
    if (match) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(match[2])
    }
    return config
})

export default axios
