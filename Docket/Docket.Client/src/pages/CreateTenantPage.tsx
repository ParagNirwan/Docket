import { useState } from "react"
import { useNavigate } from "react-router";
import { logout } from "../lib/auth";

export function CreateTenantPage() {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [error, setError] = useState("");
    const token = localStorage.getItem('token')
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (validateData() === false) {
            return;
        }
        setError("");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/tenant/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, slug }),
        })
        if (!response.ok) {
            setError("Tenant creation failed, please try again later");
            return;
        }
        setName("");
        setSlug("");
        navigate("/tenants")
    }

    function validateData() {
        if (slug.length === 0) {
            setError("Slug cannot be empty");
            return false;
        }
        if (name.length <= 3) {
            setError("Name length must be at least 4 characters.");
            return false;
        }
        return true;
    }

    return (
        <div className="max-w-sm mx-auto mt-20 p-6 border rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Create New Tenant</h1>
                <button
                    onClick={() => logout(navigate)}
                    className="text-sm text-gray-500 hover:text-red-600"
                >
                    Log out
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Tenant Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded px-3 py-2"
                />
                <input
                    type="text"
                    placeholder="Organisation slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="border rounded px-3 py-2"
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
                    Create Tenant
                </button>
            </form>
        </div>
    )
}