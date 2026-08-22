import { state } from "./net.js";

export function updateAccountMenu(user) {
    const logoutBtn = document.getElementById("logoutButton")
    logoutBtn.onclick = () => fetch(`https://supercord.lol/api/logout`, { method: "POST", credentials: "include" }).then(() => location.href = "/");
    const redirect = location.href;
    document.getElementById("discordLoginBtn").href = `https://discord.com/oauth2/authorize?client_id=1132362368979050546&response_type=code&redirect_uri=https%3A%2F%2Fsupercord.lol%2Fapi%2Flogin&scope=identify&state=${encodeURIComponent(JSON.stringify({ redirect }))}`;
    const loggedIn = document.getElementById("accountLoggedIn");
    const loggedOut = document.getElementById("accountLoggedOut");
    const avatar = document.getElementById("accountAvatar");
    const username = document.getElementById("accountUsernameDisplay");

    fetch(`https://supercord.lol/api/me`, { credentials: 'include' }).then(response => response.json().then(json => {
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

