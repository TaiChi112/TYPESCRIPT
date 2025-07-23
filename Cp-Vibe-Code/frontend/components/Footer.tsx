export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">
              Cp-Vibe-Code
            </h3>
            <p className="text-gray-300 max-w-md">
              A modern full-stack web application built with cutting-edge technologies.
              Fast, secure, and developer-friendly.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Technologies</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Next.js 15</li>
              <li>Bun Runtime</li>
              <li>TypeScript</li>
              <li>Prisma ORM</li>
              <li>PostgreSQL</li>
              <li>Tailwind CSS</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Features</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Authentication</li>
              <li>User Management</li>
              <li>API Integration</li>
              <li>Responsive Design</li>
              <li>Dark Mode</li>
              <li>Type Safety</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Cp-Vibe-Code. Built with ❤️ and modern web technologies.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-400 text-sm">
                Powered by Next.js • Bun • Prisma • PostgreSQL
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
