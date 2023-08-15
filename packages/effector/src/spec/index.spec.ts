import { describe, it } from 'vitest';
import { createContract } from '@simple-contract/core';
import { z } from 'zod';
import { initClient } from '../';
import { isQuery } from '../is-query';
import { is } from 'effector';

describe('initClient', () => {
  it('', () => {
    const client = initClient(
      createContract('', {
        users: {
          path: '/users',
          routes: {
            getOne: {
              path: '/:id',
              method: 'POST',
              responses: {
                success: z.object({
                  result: z.literal(true),
                }),
              },
            }
          },
        },
      }),
    );

    const {
      finished,
    } = client.users.getOneQuery;
  
    expect(isQuery(client.users.getOneQuery)).toBe(true);
    expect('success' in finished).toBe(true);
  });
});
