const net = require('net');
const fs = require('fs');

// Configuration
const PORT = process.env.PROXY_PORT || 1080;
const USERNAME = 'proxyuser';
const PASSWORD = 'proxypass';
const LOG_FILE = 'proxy.log';

// Create log file stream
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

// Log connection details
function logConnection(sourceIp, destHost, destPort) {
  const logMessage = `${new Date().toISOString()} - Source: ${sourceIp}, Destination: ${destHost}:${destPort}\n`;
  logStream.write(logMessage);
  console.log(logMessage);
}

// SOCKS5 protocol constants
const SOCKS_VERSION = 0x05;
const AUTH_METHODS = {
  NO_AUTH: 0x00,
  USER_PASS: 0x02,
  NO_METHODS: 0xFF
};

// Create SOCKS5 server
const server = net.createServer((clientSocket) => {
  clientSocket.on('error', (err) => {
    console.error(`Client socket error: ${err.message}`);
  });

  // Handle SOCKS5 handshake
  clientSocket.once('data', (data) => {
    // Parse initial handshake
    if (data[0] !== SOCKS_VERSION) {
      clientSocket.end();
      return;
    }

    const nmethods = data[1];
    const methods = data.slice(2, 2 + nmethods);

    // Check if username/password auth is supported
    if (!methods.includes(AUTH_METHODS.USER_PASS)) {
      clientSocket.write(Buffer.from([SOCKS_VERSION, AUTH_METHODS.NO_METHODS]));
      clientSocket.end();
      return;
    }

    // Request username/password authentication
    clientSocket.write(Buffer.from([SOCKS_VERSION, AUTH_METHODS.USER_PASS]));

    // Handle authentication
    clientSocket.once('data', (authData) => {
      if (authData[0] !== 0x01) {
        clientSocket.end();
        return;
      }

      const usernameLength = authData[1];
      const username = authData.slice(2, 2 + usernameLength).toString();
      const passwordLength = authData[2 + usernameLength];
      const password = authData.slice(3 + usernameLength, 3 + usernameLength + passwordLength).toString();

      if (username !== USERNAME || password !== PASSWORD) {
        clientSocket.write(Buffer.from([0x01, 0x01])); // Auth failure
        clientSocket.end();
        return;
      }

      // Auth success
      clientSocket.write(Buffer.from([0x01, 0x00]));

      // Handle connection request
      clientSocket.once('data', (request) => {
        if (request[0] !== SOCKS_VERSION || request[1] !== 0x01) { // Only support CONNECT command
          clientSocket.end();
          return;
        }

        const addressType = request[3];
        let destHost, destPort;

        if (addressType === 0x01) { // IPv4
          destHost = request.slice(4, 8).join('.');
          destPort = request.readUInt16BE(8);
        } else if (addressType === 0x03) { // Domain name
          const domainLength = request[4];
          destHost = request.slice(5, 5 + domainLength).toString();
          destPort = request.readUInt16BE(5 + domainLength);
        } else {
          clientSocket.end();
          return;
        }

        // Log connection
        logConnection(clientSocket.remoteAddress, destHost, destPort);

        // Create connection to destination
        const destSocket = net.createConnection({ host: destHost, port: destPort }, () => {
          // Build reply with the actual bound address/port
          const boundAddr = destSocket.localAddress.split('.').map(Number);
          const boundPort = destSocket.localPort;

          const reply = Buffer.alloc(10);
          reply[0] = SOCKS_VERSION;
          reply[1] = 0x00; // Succeeded
          reply[2] = 0x00; // Reserved
          reply[3] = 0x01; // IPv4
          reply[4] = boundAddr[0];
          reply[5] = boundAddr[1];
          reply[6] = boundAddr[2];
          reply[7] = boundAddr[3];
          reply.writeUInt16BE(boundPort, 8);

          clientSocket.write(reply);

          // Pipe data between client and destination
          clientSocket.pipe(destSocket);
          destSocket.pipe(clientSocket);
        });

        destSocket.on('error', (err) => {
          console.error(`Destination socket error: ${err.message}`);
          clientSocket.end();
        });
      });
    });
  });
});

server.on('error', (err) => {
  console.error(`Server error: ${err.message}`);
});

server.listen(PORT, () => {
  console.log(`SOCKS5 proxy server running on port ${PORT}`);
});