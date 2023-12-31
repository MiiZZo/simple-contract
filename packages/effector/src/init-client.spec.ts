import { z } from 'zod';
import { createContract } from '@simple-contract/core';
import { initClient } from './init-client';

const mocks = vi.hoisted(() => ({
  createQuery: vi.fn(),
}));


vi.mock('./create-query.ts', () => {
  return { createQuery: mocks.createQuery }
});

describe('initClient', () => { 
  beforeEach(() => {
    initClient({
      contract: createContract('http://localhost:3000', {
        users: {
          path: '/users',
          routes: {
            createOne: {
              method: 'POST',
              body: z.object({
                title: z.string(),
              }),
              responses: {},
            }
          }
        },
      }),
      baseHeaders: {
        'Some-Header': 'Some-Value'
      },
    });
  });

  it('should pass body to createQuery if it was provided in contract', async () => {
    expect(mocks.createQuery).toBeCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          body: expect.any(Function)
        }),
      }),
    );
  });

  it('should pass baseHeaders to createQuery if it was provided in config', async () => {
    expect(mocks.createQuery).toBeCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          headers: {
            'Some-Header': 'Some-Value'
          },
        }),
      }),
    );
  });
});
