import * as dotenv from "dotenv";
import * as cookieParser from "cookie-parser";
import * as csurf from "csurf";

import * as Scalar from "./resolvers/Scalar";
import * as Model from "./resolvers/Model";
import * as Query from "./resolvers/Query";
import * as Mutation from "./resolvers/Mutation";

import { GraphQLServer } from "graphql-yoga";
import { PrismaClient } from "@prisma/client";

// Configure environment variables to process.env
dotenv.config();

const prisma = new PrismaClient();

const resolvers = {
    ...Scalar,
    ...Model,
    Query,
    Mutation,
};

const server = new GraphQLServer({
    typeDefs: "./src/schema.graphql",
    resolvers,
    context: request => {
        return {
            ...request,
            prisma,
        }
    },
});

server.express.use(cookieParser(process.env.COOKIE_SECRET));

const csrfValueParser = request => {
    return request.headers["x-xsrf-token"];
};

const csrfProtection = csurf({
    cookie: {
        httpOnly: true,
        key: process.env.CSRF_COOKIE_NAME,
        signed: true,
    },
    value: csrfValueParser,
});
server.express.use(csrfProtection);

const serverOptions = {
    endpoint: "/api/graphql",
    port: process.env.APP_PORT,
    cors: {
        origin: [
            `http://localhost:${process.env.APP_PORT}`,
            `http://localhost:${process.env.UI_PORT}`
        ],
        credentials: true
    },
};

server.start(serverOptions, ({ port }) => {
    console.log(`Server is running on http://localhost:${port}`)
});

server.express.get("/api/xsrf", (request: any, response) => {
    response.status(200).send({ xsrfToken: request.csrfToken() });
});
