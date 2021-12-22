import {
    Application,
    authProviders,
    configureWunderGraphApplication,
    cors,
    introspect,
    templates
} from "@wundergraph/sdk";
import wunderGraphHooks from "./wundergraph.hooks";
import operations from "./wundergraph.operations";

const db = introspect.postgresql({
    apiNamespace: "db",
    databaseURL: "postgresql://admin:admin@localhost:54322/example?schema=public",
});

const myApplication = new Application({
    name: "app",
    apis: [
        db,
    ],
})

// configureWunderGraph emits the configuration
configureWunderGraphApplication({
    application: myApplication,
    hooks: wunderGraphHooks.config,
    operations,
    codeGenerators: [
        {
            templates: [
                // use all the typescript react templates to generate a client
                templates.typescript.operations,
                templates.typescript.linkBuilder,
                ...templates.typescript.react
            ],
        },
    ],
    cors: {
        ...cors.allowAll,
        allowedOrigins: process.env.NODE_ENV === "production" ?
            [
                "http://localhost:3000"
            ] :
            [
                "http://localhost:3000",
            ]
    },
    authentication: {
        cookieBased: {
            providers: [
                authProviders.demo(),
            ],
            authorizedRedirectUris: [
                "http://localhost:3000"
            ]
        }
    },
});
