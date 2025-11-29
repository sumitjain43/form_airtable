# Airtable-Connected Dynamic Form Builder

## Overview

This is a MERN stack application that allows users to create dynamic forms connected to Airtable bases and tables. Users can log in with Airtable OAuth, build forms by selecting fields, apply conditional logic, and collect responses that are saved both to Airtable and a local MongoDB database.

## Features

- **Airtable OAuth Login**: Secure authentication using Airtable's OAuth flow.
- **Form Builder**: Select an Airtable base and table, choose fields to include, rename labels, mark as required, and define conditional rules.
- **Supported Field Types**: Short text, long text, single select, multi select, attachment.
- **Conditional Logic**: Show/hide questions based on previous answers using AND/OR logic.
- **Form Viewer**: Public form filling with real-time conditional logic application.
- **Response Submission**: Validates and saves responses to both Airtable and MongoDB.
- **Response Listing**: View all responses stored in MongoDB.
- **Webhook Sync**: Keeps database in sync when Airtable records are updated or deleted.

## Tech Stack

- **Frontend**: React, TypeScript, React Router
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: Airtable OAuth
- **APIs**: Airtable REST API

## Setup Instructions

### Prerequisites

- Node.js
- MongoDB (local or cloud)
- Airtable account with OAuth app

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   MONGO_URI=mongodb://localhost:27017/form_builder
   AIRTABLE_CLIENT_ID=your_airtable_client_id
   AIRTABLE_CLIENT_SECRET=your_airtable_client_secret
   AIRTABLE_REDIRECT_URI=http://localhost:5000/auth/airtable/callback
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Airtable OAuth Setup

1. Go to [Airtable Developers](https://airtable.com/developers/web/api/introduction) and create a new OAuth app.
2. Set the redirect URI to `http://localhost:5000/auth/airtable/callback` (update for production).
3. Copy the Client ID and Client Secret to your `.env` file.

### Webhook Configuration

1. In your Airtable base, set up webhooks to point to your deployed backend URL: `https://your-backend-url/webhooks/airtable`
2. Configure webhook events for record updates and deletions.

## Data Models

### User
- `airtableUserId`: String (unique)
- `profile`: Object (Airtable user profile)
- `accessToken`: String
- `refreshToken`: String
- `loginTimestamp`: Date

### Form
- `owner`: ObjectId (ref User)
- `airtableBaseId`: String
- `airtableTableId`: String
- `questions`: Array of question objects
  - `questionKey`: String
  - `airtableFieldId`: String
  - `label`: String
  - `type`: String (enum)
  - `required`: Boolean
  - `conditionalRules`: Object

### Response
- `formId`: ObjectId (ref Form)
- `airtableRecordId`: String
- `answers`: Object
- `createdAt`: Date
- `updatedAt`: Date
- `deletedInAirtable`: Boolean

## Conditional Logic

The `shouldShowQuestion(rules, answersSoFar)` function evaluates whether a question should be displayed based on conditional rules.

- `rules`: Object with `logic` ("AND" | "OR") and `conditions` array
- `conditions`: Array of { questionKey, operator ("equals" | "notEquals" | "contains"), value }
- Returns `true` if no rules or conditions are met

## API Endpoints

### Authentication
- `GET /auth/airtable` - Initiate OAuth
- `GET /auth/airtable/callback` - OAuth callback

### Forms
- `GET /api/bases` - Get user's bases
- `GET /api/bases/:baseId/tables` - Get tables in base
- `GET /api/bases/:baseId/tables/:tableId/fields` - Get fields in table
- `POST /api/forms` - Create form
- `GET /api/forms` - Get user's forms
- `GET /api/forms/:id` - Get form by ID
- `POST /api/forms/:id/submit` - Submit form response
- `GET /api/forms/:id/responses` - Get form responses

### Webhooks
- `POST /webhooks/airtable` - Handle Airtable webhook events

## Deployment

### Backend
- Deploy to Render, Railway, or similar Node.js hosting service.
- Update `AIRTABLE_REDIRECT_URI` and webhook URLs.

### Frontend
- Deploy to Vercel, Netlify, or similar static hosting service.
- Update API base URL if needed.

## Usage

1. Log in with Airtable OAuth.
2. Create a new form by selecting a base and table.
3. Configure questions and conditional logic.
4. Share the form URL for responses.
5. View responses in the dashboard.

## Sample .env

```
MONGO_URI=mongodb://localhost:27017/form_builder
AIRTABLE_CLIENT_ID=appXXX
AIRTABLE_CLIENT_SECRET=secretXXX
AIRTABLE_REDIRECT_URI=http://localhost:5000/auth/airtable/callback
PORT=5000