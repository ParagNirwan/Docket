import { useState } from "react"
export function CreateTenantPage() {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [error, setError] = useState("");
    const token = localStorage.getItem('token')

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if (validateData() === false) {
            return;
        }
        setError(""); //to clear the error


        const response = await fetch('https://localhost:7100/tenant/create',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, slug }),
            }
        )
        if (!response.ok) {
            setError("Tenant creation failed, please try again later");
            return;
        } const data = await response.json()
        alert("tenant Created ");
    }


    function validateData() {
        //in future i will add better slug validation
        if (slug.length === 0) {
            setError("Slug cannot be empty");
            return false;
        }
        if (name.length <= 3) {
            setError("Name length must be atleast 4 characters.");
            return false;
        }
        return true;

    }


    return (
        <div>
            <h1>Create New Tenant</h1>

            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Tenant Name" value={name} onChange={(e) => setName(e.target.value)}></input> <br />
                <input type="text" placeholder="organisation slug" value={slug} onChange={(e) => setSlug(e.target.value)} /> <br />
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit">Create Account</button>
            </form>
        </div>
    )
}