import { useState } from "react"
export function LoginPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    //state changes → re-render → UI reflects the new state

    // function to login
    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()

        //API Call now
        const response = await fetch('https://localhost:7100/auth/login',
            {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
        if (!response.ok) {
            //alert('Login failed')
            console.log("Login Failed")
            return
        } const data = await response.json()
        console.log('Got token:', data.token)
    }

    return (
        <div>
            <h1>Log in</h1>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /> <br />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /> <br />
                <button type="submit">Log in</button>
            </form>
        </div>)
} 