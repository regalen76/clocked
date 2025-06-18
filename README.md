# Clocked

A modern work attendance tracking application built with SvelteKit that allows employees to clock in/out and generate detailed timesheets.

## Features

- **Clock In/Out System**: Track work hours with required activity descriptions
- **Timesheet Generation**: Create detailed reports for selected date ranges
- **Export Options**: Generate timesheets in Excel and PDF formats
- **User Authentication**: Secure login system powered by Appwrite
- **Modern UI**: Clean interface built with shadcn/ui components

## Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) with Svelte 5 (Runes mode)
- **Authentication & Database**: [Appwrite](https://appwrite.io/) Node SDK
- **Form Handling**: [Superforms](https://superforms.rocks/) with Zod adapter
- **UI Components**: [shadcn-svelte](https://www.shadcn-svelte.com/)
- **Validation**: [Zod](https://zod.dev/) schema validation
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## Prerequisites

Before running this application, make sure you have:

- Node.js (version 18 or higher)
- npm or pnpm package manager
- Appwrite server instance (self-hosted or cloud)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd clocked
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Configure your `.env` file with Appwrite credentials:

```env
APPWRITE_ENDPOINT=https://your-appwrite-endpoint
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
APPWRITE_DATABASE_ID=your-database-id
APPWRITE_COLLECTION_ID=your-collection-id
```

## Appwrite Setup

1. Create a new Appwrite project
2. Set up authentication (enable email/password authentication)
3. Create a database with the following collections:

### Attendance Collection

```json
{
 "userId": "string",
 "clockIn": "datetime",
 "clockOut": "datetime",
 "activity": "string",
 "date": "string",
 "duration": "number"
}
```

4. Configure permissions for authenticated users to read/write their own records

## Development

Start the development server:

```bash
npm run dev
# or
pnpm dev
```

The application will be available at `http://localhost:5173`

## Building for Production

Create a production build:

```bash
npm run build
# or
pnpm build
```

Preview the production build:

```bash
npm run preview
# or
pnpm preview
```

## Usage

### For Employees

1. **Sign Up/Login**: Create an account or log in with existing credentials
2. **Clock In**: Start your work session by clicking "Clock In"
3. **Clock Out**: End your session by clicking "Clock Out" and describe your activities
4. **View Timesheets**: Generate reports for specific date ranges
5. **Export Data**: Download timesheets as Excel or PDF files

### Key Features

- **Activity Tracking**: Required field when clocking out to document work performed
- **Date Range Selection**: Choose specific periods for timesheet generation
- **Multiple Export Formats**: Excel for data manipulation, PDF for sharing/printing
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Project Structure

```
src/
├── lib/
│   ├── components/     # Reusable UI components
│   ├── server/         # Server-side utilities
│   ├── stores/         # Svelte stores
│   └── utils/          # Helper functions
├── routes/
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Main app interface
│   └── api/            # API endpoints
└── app.html            # App template
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

## Acknowledgments

- Built with modern web technologies for optimal performance
- Inspired by the need for simple, effective time tracking solutions
- Thanks to the open-source community for the amazing tools and libraries
