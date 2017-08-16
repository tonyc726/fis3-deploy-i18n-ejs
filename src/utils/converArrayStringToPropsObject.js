import { merge, isArray, isString } from 'lodash';

/**
 * 转换字符串Array为PlainObject
 * @param {array} stringsArray - 待转换的字符串内容的Array
 * @param {object} lastContent - 最后一层的内容
 * @return
 */
export default (stringsArray = [], lastContent = {}) => {
  const length = isArray(stringsArray) ? stringsArray.length : 0;
  const result = length === 0 ? merge({}, lastContent) : {};

  if (stringsArray && stringsArray.length) {
    let prevProp = result;
    stringsArray.forEach((propName, i) => {
      if (isString(propName)) {
        const isLast = (i + 1) === length;
        const nextProp = {
          [propName]: isLast ? lastContent : {},
        };

        merge(prevProp, nextProp);

        if (!isLast) {
          prevProp = prevProp[propName];
        }
      }
    });
  }
  return result;
};
