import Fastify from "fastify";
import axios from "axios";
import { HelloResponse } from "./models";
import { HooksConfiguration } from "@wundergraph/sdk/dist/configure";

declare module "fastify" {
	interface FastifyRequest {
		/**
		 * Coming soon!
		 */
		ctx: Context;
	}
}

export interface Context {
	user?: User;
}

export interface User {
	provider?: string;
	provider_id?: string;
	email?: string;
	email_verified?: boolean;
	name?: string;
	first_name?: string;
	last_name?: string;
	nick_name?: string;
	description?: string;
	user_id?: string;
	avatar_url?: string;
	location?: string;
	roles?: Role[];
}

export type Role = "admin" | "user";

export type AuthenticationResponse = AuthenticationOK | AuthenticationDeny;

export interface AuthenticationOK {
	status: "ok";
	user: User;
	message?: never;
}

export interface AuthenticationDeny {
	status: "deny";
	user?: never;
	message?: string;
}

const internalClientAuthorizationHeader = "Bearer internalRequestToken";

const internalRequest = async (operationName: string, input?: any): Promise<any> => {
	const url = "http://localhost:9991/internal/api/main/operations/" + operationName;
	const res = await axios.post(url, JSON.stringify(input || {}), {
		headers: {
			"Content-Type": "application/json",
			Authorization: internalClientAuthorizationHeader,
		},
	});
	return res.data;
};

interface InternalClient {
	queries: {
		Hello: () => Promise<HelloResponse>;
	};
}

const client = {
	queries: {
		Hello: async () => internalRequest("Hello"),
	},
};

export const configureWunderGraphHooksWithClient = (config: (client: InternalClient) => HooksConfig) =>
	configureWunderGraphHooks(config(client));

export interface HooksConfig {
	authentication?: {
		postAuthentication?: (user: User) => Promise<void>;
		mutatingPostAuthentication?: (user: User) => Promise<AuthenticationResponse>;
		revalidate?: (user: User) => Promise<AuthenticationResponse>;
	};
	queries?: {
		Hello?: {
			mockResolve?: (ctx: Context) => Promise<HelloResponse>;
			preResolve?: (ctx: Context) => Promise<void>;
			postResolve?: (ctx: Context, response: HelloResponse) => Promise<void>;
			mutatingPostResolve?: (ctx: Context, response: HelloResponse) => Promise<HelloResponse>;
		};
	};
	mutations?: {};
}

export const configureWunderGraphHooks = (config: HooksConfig) => {
	const hooksConfig: HooksConfiguration = {
		queries: config.queries as { [name: string]: { preResolve: any; postResolve: any; mutatingPostResolve: any } },
		mutations: config.mutations as { [name: string]: { preResolve: any; postResolve: any; mutatingPostResolve: any } },
		authentication: config.authentication as {
			postAuthentication?: any;
			mutatingPostAuthentication?: any;
			revalidate?: any;
		},
	};
	const server = {
		config: hooksConfig,
		start() {
			const fastify = Fastify({
				logger: true,
			});

			fastify.addHook<{ Body: { user: User } }>("preHandler", async (req, reply) => {
				req.ctx = {
					user: req.body.user,
				};
			});

			// authentication
			fastify.post("/authentication/postAuthentication", async (request, reply) => {
				reply.type("application/json").code(200);
				if (config.authentication?.postAuthentication !== undefined && request.ctx.user !== undefined) {
					try {
						await config.authentication.postAuthentication(request.ctx.user);
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { hook: "postAuthentication", error: err };
					}
				}
				return {
					hook: "postAuthentication",
				};
			});
			fastify.post("/authentication/mutatingPostAuthentication", async (request, reply) => {
				reply.type("application/json").code(200);
				if (config.authentication?.mutatingPostAuthentication !== undefined && request.ctx.user !== undefined) {
					try {
						const out = await config.authentication.mutatingPostAuthentication(request.ctx.user);
						return {
							hook: "mutatingPostAuthentication",
							response: out,
						};
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { hook: "mutatingPostAuthentication", error: err };
					}
				}
			});
			fastify.post("/authentication/revalidateAuthentication", async (request, reply) => {
				reply.type("application/json").code(200);
				if (config.authentication?.revalidate !== undefined && request.ctx.user !== undefined) {
					try {
						const out = await config.authentication.revalidate(request.ctx.user);
						return {
							hook: "revalidateAuthentication",
							response: out,
						};
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { hook: "revalidateAuthentication", error: err };
					}
				}
			});

			/**
			 * Queries
			 */

			// mock
			fastify.post("/operation/Hello/mockResolve", async (request, reply) => {
				reply.type("application/json").code(200);
				try {
					const mutated = await config?.queries?.Hello?.mockResolve?.(request.ctx);
					return { op: "Hello", hook: "mock", response: mutated };
				} catch (err) {
					request.log.error(err);
					reply.code(500);
					return { op: "Hello", hook: "mock", error: err };
				}
			});

			// preResolve
			fastify.post("/operation/Hello/preResolve", async (request, reply) => {
				reply.type("application/json").code(200);
				try {
					await config?.queries?.Hello?.preResolve?.(request.ctx);
					return { op: "Hello", hook: "preResolve" };
				} catch (err) {
					request.log.error(err);
					reply.code(500);
					return { op: "Hello", hook: "preResolve", error: err };
				}
			});
			// postResolve
			fastify.post<{ Body: { response: HelloResponse } }>("/operation/Hello/postResolve", async (request, reply) => {
				reply.type("application/json").code(200);
				try {
					await config?.queries?.Hello?.postResolve?.(request.ctx, request.body.response);
					return { op: "Hello", hook: "postResolve" };
				} catch (err) {
					request.log.error(err);
					reply.code(500);
					return { op: "Hello", hook: "postResolve", error: err };
				}
			});
			// mutatingPostResolve
			fastify.post<{ Body: { response: HelloResponse } }>(
				"/operation/Hello/mutatingPostResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.queries?.Hello?.mutatingPostResolve?.(request.ctx, request.body.response);
						return { op: "Hello", hook: "mutatingPostResolve", response: mutated };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "Hello", hook: "mutatingPostResolve", error: err };
					}
				}
			);

			fastify.listen(9992, (err, address) => {
				if (err) {
					console.error(err);
					process.exit(0);
				}
				console.log(`hooks server listening at ${address}`);
			});
		},
	};

	if (process.env.START_HOOKS_SERVER === "true") {
		server.start();
	}

	return server;
};
