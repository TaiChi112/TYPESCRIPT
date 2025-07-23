import { Zap, Shield, Rocket, Code2, Database, Globe } from 'lucide-react';

const features = [
  {
    name: 'Lightning Fast',
    description: 'Built with Bun runtime for exceptional performance and speed.',
    icon: Zap,
  },
  {
    name: 'Type Safe',
    description: 'Full TypeScript support across frontend and backend for reliable code.',
    icon: Shield,
  },
  {
    name: 'Modern Stack',
    description: 'Next.js 15 with App Router, Prisma ORM, and PostgreSQL.',
    icon: Rocket,
  },
  {
    name: 'Developer Experience',
    description: 'Hot reload, excellent tooling, and modern development practices.',
    icon: Code2,
  },
  {
    name: 'Scalable Database',
    description: 'PostgreSQL with Prisma ORM for robust data management.',
    icon: Database,
  },
  {
    name: 'Production Ready',
    description: 'Optimized for deployment with Docker and cloud platforms.',
    icon: Globe,
  },
];

export function Features() {
  return (
    <div className="py-24 sm:py-32 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">
            Built for Performance
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Everything you need to build modern web applications
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            A carefully crafted tech stack that combines the best tools and practices
            for building scalable, maintainable, and performant web applications.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
