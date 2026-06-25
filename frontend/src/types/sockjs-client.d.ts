/**
 * Ambient declaration for the deep import path used by @stomp/stompjs.
 * The sockjs-client package ships no types for its `dist/sockjs` entry,
 * so we re-export the constructor as the default export.
 */
declare module 'sockjs-client/dist/sockjs' {
    import SockJS from 'sockjs-client';
    export default SockJS;
}
