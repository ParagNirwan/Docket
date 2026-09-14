import { useState } from "react"
import { useNavigate, Link } from "react-router";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate()
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
        if (!response.ok) {
            setError("Login Failed");
            return
        }
        const data = await response.json()

        localStorage.setItem('token', data.token)
        navigate('/create-tenant')
    }

    return (
        <div className="max-w-sm mx-auto mt-20 p-6 border rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Log in</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded px-3 py-2"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border rounded px-3 py-2"
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
                    Log in
                </button>
            </form>
            <p className="mt-4 text-sm">
                No account yet? <Link to="/register" className="text-blue-600 hover:underline">Register now.</Link>
            </p>
        </div>
    )
}