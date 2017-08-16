import matchByGlob from './matchByGlob';

describe('test matchByGlob', () => {
  test('run (undefined, undefined) >>> false', () => {
    const testStr = undefined;
    const testMatch = undefined;
    expect(matchByGlob(testStr, testMatch)).toBe(false);
  });

  test('run (null, undefined) >>> false', () => {
    const testStr = undefined;
    const testMatch = null;
    expect(matchByGlob(testStr, testMatch)).toBe(false);
  });

  test('run (\'\', undefined) >>> false', () => {
    const testStr = undefined;
    const testMatch = '';
    expect(matchByGlob(testStr, testMatch)).toBe(false);
  });

  test('run (\'\', \'\') >>> false', () => {
    const testStr = '';
    const testMatch = '';
    expect(matchByGlob(testStr, testMatch)).toBe(false);
  });

  test('run (\'_*.*\', \'abc.html\') >>> false', () => {
    const testStr = 'abc.html';
    const testMatch = '_*.*';
    expect(matchByGlob(testStr, testMatch)).toBe(false);
  });

  test('run (\'_*.*\', \'_abc.html\') >>> true', () => {
    const testStr = '_abc.html';
    const testMatch = '_*.*';
    expect(matchByGlob(testStr, testMatch)).toBe(true);
  });

  test('run (\'_*.*\', \'/a/abc.html\') >>> false', () => {
    const testStr = '/a/abc.html';
    const testMatch = '_*.*';
    expect(matchByGlob(testStr, testMatch)).toBe(false);
  });

  test('run (\'**/_*.*\', \'_abc.html\') >>> true', () => {
    const testStr = '_abc.html';
    const testMatch = '**/_*.*';
    expect(matchByGlob(testStr, testMatch)).toBe(true);
  });

  test('run (\'**/_*.*\', \'/a/_abc.html\') >>> true', () => {
    const testStr = '/a/_abc.html';
    const testMatch = '**/_*.*';
    expect(matchByGlob(testStr, testMatch)).toBe(true);
  });

  test('run (\'a/**\', \'/a/_abc.html\') >>> true', () => {
    const testStr = '/a/_abc.html';
    const testMatch = '/a/**';
    expect(matchByGlob(testStr, testMatch)).toBe(true);
  });

  test('run (\'a/**\', \'/a/b/_abc.html\') >>> true', () => {
    const testStr = '/a/b/_abc.html';
    const testMatch = '/a/**';
    expect(matchByGlob(testStr, testMatch)).toBe(true);
  });

  test('run (\'**/a/**\', \'/abc/a/_abc.html\') >>> true', () => {
    const testStr = '/abc/a/_abc.html';
    const testMatch = '**/a/**';
    expect(matchByGlob(testStr, testMatch)).toBe(true);
  });

  test('run (\'(a|b|c)\', \'/abc/a/_abc.html\') >>> false', () => {
    const testStr = '/abc/a/_abc.html';
    const testMatch = '(a|b|c)';
    expect(matchByGlob(testStr, testMatch)).toBe(false);
  });

  test('run (\'(a|b|c|abc)\', \'/abc/a/_abc.html\') >>> false', () => {
    const testStr = '/abc/a/_abc.html';
    const testMatch = '(a|b|c|abc)';
    expect(matchByGlob(testStr, testMatch)).toBe(false);
  });

  test('run (\'{a, b, c, abc}/**\', \'/abc/a/_abc.html\') >>> false', () => {
    const testStr = '/abc/a/_abc.html';
    const testMatch = '{a, b, c, abc}/**';
    expect(matchByGlob(testStr, testMatch)).toBe(false);
  });

  test('run (\'**/{a, b, c}/**\', \'/abc/a/_abc.html\') >>> true', () => {
    const testStr = '/abc/a/_abc.html';
    const testMatch = '**/{a, b, c}/**';
    expect(matchByGlob(testStr, testMatch)).toBe(true);
  });

  test('run (\'**/(a|b|c|abc)/**\', \'/abc/a/_abc.html\') >>> false', () => {
    const testStr = '/abc/a/_abc.html';
    const testMatch = '**/(a|b|c|abc)/**';
    expect(matchByGlob(testStr, testMatch)).toBe(false);
  });
});
