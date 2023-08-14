import { z } from 'zod';
import { createContract } from '../create-contract';

export const usersConfig = {
  createOne: {
    body: z.object({
      id: z.string(),
    }),
    responses: {
      success: z.object({ success: z.boolean() })
    }
  },
  doSomething: {
    params: z.object({
      id: z.string(),
    }),
    query: z.object({
      take: z.number(),
    }),
    body: z.object({
      hello: z.number(),
    }),
    responses: {
      success: z.object({ succes: z.literal(null) }),
      notFound: z.object({ success: z.literal(null) })
    }
  },
  updateOne: {
    params: z.object({
      id: z.string(),
    }),
    query: z.object({
      take: z.number(),
    }),
    responses: {
      success: z.object({ succes: z.literal(null) }),
      notFound: z.object({ success: z.literal(null) })
    }
  },
  getOne: {
    responses: {
      success: z.object({
        result: z.literal(true),
        data: z.object({
          title: z.string()
        })
      }),
      notFound: z.object({
        result: z.literal(false),
        error: z.object({
          type: z.literal('POST'),
          message: z.literal('POST wrong'),
        }),
      }),
      whatsWrong: z.object({
        result: z.literal(false),
        error: z.object({
          type: z.literal('SOMETHING_WRONG'),
          message: z.literal('something wrong'),
        }),
      })
    }
  }
}

export const contract = createContract("http://localhost:3000", {
  users: {
    path: "/users",
    routes: {
      getOne: {
        path: "/",
        method: "GET",
        ...usersConfig.getOne
      },
      createOne: {
        path: "/",
        method: "POST",
        ...usersConfig.createOne,
      },
      updateOne: {
        path: '/:id',
        method: 'POST',
        ...usersConfig.updateOne,
      },
      doSomething: {
        path: '/:id',
        method: 'POST',
        ...usersConfig.doSomething,
      }
    }
  }
});
