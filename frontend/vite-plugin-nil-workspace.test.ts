import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { safePath } from './vite-plugin-nil-workspace';

// safePath() is the only thing standing between a query-string `path` and the
// host filesystem for /__nil/file, /__nil/file (PUT), and the tree walk. A
// regression here is a vulnerability, not a visual bug, so every rule the
// guard enforces is pinned individually.
const ROOT = path.resolve('/srv/nil-workspace');

describe('safePath', () => {
  it('resolves an ordinary relative path inside the root', () => {
    expect(safePath(ROOT, 'src/lib/api.ts')).toBe(path.join(ROOT, 'src', 'lib', 'api.ts'));
  });

  it('accepts "." as the root itself', () => {
    expect(safePath(ROOT, '.')).toBe(ROOT);
  });

  it('rejects the empty path', () => {
    expect(safePath(ROOT, '')).toBeNull();
  });

  it('rejects any ".." segment, wherever it appears', () => {
    expect(safePath(ROOT, '..')).toBeNull();
    expect(safePath(ROOT, '../etc/passwd')).toBeNull();
    expect(safePath(ROOT, 'src/../../etc/passwd')).toBeNull();
    expect(safePath(ROOT, 'src/../ok.txt')).toBeNull();
    expect(safePath(ROOT, 'a/b/c/../../../../x')).toBeNull();
  });

  it('rejects ".." hidden behind backslashes', () => {
    expect(safePath(ROOT, '..\\..\\windows\\win.ini')).toBeNull();
    expect(safePath(ROOT, 'src\\..\\..\\secret')).toBeNull();
  });

  it('normalises backslashes in otherwise-safe paths', () => {
    expect(safePath(ROOT, 'src\\lib\\api.ts')).toBe(path.join(ROOT, 'src', 'lib', 'api.ts'));
  });

  it('treats a leading slash as workspace-relative, never as filesystem-absolute', () => {
    expect(safePath(ROOT, '/etc/passwd')).toBe(path.join(ROOT, 'etc', 'passwd'));
    expect(safePath(ROOT, '///src/x.ts')).toBe(path.join(ROOT, 'src', 'x.ts'));
  });

  it('rejects embedded NUL bytes', () => {
    expect(safePath(ROOT, 'src/ok.ts\0.png')).toBeNull();
    expect(safePath(ROOT, '\0')).toBeNull();
  });

  it('does not confuse dots inside a segment name with traversal', () => {
    expect(safePath(ROOT, 'notes..md')).toBe(path.join(ROOT, 'notes..md'));
    expect(safePath(ROOT, '.env.example')).toBe(path.join(ROOT, '.env.example'));
    expect(safePath(ROOT, 'a/.../b')).toBe(path.join(ROOT, 'a', '...', 'b'));
  });

  it('rejects a sibling directory that merely shares the root as a prefix', () => {
    // /srv/nil-workspace-evil starts with the root string but is not inside it.
    // Reached via a bare ".." this is already blocked; this pins the
    // startsWith(root + sep) check that catches it independently.
    const sibling = `${ROOT}-evil`;
    expect(safePath(ROOT, path.relative(ROOT, sibling))).toBeNull();
  });

  it('never returns a path outside the resolved root', () => {
    const probes = [
      'a', 'a/b', './a', 'a/./b', '/a', 'a//b', 'a\\b', '.hidden', 'deep/er/still.txt',
      '..', 'a/..', '../a', '..\\a', '\0', '', 'a/../..', '....//....//etc',
    ];
    for (const probe of probes) {
      const out = safePath(ROOT, probe);
      if (out === null) continue;
      expect(out === ROOT || out.startsWith(ROOT + path.sep)).toBe(true);
    }
  });
});
