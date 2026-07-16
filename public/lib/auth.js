export async function getUserFromSession() {
    try {
        const res = await fetch(`${process.env.AUTH_SERVER}/api/me`, {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error("Not logged in");

        const user = await res.json();
        console.log("Logged in as:", user.username + "#" + user.discriminator);
        return user;
    } catch (e) {
        console.error(e);
        console.log("Not logged in");
        return null;
    }
}
