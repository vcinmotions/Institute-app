/**
 * Public half of the licence signing key, compiled into the application.
 * It must NOT be read from .env in a packaged build: anyone could swap an
 * editable public key for their own and sign their own licences.
 * The matching PRIVATE key lives only on the hosted portal (SUBSCRIPTION_PRIVATE_KEY).
 */
export const EMBEDDED_LICENSE_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAxabx9CDmngO3DsYKP6qkpFOiJPty9VD0C702wONJ5iw=
-----END PUBLIC KEY-----`;
