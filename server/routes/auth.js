const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');

const router = express.Router();

// Simple in-memory store for PKCE (in production, use Redis or database)
const pkceStore = new Map();

// For development: global code verifier (hacky but works for testing)
let globalCodeVerifier = null;

const CLIENT_ID = process.env.AIRTABLE_CLIENT_ID;
const CLIENT_SECRET = process.env.AIRTABLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.AIRTABLE_REDIRECT_URI;

// Initiate OAuth
router.get('/airtable', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

  // Store code_verifier with state
  pkceStore.set(state, codeVerifier);
  // For development: also set global
  globalCodeVerifier = codeVerifier;

  const authUrl = `https://airtable.com/oauth2/v1/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256&scope=data.records:read data.records:write schema.bases:read`;
  res.redirect(authUrl);
});

// Callback
router.get('/airtable/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('OAuth error:', error, error_description);
    return res.status(400).send(`OAuth error: ${error_description}`);
  }

  if (!code || !state) {
    return res.status(400).send('Missing code or state in callback');
  }

  // For development: try store first, then global fallback
  let codeVerifier = pkceStore.get(state)?.codeVerifier;
  if (!codeVerifier) {
    codeVerifier = globalCodeVerifier;
  }
  if (!codeVerifier) {
    return res.status(400).send('No code verifier found - did you restart the server?');
  }
  pkceStore.delete(state);

  try {
    // 1) Exchange code + code_verifier for tokens
    const tokenResponse = await axios.post('https://airtable.com/oauth2/v1/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code.toString(),
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code_verifier: codeVerifier,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const tokenJson = tokenResponse.data;
    console.log('Token response from Airtable:', tokenJson);

    if (tokenJson.error) {
      return res.status(400).send('Token exchange error: ' + JSON.stringify(tokenJson));
    }

    const { access_token } = tokenJson;

    // 2) Fetch Airtable user profile
    const meResponse = await axios.get('https://api.airtable.com/v0/meta/whoami', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const me = meResponse.data;
    console.log('Airtable user:', me);

    // For now: show something so you SEE success in browser
    return res.send(`
      <h1>Logged in with Airtable ✅</h1>
      <pre>${JSON.stringify({ tokenJson, me }, null, 2)}</pre>
    `);

    // Later:
    // - save user + tokens in MongoDB
    // - set cookie / JWT
    // - res.redirect("http://localhost:3000/dashboard");
  } catch (err) {
    console.error('OAuth callback error:', err);
    return res.status(500).send('OAuth callback error');
  }
});

module.exports = router;