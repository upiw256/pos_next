import '@testing-library/jest-dom/vitest';
process.env.MONGODB_URI = 'mongodb://localhost:27017/pos';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
