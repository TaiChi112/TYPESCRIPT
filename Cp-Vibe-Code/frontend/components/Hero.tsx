import Link from 'next/link';
import { ArrowRight, Zap, Shield, Rocket } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Welcome to{' '}
            <span className="text-blue-600 dark:text-blue-400">
              Cp-Vibe-Code
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A modern full-stack web application built with Next.js 15, Bun runtime, 
            TypeScript, Prisma ORM, and PostgreSQL. Experience lightning-fast performance 
            and developer-friendly architecture.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/dashboard"
              className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
              Get Started
              <ArrowRight className="ml-2 inline-block h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="text-base font-semibold leading-6 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Sign In <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  );
}
