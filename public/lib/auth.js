import { state } from "./net.js";

export function updateAccountMenu(user) {
    const authServerUrl = import.meta.env.VITE_AUTH_SERVER ?? process.env.AUTH_SERVER;
    const oauthUrl = import.meta.env.VITE_DISCORD_OAUTH2_REDIRECT_URL ?? process.env.DISCORD_OAUTH2_REDIRECT_URL;

    const logoutBtn = document.getElementById("logoutButton")
    logoutBtn.onclick = () => fetch(`${authServerUrl}/api/logout`, { method: "POST", credentials: "include" }).then(() => location.href = "/");
    const redirect = location.href;
    document.getElementById("discordLoginBtn").href = `${oauthUrl}&state=${encodeURIComponent(JSON.stringify({ redirect }))}`;
    const loggedIn = document.getElementById("accountLoggedIn");
    const loggedOut = document.getElementById("accountLoggedOut");
    const avatar = document.getElementById("accountAvatar");
    const username = document.getElementById("accountUsernameDisplay");

    fetch(`${authServerUrl}/api/me`, { credentials: 'include' }).then(response => response.json().then(json => {
        if (json) {
            const user = state.user = json;
            const name = user.global_name || user.username || "User";
            const tag = user.discriminator === "0" ? "" : `#${user.discriminator}`;
            username.textContent = `${name}${tag}`;

            // GIF SUPPORT + FALLBACK
            if (user.avatar?.startsWith("a_")) avatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif?size=128`;
            else if (user.avatar) avatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=128`;
            else avatar.src = `https://cdn.discordapp.com/embed/avatars/${user.id}.png`;

            loggedIn.style.display = "block";
            loggedOut.style.display = "none";
        } else {
            loggedIn.style.display = "none";    
            loggedOut.style.display = "block";
        }
    }));
}

