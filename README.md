## About this library

This library enables you to create a contract between the client and the server with the full power of TypeScript inference and zod runtime types.

## Why not X?

### tRPC

tRPC defines your API implementation as a contract, whereas I only want to describe the contract itself without a specific API implementation.

### ts-rest

ts-rest suggests defining server response types based on status codes, whereas simple-contract does not rely on them.

#### ts-rest 
```ts
  { 
    responses: {
      200: z.any(),
      401: z.any(),
    } 
  }
```

#### simple-contract
```ts
  { 
    responses: {
      success: z.any(),
      invalidEmail: z.any(),
      invalidUsername: z.any(),
    }
  }
```
## Should I use this library?

No, I've written it exclusively for use in my pet projects.
