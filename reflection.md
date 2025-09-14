# Reflection Note

To build this SOCKS5 proxy server, I had to learn the basics of the SOCKS5 protocol by
studying RFC 1928 and related online resources, such as blog posts and Stack Overflow 
discussions. The RFC provided a clear outline of the handshake, authentication, and 
connection request phases, but I focused on implementing only the essential parts 
(username/password authentication and TCP CONNECT command) to meet the task 
requirements. I also deepened my understanding of Node.js's net module, particularly how 
to handle raw TCP sockets and binary data with Buffers. Parsing binary protocol messages 
was a new challenge, as I had to carefully manage byte offsets for fields like address 
types and domain lengths.

Debugging was iterative and relied heavily on logging and testing with tools like curl. 
Initially, I encountered issues with incorrect buffer slicing, which caused 
authentication failures. By adding detailed console logs and cross-referencing with the 
RFC, I identified and fixed these errors. Testing with curl helped verify that the proxy 
correctly forwarded traffic to destinations like ipinfo.io. If I had more time, I would 
improve error handling to provide more detailed feedback to clients, add support for 
IPv6 (ATYP 0x04), and implement a more robust configuration system (e.g., a JSON config 
file for credentials). I would also add unit tests to validate edge cases, such as 
malformed requests or connection timeouts, to make the proxy more production-ready.
