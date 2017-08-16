import { isString } from 'lodash';
import minimatch from 'minimatch';

/**
 * 根据match判断是否匹配
 * @see https://github.com/isaacs/minimatch
 *
 * @param {string} str - 待匹配的字符串
 * @param {string} match - 需要匹配的glob语法字符串
 * @return {boolean}
 */
export default (
  str,
  match,
) => (
  (
    isString(match) &&
    match.length !== 0 &&
    isString(str)
  ) ?
    minimatch(str, match, {
      // @see https://github.com/isaacs/minimatch#options
    }) :
    false
);
