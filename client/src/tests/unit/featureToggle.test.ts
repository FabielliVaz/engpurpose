import { describe, it, expect } from 'vitest';

const getDataSource = (useApi: string | undefined) => {
  return useApi === 'true' ? 'DATABASE' : 'MOCK';
};

describe('Feature Toggle Logic', () => {
  it('deve retornar DATABASE quando a variável for "true"', () => {
    expect(getDataSource('true')).toBe('DATABASE');
  });

  it('deve retornar MOCK quando a variável for "false"', () => {
    expect(getDataSource('false')).toBe('MOCK');
  });

  it('deve retornar MOCK quando a variável estiver indefinida (caso da Vercel)', () => {
    expect(getDataSource(undefined)).toBe('MOCK');
  });
});