import converArrayStringToPropsObject from './converArrayStringToPropsObject';

describe('test converArrayStringToPropsObject', () => {
  test('run ([]) >>> {}', () => {
    const testStringsArray = [];
    const testContent = {};
    expect(converArrayStringToPropsObject(testStringsArray, testContent)).toEqual(testContent);
  });

  test('run ([], {t: 1}) >>> {t: 1}', () => {
    const testStringsArray = [];
    const testContent = { t: 1 };
    expect(converArrayStringToPropsObject(testStringsArray, testContent)).toEqual(testContent);
  });

  test('run ([\'a\'], {t: 1}) >>> { a: { t: 1 } }', () => {
    const testStringsArray = ['a'];
    const testContent = { t: 1 };
    expect(converArrayStringToPropsObject(testStringsArray, testContent)).toEqual({ a: { t: 1 } });
  });

  test('run ([\'a\', \'b\'], {t: 1}) >>> { a: { b: { t: 1 } } }', () => {
    const testStringsArray = ['a', 'b'];
    const testContent = { t: 1 };
    expect(converArrayStringToPropsObject(testStringsArray, testContent)).toEqual({ a: { b: { t: 1 } } });
  });
});
