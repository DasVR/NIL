import { describe, expect, it } from 'vitest';
import { wsUrl } from './busUrl';

const pages = { protocol: 'https:', host: 'dasvr.github.io' };
const dev = { protocol: 'http:', host: 'localhost:5173' };

describe('wsUrl', () => {
  it('follows an absolute https API base to that host and prefix', () => {
    expect(wsUrl('demo', 'https://nil-api.dasdev.net/v1', pages))
      .toBe('wss://nil-api.dasdev.net/v1/ws?engagement=demo');
  });

  it('downgrades to ws: for an absolute http API base', () => {
    expect(wsUrl('demo', 'http://10.0.0.5:8766/v1', pages))
      .toBe('ws://10.0.0.5:8766/v1/ws?engagement=demo');
  });

  it('tolerates a trailing slash on the absolute base', () => {
    expect(wsUrl('demo', 'https://nil-api.dasdev.net/v1/', pages))
      .toBe('wss://nil-api.dasdev.net/v1/ws?engagement=demo');
  });

  it('keeps same-origin behaviour for the default relative base', () => {
    expect(wsUrl('demo', '/v1', dev)).toBe('ws://localhost:5173/v1/ws?engagement=demo');
    expect(wsUrl('demo', '/v1', pages)).toBe('wss://dasvr.github.io/v1/ws?engagement=demo');
  });

  it('encodes the engagement name and omits the query when empty', () => {
    expect(wsUrl('acme corp/2026', 'https://nil-api.dasdev.net/v1', pages))
      .toBe('wss://nil-api.dasdev.net/v1/ws?engagement=acme%20corp%2F2026');
    expect(wsUrl('', '/v1', dev)).toBe('ws://localhost:5173/v1/ws');
  });
});
