# 3D Data Viewer

A web application for visualizing 3D point cloud data (PCD) and geographic information system (GIS) data.

## Features

- 3D point cloud visualization with dynamic coloring
- GIS data visualization with interactive features
- Support for PCD and GeoJSON file formats
- Interactive controls and camera navigation
- System logging for operations feedback

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A modern web browser with WebGL support

### Installation

1. Clone the repository:

```bash
git clone https://github.com/r2ditto/3d-data-viewer.git
cd 3d-data-viewer
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file and add your Mapbox token:

```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Sample Files

You can test the application using these example files:

### Point Cloud (PCD) Examples

- [bunny.pcd](https://raw.githubusercontent.com/PointCloudLibrary/pcl/master/test/bunny.pcd) - Stanford Bunny model (159KB)

### GeoJSON Examples

- [us-states.geojson](https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json) - US States boundaries (820KB)

To use these files:

1. Download the sample file
2. Open the 3D Data Viewer
3. Select the appropriate viewer tab (3D or GIS)
4. Click "Upload File" and select your downloaded file

## Usage

### Point Cloud Viewer

- Upload PCD files to visualize 3D point clouds
- Adjust point size using the slider
- View bounding box dimensions
- Interact with the model using:
  - Left mouse: Rotate
  - Right mouse: Pan
  - Scroll: Zoom

### GIS Viewer

- Upload GeoJSON files to visualize geographic data
- Click features to view properties
- View feature statistics
- Supports multiple geometry types:
  - Points (red)
  - Lines (green)
  - Polygons (blue)

## Development

### Project Structure

```
src/
├── components/     # React components
├── contexts/       # Context providers
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── styles/         # CSS and styling
└── pages/          # Next.js pages
```

### Built With

- [Next.js](https://nextjs.org/) - React framework
- [Three.js](https://threejs.org/) - 3D graphics
- [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js) - GIS visualization
- [Tailwind CSS](https://tailwindcss.com/) - Styling
