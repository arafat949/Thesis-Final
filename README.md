# Web SDK and Hosted Fields

The goal of the halalpay Web SDK and Hosted Fields project is to provide a secure, developer-friendly JavaScript library that allows merchants to collect credit card information on their websites without handling raw payment data

# Architecture
```mermaid
sequenceDiagram
    participant User
    participant MerchantApp as Merchant Website
    participant SDK as Web/JS SDK
    participant Iframe as Hosted Fields (js.halalpay.com)
    participant API as halalpay API

    Note over MerchantApp, API: 1. Initialization Phase
    MerchantApp->>SDK: halalpay.init({ publicKey })
    MerchantApp->>SDK: instance.create({ selector })
    SDK->>Iframe: Inject <iframe> elements
    Iframe->>Iframe: Load secure index.html
    SDK->>Iframe: postMessage(INIT, config)
    Iframe-->>SDK: postMessage(READY)

    Note over User, Iframe: 2. Interaction Phase
    User->>Iframe: Enters Sensitive Data (PAN/CVV)
    Note right of Iframe: Data stays inside Iframe.<br/>Merchant cannot see it.
    Iframe->>Iframe: Validate & Format Input
    Iframe-->>SDK: postMessage(STATE_CHANGE, { isValid, brand })
    SDK-->>MerchantApp: emit('change', state)
    Note right of MerchantApp: UI updates (green checkmarks,<br/>brand icons) based on<br/>non-sensitive state.

    Note over MerchantApp, API: 3. Tokenization / Payment Method Request Phase
    User->>MerchantApp: Clicks "Pay"
    MerchantApp->>SDK: instance.tokenize()
    SDK->>Iframe: postMessage(TOKENIZE_REQUEST)
    Iframe->>API: POST /api/PaymentMethod (Secure Fetch)
    Note right of API: Validates card data<br/>Generates token
    API-->>Iframe: Returns { token: "1026", card: { last4: "4242" } }
    Iframe-->>SDK: postMessage(TOKENIZE_RESPONSE, { token })
    SDK-->>MerchantApp: Promise resolves with Token

    Note over MerchantApp, API: 4. Payment Phase
    MerchantApp->>MerchantApp: Submit Token to Merchant Backend
    MerchantApp->>API: Charge Request (using Token)

```

# Installation

To install all dependencies, you can use npm or yarn:

```bash
npm install
```

## Running the Projects
This is nx monorepo, so you can run the projects through nx vs code extension or directly through npm scripts.

step 1: start hosted fields server
```bash
# To all projects concurrently, you can use the following command:
npm run hosted-fields:dev

npx nx run payment-fields:serve
```

step 2: start the API server
```bash
npx nx run backend:serve 
```

step 3: start demo app 

Note: You can open multiple instances of the demo app to test multiple iframes and cross-window communication.
```bash
npx nx run simple-demo:serve
```


## Seeding the Database
Before running the API server, you may want to seed the database with test data. You can do this by running the following command:

```bash

npx nx run backend:seed

```
# Thesis-Final
