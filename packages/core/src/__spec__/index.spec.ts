import { describe, it } from 'vitest';
import { contract, usersConfig } from './__constants__';

describe('testing created contract', () => {  
  it('should create correct contract', () => {
    const { getOne, doSomething } = contract.users.routes;

    expect(contract.users.path).toBe('/users');
    expect(getOne.path).toBe('/');
    expect(getOne.method).toBe('GET');
    expect(getOne.getFullDynamicPath).toBeTypeOf('function');
    expect(getOne.fullStaticPath).toBe('http://localhost:3000/users/');
    expect(getOne.responses).toBe(usersConfig.getOne.responses);

    expect(doSomething.params).toBe(usersConfig.doSomething.params);
    expect(doSomething.query).toBe(usersConfig.doSomething.query);
    expect(doSomething.body).toBe(usersConfig.doSomething.body);
  });

  it('getFullDynamicPath should return correct url', () => {
    const { getOne, doSomething } = contract.users.routes;

    expect(getOne.getFullDynamicPath()).toBe('http://localhost:3000/users/');
    expect(
      doSomething.getFullDynamicPath({
        params: {
          id: '10'
        },
        query: {
          take: 25
        },
      })
    ).toBe('http://localhost:3000/users/10?take=25')
  });
});
