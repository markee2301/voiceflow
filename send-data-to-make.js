export default async function main(args) {
  const {
    name,
    email,
    webhookUrl
  } = args.inputVars;

  if (!name || !email || !webhookUrl) {
    return {
      next: { path: 'error' },
      trace: [{
        type: 'debug',
        payload: { message: 'Missing required input variables: name, email, or webhookUrl' }
      }]
    };
  }

  const payload = {
    name,
    email
  };

  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  };

  try {
    const rawResponse = await fetch(webhookUrl, config);

    let responseBody;
    try {
      responseBody = typeof rawResponse.json === 'function'
        ? await rawResponse.json()
        : rawResponse;
    } catch (e) {
      responseBody = rawResponse;
    }

    return {
      next: { path: 'success' },
      trace: [{
        type: 'debug',
        payload: {
          message: `Webhook triggered successfully. Response: ${JSON.stringify(responseBody)}`
        }
      }]
    };

  } catch (error) {
    return {
      next: { path: 'error' },
      trace: [{
        type: 'debug',
        payload: {
          message: `Error triggering webhook: ${error.message}`
        }
      }]
    };
  }
}
