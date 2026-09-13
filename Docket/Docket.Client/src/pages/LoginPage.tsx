import { useState } from "react"
import { useNavigate } from "react-router";

export function LoginPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate() //this helps to programatically change the url
    const [error, setError] = useState("");

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
            setError("Login Failed");
            return
        } const data = await response.json()

        //in prod we use httpOnly cookies to store the token which JS cant read. 
        localStorage.setItem('token', data.token)
        navigate('/create-tenant')
        //console.log('Got token:', data.token)
    }

    return (
        <div>
            <h1>Log in</h1>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /> <br />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /> <br />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Log in</button>
            </form>
        </div>)
} 