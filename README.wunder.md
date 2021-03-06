# WunderGraph Postgres Starter

## Getting Started

Install the dependencies and run the example:

```shell
yarn global add @wundergraph/wunderctl@latest
yarn
yarn dev
```

To get started, first run the database.
Once the DB is up and running, go ahead by running your first database migration (more info below).
When the DB is migrated, start WunderGraph.
Finally, run the NextJS application.

Running WunderGraph will automatically introspect the database and generate an API for you.
You can add more Operations (e.g. Queries or Mutations) by adding more "*.graphql" files to the directory `./wundergraph/operations`.
Each file becomes an Operation. The Operation name is not relevant, the file name is.

### 1. Start the database

```shell
yarn database
```

### 2. Run your first migration

```shell
yarn migrate init
```

### 3. Start WunderGraph

```shell
yarn wundergraph
```

### 4. Start NextJS

```shell
yarn dev
```

## Database Migrations workflow

1. Make changes to schema.prisma
1. Run the migrations script
1. Restart WunderGraph

### Important Note

All "model" descriptors in `schema.prisma` must start with a lowercase letter.

### Running Migrations

```shell
yarn migrate "your migration name"
```

Examples:

```shell
yarn migrate "init"
```

```shell
yarn migrate "add users"
```

```shell
yarn migrate "add posts"
```

## Cleanup

```shell
docker-compose rm -v -f
```

## Got Questions?

Read the [Docs](https://wundergraph.com/docs).

Join us on [Discord](https://wundergraph.com/discord)!