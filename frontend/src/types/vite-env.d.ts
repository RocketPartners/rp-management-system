/// <reference types="vite/client" />

declare module 'sockjs-client/dist/sockjs' {
    // Minimal ambient declaration for the untyped 'sockjs-client' subpath.
    // SockJS produces a WebSocket-compatible object consumed by @stomp/stompjs.
    interface SockJSOptions {
        server?: string;
        sessionId?: number | (() => string);
        transports?: string | string[];
        timeout?: number;
    }

    interface SockJSClass {
        new (url: string, protocols?: string | string[], options?: SockJSOptions): WebSocket;
    }

    const SockJS: SockJSClass;
    export default SockJS;
}
