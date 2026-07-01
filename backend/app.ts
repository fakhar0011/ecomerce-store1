import express, { Application, Request } from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { ApolloServer } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/dist/use/ws"; // ✅ Sahi import
import jwt from "jsonwebtoken";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { initSocket } from "./socket";
import { graphqlUploadExpress } from "graphql-upload-ts";
import redisClient from "./config/redis";

dotenv.config();

const app: Application = express();
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

// ✅ CORS - Full Open
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend Running" });
});

// Create HTTP server
const httpServer = http.createServer(app);

initSocket(httpServer);

// Build executable schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

const apolloServer = new ApolloServer({
  schema,
  csrfPrevention: false,
  context: ({ req }: { req: Request }) => {
    const token = req.headers.authorization?.split(" ")[1];
    let user = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
          id: string;
          role: string;
        };
        user = decoded;
      } catch {}
    }
    return { user };
  },
});

// ✅ WebSocket Server (graphql-ws v6)
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

const getWebSocketUser = (connectionParams: any) => {
  const token = connectionParams?.Authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
        role: string;
      };
      return { user: decoded };
    } catch {}
  }
  return { user: null };
};

useServer(
  {
    schema,
    onConnect: (ctx: any) => {
      const userContext = getWebSocketUser(ctx.connectionParams);
      return { ...userContext };
    },
    context: (ctx: any) => {
      return ctx;
    },
  },
  wsServer,
);

// ============================================================
// Start Servers
// ============================================================
async function startServers() {
  await redisClient.connect();
  await apolloServer.start();
  apolloServer.applyMiddleware({ app: app as any, path: "/graphql" });

  await connectDB();

  const PORT = parseInt(process.env.PORT as string, 10) || 5000;
  httpServer.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`✅ WebSocket endpoint: ws://localhost:${PORT}/graphql`);
  });
}

startServers().catch(console.error);

export default app;
