# HRA DSS back-end

This is the back-end for the human resource allocation decision
support system.

## Prerequisites

* Node.js
  * `qminer` requires version `10.xx.xx`
* Build tools to build `qminer`
  * Windows: `windows-build-tools`
  * Ubuntu: `build-essential`

## Installation

To install dependencies, run the following command in the back-end
root folder:

```
npm install
```

To initialise the database, run the following command in the back-end
root folder:

```
npx prisma migrate up --experimental
```

To start the server, run the following command in the back-end root
folder:

```
npm start
```

## Development

To start the server in development mode (utilises `nodemon`), run the
following command in the back-end root folder:

```
npm run start:dev
```

### Generating a password hash

To generate password hash for a user, run the following command in
the back-end root folder:

```
npx ts-node .\src\utils\bcrypt.ts <PASSWORD>
```

Now a user can be created in the database using the hash.

### Updating data model

After making updates to `schema.prisma`, following commands have to
be run in the back-end root folder:

1. Creating migration files (database needs to be reachable)
   ```
   npx prisma migrate save --experimental
   ```
2. Applying migrations to database
   ```
   npx prisma migrate up --experimental
   ```
3. Regenerating Prisma client
   ```
   npx prisma generate
   ```

### GraphQL Playgroung

By default, GraphQL Playground is available at the server root,
for example `localhost:4000`.

Playground settings need to be modified to support cookies
(gear icon):

```json
"request.credentials": "same-origin"
```

More info here:
https://github.com/prisma-labs/graphql-playground/issues/748

For the playground to work, get a CSRF protection -token from:

```
localhost:4000/api/csrf
```

Apply the token to a header in the Headers-section:

```json
{ "x-xsrf-token": "<TOKEN>"}
```

Now all the requests should work. You can, for example, log in.
