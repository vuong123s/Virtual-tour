# Virtual Tour Backend

This is the backend service for the Virtual Tour application. It provides APIs for managing tours, panoramas, hotspots, and infospots.

## Features

- Tour management
- Panorama image upload and management
- Hotspot creation and management
- Infospot creation and management
- MongoDB database integration
- File upload support

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/vuong123s/Virtual-tour.git
cd Virtual-tour/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your MongoDB connection string:
```
MONGO_URL=your_mongodb_connection_string
```

4. Create upload directories:
```bash
mkdir -p upload/images/panoramas
```

5. Start the server:
```bash
npm start
```

The server will start on port 3000.

## API Endpoints

### Tours
- `POST /api/tours` - Create a new tour
- `GET /api/tours` - Get all tours

### Panoramas
- `POST /api/panoramas` - Create a new panorama
- `GET /api/panoramas` - Get all panoramas
- `POST /upload` - Upload panorama image

### Hotspots
- `POST /api/hotspots` - Create a new hotspot
- `GET /api/hotspots` - Get all hotspots

### Infospots
- `POST /api/infospots` - Create a new infospot
- `GET /api/infospots` - Get all infospots

## Project Structure

```
backend/
├── models/
│   ├── Tour.js
│   ├── Panorama.js
│   ├── Hotspot.js
│   └── Infospot.js
├── upload/
│   └── images/
│       └── panoramas/
├── index.js
├── package.json
└── .env
```