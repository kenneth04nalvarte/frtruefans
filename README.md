# Apple Pass Creator Frontend

A React-based frontend application for creating and managing Apple Wallet passes for restaurants and businesses.

## Features

- **Pass Template Creation**: Create custom Apple Wallet pass templates with branding, colors, and promotional text
- **Address Autocomplete**: Google Maps integration for accurate address input and geocoding
- **QR Code Generation**: Generate QR codes for customer registration
- **Customer Registration**: Streamlined registration process for customers
- **Pass Download**: Direct download of personalized Apple Wallet passes
- **Responsive Design**: Mobile-friendly interface

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Maps API Key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd applepass-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure Google Maps API:
   - Get a Google Maps API key from the [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the following APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API
   - Update the `GOOGLE_MAPS_API_KEY` in `src/utils/constants.js`

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components
│   ├── PassCreate/       # Pass template creation
│   ├── DinerRegistration/ # Customer registration
│   ├── DinerView/        # Pass download page
│   └── QRCodeDisplay/    # QR code generation
├── services/
│   ├── api.js           # API service functions
│   └── googleMaps.js    # Google Maps integration
├── utils/
│   └── constants.js     # Configuration constants
└── App.js               # Main application component
```

## Routes

- `/` - Redirects to `/create`
- `/create` - Pass template creation page
- `/register/:passId` - Customer registration page
- `/diner/:serialNumber` - Pass download page
- `/qr/:passId` - QR code display page

## API Integration

The frontend integrates with the Apple Pass backend API:

- **Base URL**: `https://applepass-7188044708.us-central1.run.app`
- **Endpoints**:
  - `POST /api/passes/templates/json` - Create pass template
  - `GET /api/passes/templates/:passId` - Get pass template
  - `POST /api/generate-diner-pass` - Create diner pass
  - `GET /api/passes/diners/:serialNumber/download` - Download pass file

## Key Features

### Pass Template Creation
- Brand name and promotional text
- Address input with Google Maps autocomplete
- Color customization (background and text)
- Real-time preview
- Form validation

### Address Autocomplete
- Google Maps Places API integration
- Automatic geocoding
- Address validation
- Location coordinates extraction

### QR Code Generation
- Dynamic QR code generation
- Adjustable size
- Download functionality
- Registration URL display

### Customer Registration
- Personal information collection
- Pass template preview
- Form validation
- Success/error handling

### Pass Download
- Multiple download methods
- Progress indicators
- Error handling
- Instructions for Apple Wallet

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_BASE_URL=https://applepass-7188044708.us-central1.run.app
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Update the API key in `src/utils/constants.js`

## Building for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## Deployment

The application can be deployed to any static hosting service:

- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your repository
- **AWS S3**: Upload the `build` folder
- **GitHub Pages**: Use `npm run deploy`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
