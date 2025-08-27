import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { ArrowRight, Heart, Users, Globe, Calendar } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-bold">VolunteerConnect</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#" className="text-sm font-medium hover:text-rose-500 transition-colors">
              Home
            </Link>
            <Link href="#opportunities" className="text-sm font-medium hover:text-rose-500 transition-colors">
              Opportunities
            </Link>
            <Link href="#impact" className="text-sm font-medium hover:text-rose-500 transition-colors">
              Our Impact
            </Link>
            <Link href="#about" className="text-sm font-medium hover:text-rose-500 transition-colors">
              About Us
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Log In
            </Button>
            <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section - Elysia.js Style - Centered */}
        <section className="relative py-20 md:py-32 bg-gray-900 overflow-hidden">
          {/* Background grid pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="h-full w-full"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            ></div>
          </div>

          {/* Glow effects */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-500 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-500 rounded-full opacity-5 blur-3xl"></div>

          <div className="container relative z-10">
            <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
              {/* Logo */}
              <div className="inline-flex items-center gap-3 mb-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-rose-500 blur-lg opacity-50 rounded-full"></div>
                  <div className="relative bg-gray-900 p-4 rounded-full border border-rose-500/30">
                    <Heart className="h-12 w-12 text-rose-500" />
                  </div>
                </div>
                <h2 className="text-4xl font-bold text-white">
                  Volunteer<span className="text-rose-500">Connect</span>
                </h2>
              </div>

              {/* Hero Content - Centered */}
              <div className="space-y-8 text-white">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-3xl">
                  Make a <span className="text-rose-500">difference</span> in your community
                </h1>
                <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                  Join thousands of volunteers who are creating positive change through meaningful service
                  opportunities.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <Button size="lg" className="bg-rose-500 hover:bg-rose-600">
                    Get Started
                  </Button>
                  <Button size="lg" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    Browse Opportunities
                  </Button>
                  <Button size="lg" variant="link" className="text-rose-400 hover:text-rose-300">
                    Learn More →
                  </Button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 w-full max-w-3xl mx-auto">
                  {[
                    { number: "10,000+", label: "Active Volunteers" },
                    { number: "250+", label: "Community Partners" },
                    { number: "50,000+", label: "Service Hours" },
                  ].map((stat, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <span className="text-3xl font-bold text-rose-400">{stat.number}</span>
                      <span className="text-sm text-gray-400">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Opportunities */}
        <section id="opportunities" className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Opportunities</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover meaningful ways to contribute your time and skills to causes that matter.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Community Garden Project",
                  description:
                    "Help plant and maintain community gardens that provide fresh produce to local food banks.",
                  icon: <Globe className="h-10 w-10 text-emerald-500" />,
                  category: "Environment",
                  commitment: "Weekly, 2-4 hours",
                },
                {
                  title: "Youth Mentorship Program",
                  description: "Become a mentor to at-risk youth and help them develop important life skills.",
                  icon: <Users className="h-10 w-10 text-blue-500" />,
                  category: "Education",
                  commitment: "Bi-weekly, 3 hours",
                },
                {
                  title: "Senior Companion Initiative",
                  description: "Provide companionship and assistance to elderly individuals in your neighborhood.",
                  icon: <Heart className="h-10 w-10 text-rose-500" />,
                  category: "Healthcare",
                  commitment: "Flexible, 2-5 hours",
                },
              ].map((opportunity, index) => (
                <Card key={index} className="transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="mb-4">{opportunity.icon}</div>
                    <CardTitle>{opportunity.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      {opportunity.category} • {opportunity.commitment}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{opportunity.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Learn More
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button variant="link" className="text-rose-500 flex items-center gap-2">
                View All Opportunities <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="py-20 bg-gray-50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Together, our volunteers are making a real difference in communities around the world.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { number: "10,000+", label: "Active Volunteers" },
                { number: "250+", label: "Community Partners" },
                { number: "50,000+", label: "Service Hours" },
              ].map((stat, index) => (
                <div key={index} className="p-6 bg-white rounded-lg shadow-sm">
                  <p className="text-4xl font-bold text-rose-500 mb-2">{stat.number}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">Success Stories</h3>
                  <p className="text-gray-600 mb-6">
                    "Through VolunteerConnect, I found an opportunity to teach coding to underprivileged children.
                    Seeing their excitement when they created their first program was incredibly rewarding. I've
                    continued volunteering for over a year now, and it's become the highlight of my week."
                  </p>
                  <p className="font-medium">- Sarah J., Volunteer since 2022</p>
                </div>
                <div className="flex-1">
                  <img
                    src="/placeholder.svg?height=300&width=500"
                    alt="Volunteer teaching children"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-rose-500 text-white">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join our community of volunteers today and start creating positive change in your area.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary">
                Sign Up Now
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-rose-600">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section id="events" className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Join us for these upcoming volunteer events and activities in your community.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  title: "Beach Cleanup Day",
                  date: "June 15, 2025",
                  location: "Sunset Beach",
                  description: "Help clean up our local beaches and protect marine wildlife.",
                },
                {
                  title: "Food Bank Distribution",
                  date: "June 22, 2025",
                  location: "Community Center",
                  description: "Assist with sorting and distributing food to families in need.",
                },
                {
                  title: "Habitat Building Project",
                  date: "July 5-6, 2025",
                  location: "Eastside Neighborhood",
                  description: "Join our weekend build to help construct affordable housing.",
                },
              ].map((event, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center md:justify-start">
                    <div className="bg-rose-100 text-rose-500 p-4 rounded-lg">
                      <Calendar className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                    <p className="text-gray-600 mb-2">
                      {event.date} • {event.location}
                    </p>
                    <p className="text-gray-600">{event.description}</p>
                  </div>
                  <div className="flex items-center justify-center md:justify-end mt-4 md:mt-0">
                    <Button>Register</Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button variant="link" className="text-rose-500 flex items-center gap-2 mx-auto">
                View All Events <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-rose-400" />
                <span className="text-xl font-bold text-white">VolunteerConnect</span>
              </div>
              <p className="text-sm text-gray-400">
                Connecting passionate volunteers with meaningful opportunities to create positive change.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-rose-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#opportunities" className="hover:text-rose-400 transition-colors">
                    Opportunities
                  </Link>
                </li>
                <li>
                  <Link href="#impact" className="hover:text-rose-400 transition-colors">
                    Our Impact
                  </Link>
                </li>
                <li>
                  <Link href="#events" className="hover:text-rose-400 transition-colors">
                    Events
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-rose-400 transition-colors">
                    Volunteer Guide
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-rose-400 transition-colors">
                    Partner Organizations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-rose-400 transition-colors">
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-rose-400 transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Stay Connected</h3>
              <p className="text-sm text-gray-400 mb-4">
                Subscribe to our newsletter for updates on new opportunities and events.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-3 py-2 text-sm rounded-md bg-gray-800 border border-gray-700 text-white flex-1"
                />
                <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-400 text-center">
            <p>© {new Date().getFullYear()} VolunteerConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
