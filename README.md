# RecycLens MVP

An AI-powered recycling assistant that helps users identify recyclable items and find nearby recycling facilities.

## Features

- **Image Analysis**: Upload a photo of an item to identify its materials
- **Recyclability Assessment**: Get instant feedback on whether an item can be recycled
- **Local Facilities**: Find nearby recycling and disposal facilities using web search
- **Interactive Map**: View facilities on an interactive Mapbox map with markers
- **Clear Instructions**: Receive step-by-step guidance for proper disposal
- **Staged Progress Updates**: Real-time feedback during analysis (image analysis → recyclability → geocoding)

## Tech Stack

- **Frontend**: Shiny (Python) web framework
- **Backend**: Node.js + Express + TypeScript
- **AI Services**: OpenAI Responses API (GPT-4.1) for image analysis + OpenAI Responses API (GPT-4.1 with web search) for recyclability
- **Maps**: Mapbox GL JS + Mapbox Geocoding API

## Prerequisites

- Python 3.8+
- Node.js 18+ and npm (for backend server)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Mapbox access token ([Get one here](https://account.mapbox.com/access-tokens/)) - Optional, for map functionality

## Setup

### 1. Install Backend Dependencies

```bash
npm install
```

### 2. Install Python Dependencies

```bash
cd app
pip install -r requirements.txt
cd ..
```

### 3. Configure Environment Variables

Create a `.env` file in the project root for the backend:

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=3001
NODE_ENV=development
```

Create a `.env` file in the `app/` directory for the Shiny frontend:

```bash
BACKEND_URL=http://localhost:3001
MAPBOX_ACCESS_TOKEN=pk.your-mapbox-token-here
```

**Note:** The Mapbox access token is optional. Without it, the map will not display, but other features will still work.

### 4. Run the Application

You need to run both the backend server and the Shiny frontend:

**Terminal 1 - Backend Server:**
```bash
npm run server
```

The backend will start on `http://localhost:3001`

**Terminal 2 - Shiny Frontend:**
```bash
cd app
shiny run app.py
```

Or using Python directly:
```bash
cd app
python -m shiny run app.py
```

The Shiny app will start and display a URL (typically `http://127.0.0.1:8000`). Open this URL in your browser.

## How It Works

### System Architecture

The Shiny frontend communicates with a Node.js backend API that handles AI processing:

1. **User Input**: User uploads an image, enters location, and optionally adds context via the Shiny UI
2. **Image Analysis**: Backend calls GPT-4.1 Responses API to analyze the image and identify:
   - Primary and secondary materials
   - Item condition (clean, soiled, damaged, etc.)
   - Contaminants (food residue, grease, etc.)
   - Material category
3. **Recyclability Assessment**: Backend calls GPT-4.1 Responses API with web search to:
   - Determine recyclability based on local regulations
   - Find nearby recycling/disposal facilities
   - Generate step-by-step disposal instructions
4. **Geocoding**: Frontend geocodes facility addresses using Mapbox Geocoding API
5. **Results Display**: Shiny app displays:
   - Recyclability decision with confidence score
   - Disposal instructions
   - Interactive map with facility markers
   - Facility cards with details and links

### Staged Progress Updates

The app provides real-time feedback during analysis:

- **Stage 1**: "Identifying what's in the image..." - Vision API call
- **Stage 2**: "Determining if it can be recycled..." - Recyclability API call
- **Stage 3**: "Finding places to recycle..." - Geocoding and map rendering

## Project Structure

```
RecycLens/
├── app/                    # Shiny frontend application
│   ├── app.py             # Main Shiny application
│   ├── requirements.txt   # Python dependencies
│   ├── README.md          # Shiny app documentation
│   ├── static/            # Static assets
│   │   └── styles.css     # Custom CSS styling
│   └── utils/             # Utility functions
│       ├── __init__.py
│       └── api_client.py  # API call functions
├── server/                # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes/           # API routes
│   │   └── analyze.ts    # Main analysis endpoint
│   ├── services/         # Business logic
│   │   ├── visionService.ts    # Vision API integration
│   │   └── gpt5Service.ts      # Responses API integration
│   └── types.ts          # Backend types
├── package.json          # Backend Node.js dependencies
├── tsconfig.json         # TypeScript configuration
└── tsconfig.server.json  # Server TypeScript configuration
```

## API Endpoints

The backend provides the following endpoints:

### POST /api/analyze/vision

Analyzes an image to identify materials.

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "stage": "vision",
  "result": {
    "primaryMaterial": "Plastic",
    "secondaryMaterials": [],
    "category": "Container",
    "condition": "clean",
    "contaminants": [],
    "confidence": 0.95,
    "shortDescription": "Plastic bottle"
  }
}
```

### POST /api/analyze/recyclability

Determines recyclability and finds facilities.

**Request Body:**
```json
{
  "visionResult": { ... },
  "location": "Ithaca, NY 14850",
  "context": "Plastic container with food residue"
}
```

**Response:**
```json
{
  "stage": "recyclability",
  "result": {
    "isRecyclable": true,
    "category": "Plastic",
    "bin": "recycling",
    "confidence": 0.87,
    "materialDescription": "Plastic bottle",
    "instructions": [
      "Rinse the container thoroughly",
      "Remove any labels if possible",
      "Place in recycling bin"
    ],
    "reasoning": "This is a clean plastic container that can be recycled.",
    "locationUsed": "Ithaca, NY 14850",
    "facilities": [
      {
        "name": "Green Valley Recycling",
        "type": "Recycling Center",
        "address": "123 Main St, Ithaca, NY",
        "url": "https://example.com",
        "notes": "Accepts plastic containers"
      }
    ]
  }
}
```

## Troubleshooting

### Backend won't start

- Check that `OPENAI_API_KEY` is set in `.env` (project root)
- Ensure port 3001 is not in use
- Check console for error messages

### Shiny app can't connect to backend

- Ensure the backend server is running on port 3001
- Check that `BACKEND_URL` in `app/.env` matches the backend server URL
- Verify the backend is accessible at the specified URL

### Map not displaying

- Verify `MAPBOX_ACCESS_TOKEN` is set in `app/.env`
- Check that the token is valid and has the necessary permissions
- Check browser console for JavaScript errors

### Image upload issues

- Ensure the image file is a valid image format (JPEG, PNG, GIF, WebP)
- Check that the file size is reasonable (backend may have limits)
- Verify the backend server is running and accessible

## Development

### Backend Development

- Edit files in `server/` directory
- Restart the backend server to see changes
- Backend uses TypeScript - compile with `npm run build:server`

### Shiny Frontend Development

- Edit `app/app.py` for main application logic
- Edit `app/utils/api_client.py` for API call logic
- Edit `app/static/styles.css` for styling
- Restart the Shiny app to see changes

## License

© 2025 RecycLens. Making recycling simple.
