import { serve } from "bun";
import { testDatabaseConnection, closeDatabaseConnection } from "./database";
import { UserService } from "./services/userService";
import type { CreateUserRequest } from "./types";

// Environment variables with defaults
const PORT = process.env.PORT ?? 3001;

// API Routes
const routes = {
  // Health check endpoint (required for Docker health check)
  "/health": async () => {
    const dbHealthy = await testDatabaseConnection();
    const status = dbHealthy ? 200 : 503;
    return new Response(
      JSON.stringify({
        status: dbHealthy ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        database: dbHealthy ? "connected" : "disconnected",
      }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      }
    );
  },

  // Get all users
  "/api/users": async () => {
    try {
      const users = await UserService.getAllUsers();
      return new Response(JSON.stringify(users), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch users" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },

  // Create a new user
  "/api/users/create": async (request: Request) => {
    try {
      const body = await request.json() as CreateUserRequest;
      const { username, email } = body;

      if (!username || !email) {
        return new Response(
          JSON.stringify({ error: "Username and email are required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const user = await UserService.createUser({ username, email });
      return new Response(JSON.stringify(user), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create user" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },

  // Default route
  "/": () => {
    return new Response(
      JSON.stringify({
        message: "Vibe Backend API",
        version: "1.0.0",
        endpoints: [
          "GET /health - Health check",
          "GET /api/users - Get all users",
          "POST /api/users/create - Create a new user",
        ],
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  },
};

// Create server
const server = serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Route handling
    const handler = routes[path as keyof typeof routes];
    if (handler) {
      try {
        const response = await handler(request);
        // Add CORS headers to response
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      } catch (error) {
        console.error(`Error handling ${path}:`, error);
        return new Response(
          JSON.stringify({ error: "Internal server error" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: "Not found" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  },
});

// Initialize server
console.log(`🚀 Server running on http://localhost:${PORT}`);

// Test database connection on startup
testDatabaseConnection().then((connected) => {
  if (!connected) {
    console.warn("⚠️  Server started but database connection failed");
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...");
  await closeDatabaseConnection();
  server.stop();
  process.exit(0);
});