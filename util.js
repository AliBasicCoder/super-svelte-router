/**
 * AL stands for ArraysLooper
 * @param  {...Array<string>} args
 */
export function* loopOver(...args) {
  const len = Math.max.apply(
    undefined,
    args.map((arg) => arg.length)
  );
  for (let i = 0; i < len; i++) {
    const result = [];
    for (let y = 0; y < args.length; y++) {
      result.push(args[y][i]);
    }
    yield result;
  }
}

/**
 * @param {string} pathname
 * @param {string} routePath
 * @returns {boolean}
 */
export function matches(pathname, routePath) {
  const routeParts = routePath.split("/");
  const pathnameParts = pathname.split("/");
  if (routeParts.length !== pathnameParts.length) return false;
  let matches = true;
  for (const [routePart, pathnamePart] of loopOver(routeParts, pathnameParts)) {
    if (routePart.startsWith(":")) {
      params[routePart.slice(1)] = decodeURI(pathnamePart);
      continue;
    }
    if (routePart !== pathnamePart) {
      matches = false;
      break;
    }
  }
  return matches;
}
