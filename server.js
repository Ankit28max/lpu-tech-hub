const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// WebSocket state
const clients = new Map(); // ws -> userId
const userCounts = new Map(); // userId -> count

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // WebSocket Server
    const wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
        const { pathname } = parse(request.url);

        if (pathname === '/api/messages/ws') {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        } else {
            socket.destroy();
        }
    });

    wss.on('connection', (ws) => {
        console.log('WebSocket client connected');
        clients.set(ws, undefined);

        ws.on('message', (data) => {
            try {
                const payload = JSON.parse(data.toString());
                console.log('WebSocket message received:', payload.type);

                if (payload.type === 'init' && payload.userId) {
                    const prevUserId = clients.get(ws);
                    if (prevUserId && prevUserId !== payload.userId) {
                        decrementUser(prevUserId);
                    }
                    clients.set(ws, payload.userId);
                    incrementUser(payload.userId);
                    return;
                }

                // Broadcast message, typing, delete events
                if (['message', 'typing', 'delete', 'presence'].includes(payload.type)) {
                    broadcast(JSON.stringify(payload), ws);
                }
            } catch (err) {
                console.error('WebSocket message error:', err);
            }
        });

        ws.on('close', () => {
            console.log('WebSocket client disconnected');
            const userId = clients.get(ws);
            clients.delete(ws);
            if (userId) decrementUser(userId);
        });

        ws.on('error', (err) => {
            console.error('WebSocket error:', err);
            const userId = clients.get(ws);
            clients.delete(ws);
            if (userId) decrementUser(userId);
        });
    });

    function incrementUser(userId) {
        const count = (userCounts.get(userId) || 0) + 1;
        userCounts.set(userId, count);
        console.log(`User ${userId} online (count: ${count})`);
        if (count === 1) {
            broadcast(JSON.stringify({ type: 'presence', userId, online: true }));
        }
    }

    function decrementUser(userId) {
        const count = (userCounts.get(userId) || 1) - 1;
        if (count <= 0) {
            userCounts.delete(userId);
            console.log(`User ${userId} offline`);
            broadcast(JSON.stringify({ type: 'presence', userId, online: false }));
        } else {
            userCounts.set(userId, count);
            console.log(`User ${userId} still online (count: ${count})`);
        }
    }

    function broadcast(data, exclude) {
        let sentCount = 0;
        for (const [client, userId] of clients.entries()) {
            if (client !== exclude && client.readyState === 1) {
                try {
                    client.send(data);
                    sentCount++;
                } catch (err) {
                    console.error('Broadcast error:', err);
                }
            }
        }
        console.log(`Broadcast to ${sentCount} clients`);
    }

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> WebSocket server running on ws://${hostname}:${port}/api/messages/ws`);
    });
});
