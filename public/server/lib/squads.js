import state from "./state.js";

export const SQUADS = globalThis.SQUADS ||= new Map();

export const getUserId = client => client?.userId;

export const getPlayerLevel = client => client?.level ?? 0;

export function clientByUserId(userId) {
    if (!userId) return null;

    for (const client of state.clients.values()) {
        if (client.userId === userId) return client;
    }

    return null;
}

export function inSquad(client) {
    const uid = getUserId(client);
    if (!uid) return null;

    for (const squad of SQUADS.values()) {
        if (squad.members.has(uid)) return squad;
    }

    return null;
}

export function getSquadKey(client) {
    const squad = inSquad(client);
    return squad ? "squad:" + squad.name : "solo:" + client.id;
}

export function squadBroadcast(squad, msg, color = "#55ccff") {
    for (const memberId of squad.members) {
        const online = clientByUserId(memberId);
        if (online) online.systemMessage(msg, color);
    }
}

export function validateSquadMembers(squad) {
    const owner = clientByUserId(squad.ownerId);
    if (!owner) return;

    const ownerLevel = getPlayerLevel(owner);
    squad.levelRequirement = ownerLevel;

    const min = ownerLevel - 32;
    const max = ownerLevel + 32;

    for (const memberId of [...squad.members]) {
        if (memberId === squad.ownerId) continue;

        const client = clientByUserId(memberId);
        if (!client) continue;

        const lvl = getPlayerLevel(client);

        if (lvl < min || lvl > max) {
            squad.members.delete(memberId);
            squadBroadcast(squad, `${client.username} left squad. Not enough lvl.`, "#ffaa00");
        }
    }
}

export function handleSquadLeave(player, reason = "Owner disconnected.") {
    const squad = inSquad(player);
    if (!squad) return;

    const uid = getUserId(player);
    if (!uid) return;

    if (uid === squad.ownerId) {
        squadBroadcast(squad, `Squad disbanded. ${reason}`, "#ff5555");
        SQUADS.delete(squad.name);
    } else {
        squadBroadcast(squad, `${player.username} left squad.`, "#ffaa00");
        squad.members.delete(uid);
    }
}
