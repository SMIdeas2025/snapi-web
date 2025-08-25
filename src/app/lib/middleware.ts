import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',  // Exclude static assets and Next internals
    '/(api|trpc)(.*)',         // Include API/TRPC routes
  ],
};
