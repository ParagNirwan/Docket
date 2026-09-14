import { useState } from "react"
import { useNavigate, Link } from "react-router"

export function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (validateInput() === false) {
            return;
        }

        setError("");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password }),
        })
        if (!response.ok) {
            setError("Registration failed, please try again.")
            return
        }

        // Registration succeeded - send them to log in with their new account
        navigate('/login')
    }

    function validateInput() {
        if (password !== confirmPassword) {
            setError("Passwords don't match.");
            return false;
        }
        if (password.length < 8) {
            setError("Password length must be at least 8 characters.")
            return false;
        }
        if (fullName.length === 0) {
            setError("Full Name cannot be empty")
            return false;
        }
        if (email.length === 0) {
            setError("Email cannot be empty")
            return false;
        }
        return true;
    }

    return (
        <div className="max-w-sm mx-auto mt-20 p-6 border rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Register New Account</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border rounded px-3 py-2"
                />
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
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border rounded px-3 py-2"
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
                    Create Account
                </button>
            </form>

            <p className="mt-4 text-sm">
                Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here.</Link>
            </p>
        </div>
    )
}