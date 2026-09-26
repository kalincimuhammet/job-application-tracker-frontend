# Job Application Tracker

A small Angular app for keeping job applications, their status, salary expectations, and notes in one place.

## Features

- Create, edit, search, and delete applications
- Track applications that are still to be sent, open, or rejected
- Sign in with OpenID Connect through Zitadel
- Send authenticated requests to a separate REST API

## Requirements

- Node.js supported by Angular CLI 22 and npm
- A Zitadel OIDC application
- A compatible Job Application Tracker API instance

## Local setup

```bash
npm ci
```

Create the local runtime config from the example:

```powershell
Copy-Item public/assets/config.example.json public/assets/config.json
```

On macOS or Linux, use:

```bash
cp public/assets/config.example.json public/assets/config.json
```

Edit `public/assets/config.json` with your own values:

```json
{
	"authority": "https://your-instance.zitadel.cloud",
	"client_id": "YOUR_ZITADEL_CLIENT_ID",
	"apiUrl": "https://your-api.example.com/api/applications.php"
}
```

In Zitadel, allow the app's browser origin and configure the redirect URI as `<origin>/auth/callback` and the post-logout redirect URI as `<origin>/`. Configure the API to accept requests from the app's origin and validate the bearer tokens it receives.

Start the development server:

```bash
npm start
```

Open `http://localhost:4200/`.

## Commands

```bash
npm test
npm run build
```

The production build is written to `dist/`.

## Configuration and security

The runtime configuration is downloaded by the browser and is therefore public. OIDC client IDs and service URLs may be placed there; never put client secrets, signing keys, or other credentials in this frontend repository. The real `public/assets/config.json` is ignored by Git. Create it locally from `public/assets/config.example.json` or provide it through your deployment process.

The API is a separate service and must enforce authentication and per-user authorization itself. Hiding data in the frontend is not an access-control boundary.

## License

No license has been selected for this project yet. Until a license is added, the source is not granted for reuse by others.
