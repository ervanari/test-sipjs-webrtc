// File: lib/sipClient.ts
import {
    Invitation,
    Inviter,
    Messager,
    Registerer,
    Session,
    UserAgent,
    UserAgentOptions,
} from "sip.js";

let ua: UserAgent;
let registerer: Registerer;
let currentSession: Session;

interface SIPConfig {
    uri: string;
    password: string;
    wsServer: string;
    onInvite?: (session: Invitation) => void;
    onMessage?: (message: string, from: string) => void;
}

export function initSIP(config: SIPConfig) {
    const { uri, password, wsServer, onInvite, onMessage } = config;

    const userAgentOptions: UserAgentOptions = {
        uri: UserAgent.makeURI(uri),
        transportOptions: {
            server: wsServer,
        },
        authorizationUsername: extractUsername(uri),
        authorizationPassword: password,
    };

    // Helper function to extract username from URI
    function extractUsername(uri: string): string {
        // Handle URI with sip: prefix (sip:username@domain)
        if (uri.includes(':')) {
            const parts = uri.split(':');
            if (parts.length > 1 && parts[1].includes('@')) {
                return parts[1].split('@')[0];
            }
        }

        // Handle URI without prefix (username@domain)
        if (uri.includes('@')) {
            return uri.split('@')[0];
        }

        // Fallback to the original URI if no username can be extracted
        return uri;
    }

    ua = new UserAgent(userAgentOptions);

    // Create delegate for handling events
    ua.delegate = {
        onInvite: (invitation) => {
            currentSession = invitation;
            if (onInvite) {
                onInvite(invitation);
            }
        },
        onMessage: (message) => {
            if (onMessage) {
                const from = message.request.from.uri.toString();
                const body = message.request.body;
                onMessage(body, from);
            }
        }
    };

    ua.start().then(() => {
        registerer = new Registerer(ua);
        registerer.register();
        console.log("✅ SIP connected and registered");
    });
}

export async function makeCall(target: string, withVideo = false): Promise<Session> {
    const inviter = new Inviter(ua, UserAgent.makeURI(target)!, {
        sessionDescriptionHandlerOptions: {
            constraints: {
                audio: true,
                video: withVideo,
            },
        },
    });

    currentSession = inviter;
    await inviter.invite();
    return inviter;
}

export function acceptCall(invitation: Invitation, withVideo = false) {
    invitation.accept({
        sessionDescriptionHandlerOptions: {
            constraints: {
                audio: true,
                video: withVideo,
            },
        },
    });
    currentSession = invitation;
}

export function hangupCall() {
    if (currentSession) {
        if (currentSession.state === "Established") {
            currentSession.bye();
        } else if (currentSession.state === "Initial") {
            // Check if the session is an Inviter before calling cancel()
            if (currentSession instanceof Inviter) {
                currentSession.cancel();
            }
        }
    }
}

export function muteCall(mute: boolean) {
    if (currentSession && currentSession.sessionDescriptionHandler) {
        // Use type assertion to access peerConnection
        const sessionDescriptionHandler = currentSession.sessionDescriptionHandler as any;
        if (sessionDescriptionHandler.peerConnection) {
            const pc = sessionDescriptionHandler.peerConnection;
            pc.getSenders().forEach((sender: RTCRtpSender) => {
                if (sender.track && sender.track.kind === 'audio') {
                    sender.track.enabled = !mute;
                }
            });
            return true;
        }
    }
    return false;
}

export function sendMessage(target: string, message: string) {
    const targetURI = UserAgent.makeURI(target)!;
    const messager = new Messager(ua, targetURI, message);
    messager.message();
}

export function transferCall(target: string) {
    if (currentSession && currentSession instanceof Inviter) {
        currentSession.refer(UserAgent.makeURI(target)!);
    }
}
