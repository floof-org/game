import RoomManager from "./Room.js";

export const MAX_SQUAD_SIZE = 4;
export const MAX_LEVEL_GAP = 20;
export const INVITE_TIMEOUT_MS = 30_000;

const SQUAD_CODE_ALPHABET = "rtyufghjvbnm1234567890";

/** @type {Map<string, {leader: import("./Client.js").default, members: Set<import("./Client.js").default>, isPrivate: boolean}>} */
export const squads = new Map();

/** @type {Map<import("./Client.js").default, {invCode: string, inviterName: string, timer: any}>} */
export const squadInvites = new Map();

export function generateSquadCode() {
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += SQUAD_CODE_ALPHABET[Math.floor(Math.random() * SQUAD_CODE_ALPHABET.length)];
    }
    return code;
}

/**
 * @param {import("./Client.js").default} client
 * @returns {[string, object] | null}
 */
export function findSquadOf(client) {
    for (const [code, squad] of squads) {
        if (squad.members.has(client)) return [code, squad];
    }
    return null;
}

export function averageLevel(squad) {
    let total = 0;
    squad.members.forEach(m => total += (m.level || 1));
    return total / squad.members.size;
}

function findClientByUsername(username) {
    const lower = username.toLowerCase();
    for (const room of RoomManager.rooms) {
        for (const client of room.roomState.clients.values()) {
            if (client.verified && client.username.toLowerCase() === lower) {
                return client;
            }
        }
    }
    return null;
}

function currentBiomeOf(client) {
    const room = RoomManager.roomOf(client.id);
    if (!room) return null;
    if (room.roomState.isWaves && room.parentRoomName) {
        const parent = RoomManager.findByName(room.parentRoomName);
        return parent?.biome ?? room.biome;
    }
    return room.biome;
}

function teleportToRoomIfNeeded(client, targetRoom, extraMessage) {
    if (!targetRoom) return;
    const currentRoom = RoomManager.roomOf(client.id);
    if (currentRoom === targetRoom) return;
    RoomManager.moveClient(client, targetRoom);
    if (extraMessage) client.systemMessage(extraMessage(targetRoom.name), "#ffaaaa");
}

/**
 * @param {import("./Client.js").default} client
 * @param {string[]} args
 */
export function handleSquadCommand(client, args) {
    const subcommand = (args[0] ?? "").toLowerCase();
    const param = args[1] ?? "";
    const leaderRoom = RoomManager.roomOf(client.id);
    const inWavesRoom = Boolean(leaderRoom?.roomState.isWaves);

    switch (subcommand) {

        case "create": {
            if (inWavesRoom) {
                client.systemMessage("You cannot create a squad while on a Waves run", "#FF6666");
                return;
            }
            if (findSquadOf(client)) {
                client.systemMessage("You are already in a squad. Use /squad leave first", "#FF6666");
                return;
            }
            const code = generateSquadCode();
            squads.set(code, {
                leader: client,
                members: new Set([client]),
                isPrivate: false
            });
            client.systemMessage(`Squad created! Code: ${code} | Visibility: public`, "#ffaaaa");
            return;
        }

        case "join": {
            if (!param) {
                client.systemMessage("Usage: /squad join <code>", "#ffaaaa");
                return;
            }
            if (findSquadOf(client)) {
                client.systemMessage("You are already in a squad", "#FF6666");
                return;
            }
            if (inWavesRoom) {
                client.systemMessage("You cannot join a squad while on a Waves run", "#FF6666");
                return;
            }
            const squad = squads.get(param);
            if (!squad) {
                client.systemMessage("Squad not found", "#FF6666");
                return;
            }
            if (squad.members.size >= MAX_SQUAD_SIZE) {
                client.systemMessage("Squad is full, max 4", "#FF6666");
                return;
            }
            if (squad.isPrivate) {
                client.systemMessage("This squad is private. Ask the leader for an invite", "#FF6666");
                return;
            }
            const squadLeaderRoom = RoomManager.roomOf(squad.leader.id);
            if (squadLeaderRoom?.roomState.isWaves) {
                client.systemMessage("Cannot join a squad that is on a Waves run", "#FF6666");
                return;
            }
            {
                const myLevel = client.level || 1;
                const avg = averageLevel(squad);
                if (Math.abs(myLevel - avg) > MAX_LEVEL_GAP) {
                    client.systemMessage(`Your level ${myLevel} is too far from the squad average is ${Math.round(avg)}. Difference must be < 20`, "#FF6666");
                    return;
                }
            }
            squad.members.add(client);
            client.systemMessage(`Joined squad ${param}!`, "#ffaaaa");
            squad.members.forEach(m => {
                if (m !== client) m.systemMessage(`${client.username} joined the squad`, "#ffaaaa");
            });
            teleportToRoomIfNeeded(client, squadLeaderRoom, roomName => `Teleported to squad leader's room: ${roomName}`);
            return;
        }

        case "info": {
            const found = findSquadOf(client);
            if (!found) {
                client.systemMessage("You are not in a squad", "#ffaaaa");
                return;
            }
            const [code, squad] = found;
            const avg = Math.round(averageLevel(squad));

            client.systemMessage(`Squad: ${code} | Avg level: ${avg} | Members: ${squad.members.size}/4`, "#ffaaaa");

            const squadLeaderRoom = RoomManager.roomOf(squad.leader.id);
            if (squadLeaderRoom?.roomState.isWaves) {
                client.systemMessage(`Currently on a Waves run in "${squadLeaderRoom.name}" - Wave ${squadLeaderRoom.roomState.currentWave ?? 1}`, "#ffaaaa");
            } else {
                client.systemMessage(`Not currently on a Waves run (in "${squadLeaderRoom?.name ?? "?"}")`, "#ffaaaa");
            }

            squad.members.forEach(m => {
                const leaderTag = m === squad.leader ? "| Leader" : "";
                client.systemMessage(`${m.username} ${leaderTag} | lvl ${m.level || 1}`, "#ffaaaa");
            });
            return;
        }

        case "invite": {
            if (!param) {
                client.systemMessage("Usage: /squad invite <playerName>", "#ffaaaa");
                return;
            }
            const found = findSquadOf(client);
            if (!found) {
                client.systemMessage("You are not in a squad. Create one with /squad create", "#FF6666");
                return;
            }
            const [code, squad] = found;
            if (squad.leader !== client) {
                client.systemMessage("Only the squad leader can invite players", "#FF6666");
                return;
            }
            if (squad.members.size >= MAX_SQUAD_SIZE) {
                client.systemMessage("Squad is full, max 4", "#FF6666");
                return;
            }
            const target = findClientByUsername(param);
            const displayName = target?.username ?? param;

            if (!target) {
                client.systemMessage(`Player "${param}" not found`, "#FF6666");
                return;
            }
            if (target === client) {
                client.systemMessage("You cannot invite yourself", "#FF6666");
                return;
            }
            if (target.squadDisabled) {
                client.systemMessage(`${displayName} has squad invites disabled`, "#FF6666");
                return;
            }
            if (findSquadOf(target)) {
                client.systemMessage(`${displayName} is already in a squad`, "#FF6666");
                return;
            }
            if (squadInvites.has(target)) {
                client.systemMessage(`${displayName} already has a pending invite`, "#FF6666");
                return;
            }

            const expireTimer = setTimeout(() => {
                if (squadInvites.get(target)?.invCode === code) {
                    squadInvites.delete(target);
                    target.systemMessage("Squad invite expired", "#FF6666");
                    client.systemMessage(`${target.username} did not accept the invite in time`, "#FF6666");
                }
            }, INVITE_TIMEOUT_MS);

            squadInvites.set(target, {
                invCode: code,
                inviterName: client.username,
                timer: expireTimer
            });
            target.systemMessage(`${client.username} invited you to squad, type /squad accept to accept`, "#ffaaaa");
            client.systemMessage(`Invite sent to ${displayName}. They have 30 seconds to accept`, "#ffaaaa");
            return;
        }

        case "accept": {
            const invite = squadInvites.get(client);
            if (!invite) {
                client.systemMessage("You have no pending squad invite", "#FF6666");
                return;
            }
            clearTimeout(invite.timer);
            squadInvites.delete(client);

            if (findSquadOf(client)) {
                client.systemMessage("You are already in a squad", "#FF6666");
                return;
            }
            if (inWavesRoom) {
                client.systemMessage("You cannot join a squad while on a Waves run", "#FF6666");
                return;
            }
            const squad = squads.get(invite.invCode);
            if (!squad) {
                client.systemMessage("Squad no longer exists", "#FF6666");
                return;
            }
            if (squad.members.size >= MAX_SQUAD_SIZE) {
                client.systemMessage("Squad is now full", "#FF6666");
                return;
            }
            const squadLeaderRoom = RoomManager.roomOf(squad.leader.id);
            if (squadLeaderRoom?.roomState.isWaves) {
                client.systemMessage("Cannot join a squad that is on a Waves run", "#FF6666");
                return;
            }
            {
                const myLevel = client.level || 1;
                const avg = averageLevel(squad);
                if (Math.abs(myLevel - avg) > MAX_LEVEL_GAP) {
                    client.systemMessage(`Your level - ${myLevel} is too far from the squad average ${Math.round(avg)}. Difference must be < 20`, "#FF6666");
                    return;
                }
            }
            squad.members.add(client);
            client.systemMessage(`Joined ${invite.inviterName}'s squad!`, "#ffaaaa");
            squad.members.forEach(m => {
                if (m !== client) m.systemMessage(`${client.username} accepted the invite and joined the squad`, "#ffaaaa");
            });
            teleportToRoomIfNeeded(client, squadLeaderRoom, roomName => `Teleported to squad leader's room: ${roomName}`);
            return;
        }

        case "leave": {
            if (inWavesRoom) {
                client.systemMessage("You cannot leave a squad while on a Waves run", "#FF6666");
                return;
            }
            const found = findSquadOf(client);
            if (!found) {
                client.systemMessage("You are not in a squad", "#ffaaaa");
                return;
            }
            const [code, squad] = found;
            if (squad.leader === client) {
                squad.members.forEach(m => {
                    if (m !== client) m.systemMessage("The leader left. Squad disbanded", "#FF6666");
                });
                squads.delete(code);
                client.systemMessage("Squad disbanded", "#FF6666");
                return;
            }
            squad.members.delete(client);
            client.systemMessage("You left the squad", "#ffaaaa");
            squad.members.forEach(m => m.systemMessage(`${client.username} left the squad`, "#ffaaaa"));
            return;
        }

        case "find": {
            const myLevel = client.level || 1;
            const myBiome = currentBiomeOf(client);

            if (findSquadOf(client)) {
                client.systemMessage("You are already in a squad", "#FF6666");
                return;
            }

            const candidates = [];
            for (const [code, squad] of squads) {
                if (squad.isPrivate) continue;
                if (squad.members.size >= MAX_SQUAD_SIZE) continue;
                const avg = averageLevel(squad);
                if (Math.abs(myLevel - avg) > MAX_LEVEL_GAP) continue;
                const squadLeaderRoom = RoomManager.roomOf(squad.leader.id);
                candidates.push({
                    code,
                    squad,
                    leaderRoom: squadLeaderRoom,
                    squadBiome: squadLeaderRoom?.biome ?? myBiome
                });
            }

            if (candidates.length > 0) {
                candidates.sort((a, b) => {
                    const aSame = a.squadBiome === myBiome ? 0 : 1;
                    const bSame = b.squadBiome === myBiome ? 0 : 1;
                    if (aSame !== bSame) return aSame - bSame;
                    return Math.abs(myLevel - averageLevel(a.squad)) - Math.abs(myLevel - averageLevel(b.squad));
                });

                const best = candidates[0];
                const leaderInWaves = Boolean(best.leaderRoom?.roomState.isWaves);

                if (leaderInWaves) {
                    const mainRoom = RoomManager.findByName(best.leaderRoom.parentRoomName ?? "main-garden")
                        ?? RoomManager.findRoomForNewClient();
                    best.squad.members.add(client);
                    best.squad.members.forEach(m => {
                        if (m !== client) {
                            m.systemMessage(`${client.username} is waiting for the squad in the main room via /squad find`, "#ffaaaa");
                        }
                    });
                    client.systemMessage(`Found squad ${best.code} ${best.squad.members.size}/4. They are currently on a Waves run. Sending you to wait in their main room`, "#ffaaaa");
                    client.systemMessage("You will be able to join them once they finish their run and return to the main room", "#ffddaa");
                    if (mainRoom) RoomManager.moveClient(client, mainRoom);
                } else {
                    best.squad.members.add(client);
                    client.systemMessage(`Found and joined squad ${best.code}, ${best.squad.members.size}/4!`, "#ffaaaa");
                    best.squad.members.forEach(m => {
                        if (m !== client) m.systemMessage(`${client.username} joined the squad via /squad find`, "#ffaaaa");
                    });
                    teleportToRoomIfNeeded(client, best.leaderRoom, roomName => `Teleported to squad leader's room: ${roomName}`);
                }
                return;
            }

            let partner = null;
            for (const room of RoomManager.rooms) {
                for (const c of room.roomState.clients.values()) {
                    if (c !== client && !c.squadDisabled && !(findSquadOf(c) || Math.abs(myLevel - (c.level || 1)) > MAX_LEVEL_GAP)) {
                        partner = c;
                        break;
                    }
                }
                if (partner) break;
            }
            if (!partner) {
                client.systemMessage("No squads or players found matching your level range", "#FF6666");
                return;
            }

            const newCode = generateSquadCode();
            squads.set(newCode, {
                leader: partner,
                members: new Set([partner, client]),
                isPrivate: false
            });
            client.systemMessage(`Found player ${partner.username}, lvl ${partner.level || 1}. Created squad ${newCode} with them as leader!`, "#ffaaaa");
            partner.systemMessage(`${client.username}, lvl ${myLevel} found you via /squad find. You are now squad leader! Code: ${newCode}`, "#ffaaaa");

            const partnerRoom = RoomManager.roomOf(partner.id);
            teleportToRoomIfNeeded(client, partnerRoom, roomName => `Teleported to ${partner.username}'s room: ${roomName}`);
            return;
        }

        case "private": {
            const found = findSquadOf(client);
            if (!found) {
                client.systemMessage("You are not in a squad", "#FF6666");
                return;
            }
            const [, squad] = found;
            if (squad.leader !== client) {
                client.systemMessage("Only the squad leader can change squad visibility", "#FF6666");
                return;
            }
            squad.isPrivate = !squad.isPrivate;
            const label = squad.isPrivate ? "private" : "public";
            squad.members.forEach(m => m.systemMessage(`Squad is now ${label}`, "#ffaaaa"));
            return;
        }

        case "kick": {
            if (!param) {
                client.systemMessage("Usage: /squad kick <playerName>", "#ffaaaa");
                return;
            }
            const found = findSquadOf(client);
            if (!found) {
                client.systemMessage("You are not in a squad", "#FF6666");
                return;
            }
            const [, squad] = found;
            if (squad.leader !== client) {
                client.systemMessage("Only the squad leader can kick players", "#FF6666");
                return;
            }
            let target = null;
            for (const m of squad.members) {
                if (m.username === param) {
                    target = m;
                    break;
                }
            }
            if (!target) {
                client.systemMessage(`Player "${param}" is not in your squad`, "#FF6666");
                return;
            }
            if (target === client) {
                client.systemMessage("You cannot kick yourself. Use /squad leave to disband", "#FF6666");
                return;
            }
            squad.members.delete(target);
            target.systemMessage("You have been kicked from the squad", "#FF6666");
            squad.members.forEach(m => m.systemMessage(`${param} was kicked from the squad`, "#ffaaaa"));
            client.systemMessage(`${param} has been kicked`, "#ffaaaa");
            return;
        }

        case "disable":
            client.squadDisabled = !client.squadDisabled;
            client.systemMessage(
                client.squadDisabled
                    ? "Squad invites and /squad find are now DISABLED for you"
                    : "Squad invites and /squad find are now ENABLED for you",
                client.squadDisabled ? "#FF6666" : "#ffaaaa"
            );
            return;

        default:
            client.systemMessage(
                "/squad create | join <code> | find | invite <player> | accept | info | private | kick <player> | disable | leave",
                "#ffaaaa"
            );
    }
}

export function dragSquadAlongOnRoomMove(client, targetRoom) {
    const found = findSquadOf(client);
    if (!found) return;
    const [, squad] = found;
    if (squad.leader !== client) return;

    squad.members.forEach(member => {
        if (member !== client) {
            RoomManager.moveClient(member, targetRoom);
            member.systemMessage(`Squad leader moved you to room "${targetRoom.name}"`, "#ffaaaa");
        }
    });
}

/**
 * @returns {boolean}
 */
export function canUseRoomJoin(client) {
    const found = findSquadOf(client);
    if (found && found[1].leader !== client) {
        client.systemMessage("Only the squad leader can use /room join. Use /squad leave first", "#FF6666");
        return false;
    }
    return true;
}

export function cleanupSquadOnDisconnect(client) {
    for (const [code, squad] of squads) {
        if (squad.members.has(client)) {
            if (squad.leader === client) {
                squad.members.forEach(m => {
                    if (m !== client) m.systemMessage("Squad leader disconnected. Squad disbanded", "#FF6666");
                });
                squads.delete(code);
            } else {
                squad.members.delete(client);
                squad.members.forEach(m => m.systemMessage(`${client.username} disconnected and left the squad`, "#ffaaaa"));
            }
            break;
        }
    }
}

export function printSquadHelp(client) {
    client.systemMessage("/squad commands:", "#ffaaaa");
    client.systemMessage("/squad create - create a new squad, public by default", "#ffaaaa");
    client.systemMessage("/squad find - find a public squad matching your level", "#ffaaaa");
    client.systemMessage("/squad join <code> - join a squad by code", "#ffaaaa");
    client.systemMessage("/squad invite <player> - invite a player, leader only", "#ffaaaa");
    client.systemMessage("/squad accept - accept a pending squad invite", "#ffaaaa");
    client.systemMessage("/squad info - show current squad info & code", "#ffaaaa");
    client.systemMessage("/squad private - toggle squad public/private, leader only", "#ffaaaa");
    client.systemMessage("/squad kick <player> - kick a player from squad, leader only", "#ffaaaa");
    client.systemMessage("/squad leave - leave your current squad", "#ffaaaa");
}