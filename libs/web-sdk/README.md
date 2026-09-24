# Hosted Fields

Secure, PCI-compliant payment field collection library.

## Overview

Hosted Fields provides secure, iframe-based input fields for collecting sensitive payment information. Card data never touches the merchant's page, reducing PCI scope.

## Documentation

For detailed integration guides, API reference, and internal development instructions, please see [DOCUMENTATION.md](./DOCUMENTATION.md).

## Quick Start

```html
<script src="https://localhost:4300/halalpay.js"></script>
<script>
  const hostedFields = HostedFields.init({
    publicKey: 'pk_test_xxx',
    environment: 'sandbox'
  });

  hostedFields.create({
    fields: {
      cardNumber: { selector: '#card-number' },
      expirationDate: { selector: '#expiration' },
      cvv: { selector: '#cvv' }
    }
  });

  // Tokenize on form submit
  const { token, card } = await hostedFields.tokenize();
</script>
```

## Security Features

- Iframe isolation (same-origin policy protection)
- Origin validation on all postMessage communications
- Session-based authentication
- No sensitive data in logs or error reports
