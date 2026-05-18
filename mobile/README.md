# AeroPulse Mobile

React Native + Expo mobile version of the existing AeroPulse web POS and customer management system.

## Run

1. Start the existing backend from `../backend`.
2. Set the mobile API URL:
   - Android emulator: `http://10.0.2.2:5000/api`
   - iOS simulator: `http://localhost:5000/api`
   - Physical phone: `http://YOUR_LAN_IP:5000/api`
3. Install and start:

```bash
npm install
npm start
```

The API base URL defaults to `app.json > expo.extra.apiBaseUrl`; it can be overridden with `EXPO_PUBLIC_API_URL`.
