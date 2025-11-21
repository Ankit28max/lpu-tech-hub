export const runtime = 'edge';
// Edge runtime uses Deno; declare for TypeScript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

// In-memory hub: track clients and online counts per user
const getHub = () => {
  const g = globalThis as unknown as {
    __wsClients?: Map<WebSocket, string | undefined>;
    __wsUserCounts?: Map<string, number>;
  };
  if (!g.__wsClients) g.__wsClients = new Map<WebSocket, string | undefined>();
  if (!g.__wsUserCounts) g.__wsUserCounts = new Map<string, number>();
  return { clients: g.__wsClients, userCounts: g.__wsUserCounts };
};

export async function GET(req: Request) {
  const upgradeHeader = req.headers.get('upgrade') || '';
  if (upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected websocket', { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const { clients, userCounts } = getHub();

  socket.onopen = () => {
    clients.set(socket, undefined);
  };

  socket.onmessage = (event: MessageEvent) => {
    try {
      const payload = JSON.parse(event.data as string);
      if (payload.type === 'init' && typeof payload.userId === 'string') {
        const prevUserId = clients.get(socket);
        if (prevUserId && prevUserId !== payload.userId) {
          const prevCount = (userCounts.get(prevUserId) || 1) - 1;
          if (prevCount <= 0) {
            userCounts.delete(prevUserId);
            broadcast(JSON.stringify({ type: 'presence', userId: prevUserId, online: false }));
          } else {
            userCounts.set(prevUserId, prevCount);
          }
        }
        clients.set(socket, payload.userId);
        const next = (userCounts.get(payload.userId) || 0) + 1;
        userCounts.set(payload.userId, next);
        if (next === 1) {
          broadcast(JSON.stringify({ type: 'presence', userId: payload.userId, online: true }));
        }
        return;
      }
      if (payload.type === 'message' || payload.type === 'typing' || payload.type === 'presence') {
        broadcast(JSON.stringify(payload), socket);
        return;
      }
      // default: fan out raw
      broadcast(event.data as string, socket);
    } catch {
      // ignore invalid JSON
    }
  };

  socket.onclose = () => {
    const userId = clients.get(socket);
    clients.delete(socket);
    if (userId) {
      const next = (userCounts.get(userId) || 1) - 1;
      if (next <= 0) {
        userCounts.delete(userId);
        broadcast(JSON.stringify({ type: 'presence', userId, online: false }));
      } else {
        userCounts.set(userId, next);
      }
    }
  };

  socket.onerror = () => {
    const userId = clients.get(socket);
    clients.delete(socket);
    if (userId) {
      const next = (userCounts.get(userId) || 1) - 1;
      if (next <= 0) {
        userCounts.delete(userId);
        broadcast(JSON.stringify({ type: 'presence', userId, online: false }));
      } else {
        userCounts.set(userId, next);
      }
    }
    try { socket.close(); } catch { }
  };

  function broadcast(data: string, exclude?: WebSocket) {
    for (const client of clients.keys()) {
      if (client === exclude) continue;
      try { client.send(data); } catch { }
    }
  }

  return response;
}


