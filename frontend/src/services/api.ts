const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function testBackend() {
    const response = await fetch(`${API_BASE_URL}/api/test`);

    if (!response.ok) {
        throw new Error("Backend request failed");
    }

    return response.json();
}