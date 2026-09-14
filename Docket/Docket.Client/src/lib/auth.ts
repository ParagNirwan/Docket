export function logout(
    navigate: (path: string) => void
) 
{
    localStorage.removeItem('token')
    navigate('/login')
}