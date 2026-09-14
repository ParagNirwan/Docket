import { useState } from "react"
export function RegisterPage() {

    // anything with 'use' in front of it is a Hook
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");


    //state changes → re-render → UI reflects the new state

    // function to login
    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()

        if(validateInput() === false){
            return;
        };
        
        setError("");

        //API Call now
        const response = await fetch('https://localhost:7100/auth/register',
            {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password }),
            })
        if (!response.ok) {
            //alert('Login failed')
            console.log("Registration Failed")
            return
        } const data = await response.json()
       // console.log('Got token:', data.token)
    }
    function validateInput() {
        //password check
        if (password !== confirmPassword) {
            setError("Passwords don't macth.");
            return false;
        }

        if (password.length < 8) {
            setError("Password length must be atleast 8 Characters.")
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
        <div>
            <h1>Register New Account</h1>

            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)}></input> <br />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /> <br />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /> <br />
                <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}></input> <br />
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit">Create Account</button>
            </form> <br />
            Already have an account? <a href="/login">Login Here.</a>
        </div>
    )

} 