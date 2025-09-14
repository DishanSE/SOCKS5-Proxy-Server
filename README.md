# SOCKS5 Proxy Server

A simple SOCKS5 proxy server implemented in **Node.js** that supports basic authentication and TCP tunneling.

---

## 🚀 Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- A SOCKS5-compatible client (e.g., `curl`, browser, or Postman)

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/DishanSE/SOCKS5-Proxy-Server
cd simple-socks5-proxy-server
```
---

## ⚙️ Configuration

- Port: Configure the listening port with the environment variable PROXY_PORT (default: 1080).
- Credentials: Hardcoded username: proxyuser, password: proxypass.

---

## ▶️ Running the Proxy

Start the server:

Linux / macOS:
```bash
PROXY_PORT=1080 node socks5-proxy.js
```

Windows (CMD):
```bat
set PROXY_PORT=1080
node socks5-proxy.js
```

Windows (PowerShell):
```powershell
$env:PROXY_PORT=1080; node socks5-proxy.js
```

The server will log connections to proxy.log and print them to the console.

--- 

## 🔍 Testing the Proxy

Use curl to test:
```bash
curl --socks5-hostname localhost:1080 --proxy-user proxyuser:proxypass https://ipinfo.io
```

This command fetches data from https://ipinfo.io through the proxy.

---

## 📝 Log Output

Connection logs are saved to proxy.log in the format:
```php-template
2025-09-14T05:26:00.000Z - Source: <client-ip>, Destination: <host>:<port>
```
