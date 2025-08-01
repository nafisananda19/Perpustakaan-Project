# Rumah Ilmu Lebah Dhuawar Hijau - Library Management System

A comprehensive library management system built with React, TypeScript, and Supabase for managing books, members, loans, and visitors.

## Features

- **Authentication**: Secure login system with Supabase Auth
- **Dashboard**: Real-time statistics and analytics with interactive charts
- **Books Management**: Complete CRUD operations for book collection
- **Members Management**: Track library members with detailed profiles
- **Borrowing System**: Loan management with fine calculations
- **Visitor Management**: Check-in/check-out system for library visitors
- **Reports**: Generate PDF reports for various analytics
- **Responsive Design**: Mobile-first design with adaptive navigation

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Query, React Context
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Routing**: React Router v6
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd library-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project in Supabase
   - Copy the project URL and anon key
   - Update the `.env` file with your Supabase credentials

4. Run the database migrations:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the migration script from `supabase/migrations/create_library_schema.sql`

5. Create the admin user:
   - Go to Authentication > Users in your Supabase dashboard
   - Create a new user with email: `admin@library.com` and password: `admin123`

6. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

The application uses the following main tables:

- **books**: Store book information with availability tracking
- **members**: Store member information with categories
- **loans**: Track book borrowing with status and fines
- **visitors**: Track daily visitors with check-in/out times

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   └── forms/          # Form components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
├── contexts/           # React contexts
└── App.tsx            # Main application component
```

## Authentication

The system uses Supabase Auth with email/password authentication. The default admin credentials are:
- Email: `admin@library.com`
- Password: `admin123`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.