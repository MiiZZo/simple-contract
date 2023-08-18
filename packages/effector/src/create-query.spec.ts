import { allSettled, fork } from 'effector';
import { z } from 'zod';
import { createQuery } from './create-query';

describe('createQuery', () => {
  let scope = fork();
  const query = createQuery({
    contracts: {
      success: z.object({
        title: z.string()
      }),
    },
    params: {} as { title: string },
    request: {
      method: 'GET',
      url: () => 'http://localhost:3000',
      body: (params) => params,
    }
  });

  afterEach(() => {
    query.__executorFx.use(() => ({
      title: '',
    }));
  });

  afterEach(() => {
    scope = fork();
  });

  it ('should trigger unexpected event if there is not matched contract', async () => {
    const unexpectedEventWatcher = vi.fn();

    query.__executorFx.use(() => 'something_unexpected');

    query.finished.unexpected.event.watch(unexpectedEventWatcher);

    await allSettled(query.start, {
      scope,
      params: {
        title: '',
      },
    });
    
    expect(unexpectedEventWatcher).toBeCalledTimes(1);
  });

  it('should trigger fetcher with correct params', async () => {
    const executorWatcher = vi.fn();
    query.__executorFx.watch(executorWatcher);
    
    await allSettled(query.start, {
      scope,
      params: {
        title: 'help',
      }
    });

    expect(executorWatcher).toBeCalledWith({ body: { title: 'help' }, url: 'http://localhost:3000' });
  });

  it('should pass body to executorFx if body exists in query config', async () => {
    const executorWatcher = vi.fn();
    
    query.__executorFx.watch(executorWatcher);

    await allSettled(query.start, {
      scope,
      params: {
        title: 'hello',
      },
    });

    expect(executorWatcher).toHaveBeenCalledWith(({ url: 'http://localhost:3000', body: { title: 'hello' } }));
  });
  
  it('should trigger success event only and pass result data to success.$data', async () => {
    const executorWatcher = vi.fn();
    const successEventWatcher = vi.fn();
    const unexpectedEventWatcher = vi.fn();

    query.__executorFx.watch(executorWatcher);
    query.finished.success.event.watch(successEventWatcher);
    query.finished.unexpected.event.watch(unexpectedEventWatcher);
    
    await allSettled(query.start, {
      scope,
      params: {
        title: '',
      },
    });

    expect(executorWatcher).toBeCalledTimes(1);
    expect(successEventWatcher).toBeCalledTimes(1);
    expect(unexpectedEventWatcher).toBeCalledTimes(0);
    expect(scope.getState(query.finished.success.$data)).toEqual({ title: '' });
  });
});
