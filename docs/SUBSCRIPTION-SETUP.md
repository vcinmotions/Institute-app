# Subscription setup checklist

Subscriptions are bought and renewed only on the hosted web portal. The Windows EXE keeps a signed copy and goes view/export-only when it expires.

## 1. Generate the signing keys (once)

Run in any terminal with Node:

```
node -e "const c=require('crypto');const k=c.generateKeyPairSync('ed25519');console.log('SUBSCRIPTION_PRIVATE_KEY='+Buffer.from(k.privateKey.export({type:'pkcs8',format:'pem'})).toString('base64'));console.log('SUBSCRIPTION_PUBLIC_KEY='+Buffer.from(k.publicKey.export({type:'spki',format:'pem'})).toString('base64'))"
```

- PRIVATE key goes only on the hosted server. Never put it in the repo or the EXE.
- PUBLIC key goes in the EXE's env.
- Keep a safe backup of the private key. If it is lost, every installed EXE needs a new build with a new public key.

## 2. Hosted server (`server/.env`)

```
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
SUBSCRIPTION_PRIVATE_KEY=<from step 1>
JWT_SECRET=<long random string>
```

- Do NOT set `SUBSCRIPTION_API_URL` on the hosted server (it would lock the portal itself).
- Use `rzp_test_` keys first, then switch to live.

Database (stop any running server/EXE first, the Prisma engine file is locked while they run):

```
cd server
npm run generate:central
npm run db:push:central
```

For the desktop build also run `npm run generate:central-prod`.

### Create the SaaS Super Admin (once, on the hosted server)

```
cd server
npx ts-node src/scripts/create-saas-admin.ts you@example.com "a-strong-password" "Your Name"
```

Sign in at `https://<your-domain>/saas/login`. Run the same command again to reset the password.

## 3. Razorpay dashboard

- Settings > Webhooks > add `https://<your-domain>/api/portal/razorpay-webhook`
- Event: `payment.captured` (`order.paid` also works)
- Secret: the same value as `RAZORPAY_WEBHOOK_SECRET`

## 4. Hosted frontend

```
NEXT_PUBLIC_API_BASE_URL=https://<your-domain>/api
```

Sign in at `/saas/login` and set the 6-month and 1-year prices on the Subscription plans tab. A plan at 0 cannot be bought.

## 5. EXE build (`server/.env` and `.env.prod` shipped in the installer)

```
SUBSCRIPTION_API_URL=https://<your-domain>
SUBSCRIPTION_PORTAL_URL=https://<your-domain>
SUBSCRIPTION_PUBLIC_KEY=<from step 1>
```

Leaving `SUBSCRIPTION_API_URL` empty turns the checks off (dev).

## 6. Test checklist

1. Website `/`: plans show the prices you set.
2. Register a new institute (Razorpay test mode), pay with a test card.
3. `/subscription` shows Active with days left.
4. EXE: sign in with that email and password while online. It activates and works offline afterwards.
5. Expiry test: temporarily set `expiryDate` in the past for that email in `PortalSubscription`, wait for the 5-minute sync or press "I have renewed - check again". Add/edit should return 402, view/export keep working.
6. Click **Renew Subscription** in the EXE: it opens `/subscription` in the browser. Pay, return to the EXE. It unlocks without reinstalling.
7. Turn off the internet: the app keeps working until the saved expiry date.
8. Move the system clock back: the app locks until it goes online.

## Known limits

- Registration creates the institute database before payment. Unpaid sign-ups leave databases behind; add a cleanup job or captcha if abused.
- Unpaid accounts can sign in to the EXE in view-only mode.
