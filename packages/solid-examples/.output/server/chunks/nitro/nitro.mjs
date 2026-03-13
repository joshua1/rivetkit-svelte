import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { promises, existsSync } from 'node:fs';
import { resolve as resolve$1, dirname as dirname$1, join } from 'node:path';
import { createHash } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import invariant from 'vinxi/lib/invariant';
import { virtualId, handlerModule, join as join$1 } from 'vinxi/lib/path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createSignal, createMemo, createRenderEffect, on as on$3, useContext, runWithOwner, createContext as createContext$1, getOwner, startTransition, resetErrorBoundaries, batch, untrack, createComponent, getListener, onCleanup, sharedConfig, createRoot, createEffect, lazy, catchError, ErrorBoundary, Suspense, children, Show } from 'solid-js';
import { getRequestEvent, isServer, renderToString, ssrElement, escape, mergeProps, ssr, renderToStream, createComponent as createComponent$1, ssrHydrationKey, NoHydration, useAssets, Hydration, ssrAttribute, HydrationScript, delegateEvents } from 'solid-js/web';
import { provideRequestEvent } from 'solid-js/web/storage';
import { getLogger } from 'rivetkit/log';
import { createClient } from 'rivetkit/client';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function decode$1(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode$1(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/");
  }
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/") ? input : input + "/";
  }
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    const nextChar = input[_base.length];
    if (!nextChar || nextChar === "/" || nextChar === "?") {
      return input;
    }
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const nextChar = input[_base.length];
  if (nextChar && nextChar !== "/" && nextChar !== "?") {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

function parse(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = {};
  const opt = {};
  const dec = opt.decode || decode;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function serialize$1(name, value, options) {
  const opt = options || {};
  const enc = opt.encode || encodeURIComponent;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  const encodedValue = enc(value);
  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    throw new TypeError("argument val is invalid");
  }
  let str = name + "=" + encodedValue;
  if (void 0 !== opt.maxAge && opt.maxAge !== null) {
    const maxAge = opt.maxAge - 0;
    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    if (!isDate(opt.expires) || Number.isNaN(opt.expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.priority) {
    const priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low": {
        str += "; Priority=Low";
        break;
      }
      case "medium": {
        str += "; Priority=Medium";
        break;
      }
      case "high": {
        str += "; Priority=High";
        break;
      }
      default: {
        throw new TypeError("option priority is invalid");
      }
    }
  }
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true: {
        str += "; SameSite=Strict";
        break;
      }
      case "lax": {
        str += "; SameSite=Lax";
        break;
      }
      case "strict": {
        str += "; SameSite=Strict";
        break;
      }
      case "none": {
        str += "; SameSite=None";
        break;
      }
      default: {
        throw new TypeError("option sameSite is invalid");
      }
    }
  }
  if (opt.partitioned) {
    str += "; Partitioned";
  }
  return str;
}
function isDate(val) {
  return Object.prototype.toString.call(val) === "[object Date]" || val instanceof Date;
}

function parseSetCookie(setCookieValue, options) {
  const parts = (setCookieValue || "").split(";").filter((str) => typeof str === "string" && !!str.trim());
  const nameValuePairStr = parts.shift() || "";
  const parsed = _parseNameValuePair(nameValuePairStr);
  const name = parsed.name;
  let value = parsed.value;
  try {
    value = options?.decode === false ? value : (options?.decode || decodeURIComponent)(value);
  } catch {
  }
  const cookie = {
    name,
    value
  };
  for (const part of parts) {
    const sides = part.split("=");
    const partKey = (sides.shift() || "").trimStart().toLowerCase();
    const partValue = sides.join("=");
    switch (partKey) {
      case "expires": {
        cookie.expires = new Date(partValue);
        break;
      }
      case "max-age": {
        cookie.maxAge = Number.parseInt(partValue, 10);
        break;
      }
      case "secure": {
        cookie.secure = true;
        break;
      }
      case "httponly": {
        cookie.httpOnly = true;
        break;
      }
      case "samesite": {
        cookie.sameSite = partValue;
        break;
      }
      default: {
        cookie[partKey] = partValue;
      }
    }
  }
  return cookie;
}
function _parseNameValuePair(nameValuePairStr) {
  let name = "";
  let value = "";
  const nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift();
    value = nameValueArr.join("=");
  } else {
    value = nameValuePairStr;
  }
  return { name, value };
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function o(n){throw new Error(`${n} is not implemented yet!`)}let i$1 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o("Readable.asyncIterator")}iterator(e){throw o("Readable.iterator")}map(e,t){throw o("Readable.map")}filter(e,t){throw o("Readable.filter")}forEach(e,t){throw o("Readable.forEach")}reduce(e,t,r){throw o("Readable.reduce")}find(e,t){throw o("Readable.find")}findIndex(e,t){throw o("Readable.findIndex")}some(e,t){throw o("Readable.some")}toArray(e){throw o("Readable.toArray")}every(e,t){throw o("Readable.every")}flatMap(e,t){throw o("Readable.flatMap")}drop(e,t){throw o("Readable.drop")}take(e,t){throw o("Readable.take")}asIndexedPairs(e){throw o("Readable.asIndexedPairs")}};let l$1 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c=class{allowHalfOpen=true;_destroy;constructor(e=new i$1,t=new l$1){Object.assign(this,e),Object.assign(this,t),this._destroy=m$1(e._destroy,t._destroy);}};function _$1(){return Object.assign(c.prototype,i$1.prototype),Object.assign(c.prototype,l$1.prototype),c}function m$1(...n){return function(...e){for(const t of n)t(...e);}}const g$1=_$1();let A$3 = class A extends g$1{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}};let y$1 = class y extends i$1{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A$3;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}};function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$1{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E$3=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R$7(n={}){const e=new E$3,t=Array.isArray(n)||H$5(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H$5(n){return typeof n?.entries=="function"}function v$1(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S=new Set([101,204,205,304]);async function b$1(n,e){const t=new y$1,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R$7(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C$3(n,e,t={}){try{const r=await b$1(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v$1(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}
function getRequestIP(event, opts = {}) {
  if (event.context.clientAddress) {
    return event.context.clientAddress;
  }
  if (opts.xForwardedFor) {
    const xForwardedFor = getRequestHeader(event, "x-forwarded-for")?.split(",").shift()?.trim();
    if (xForwardedFor) {
      return xForwardedFor;
    }
  }
  if (event.node.req.socket.remoteAddress) {
    return event.node.req.socket.remoteAddress;
  }
}

const RawBodySymbol = Symbol.for("h3RawBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !/\bchunked\b/i.test(
    String(event.node.req.headers["transfer-encoding"] ?? "")
  )) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}

function getDistinctCookieKey(name, opts) {
  return [name, opts.domain || "", opts.path || "/"].join(";");
}

function parseCookies(event) {
  return parse(event.node.req.headers.cookie || "");
}
function getCookie(event, name) {
  return parseCookies(event)[name];
}
function setCookie(event, name, value, serializeOptions = {}) {
  if (!serializeOptions.path) {
    serializeOptions = { path: "/", ...serializeOptions };
  }
  const newCookie = serialize$1(name, value, serializeOptions);
  const currentCookies = splitCookiesString(
    event.node.res.getHeader("set-cookie")
  );
  if (currentCookies.length === 0) {
    event.node.res.setHeader("set-cookie", newCookie);
    return;
  }
  const newCookieKey = getDistinctCookieKey(name, serializeOptions);
  event.node.res.removeHeader("set-cookie");
  for (const cookie of currentCookies) {
    const parsed = parseSetCookie(cookie);
    const key = getDistinctCookieKey(parsed.name, parsed);
    if (key === newCookieKey) {
      continue;
    }
    event.node.res.appendHeader("set-cookie", cookie);
  }
  event.node.res.appendHeader("set-cookie", newCookie);
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeaders(event) {
  return event.node.res.getHeaders();
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
const setHeader = setResponseHeader;
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$1=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (contentType === "text/event-stream") {
    return "stream";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
      if (!(context.options.headers instanceof Headers)) {
        context.options.headers = new Headers(
          context.options.headers || {}
          /* compat */
        );
      }
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        const contentType = context.options.headers.get("content-type");
        if (typeof context.options.body !== "string") {
          context.options.body = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(
            context.options.body
          ).toString() : JSON.stringify(context.options.body);
        }
        if (!contentType) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$1;
const AbortController$1 = globalThis.AbortController || i;
createFetch({ fetch, Headers: Headers$1, AbortController: AbortController$1 });

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r="sha256",s="base64url";function digest(t){if(e)return e(r,t,s);const o=createHash(r).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s):o.digest(s)}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const inlineAppConfig = {};



const appConfig$1 = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/"
  },
  "nitro": {
    "routeRules": {
      "/_build/assets/**": {
        "headers": {
          "cache-control": "public, immutable, max-age=31536000"
        }
      }
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  {
    return _sharedRuntimeConfig;
  }
}
_deepFreeze(klona(appConfig$1));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());

const nitroAsyncContext = getContext("nitro-app", {
  asyncContext: true,
  AsyncLocalStorage: AsyncLocalStorage 
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$0 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const appConfig = {"name":"vinxi","routers":[{"name":"public","type":"static","base":"/","dir":"./public","root":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples","order":0,"outDir":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/.vinxi/build/public"},{"name":"ssr","type":"http","link":{"client":"client"},"handler":"src/entry-server.tsx","extensions":["js","jsx","ts","tsx"],"target":"server","root":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples","base":"/","outDir":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/.vinxi/build/ssr","order":1},{"name":"client","type":"client","base":"/_build","handler":"src/entry-client.tsx","extensions":["js","jsx","ts","tsx"],"target":"browser","root":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples","outDir":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/.vinxi/build/client","order":2},{"name":"server-fns","type":"http","base":"/_server","handler":"../../node_modules/.pnpm/@solidjs+start@1.3.2_solid-js@1.9.11_vinxi@0.5.11_@types+node@25.3.2_db0@0.3.4_ioredis@_b40e54088fd2bc16a3feaba652fa1856/node_modules/@solidjs/start/dist/runtime/server-handler.js","target":"server","root":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples","outDir":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/.vinxi/build/server-fns","order":3}],"server":{"compressPublicAssets":{"brotli":true},"routeRules":{"/_build/assets/**":{"headers":{"cache-control":"public, immutable, max-age=31536000"}}},"experimental":{"asyncContext":true},"preset":"node-server"},"root":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples"};
					const buildManifest = {"ssr":{"_actor.client-CQZqd8tq.js":{"file":"assets/actor.client-CQZqd8tq.js","name":"actor.client","imports":["_chunk-PRGJ3UM7-Cui1pf_t.js"]},"_chunk-PRGJ3UM7-Cui1pf_t.js":{"file":"assets/chunk-PRGJ3UM7-Cui1pf_t.js","name":"chunk-PRGJ3UM7"},"_query-CoyrQWjL.js":{"file":"assets/query-CoyrQWjL.js","name":"query"},"_registry-C1LwNvWZ.js":{"file":"assets/registry-C1LwNvWZ.js","name":"registry"},"src/routes/api/rivet/[...rest].ts?pick=DELETE":{"file":"_...rest_.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=DELETE","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-PRGJ3UM7-Cui1pf_t.js","_registry-C1LwNvWZ.js"]},"src/routes/api/rivet/[...rest].ts?pick=GET":{"file":"_...rest_2.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=GET","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-PRGJ3UM7-Cui1pf_t.js","_registry-C1LwNvWZ.js"]},"src/routes/api/rivet/[...rest].ts?pick=HEAD":{"file":"_...rest_3.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=HEAD","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-PRGJ3UM7-Cui1pf_t.js","_registry-C1LwNvWZ.js"]},"src/routes/api/rivet/[...rest].ts?pick=OPTIONS":{"file":"_...rest_4.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=OPTIONS","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-PRGJ3UM7-Cui1pf_t.js","_registry-C1LwNvWZ.js"]},"src/routes/api/rivet/[...rest].ts?pick=PATCH":{"file":"_...rest_5.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=PATCH","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-PRGJ3UM7-Cui1pf_t.js","_registry-C1LwNvWZ.js"]},"src/routes/api/rivet/[...rest].ts?pick=POST":{"file":"_...rest_6.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=POST","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-PRGJ3UM7-Cui1pf_t.js","_registry-C1LwNvWZ.js"]},"src/routes/api/rivet/[...rest].ts?pick=PUT":{"file":"_...rest_7.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=PUT","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-PRGJ3UM7-Cui1pf_t.js","_registry-C1LwNvWZ.js"]},"src/routes/index.tsx?pick=default&pick=$css":{"file":"index.js","name":"index","src":"src/routes/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_actor.client-CQZqd8tq.js","_chunk-PRGJ3UM7-Cui1pf_t.js"]},"src/routes/ssr.tsx?pick=default&pick=$css":{"file":"ssr2.js","name":"ssr","src":"src/routes/ssr.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_query-CoyrQWjL.js","_actor.client-CQZqd8tq.js","_chunk-PRGJ3UM7-Cui1pf_t.js"]},"virtual:$vinxi/handler/ssr":{"file":"ssr.js","name":"ssr","src":"virtual:$vinxi/handler/ssr","isEntry":true,"imports":["_query-CoyrQWjL.js","_chunk-PRGJ3UM7-Cui1pf_t.js","_actor.client-CQZqd8tq.js"],"dynamicImports":["src/routes/api/rivet/[...rest].ts?pick=DELETE","src/routes/api/rivet/[...rest].ts?pick=DELETE","src/routes/api/rivet/[...rest].ts?pick=GET","src/routes/api/rivet/[...rest].ts?pick=GET","src/routes/api/rivet/[...rest].ts?pick=HEAD","src/routes/api/rivet/[...rest].ts?pick=HEAD","src/routes/api/rivet/[...rest].ts?pick=OPTIONS","src/routes/api/rivet/[...rest].ts?pick=OPTIONS","src/routes/api/rivet/[...rest].ts?pick=PATCH","src/routes/api/rivet/[...rest].ts?pick=PATCH","src/routes/api/rivet/[...rest].ts?pick=POST","src/routes/api/rivet/[...rest].ts?pick=POST","src/routes/api/rivet/[...rest].ts?pick=PUT","src/routes/api/rivet/[...rest].ts?pick=PUT","src/routes/index.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/ssr.tsx?pick=default&pick=$css","src/routes/ssr.tsx?pick=default&pick=$css"]}},"client":{"_actor.client-DkR9QHEz.js":{"file":"assets/actor.client-DkR9QHEz.js","name":"actor.client","imports":["_web-xDTdpy4P.js"]},"_server-runtime-DAZALyWd.js":{"file":"assets/server-runtime-DAZALyWd.js","name":"server-runtime","imports":["_web-xDTdpy4P.js"]},"_web-xDTdpy4P.js":{"file":"assets/web-xDTdpy4P.js","name":"web"},"src/routes/index.tsx?pick=default&pick=$css":{"file":"assets/index-uYaPfIoi.js","name":"index","src":"src/routes/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-xDTdpy4P.js","_actor.client-DkR9QHEz.js"]},"src/routes/ssr.tsx?pick=default&pick=$css":{"file":"assets/ssr-DB4-dRQl.js","name":"ssr","src":"src/routes/ssr.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-xDTdpy4P.js","_server-runtime-DAZALyWd.js","_actor.client-DkR9QHEz.js"]},"virtual:$vinxi/handler/client":{"file":"assets/client-fKVIefv0.js","name":"client","src":"virtual:$vinxi/handler/client","isEntry":true,"imports":["_web-xDTdpy4P.js","_server-runtime-DAZALyWd.js"],"dynamicImports":["src/routes/index.tsx?pick=default&pick=$css","src/routes/ssr.tsx?pick=default&pick=$css"]}},"server-fns":{"_actor.client-CQZqd8tq.js":{"file":"assets/actor.client-CQZqd8tq.js","name":"actor.client","imports":["_chunk-PRGJ3UM7-Cui1pf_t.js"]},"_chunk-PRGJ3UM7-Cui1pf_t.js":{"file":"assets/chunk-PRGJ3UM7-Cui1pf_t.js","name":"chunk-PRGJ3UM7"},"_query-BjTKLNTp.js":{"file":"assets/query-BjTKLNTp.js","name":"query"},"_registry-C1LwNvWZ.js":{"file":"assets/registry-C1LwNvWZ.js","name":"registry"},"_server-fns-v6xn5QIo.js":{"file":"assets/server-fns-v6xn5QIo.js","name":"server-fns","imports":["_query-BjTKLNTp.js","_chunk-PRGJ3UM7-Cui1pf_t.js","_actor.client-CQZqd8tq.js"],"dynamicImports":["src/routes/api/rivet/[...rest].ts?pick=DELETE","src/routes/api/rivet/[...rest].ts?pick=DELETE","src/routes/api/rivet/[...rest].ts?pick=GET","src/routes/api/rivet/[...rest].ts?pick=GET","src/routes/api/rivet/[...rest].ts?pick=HEAD","src/routes/api/rivet/[...rest].ts?pick=HEAD","src/routes/api/rivet/[...rest].ts?pick=OPTIONS","src/routes/api/rivet/[...rest].ts?pick=OPTIONS","src/routes/api/rivet/[...rest].ts?pick=PATCH","src/routes/api/rivet/[...rest].ts?pick=PATCH","src/routes/api/rivet/[...rest].ts?pick=POST","src/routes/api/rivet/[...rest].ts?pick=POST","src/routes/api/rivet/[...rest].ts?pick=PUT","src/routes/api/rivet/[...rest].ts?pick=PUT","src/routes/index.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/ssr.tsx?pick=default&pick=$css","src/routes/ssr.tsx?pick=default&pick=$css","src/routes/ssr.tsx?pick=route&tsr-directive-use-server=","src/app.tsx"]},"src/app.tsx":{"file":"assets/app-PN6qWyv6.js","name":"app","src":"src/app.tsx","isDynamicEntry":true,"imports":["_server-fns-v6xn5QIo.js","_query-BjTKLNTp.js","_chunk-PRGJ3UM7-Cui1pf_t.js","_actor.client-CQZqd8tq.js"]},"src/routes/api/rivet/[...rest].ts?pick=DELETE":{"file":"_...rest_.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=DELETE","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-PRGJ3UM7-Cui1pf_t.js","_registry-C1LwNvWZ.js"]},"src/routes/api/rivet/[...rest].ts?pick=GET":{"file":"_...rest_2.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=GET","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-PRGJ3UM7-Cui1pf_t.js","_registry-C1LwNvWZ.js"]},"src/routes/api/rivet/[...rest].ts?pick=HEAD":{"file":"_...rest_3.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=HEAD","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-PRGJ3UM7-Cui1pf_t.js","_registry-C1LwNvWZ.js"]},"src/routes/api/rivet/[...rest].ts?pick=OPTIONS":{"file":"_...rest_4.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=OPTIONS","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-PRGJ3UM7-Cui1pf_t.js","_registry-C1LwNvWZ.js"]},"src/routes/api/rivet/[...rest].ts?pick=PATCH":{"file":"_...rest_5.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=PATCH","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-PRGJ3UM7-Cui1pf_t.js","_registry-C1LwNvWZ.js"]},"src/routes/api/rivet/[...rest].ts?pick=POST":{"file":"_...rest_6.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=POST","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-PRGJ3UM7-Cui1pf_t.js","_registry-C1LwNvWZ.js"]},"src/routes/api/rivet/[...rest].ts?pick=PUT":{"file":"_...rest_7.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=PUT","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-PRGJ3UM7-Cui1pf_t.js","_registry-C1LwNvWZ.js"]},"src/routes/index.tsx?pick=default&pick=$css":{"file":"index.js","name":"index","src":"src/routes/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_actor.client-CQZqd8tq.js","_chunk-PRGJ3UM7-Cui1pf_t.js"]},"src/routes/ssr.tsx?pick=default&pick=$css":{"file":"ssr.js","name":"ssr","src":"src/routes/ssr.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_query-BjTKLNTp.js","_actor.client-CQZqd8tq.js","_chunk-PRGJ3UM7-Cui1pf_t.js"]},"src/routes/ssr.tsx?pick=route&tsr-directive-use-server=":{"file":"assets/ssr-GlLJj5UT.js","name":"ssr","src":"src/routes/ssr.tsx?pick=route&tsr-directive-use-server=","isDynamicEntry":true,"imports":["_query-BjTKLNTp.js","_chunk-PRGJ3UM7-Cui1pf_t.js","_actor.client-CQZqd8tq.js"]},"virtual:$vinxi/handler/server-fns":{"file":"server-fns.js","name":"server-fns","src":"virtual:$vinxi/handler/server-fns","isEntry":true,"imports":["_server-fns-v6xn5QIo.js","_query-BjTKLNTp.js","_chunk-PRGJ3UM7-Cui1pf_t.js","_actor.client-CQZqd8tq.js"]}}};

					const routeManifest = {"ssr":{},"client":{},"server-fns":{}};

        function createProdApp(appConfig) {
          return {
            config: { ...appConfig, buildManifest, routeManifest },
            getRouter(name) {
              return appConfig.routers.find(router => router.name === name)
            }
          }
        }

        function plugin$2(app) {
          const prodApp = createProdApp(appConfig);
          globalThis.app = prodApp;
        }

function plugin$1(app) {
	globalThis.$handle = (event) => app.h3App.handler(event);
}

/**
 * Traverses the module graph and collects assets for a given chunk
 *
 * @param {any} manifest Client manifest
 * @param {string} id Chunk id
 * @param {Map<string, string[]>} assetMap Cache of assets
 * @param {string[]} stack Stack of chunk ids to prevent circular dependencies
 * @returns Array of asset URLs
 */
function findAssetsInViteManifest(manifest, id, assetMap = new Map(), stack = []) {
	if (stack.includes(id)) {
		return [];
	}

	const cached = assetMap.get(id);
	if (cached) {
		return cached;
	}
	const chunk = manifest[id];
	if (!chunk) {
		return [];
	}

	const assets = [
		...(chunk.assets?.filter(Boolean) || []),
		...(chunk.css?.filter(Boolean) || [])
	];
	if (chunk.imports) {
		stack.push(id);
		for (let i = 0, l = chunk.imports.length; i < l; i++) {
			assets.push(...findAssetsInViteManifest(manifest, chunk.imports[i], assetMap, stack));
		}
		stack.pop();
	}
	assets.push(chunk.file);
	const all = Array.from(new Set(assets));
	assetMap.set(id, all);

	return all;
}

/** @typedef {import("../app.js").App & { config: { buildManifest: { [key:string]: any } }}} ProdApp */

function createHtmlTagsForAssets(router, app, assets) {
	return assets
		.filter(
			(asset) =>
				asset.endsWith(".css") ||
				asset.endsWith(".js") ||
				asset.endsWith(".mjs"),
		)
		.map((asset) => ({
			tag: "link",
			attrs: {
				href: joinURL(app.config.server.baseURL ?? "/", router.base, asset),
				key: join$1(app.config.server.baseURL ?? "", router.base, asset),
				...(asset.endsWith(".css")
					? { rel: "stylesheet", fetchPriority: "high" }
					: { rel: "modulepreload" }),
			},
		}));
}

/**
 *
 * @param {ProdApp} app
 * @returns
 */
function createProdManifest(app) {
	const manifest = new Proxy(
		{},
		{
			get(target, routerName) {
				invariant(typeof routerName === "string", "Bundler name expected");
				const router = app.getRouter(routerName);
				const bundlerManifest = app.config.buildManifest[routerName];

				invariant(
					router.type !== "static",
					"manifest not available for static router",
				);
				return {
					handler: router.handler,
					async assets() {
						/** @type {{ [key: string]: string[] }} */
						let assets = {};
						assets[router.handler] = await this.inputs[router.handler].assets();
						for (const route of (await router.internals.routes?.getRoutes()) ??
							[]) {
							assets[route.filePath] = await this.inputs[
								route.filePath
							].assets();
						}
						return assets;
					},
					async routes() {
						return (await router.internals.routes?.getRoutes()) ?? [];
					},
					async json() {
						/** @type {{ [key: string]: { output: string; assets: string[]} }} */
						let json = {};
						for (const input of Object.keys(this.inputs)) {
							json[input] = {
								output: this.inputs[input].output.path,
								assets: await this.inputs[input].assets(),
							};
						}
						return json;
					},
					chunks: new Proxy(
						{},
						{
							get(target, chunk) {
								invariant(typeof chunk === "string", "Chunk expected");
								const chunkPath = join$1(
									router.outDir,
									router.base,
									chunk + ".mjs",
								);
								return {
									import() {
										if (globalThis.$$chunks[chunk + ".mjs"]) {
											return globalThis.$$chunks[chunk + ".mjs"];
										}
										return import(
											/* @vite-ignore */ pathToFileURL(chunkPath).href
										);
									},
									output: {
										path: chunkPath,
									},
								};
							},
						},
					),
					inputs: new Proxy(
						{},
						{
							ownKeys(target) {
								const keys = Object.keys(bundlerManifest)
									.filter((id) => bundlerManifest[id].isEntry)
									.map((id) => id);
								return keys;
							},
							getOwnPropertyDescriptor(k) {
								return {
									enumerable: true,
									configurable: true,
								};
							},
							get(target, input) {
								invariant(typeof input === "string", "Input expected");
								if (router.target === "server") {
									const id =
										input === router.handler
											? virtualId(handlerModule(router))
											: input;
									return {
										assets() {
											return createHtmlTagsForAssets(
												router,
												app,
												findAssetsInViteManifest(bundlerManifest, id),
											);
										},
										output: {
											path: join$1(
												router.outDir,
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								} else if (router.target === "browser") {
									const id =
										input === router.handler && !input.endsWith(".html")
											? virtualId(handlerModule(router))
											: input;
									return {
										import() {
											return import(
												/* @vite-ignore */ joinURL(
													app.config.server.baseURL ?? "",
													router.base,
													bundlerManifest[id].file,
												)
											);
										},
										assets() {
											return createHtmlTagsForAssets(
												router,
												app,
												findAssetsInViteManifest(bundlerManifest, id),
											);
										},
										output: {
											path: joinURL(
												app.config.server.baseURL ?? "",
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								}
							},
						},
					),
				};
			},
		},
	);

	return manifest;
}

function plugin() {
	globalThis.MANIFEST =
		createProdManifest(globalThis.app)
			;
}

const chunks = {};
			 



			 function app() {
				 globalThis.$$chunks = chunks;
			 }

const plugins = [
  plugin$2,
plugin$1,
plugin,
app
];

const assets = {
  "/_build/.vite/manifest.json": {
    "type": "application/json",
    "encoding": null,
    "etag": "\"5a7-vjZrMkjhUKm7FpM3/8Z1NcFb44k\"",
    "mtime": "2026-03-12T15:02:27.633Z",
    "size": 1447,
    "path": "../public/_build/.vite/manifest.json"
  },
  "/_build/.vite/manifest.json.br": {
    "type": "application/json",
    "encoding": "br",
    "etag": "\"13b-+ySivv79kl6AdlgVtoEPmcdD/BM\"",
    "mtime": "2026-03-12T15:02:27.659Z",
    "size": 315,
    "path": "../public/_build/.vite/manifest.json.br"
  },
  "/_build/.vite/manifest.json.gz": {
    "type": "application/json",
    "encoding": "gzip",
    "etag": "\"172-BJevLNWeRUBmqBb23BsVwX6Q9Os\"",
    "mtime": "2026-03-12T15:02:27.659Z",
    "size": 370,
    "path": "../public/_build/.vite/manifest.json.gz"
  },
  "/_build/assets/actor.client-DkR9QHEz.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"13c79-yoW04PwRG7sJaK8hemKwapwHqn8\"",
    "mtime": "2026-03-12T15:02:28.104Z",
    "size": 81017,
    "path": "../public/_build/assets/actor.client-DkR9QHEz.js.br"
  },
  "/_build/assets/actor.client-DkR9QHEz.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"17853-gZLwc7RbtheheHC6QZzDttSNyug\"",
    "mtime": "2026-03-12T15:02:27.685Z",
    "size": 96339,
    "path": "../public/_build/assets/actor.client-DkR9QHEz.js.gz"
  },
  "/_build/assets/client-fKVIefv0.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"3b08-9Ub066q/3lRHJTN0xydNIRfV8bQ\"",
    "mtime": "2026-03-12T15:02:27.633Z",
    "size": 15112,
    "path": "../public/_build/assets/client-fKVIefv0.js"
  },
  "/_build/assets/actor.client-DkR9QHEz.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"5cc3d-wojSf/cQG7PNFpYVj00ZknlCwp4\"",
    "mtime": "2026-03-12T15:02:27.633Z",
    "size": 379965,
    "path": "../public/_build/assets/actor.client-DkR9QHEz.js"
  },
  "/_build/assets/client-fKVIefv0.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"15e6-9rkn4T/e4xnbJdAZHFkSokngzlk\"",
    "mtime": "2026-03-12T15:02:27.660Z",
    "size": 5606,
    "path": "../public/_build/assets/client-fKVIefv0.js.br"
  },
  "/_build/assets/client-fKVIefv0.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1852-Qonq0K3iVtwzaMTHkJmSmeF87Co\"",
    "mtime": "2026-03-12T15:02:27.659Z",
    "size": 6226,
    "path": "../public/_build/assets/client-fKVIefv0.js.gz"
  },
  "/_build/assets/index-uYaPfIoi.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"46d-uGjtLrzsfZ2hMr74YHLS6tgmh7k\"",
    "mtime": "2026-03-12T15:02:27.633Z",
    "size": 1133,
    "path": "../public/_build/assets/index-uYaPfIoi.js"
  },
  "/_build/assets/index-uYaPfIoi.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"206-/aKrf7EEBm1b8QhMxWbxNcMNAhE\"",
    "mtime": "2026-03-12T15:02:27.659Z",
    "size": 518,
    "path": "../public/_build/assets/index-uYaPfIoi.js.br"
  },
  "/_build/assets/index-uYaPfIoi.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"248-fM04YqrCC9SiWehhkB3xuO+E/Gg\"",
    "mtime": "2026-03-12T15:02:27.659Z",
    "size": 584,
    "path": "../public/_build/assets/index-uYaPfIoi.js.gz"
  },
  "/_build/assets/server-runtime-DAZALyWd.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"7ad8-wut78hA7+o6BNpDpGHaFMm+JsZc\"",
    "mtime": "2026-03-12T15:02:27.633Z",
    "size": 31448,
    "path": "../public/_build/assets/server-runtime-DAZALyWd.js"
  },
  "/_build/assets/server-runtime-DAZALyWd.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"29c0-tMMpNPdXWFh39mQexHc4R1qH3iY\"",
    "mtime": "2026-03-12T15:02:27.659Z",
    "size": 10688,
    "path": "../public/_build/assets/server-runtime-DAZALyWd.js.gz"
  },
  "/_build/assets/ssr-DB4-dRQl.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"876-Xacimogah0J2Z03784IeTMS6QHE\"",
    "mtime": "2026-03-12T15:02:27.633Z",
    "size": 2166,
    "path": "../public/_build/assets/ssr-DB4-dRQl.js"
  },
  "/_build/assets/ssr-DB4-dRQl.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3b5-hi1eF59mKOzOeLxO6+g2utqc73Y\"",
    "mtime": "2026-03-12T15:02:27.659Z",
    "size": 949,
    "path": "../public/_build/assets/ssr-DB4-dRQl.js.br"
  },
  "/_build/assets/ssr-DB4-dRQl.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"441-+rFFFe5Wthtf7HvAO4z8BvYEwaU\"",
    "mtime": "2026-03-12T15:02:27.659Z",
    "size": 1089,
    "path": "../public/_build/assets/ssr-DB4-dRQl.js.gz"
  },
  "/_build/assets/server-runtime-DAZALyWd.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"25aa-iWQPDTb5ijWiJkp43C4ovgpj9L8\"",
    "mtime": "2026-03-12T15:02:27.686Z",
    "size": 9642,
    "path": "../public/_build/assets/server-runtime-DAZALyWd.js.br"
  },
  "/_build/assets/web-xDTdpy4P.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"605b-kRf10m2rbJPra0KBtu5CUuIq/Rc\"",
    "mtime": "2026-03-12T15:02:27.633Z",
    "size": 24667,
    "path": "../public/_build/assets/web-xDTdpy4P.js"
  },
  "/_build/assets/web-xDTdpy4P.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2187-y0LJBQeV+VQw3TPhbDKp++Svqo4\"",
    "mtime": "2026-03-12T15:02:27.686Z",
    "size": 8583,
    "path": "../public/_build/assets/web-xDTdpy4P.js.br"
  },
  "/_build/assets/web-xDTdpy4P.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"24ce-KjaY/n78gNjAoLg3Z8LekUtDoU4\"",
    "mtime": "2026-03-12T15:02:27.663Z",
    "size": 9422,
    "path": "../public/_build/assets/web-xDTdpy4P.js.gz"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _YHSsop = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, key + "" , value);
function Ze$3(t = {}) {
  let e, n = false;
  const r = (o) => {
    if (e && e !== o) throw new Error("Context conflict");
  };
  let s;
  if (t.asyncContext) {
    const o = t.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    o ? s = new o() : console.warn("[unctx] `AsyncLocalStorage` is not provided.");
  }
  const a = () => {
    if (s) {
      const o = s.getStore();
      if (o !== void 0) return o;
    }
    return e;
  };
  return { use: () => {
    const o = a();
    if (o === void 0) throw new Error("Context is not available");
    return o;
  }, tryUse: () => a(), set: (o, c) => {
    c || r(o), e = o, n = true;
  }, unset: () => {
    e = void 0, n = false;
  }, call: (o, c) => {
    r(o), e = o;
    try {
      return s ? s.run(o, c) : c();
    } finally {
      n || (e = void 0);
    }
  }, async callAsync(o, c) {
    e = o;
    const h = () => {
      e = o;
    }, p = () => e === o ? h : void 0;
    oe$2.add(p);
    try {
      const u = s ? s.run(o, c) : c();
      return n || (e = void 0), await u;
    } finally {
      oe$2.delete(p);
    }
  } };
}
function et$5(t = {}) {
  const e = {};
  return { get(n, r = {}) {
    return e[n] || (e[n] = Ze$3({ ...t, ...r })), e[n];
  } };
}
const N$5 = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof global < "u" ? global : {}, re$2 = "__unctx__", tt$5 = N$5[re$2] || (N$5[re$2] = et$5()), nt$5 = (t, e = {}) => tt$5.get(t, e), se$2 = "__unctx_async_handlers__", oe$2 = N$5[se$2] || (N$5[se$2] = /* @__PURE__ */ new Set());
function rt$5(t) {
  let e;
  const n = ye$2(t), r = { duplex: "half", method: t.method, headers: t.headers };
  return t.node.req.body instanceof ArrayBuffer ? new Request(n, { ...r, body: t.node.req.body }) : new Request(n, { ...r, get body() {
    return e || (e = lt$5(t), e);
  } });
}
function st$5(t) {
  var _a;
  return (_a = t.web) != null ? _a : t.web = { request: rt$5(t), url: ye$2(t) }, t.web.request;
}
function ot$4() {
  return pt$5();
}
const ge$2 = /* @__PURE__ */ Symbol("$HTTPEvent");
function at$5(t) {
  return typeof t == "object" && (t instanceof H3Event || (t == null ? void 0 : t[ge$2]) instanceof H3Event || (t == null ? void 0 : t.__is_event__) === true);
}
function R$6(t) {
  return function(...e) {
    var _a;
    let n = e[0];
    if (at$5(n)) e[0] = n instanceof H3Event || n.__is_event__ ? n : n[ge$2];
    else {
      if (!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (n = ot$4(), !n) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      e.unshift(n);
    }
    return t(...e);
  };
}
const ye$2 = R$6(getRequestURL), it$4 = R$6(getRequestIP), ae$2 = R$6(setResponseStatus), ie$2 = R$6(getResponseStatus), ct$5 = R$6(getResponseStatusText), M$4 = R$6(getResponseHeaders), ce$2 = R$6(getResponseHeader), ut$4 = R$6(setResponseHeader), me$2 = R$6(appendResponseHeader), Jt$2 = R$6(parseCookies), Xt$2 = R$6(getCookie), Yt$2 = R$6(setCookie), Qt$2 = R$6(setHeader), lt$5 = R$6(getRequestWebStream), ft$5 = R$6(removeResponseHeader), ht$5 = R$6(st$5);
function dt$5() {
  var _a;
  return nt$5("nitro-app", { asyncContext: !!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function pt$5() {
  return dt$5().use().event;
}
const K$5 = "solidFetchEvent";
function gt$3(t) {
  return { request: ht$5(t), response: wt$3(t), clientAddress: it$4(t), locals: {}, nativeEvent: t };
}
function yt$3(t) {
  return { ...t };
}
function Vt$2(t) {
  if (!t.context[K$5]) {
    const e = gt$3(t);
    t.context[K$5] = e;
  }
  return t.context[K$5];
}
function Zt$2(t, e) {
  for (const [n, r] of e.entries()) me$2(t, n, r);
}
let mt$3 = class mt {
  constructor(e) {
    __publicField$2(this, "event");
    this.event = e;
  }
  get(e) {
    const n = ce$2(this.event, e);
    return Array.isArray(n) ? n.join(", ") : n || null;
  }
  has(e) {
    return this.get(e) !== null;
  }
  set(e, n) {
    return ut$4(this.event, e, n);
  }
  delete(e) {
    return ft$5(this.event, e);
  }
  append(e, n) {
    me$2(this.event, e, n);
  }
  getSetCookie() {
    const e = ce$2(this.event, "Set-Cookie");
    return Array.isArray(e) ? e : [e];
  }
  forEach(e) {
    return Object.entries(M$4(this.event)).forEach(([n, r]) => e(Array.isArray(r) ? r.join(", ") : r, n, this));
  }
  entries() {
    return Object.entries(M$4(this.event)).map(([e, n]) => [e, Array.isArray(n) ? n.join(", ") : n])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(M$4(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(M$4(this.event)).map((e) => Array.isArray(e) ? e.join(", ") : e)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
};
function wt$3(t) {
  return { get status() {
    return ie$2(t);
  }, set status(e) {
    ae$2(t, e);
  }, get statusText() {
    return ct$5(t);
  }, set statusText(e) {
    ae$2(t, ie$2(t), e);
  }, headers: new mt$3(t) };
}
function en$2(t, e, n) {
  if (typeof t != "function") throw new Error("Export from a 'use server' module must be a function");
  const r = "";
  return new Proxy(t, { get(s, a, o) {
    return a === "url" ? `${r}/_server?id=${encodeURIComponent(e)}&name=${encodeURIComponent(n)}` : a === "GET" ? o : s[a];
  }, apply(s, a, o) {
    const c = getRequestEvent();
    if (!c) throw new Error("Cannot call server function outside of a request");
    const h = yt$3(c);
    return h.locals.serverFunctionMeta = { id: e + "#" + n }, h.serverOnly = true, provideRequestEvent(h, () => t.apply(a, o));
  } });
}
function Rt$3() {
  let t = /* @__PURE__ */ new Set();
  function e(s) {
    return t.add(s), () => t.delete(s);
  }
  let n = false;
  function r(s, a) {
    if (n) return !(n = false);
    const o = { to: s, options: a, defaultPrevented: false, preventDefault: () => o.defaultPrevented = true };
    for (const c of t) c.listener({ ...o, from: c.location, retry: (h) => {
      h && (n = true), c.navigate(s, { ...a, resolve: false });
    } });
    return !o.defaultPrevented;
  }
  return { subscribe: e, confirm: r };
}
let X$5;
function we$2() {
  (!window.history.state || window.history.state._depth == null) && window.history.replaceState({ ...window.history.state, _depth: window.history.length - 1 }, ""), X$5 = window.history.state._depth;
}
isServer || we$2();
function tn$2(t) {
  return { ...t, _depth: window.history.state && window.history.state._depth };
}
function nn$2(t, e) {
  let n = false;
  return () => {
    const r = X$5;
    we$2();
    const s = r == null ? null : X$5 - r;
    if (n) {
      n = false;
      return;
    }
    s && e(s) ? (n = true, window.history.go(-s)) : t();
  };
}
const vt$5 = /^(?:[a-z0-9]+:)?\/\//i, xt$2 = /^\/+|(\/)\/+$/g, bt$5 = "http://sr";
function F$3(t, e = false) {
  const n = t.replace(xt$2, "$1");
  return n ? e || /^[?#]/.test(n) ? n : "/" + n : "";
}
function D$5(t, e, n) {
  if (vt$5.test(e)) return;
  const r = F$3(t), s = n && F$3(n);
  let a = "";
  return !s || e.startsWith("/") ? a = r : s.toLowerCase().indexOf(r.toLowerCase()) !== 0 ? a = r + s : a = s, (a || "/") + F$3(e, !a);
}
function Ct$3(t, e) {
  if (t == null) throw new Error(e);
  return t;
}
function St$3(t, e) {
  return F$3(t).replace(/\/*(\*.*)?$/g, "") + F$3(e);
}
function Re$2(t) {
  const e = {};
  return t.searchParams.forEach((n, r) => {
    r in e ? Array.isArray(e[r]) ? e[r].push(n) : e[r] = [e[r], n] : e[r] = n;
  }), e;
}
function Et$3(t, e, n) {
  const [r, s] = t.split("/*", 2), a = r.split("/").filter(Boolean), o = a.length;
  return (c) => {
    const h = c.split("/").filter(Boolean), p = h.length - o;
    if (p < 0 || p > 0 && s === void 0 && !e) return null;
    const u = { path: o ? "" : "/", params: {} }, i = (y) => n === void 0 ? void 0 : n[y];
    for (let y = 0; y < o; y++) {
      const l = a[y], m = l[0] === ":", d = m ? h[y] : h[y].toLowerCase(), w = m ? l.slice(1) : l.toLowerCase();
      if (m && z$3(d, i(w))) u.params[w] = d;
      else if (m || !z$3(d, w)) return null;
      u.path += `/${d}`;
    }
    if (s) {
      const y = p ? h.slice(-p).join("/") : "";
      if (z$3(y, i(s))) u.params[s] = y;
      else return null;
    }
    return u;
  };
}
function z$3(t, e) {
  const n = (r) => r === t;
  return e === void 0 ? true : typeof e == "string" ? n(e) : typeof e == "function" ? e(t) : Array.isArray(e) ? e.some(n) : e instanceof RegExp ? e.test(t) : false;
}
function Pt$3(t) {
  const [e, n] = t.pattern.split("/*", 2), r = e.split("/").filter(Boolean);
  return r.reduce((s, a) => s + (a.startsWith(":") ? 2 : 3), r.length - (n === void 0 ? 0 : 1));
}
function ve$2(t) {
  const e = /* @__PURE__ */ new Map(), n = getOwner();
  return new Proxy({}, { get(r, s) {
    return e.has(s) || runWithOwner(n, () => e.set(s, createMemo(() => t()[s]))), e.get(s)();
  }, getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  }, ownKeys() {
    return Reflect.ownKeys(t());
  }, has(r, s) {
    return s in t();
  } });
}
function xe$2(t) {
  let e = /(\/?\:[^\/]+)\?/.exec(t);
  if (!e) return [t];
  let n = t.slice(0, e.index), r = t.slice(e.index + e[0].length);
  const s = [n, n += e[1]];
  for (; e = /^(\/\:[^\/]+)\?/.exec(r); ) s.push(n += e[1]), r = r.slice(e[0].length);
  return xe$2(r).reduce((a, o) => [...a, ...s.map((c) => c + o)], []);
}
const At$3 = 100, _t$2 = createContext$1(), Ht$2 = createContext$1(), qt$2 = () => Ct$3(useContext(_t$2), "<A> and 'use' router primitives can be only used inside a Route."), Tt$3 = () => qt$2().navigatorFactory();
function Ot$2(t, e = "") {
  const { component: n, preload: r, load: s, children: a, info: o } = t, c = !a || Array.isArray(a) && !a.length, h = { key: t, component: n, preload: r || s, info: o };
  return be$1(t.path).reduce((p, u) => {
    for (const i of xe$2(u)) {
      const y = St$3(e, i);
      let l = c ? y : y.split("/*", 1)[0];
      l = l.split("/").map((m) => m.startsWith(":") || m.startsWith("*") ? m : encodeURIComponent(m)).join("/"), p.push({ ...h, originalPath: u, pattern: l, matcher: Et$3(l, !c, t.matchFilters) });
    }
    return p;
  }, []);
}
function Lt$3(t, e = 0) {
  return { routes: t, score: Pt$3(t[t.length - 1]) * 1e4 - e, matcher(n) {
    const r = [];
    for (let s = t.length - 1; s >= 0; s--) {
      const a = t[s], o = a.matcher(n);
      if (!o) return null;
      r.unshift({ ...o, route: a });
    }
    return r;
  } };
}
function be$1(t) {
  return Array.isArray(t) ? t : [t];
}
function $t$3(t, e = "", n = [], r = []) {
  const s = be$1(t);
  for (let a = 0, o = s.length; a < o; a++) {
    const c = s[a];
    if (c && typeof c == "object") {
      c.hasOwnProperty("path") || (c.path = "");
      const h = Ot$2(c, e);
      for (const p of h) {
        n.push(p);
        const u = Array.isArray(c.children) && c.children.length === 0;
        if (c.children && !u) $t$3(c.children, p.pattern, n, r);
        else {
          const i = Lt$3([...n], r.length);
          r.push(i);
        }
        n.pop();
      }
    }
  }
  return n.length ? r : r.sort((a, o) => o.score - a.score);
}
function G$5(t, e) {
  for (let n = 0, r = t.length; n < r; n++) {
    const s = t[n].matcher(e);
    if (s) return s;
  }
  return [];
}
function kt$3(t, e, n) {
  const r = new URL(bt$5), s = createMemo((u) => {
    const i = t();
    try {
      return new URL(i, r);
    } catch {
      return console.error(`Invalid path ${i}`), u;
    }
  }, r, { equals: (u, i) => u.href === i.href }), a = createMemo(() => s().pathname), o = createMemo(() => s().search, true), c = createMemo(() => s().hash), h = () => "", p = on$3(o, () => Re$2(s()));
  return { get pathname() {
    return a();
  }, get search() {
    return o();
  }, get hash() {
    return c();
  }, get state() {
    return e();
  }, get key() {
    return h();
  }, query: n ? n(p) : ve$2(p) };
}
let A$2;
function Ft$2() {
  return A$2;
}
let k$6 = false;
function jt$3() {
  return k$6;
}
function rn$2(t) {
  k$6 = t;
}
function sn$2(t, e, n, r = {}) {
  const { signal: [s, a], utils: o = {} } = t, c = o.parsePath || ((f) => f), h = o.renderPath || ((f) => f), p = o.beforeLeave || Rt$3(), u = D$5("", r.base || "");
  if (u === void 0) throw new Error(`${u} is not a valid base path`);
  u && !s().value && a({ value: u, replace: true, scroll: false });
  const [i, y] = createSignal(false);
  let l;
  const m = (f, g) => {
    g.value === d() && g.state === v() || (l === void 0 && y(true), A$2 = f, l = g, startTransition(() => {
      l === g && (w(l.value), H(l.state), resetErrorBoundaries(), isServer || Q[1]((b) => b.filter((q) => q.pending)));
    }).finally(() => {
      l === g && batch(() => {
        A$2 = void 0, f === "navigate" && Pe(l), y(false), l = void 0;
      });
    }));
  }, [d, w] = createSignal(s().value), [v, H] = createSignal(s().state), S = kt$3(d, v, o.queryWrapper), E = [], Q = createSignal(isServer ? _e() : []), V = createMemo(() => typeof r.transformUrl == "function" ? G$5(e(), r.transformUrl(S.pathname)) : G$5(e(), S.pathname)), Z = () => {
    const f = V(), g = {};
    for (let b = 0; b < f.length; b++) Object.assign(g, f[b].params);
    return g;
  }, Ce = o.paramsWrapper ? o.paramsWrapper(Z, e) : ve$2(Z), ee = { pattern: u, path: () => u, outlet: () => null, resolvePath(f) {
    return D$5(u, f);
  } };
  return createRenderEffect(on$3(s, (f) => m("native", f), { defer: true })), { base: ee, location: S, params: Ce, isRouting: i, renderPath: h, parsePath: c, navigatorFactory: Ee, matches: V, beforeLeave: p, preloadRoute: Ae, singleFlight: r.singleFlight === void 0 ? true : r.singleFlight, submissions: Q };
  function Se(f, g, b) {
    untrack(() => {
      if (typeof g == "number") {
        g && (o.go ? o.go(g) : console.warn("Router integration does not support relative routing"));
        return;
      }
      const q = !g || g[0] === "?", { replace: W, resolve: T, scroll: U, state: O } = { replace: false, resolve: !q, scroll: true, ...b }, L = T ? f.resolvePath(g) : D$5(q && S.pathname || "", g);
      if (L === void 0) throw new Error(`Path '${g}' is not a routable path`);
      if (E.length >= At$3) throw new Error("Too many redirects");
      const te = d();
      if (L !== te || O !== v()) if (isServer) {
        const ne = getRequestEvent();
        ne && (ne.response = { status: 302, headers: new Headers({ Location: L }) }), a({ value: L, replace: W, scroll: U, state: O });
      } else p.confirm(L, b) && (E.push({ value: te, replace: W, scroll: U, state: v() }), m("navigate", { value: L, state: O }));
    });
  }
  function Ee(f) {
    return f = f || useContext(Ht$2) || ee, (g, b) => Se(f, g, b);
  }
  function Pe(f) {
    const g = E[0];
    g && (a({ ...f, replace: g.replace, scroll: g.scroll }), E.length = 0);
  }
  function Ae(f, g) {
    const b = G$5(e(), f.pathname), q = A$2;
    A$2 = "preload";
    for (let W in b) {
      const { route: T, params: U } = b[W];
      T.component && T.component.preload && T.component.preload();
      const { preload: O } = T;
      k$6 = true, g && O && runWithOwner(n(), () => O({ params: U, location: { pathname: f.pathname, search: f.search, hash: f.hash, query: Re$2(f), state: null, key: "" }, intent: "preload" })), k$6 = false;
    }
    A$2 = q;
  }
  function _e() {
    const f = getRequestEvent();
    return f && f.router && f.router.submission ? [f.router.submission] : [];
  }
}
function on$2(t, e, n, r) {
  const { base: s, location: a, params: o } = t, { pattern: c, component: h, preload: p } = r().route, u = createMemo(() => r().path);
  h && h.preload && h.preload(), k$6 = true;
  const i = p ? p({ params: o, location: a, intent: A$2 || "initial" }) : void 0;
  return k$6 = false, { parent: e, pattern: c, path: u, outlet: () => h ? createComponent(h, { params: o, location: a, data: i, get children() {
    return n();
  } }) : n(), resolvePath(l) {
    return D$5(s.path(), l, u());
  } };
}
const It$2 = "Location", Wt$2 = 5e3, Ut$2 = 18e4;
let Y$5 = /* @__PURE__ */ new Map();
isServer || setInterval(() => {
  const t = Date.now();
  for (let [e, n] of Y$5.entries()) !n[4].count && t - n[0] > Ut$2 && Y$5.delete(e);
}, 3e5);
function j$4() {
  if (!isServer) return Y$5;
  const t = getRequestEvent();
  if (!t) throw new Error("Cannot find cache context");
  return (t.router || (t.router = {})).cache || (t.router.cache = /* @__PURE__ */ new Map());
}
function I$2(t, e) {
  t.GET && (t = t.GET);
  const n = (...r) => {
    const s = j$4(), a = Ft$2(), o = jt$3(), h = getOwner() ? Tt$3() : void 0, p = Date.now(), u = e + ue$1(r);
    let i = s.get(u), y;
    if (isServer) {
      const d = getRequestEvent();
      if (d) {
        const w = (d.router || (d.router = {})).dataOnly;
        if (w) {
          const v = d && (d.router.data || (d.router.data = {}));
          if (v && u in v) return v[u];
          if (Array.isArray(w) && !Mt$2(u, w)) return v[u] = void 0, Promise.resolve();
        }
      }
    }
    if (getListener() && !isServer && (y = true, onCleanup(() => i[4].count--)), i && i[0] && (isServer || a === "native" || i[4].count || Date.now() - i[0] < Wt$2)) {
      y && (i[4].count++, i[4][0]()), i[3] === "preload" && a !== "preload" && (i[0] = p);
      let d = i[1];
      return a !== "preload" && (d = "then" in i[1] ? i[1].then(m(false), m(true)) : m(false)(i[1]), !isServer && a === "navigate" && startTransition(() => i[4][1](i[0]))), o && "then" in d && d.catch(() => {
      }), d;
    }
    let l;
    if (!isServer && sharedConfig.has && sharedConfig.has(u) ? (l = sharedConfig.load(u), delete globalThis._$HY.r[u]) : l = t(...r), i ? (i[0] = p, i[1] = l, i[3] = a, !isServer && a === "navigate" && startTransition(() => i[4][1](i[0]))) : (s.set(u, i = [p, l, , a, createSignal(p)]), i[4].count = 0), y && (i[4].count++, i[4][0]()), isServer) {
      const d = getRequestEvent();
      if (d && d.router.dataOnly) return d.router.data[u] = l;
    }
    if (a !== "preload" && (l = "then" in l ? l.then(m(false), m(true)) : m(false)(l)), o && "then" in l && l.catch(() => {
    }), isServer && sharedConfig.context && sharedConfig.context.async && !sharedConfig.context.noHydrate) {
      const d = getRequestEvent();
      (!d || !d.serverOnly) && sharedConfig.context.serialize(u, l);
    }
    return l;
    function m(d) {
      return async (w) => {
        if (w instanceof Response) {
          const v = getRequestEvent();
          if (v) for (const [S, E] of w.headers) S == "set-cookie" ? v.response.headers.append("set-cookie", E) : v.response.headers.set(S, E);
          const H = w.headers.get(It$2);
          if (H !== null) {
            h && H.startsWith("/") ? startTransition(() => {
              h(H, { replace: true });
            }) : isServer ? v && (v.response.status = 302) : window.location.href = H;
            return;
          }
          w.customBody && (w = await w.customBody());
        }
        if (d) throw w;
        return i[2] = w, w;
      };
    }
  };
  return n.keyFor = (...r) => e + ue$1(r), n.key = e, n;
}
I$2.get = (t) => j$4().get(t)[2];
I$2.set = (t, e) => {
  const n = j$4(), r = Date.now();
  let s = n.get(t);
  s ? (s[0] = r, s[1] = Promise.resolve(e), s[2] = e, s[3] = "preload") : (n.set(t, s = [r, Promise.resolve(e), e, "preload", createSignal(r)]), s[4].count = 0);
};
I$2.delete = (t) => j$4().delete(t);
I$2.clear = () => j$4().clear();
const an$1 = I$2;
function Mt$2(t, e) {
  for (let n of e) if (n && t.startsWith(n)) return true;
  return false;
}
function ue$1(t) {
  return JSON.stringify(t, (e, n) => Bt$2(n) ? Object.keys(n).sort().reduce((r, s) => (r[s] = n[s], r), {}) : n);
}
function Bt$2(t) {
  let e;
  return t != null && typeof t == "object" && (!(e = Object.getPrototypeOf(t)) || e === Object.prototype);
}

var U$4 = Math.floor(Date.now() / 1e3), R$5 = getLogger("driver-solidstart"), C$2 = async (n, e) => {
  const a = new URL(n.url), t = e == null ? void 0 : e.rivetSiteUrl;
  if (!t) throw new Error("rivetSiteUrl is required");
  const r = e == null ? void 0 : e.registry;
  if (!r) throw new Error("registry is not set");
  r.config.serveManager = false, r.config.serverless = { ...r.config.serverless, basePath: "/api/rivet" }, (e == null ? void 0 : e.isDev) ? (R$5.debug("detected development environment, auto-starting engine and auto-configuring serverless"), r.config.serverless.spawnEngine = true, r.config.serverless.configureRunnerPool = { url: `${t}/api/rivet`, minRunners: 0, maxRunners: 1e5, requestLifespan: 300, slotsPerRunner: 1, metadata: { provider: "solidstart" } }, r.config.runner = { ...r.config.runner, version: U$4 }) : R$5.debug("detected production environment, will not auto-start engine and auto-configure serverless");
  const o = `${t}${a.pathname}`, s = new Request(o, n);
  if (s.headers.set("host", new URL(o).host), s.headers.set("accept-encoding", "application/json"), e == null ? void 0 : e.headers) for (const [c, d] of Object.entries(e.headers)) s.headers.set(c, d);
  if (e == null ? void 0 : e.getHeaders) {
    const c = await e.getHeaders(n);
    for (const [d, u] of Object.entries(c)) s.headers.set(d, u);
  }
  return await r.handler(s);
}, k$5 = (n) => {
  const e = async ({ request: a }) => C$2(a, n);
  return { GET: e, POST: e, PUT: e, DELETE: e, PATCH: e, HEAD: e, OPTIONS: e };
}, H$4 = typeof globalThis.document < "u";
async function q$5(n, e) {
  const { actor: a, key: t, action: r, args: o = [], event: s, params: c, createInRegion: d, createWithInput: u } = e, g = Array.isArray(t) ? t : [t], v = await n.getOrCreate(a, g, { params: c, createInRegion: d, createWithInput: u }).action({ name: r, args: o });
  return H$4 ? T$4(n, e, v) : P$2(v);
}
function P$2(n) {
  const [e] = createSignal(n), [a] = createSignal(false), [t] = createSignal(void 0), [r] = createSignal(false);
  return { data: e, isLoading: a, error: t, isConnected: r };
}
function T$4(n, e, a) {
  const { actor: t, key: r, event: o, params: s, createInRegion: c, createWithInput: d, transform: u = (l, f) => f } = e, [g, m] = createSignal(a), [v, p] = createSignal(false), [E, y] = createSignal(void 0), [S, w] = createSignal(false), A = Array.isArray(r) ? r : [r], h = n.getOrCreate(t, A, { params: s, createInRegion: c, createWithInput: d }).connect();
  h.onOpen(() => {
    w(true);
  }), h.onClose(() => {
    w(false);
  }), h.onError((l) => {
    y(l instanceof Error ? l : new Error(String(l)));
  });
  const L = Array.isArray(o) ? o : [o];
  for (const l of L) h.on(l, (...f) => {
    const O = f.length === 1 ? f[0] : f;
    m(() => u(g(), O)), p(false), y(void 0);
  });
  return { data: g, isLoading: v, error: E, isConnected: S };
}

var K$4 = Object.create, $$3 = Object.defineProperty, Q$3 = Object.getOwnPropertyDescriptor, U$3 = Object.getOwnPropertyNames, X$4 = Object.getPrototypeOf, Y$4 = Object.prototype.hasOwnProperty, Z$3 = (o, r) => function() {
  return r || (0, o[U$3(o)[0]])((r = { exports: {} }).exports, r), r.exports;
}, q$4 = (o, r, t, e) => {
  if (r && typeof r == "object" || typeof r == "function") for (let n of U$3(r)) !Y$4.call(o, n) && n !== t && $$3(o, n, { get: () => r[n], enumerable: !(e = Q$3(r, n)) || e.enumerable });
  return o;
}, tt$4 = (o, r, t) => (t = o != null ? K$4(X$4(o)) : {}, q$4($$3(t, "default", { value: o, enumerable: true }), o)), et$4 = Z$3({ "../../node_modules/.pnpm/fast-deep-equal@3.1.3/node_modules/fast-deep-equal/index.js"(o, r) {
  r.exports = function t(e, n) {
    if (e === n) return true;
    if (e && n && typeof e == "object" && typeof n == "object") {
      if (e.constructor !== n.constructor) return false;
      var i, a, s;
      if (Array.isArray(e)) {
        if (i = e.length, i != n.length) return false;
        for (a = i; a-- !== 0; ) if (!t(e[a], n[a])) return false;
        return true;
      }
      if (e.constructor === RegExp) return e.source === n.source && e.flags === n.flags;
      if (e.valueOf !== Object.prototype.valueOf) return e.valueOf() === n.valueOf();
      if (e.toString !== Object.prototype.toString) return e.toString() === n.toString();
      if (s = Object.keys(e), i = s.length, i !== Object.keys(n).length) return false;
      for (a = i; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(n, s[a])) return false;
      for (a = i; a-- !== 0; ) {
        var p = s[a];
        if (!t(e[p], n[p])) return false;
      }
      return true;
    }
    return e !== e && n !== n;
  };
} }), D$4 = /* @__PURE__ */ new WeakMap(), T$3 = /* @__PURE__ */ new WeakMap(), R$4 = { current: [] }, M$3 = false, j$3 = /* @__PURE__ */ new Set(), k$4 = /* @__PURE__ */ new Map();
function H$3(o) {
  const r = Array.from(o).sort((t, e) => t instanceof F$2 && t.options.deps.includes(e) ? 1 : e instanceof F$2 && e.options.deps.includes(t) ? -1 : 0);
  for (const t of r) {
    if (R$4.current.includes(t)) continue;
    R$4.current.push(t), t.recompute();
    const e = T$3.get(t);
    if (e) for (const n of e) {
      const i = D$4.get(n);
      i && H$3(i);
    }
  }
}
function nt$4(o) {
  o.listeners.forEach((r) => r({ prevVal: o.prevState, currentVal: o.state }));
}
function rt$4(o) {
  o.listeners.forEach((r) => r({ prevVal: o.prevState, currentVal: o.state }));
}
function ot$3(o) {
  var _a;
  if (j$3.add(o), !M$3) try {
    for (M$3 = true; j$3.size > 0; ) {
      const r = Array.from(j$3);
      j$3.clear();
      for (const t of r) {
        const e = (_a = k$4.get(t)) != null ? _a : t.prevState;
        t.prevState = e, nt$4(t);
      }
      for (const t of r) {
        const e = D$4.get(t);
        e && (R$4.current.push(t), H$3(e));
      }
      for (const t of r) {
        const e = D$4.get(t);
        if (e) for (const n of e) rt$4(n);
      }
    }
  } finally {
    M$3 = false, R$4.current = [], k$4.clear();
  }
}
function st$4(o) {
  return typeof o == "function";
}
var N$4 = class N {
  constructor(o, r) {
    this.listeners = /* @__PURE__ */ new Set(), this.subscribe = (t) => {
      var e, n;
      this.listeners.add(t);
      const i = (n = (e = this.options) == null ? void 0 : e.onSubscribe) == null ? void 0 : n.call(e, t, this);
      return () => {
        this.listeners.delete(t), i == null ? void 0 : i();
      };
    }, this.prevState = o, this.state = o, this.options = r;
  }
  setState(o) {
    var r, t, e;
    this.prevState = this.state, (r = this.options) != null && r.updateFn ? this.state = this.options.updateFn(this.prevState)(o) : st$4(o) ? this.state = o(this.prevState) : this.state = o, (e = (t = this.options) == null ? void 0 : t.onUpdate) == null || e.call(t), ot$3(this);
  }
}, F$2 = class P {
  constructor(r) {
    this.listeners = /* @__PURE__ */ new Set(), this._subscriptions = [], this.lastSeenDepValues = [], this.getDepVals = () => {
      var _a;
      const t = [], e = [];
      for (const n of this.options.deps) t.push(n.prevState), e.push(n.state);
      return this.lastSeenDepValues = e, { prevDepVals: t, currDepVals: e, prevVal: (_a = this.prevState) != null ? _a : void 0 };
    }, this.recompute = () => {
      var t, e;
      this.prevState = this.state;
      const { prevDepVals: n, currDepVals: i, prevVal: a } = this.getDepVals();
      this.state = this.options.fn({ prevDepVals: n, currDepVals: i, prevVal: a }), (e = (t = this.options).onUpdate) == null || e.call(t);
    }, this.checkIfRecalculationNeededDeeply = () => {
      for (const i of this.options.deps) i instanceof P && i.checkIfRecalculationNeededDeeply();
      let t = false;
      const e = this.lastSeenDepValues, { currDepVals: n } = this.getDepVals();
      for (let i = 0; i < n.length; i++) if (n[i] !== e[i]) {
        t = true;
        break;
      }
      t && this.recompute();
    }, this.mount = () => (this.registerOnGraph(), this.checkIfRecalculationNeededDeeply(), () => {
      this.unregisterFromGraph();
      for (const t of this._subscriptions) t();
    }), this.subscribe = (t) => {
      var e, n;
      this.listeners.add(t);
      const i = (n = (e = this.options).onSubscribe) == null ? void 0 : n.call(e, t, this);
      return () => {
        this.listeners.delete(t), i == null ? void 0 : i();
      };
    }, this.options = r, this.state = r.fn({ prevDepVals: void 0, prevVal: void 0, currDepVals: this.getDepVals().currDepVals });
  }
  registerOnGraph(r = this.options.deps) {
    for (const t of r) if (t instanceof P) t.registerOnGraph(), this.registerOnGraph(t.options.deps);
    else if (t instanceof N$4) {
      let e = D$4.get(t);
      e || (e = /* @__PURE__ */ new Set(), D$4.set(t, e)), e.add(this);
      let n = T$3.get(this);
      n || (n = /* @__PURE__ */ new Set(), T$3.set(this, n)), n.add(t);
    }
  }
  unregisterFromGraph(r = this.options.deps) {
    for (const t of r) if (t instanceof P) this.unregisterFromGraph(t.options.deps);
    else if (t instanceof N$4) {
      const e = D$4.get(t);
      e && e.delete(this);
      const n = T$3.get(this);
      n && n.delete(t);
    }
  }
}, it$3 = class it {
  constructor(o) {
    const { eager: r, fn: t, ...e } = o;
    this._derived = new F$2({ ...e, fn: () => {
    }, onUpdate() {
      t();
    } }), r && t();
  }
  mount() {
    return this._derived.mount();
  }
}, ct$4 = tt$4(et$4());
function at$4(o, r = {}) {
  const t = new N$4({ actors: {} }), e = /* @__PURE__ */ new Map();
  return { getOrCreateActor: (n) => ut$3(o, r, t, e, n), store: t };
}
function E$2(o, r, t) {
  o.setState((e) => ({ ...e, actors: { ...e.actors, [r]: { ...e.actors[r], ...t } } }));
}
function ut$3(o, r, t, e, n) {
  var _a;
  const i = r.hashFunction || lt$4, a = { ...n, enabled: (_a = n.enabled) != null ? _a : true }, s = i(a), p = t.state.actors[s];
  p ? ft$4(p.opts, a) || queueMicrotask(() => {
    E$2(t, s, { opts: a });
  }) : t.setState((c) => ({ ...c, actors: { ...c.actors, [s]: { hash: s, connStatus: "idle", connection: null, handle: null, error: null, opts: a } } }));
  const V = e.get(s);
  if (V) return { ...V, state: V.state };
  const S = new F$2({ fn: ({ currDepVals: [c] }) => {
    const l = c.actors[s];
    return { ...l, isConnected: l.connStatus === "connected" };
  }, deps: [t] }), L = new it$3({ fn: () => {
    const c = t.state.actors[s];
    if (!c) throw new Error(`Actor with key "${s}" not found in store. This indicates a bug in cleanup logic.`);
    if (!c.opts.enabled && c.connection) {
      c.connection.dispose(), E$2(t, s, { connection: null, handle: null, connStatus: "idle" });
      return;
    }
    c.connStatus === "idle" && c.opts.enabled && queueMicrotask(() => {
      const l = t.state.actors[s];
      l && l.connStatus === "idle" && l.opts.enabled && G$4(o, t, s);
    });
  }, deps: [S] });
  let w = null, A = null;
  const u = () => {
    const c = e.get(s);
    if (!c) throw new Error(`Actor with key "${s}" not found in cache. This indicates a bug in cleanup logic.`);
    if (c.cleanupTimeout !== null && (clearTimeout(c.cleanupTimeout), c.cleanupTimeout = null), c.refCount++, c.refCount === 1) {
      w = S.mount(), A = L.mount();
      const l = t.state.actors[s];
      l && l.opts.enabled && l.connStatus === "idle" && G$4(o, t, s);
    }
    return () => {
      c.refCount--, c.refCount === 0 && (c.cleanupTimeout = setTimeout(() => {
        if (c.cleanupTimeout = null, c.refCount > 0) return;
        w == null ? void 0 : w(), A == null ? void 0 : A(), w = null, A = null;
        const l = t.state.actors[s];
        (l == null ? void 0 : l.connection) && l.connection.dispose(), t.setState((g) => {
          const { [s]: v, ...m } = g.actors;
          return { ...g, actors: m };
        }), e.delete(s);
      }, 0));
    };
  };
  return e.set(s, { state: S, key: s, mount: u, create: G$4.bind(void 0, o, t, s), refCount: 0, cleanupTimeout: null }), { mount: u, state: S, key: s };
}
function G$4(o, r, t) {
  const e = r.state.actors[t];
  if (!e) throw new Error(`Actor with key "${t}" not found in store. This indicates a bug in cleanup logic.`);
  E$2(r, t, { connStatus: "connecting", error: null });
  try {
    const n = e.opts.noCreate ? o.get(e.opts.name, e.opts.key, { params: e.opts.params }) : o.getOrCreate(e.opts.name, e.opts.key, { params: e.opts.params, createInRegion: e.opts.createInRegion, createWithInput: e.opts.createWithInput }), i = n.connect();
    E$2(r, t, { handle: n, connection: i }), i.onStatusChange((a) => {
      r.setState((s) => {
        var p;
        return ((p = s.actors[t]) == null ? void 0 : p.connection) === i ? { ...s, actors: { ...s.actors, [t]: { ...s.actors[t], connStatus: a, ...a === "connected" ? { error: null } : {} } } } : s;
      });
    }), i.onError((a) => {
      r.setState((s) => {
        var p;
        return ((p = s.actors[t]) == null ? void 0 : p.connection) !== i ? s : { ...s, actors: { ...s.actors, [t]: { ...s.actors[t], error: a } } };
      });
    });
  } catch (n) {
    console.error("Failed to create actor connection", n), E$2(r, t, { connStatus: "disconnected", error: n });
  }
}
function lt$4({ name: o, key: r, params: t, noCreate: e }) {
  return JSON.stringify({ name: o, key: r, params: t, noCreate: e });
}
function ft$4(o, r) {
  return (0, ct$4.default)(o, r);
}
function pt$4(o, r = {}) {
  const { getOrCreateActor: t } = at$4(o, r);
  function e(n) {
    const { mount: i, state: a } = t(n);
    createRoot(() => {
      i();
    });
    const [s, p] = createSignal(void 0), V = a == null ? void 0 : a.subscribe((u) => {
      p(u.currentVal);
    });
    onCleanup(() => V == null ? void 0 : V());
    function S(u, c) {
      let l = c;
      createEffect(() => {
        l = c;
      }), createEffect(() => {
        var _a;
        const g = s();
        if (!(g == null ? void 0 : g.connection)) return;
        function v(..._) {
          l(..._);
        }
        const m = (_a = g.connection) == null ? void 0 : _a.on(u, v);
        onCleanup(() => m == null ? void 0 : m());
      });
    }
    const L = { connect() {
      var _a, _b;
      (_b = (_a = s()) == null ? void 0 : _a.connection) == null ? void 0 : _b.connect();
    }, get connection() {
      var _a;
      return (_a = s()) == null ? void 0 : _a.connection;
    }, get handle() {
      var _a;
      return (_a = s()) == null ? void 0 : _a.handle;
    }, get isConnected() {
      var _a;
      return ((_a = s()) == null ? void 0 : _a.connStatus) === "connected";
    }, get isConnecting() {
      var _a;
      return ((_a = s()) == null ? void 0 : _a.connStatus) === "connecting";
    }, get isError() {
      var _a;
      return !!((_a = s()) == null ? void 0 : _a.error);
    }, get error() {
      var _a;
      return (_a = s()) == null ? void 0 : _a.error;
    }, get opts() {
      var _a;
      return (_a = s()) == null ? void 0 : _a.opts;
    }, get hash() {
      var _a;
      return (_a = s()) == null ? void 0 : _a.hash;
    } };
    function w(u) {
      var _a;
      const [c, l] = createSignal(u.initialValue), [g, v] = createSignal(true), [m, _] = createSignal(null), I = (_a = u.transform) != null ? _a : ((f, d) => f !== null && d !== null && typeof f == "object" && typeof d == "object" && !Array.isArray(f) && !Array.isArray(d) ? { ...f, ...d } : d);
      return S(u.event, (...f) => {
        const d = f.length === 1 ? f[0] : f;
        l(() => I(c(), d)), v(false), _(null);
      }), createEffect(() => {
        var _a2, _b;
        const f = (_a2 = s()) == null ? void 0 : _a2.connection;
        if (!f) return;
        const d = f[u.action];
        if (typeof d != "function") {
          _(new Error(`Action '${u.action}' not found on actor connection`)), v(false);
          return;
        }
        const x = (_b = u.args) != null ? _b : [];
        Promise.resolve(d.call(f, ...x)).then((h) => {
          l(() => h), v(false);
        }).catch((h) => {
          _(h instanceof Error ? h : new Error(String(h))), v(false);
        });
      }), { get value() {
        return c();
      }, get isLoading() {
        return g();
      }, get error() {
        return m();
      } };
    }
    function A(u) {
      const [c, l] = createSignal(u.initialValue), [g, v] = createSignal(true), [m, _] = createSignal(null), [I, f] = createSignal(0);
      function d() {
        var _a, _b, _c;
        const h = (_a = s()) == null ? void 0 : _a.connection;
        if (!h) return;
        const O = h[u.action];
        if (typeof O != "function") {
          _(new Error(`Action '${u.action}' not found on actor connection`)), v(false);
          return;
        }
        const z = (_c = (_b = u.args) == null ? void 0 : _b.call(u)) != null ? _c : [];
        v(true), Promise.resolve(O.call(h, ...z)).then((y) => {
          l(() => y), v(false), _(null);
        }).catch((y) => {
          _(y instanceof Error ? y : new Error(String(y))), v(false);
        });
      }
      const x = Array.isArray(u.event) ? u.event : [u.event];
      for (const h of x) S(h, () => {
        f((O) => O + 1);
      });
      return createEffect(() => {
        var _a, _b;
        const h = (_a = s()) == null ? void 0 : _a.connection;
        (_b = u.args) == null ? void 0 : _b.call(u), I(), h && d();
      }), { get value() {
        return c();
      }, get isLoading() {
        return g();
      }, get error() {
        return m();
      }, refetch: d };
    }
    return { current: L, useEvent: S, useQuery: w, useActionQuery: A };
  }
  return { useActor: e };
}
const dt$4 = typeof globalThis.document < "u", ht$4 = dt$4 ? `${location.origin}/api/rivet` : "http://localhost:3000/api/rivet", vt$4 = createClient(ht$4), { useActor: bt$4 } = pt$4(vt$4);

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
function Ar(e, t) {
  const r = (e || "").split(";").filter((c) => typeof c == "string" && !!c.trim()), n = r.shift() || "", s = _r(n), i = s.name;
  let o = s.value;
  try {
    o = (t == null ? void 0 : t.decode) === false ? o : ((t == null ? void 0 : t.decode) || decodeURIComponent)(o);
  } catch {
  }
  const u = { name: i, value: o };
  for (const c of r) {
    const l = c.split("="), p = (l.shift() || "").trimStart().toLowerCase(), d = l.join("=");
    switch (p) {
      case "expires": {
        u.expires = new Date(d);
        break;
      }
      case "max-age": {
        u.maxAge = Number.parseInt(d, 10);
        break;
      }
      case "secure": {
        u.secure = true;
        break;
      }
      case "httponly": {
        u.httpOnly = true;
        break;
      }
      case "samesite": {
        u.sameSite = d;
        break;
      }
      default:
        u[p] = d;
    }
  }
  return u;
}
function _r(e) {
  let t = "", r = "";
  const n = e.split("=");
  return n.length > 1 ? (t = n.shift(), r = n.join("=")) : r = e, { name: t, value: r };
}
const ce$1 = "Invariant Violation", { setPrototypeOf: xr = function(e, t) {
  return e.__proto__ = t, e;
} } = Object;
let ve$1 = class ve extends Error {
  constructor(t = ce$1) {
    super(typeof t == "number" ? `${ce$1}: ${t} (see https://github.com/apollographql/invariant-packages)` : t);
    __publicField$1(this, "framesToPop", 1);
    __publicField$1(this, "name", ce$1);
    xr(this, ve.prototype);
  }
};
function $r(e, t) {
  if (!e) throw new ve$1(t);
}
const M$2 = { NORMAL: 0, WILDCARD: 1, PLACEHOLDER: 2 };
function zr(e = {}) {
  const t = { options: e, rootNode: ut$2(), staticRoutesMap: {} }, r = (n) => e.strictTrailingSlash ? n : n.replace(/\/$/, "") || "/";
  if (e.routes) for (const n in e.routes) Fe$1(t, r(n), e.routes[n]);
  return { ctx: t, lookup: (n) => Or(t, r(n)), insert: (n, s) => Fe$1(t, r(n), s), remove: (n) => Pr(t, r(n)) };
}
function Or(e, t) {
  const r = e.staticRoutesMap[t];
  if (r) return r.data;
  const n = t.split("/"), s = {};
  let i = false, o = null, u = e.rootNode, c = null;
  for (let l = 0; l < n.length; l++) {
    const p = n[l];
    u.wildcardChildNode !== null && (o = u.wildcardChildNode, c = n.slice(l).join("/"));
    const d = u.children.get(p);
    if (d === void 0) {
      if (u && u.placeholderChildren.length > 1) {
        const w = n.length - l;
        u = u.placeholderChildren.find((f) => f.maxDepth === w) || null;
      } else u = u.placeholderChildren[0] || null;
      if (!u) break;
      u.paramName && (s[u.paramName] = p), i = true;
    } else u = d;
  }
  return (u === null || u.data === null) && o !== null && (u = o, s[u.paramName || "_"] = c, i = true), u ? i ? { ...u.data, params: i ? s : void 0 } : u.data : null;
}
function Fe$1(e, t, r) {
  let n = true;
  const s = t.split("/");
  let i = e.rootNode, o = 0;
  const u = [i];
  for (const c of s) {
    let l;
    if (l = i.children.get(c)) i = l;
    else {
      const p = Cr(c);
      l = ut$2({ type: p, parent: i }), i.children.set(c, l), p === M$2.PLACEHOLDER ? (l.paramName = c === "*" ? `_${o++}` : c.slice(1), i.placeholderChildren.push(l), n = false) : p === M$2.WILDCARD && (i.wildcardChildNode = l, l.paramName = c.slice(3) || "_", n = false), u.push(l), i = l;
    }
  }
  for (const [c, l] of u.entries()) l.maxDepth = Math.max(u.length - c, l.maxDepth || 0);
  return i.data = r, n === true && (e.staticRoutesMap[t] = i), i;
}
function Pr(e, t) {
  let r = false;
  const n = t.split("/");
  let s = e.rootNode;
  for (const i of n) if (s = s.children.get(i), !s) return r;
  if (s.data) {
    const i = n.at(-1) || "";
    s.data = null, Object.keys(s.children).length === 0 && s.parent && (s.parent.children.delete(i), s.parent.wildcardChildNode = null, s.parent.placeholderChildren = []), r = true;
  }
  return r;
}
function ut$2(e = {}) {
  return { type: e.type || M$2.NORMAL, maxDepth: 0, parent: e.parent || null, children: /* @__PURE__ */ new Map(), data: e.data || null, paramName: e.paramName || null, wildcardChildNode: null, placeholderChildren: [] };
}
function Cr(e) {
  return e.startsWith("**") ? M$2.WILDCARD : e[0] === ":" || e === "*" ? M$2.PLACEHOLDER : M$2.NORMAL;
}
const Ir = en$2(async () => {
  const e = await q$5(vt$4, { actor: "counter", key: ["test-counter"], action: "getCount", event: "newCount" }), t = await q$5(vt$4, { actor: "counter", key: ["test-counter"], action: "getCountDouble", event: "newDoubleCount" });
  return { count: e, countDouble: t };
}, "src_routes_ssr_tsx--getCounterData_cache", "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/ssr.tsx?pick=route&tsr-directive-use-server="), Nr = an$1(Ir, "counter-data"), Lr = { preload: () => Nr() }, ct$3 = [{ page: false, $DELETE: { src: "src/routes/api/rivet/[...rest].ts?pick=DELETE", build: () => import('../build/_...rest_.mjs'), import: () => import('../build/_...rest_.mjs') }, $GET: { src: "src/routes/api/rivet/[...rest].ts?pick=GET", build: () => import('../build/_...rest_2.mjs'), import: () => import('../build/_...rest_2.mjs') }, $HEAD: { src: "src/routes/api/rivet/[...rest].ts?pick=HEAD", build: () => import('../build/_...rest_3.mjs'), import: () => import('../build/_...rest_3.mjs') }, $OPTIONS: { src: "src/routes/api/rivet/[...rest].ts?pick=OPTIONS", build: () => import('../build/_...rest_4.mjs'), import: () => import('../build/_...rest_4.mjs') }, $PATCH: { src: "src/routes/api/rivet/[...rest].ts?pick=PATCH", build: () => import('../build/_...rest_5.mjs'), import: () => import('../build/_...rest_5.mjs') }, $POST: { src: "src/routes/api/rivet/[...rest].ts?pick=POST", build: () => import('../build/_...rest_6.mjs'), import: () => import('../build/_...rest_6.mjs') }, $PUT: { src: "src/routes/api/rivet/[...rest].ts?pick=PUT", build: () => import('../build/_...rest_7.mjs'), import: () => import('../build/_...rest_7.mjs') }, path: "/api/rivet/*rest", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/api/rivet/[...rest].ts" }, { page: true, $component: { src: "src/routes/index.tsx?pick=default&pick=$css", build: () => import('../build/index.mjs'), import: () => import('../build/index.mjs') }, path: "/", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/index.tsx" }, { page: true, $component: { src: "src/routes/ssr.tsx?pick=default&pick=$css", build: () => import('../build/ssr.mjs'), import: () => import('../build/ssr.mjs') }, $$route: { require: () => ({ route: Lr }), src: "src/routes/ssr.tsx?pick=route" }, path: "/ssr", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/ssr.tsx" }], Dr = Tr(ct$3.filter((e) => e.page));
function Tr(e) {
  function t(r, n, s, i) {
    const o = Object.values(r).find((u) => s.startsWith(u.id + "/"));
    return o ? (t(o.children || (o.children = []), n, s.slice(o.id.length)), r) : (r.push({ ...n, id: s, path: s.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), r);
  }
  return e.sort((r, n) => r.path.length - n.path.length).reduce((r, n) => t(r, n, n.path, n.path), []);
}
function Ur(e) {
  return e.$HEAD || e.$GET || e.$POST || e.$PUT || e.$PATCH || e.$DELETE;
}
zr({ routes: ct$3.reduce((e, t) => {
  if (!Ur(t)) return e;
  let r = t.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (n, s) => `**:${s}`).split("/").map((n) => n.startsWith(":") || n.startsWith("*") ? n : encodeURIComponent(n)).join("/");
  if (/:[^/]*\?/g.test(r)) throw new Error(`Optional parameters are not supported in API routes: ${r}`);
  if (e[r]) throw new Error(`Duplicate API routes for "${r}" found at "${e[r].route.path}" and "${t.path}"`);
  return e[r] = { route: t }, e;
}, {}) });
var jr = " ";
const Mr = { style: (e) => ssrElement("style", e.attrs, () => e.children, true), link: (e) => ssrElement("link", e.attrs, void 0, true), script: (e) => e.attrs.src ? ssrElement("script", mergeProps(() => e.attrs, { get id() {
  return e.key;
} }), () => ssr(jr), true) : null, noscript: (e) => ssrElement("noscript", e.attrs, () => escape(e.children), true) };
function qr(e, t) {
  let { tag: r, attrs: { key: n, ...s } = { key: void 0 }, children: i } = e;
  return Mr[r]({ attrs: { ...s, nonce: t }, key: n, children: i });
}
function Hr(e, t, r, n = "default") {
  return lazy(async () => {
    var _a2;
    {
      const i = (await e.import())[n], u = (await ((_a2 = t.inputs) == null ? void 0 : _a2[e.src].assets())).filter((l) => l.tag === "style" || l.attrs.rel === "stylesheet");
      return { default: (l) => [...u.map((p) => qr(p)), createComponent(i, l)] };
    }
  });
}
function lt$3() {
  function e(r) {
    return { ...r, ...r.$$route ? r.$$route.require().route : void 0, info: { ...r.$$route ? r.$$route.require().route.info : {}, filesystem: true }, component: r.$component && Hr(r.$component, globalThis.MANIFEST.client, globalThis.MANIFEST.ssr), children: r.children ? r.children.map(e) : void 0 };
  }
  return Dr.map(e);
}
let je$1;
const wo = isServer ? () => getRequestEvent().routes : () => je$1 || (je$1 = lt$3());
function Br(e) {
  const t = Xt$2(e.nativeEvent, "flash");
  if (t) try {
    let r = JSON.parse(t);
    if (!r || !r.result) return;
    const n = [...r.input.slice(0, -1), new Map(r.input[r.input.length - 1])], s = r.error ? new Error(r.result) : r.result;
    return { input: n, url: r.url, pending: false, result: r.thrown ? void 0 : s, error: r.thrown ? s : void 0 };
  } catch (r) {
    console.error(r);
  } finally {
    Yt$2(e.nativeEvent, "flash", "", { maxAge: 0 });
  }
}
async function Vr(e) {
  const t = globalThis.MANIFEST.client;
  return globalThis.MANIFEST.ssr, e.response.headers.set("Content-Type", "text/html"), Object.assign(e, { manifest: await t.json(), assets: [...await t.inputs[t.handler].assets()], router: { submission: Br(e) }, routes: lt$3(), complete: false, $islands: /* @__PURE__ */ new Set() });
}
const Wr = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function Gr(e) {
  return e.status && Wr.has(e.status) ? e.status : 302;
}
const Xr = { "src_routes_ssr_tsx--getCounterData_cache": { functionName: "getCounterData_cache", importer: () => import('../build/ssr-GlLJj5UT.mjs') } };
var ft$3 = ((e) => (e[e.AggregateError = 1] = "AggregateError", e[e.ArrowFunction = 2] = "ArrowFunction", e[e.ErrorPrototypeStack = 4] = "ErrorPrototypeStack", e[e.ObjectAssign = 8] = "ObjectAssign", e[e.BigIntTypedArray = 16] = "BigIntTypedArray", e[e.RegExp = 32] = "RegExp", e))(ft$3 || {}), A$1 = Symbol.asyncIterator, pt$3 = Symbol.hasInstance, q$3 = Symbol.isConcatSpreadable, _ = Symbol.iterator, dt$3 = Symbol.match, ht$3 = Symbol.matchAll, mt$2 = Symbol.replace, gt$2 = Symbol.search, bt$3 = Symbol.species, yt$2 = Symbol.split, wt$2 = Symbol.toPrimitive, H$2 = Symbol.toStringTag, vt$3 = Symbol.unscopables, Jr = { 0: "Symbol.asyncIterator", 1: "Symbol.hasInstance", 2: "Symbol.isConcatSpreadable", 3: "Symbol.iterator", 4: "Symbol.match", 5: "Symbol.matchAll", 6: "Symbol.replace", 7: "Symbol.search", 8: "Symbol.species", 9: "Symbol.split", 10: "Symbol.toPrimitive", 11: "Symbol.toStringTag", 12: "Symbol.unscopables" }, Et$2 = { [A$1]: 0, [pt$3]: 1, [q$3]: 2, [_]: 3, [dt$3]: 4, [ht$3]: 5, [mt$2]: 6, [gt$2]: 7, [bt$3]: 8, [yt$2]: 9, [wt$2]: 10, [H$2]: 11, [vt$3]: 12 }, Yr = { 0: A$1, 1: pt$3, 2: q$3, 3: _, 4: dt$3, 5: ht$3, 6: mt$2, 7: gt$2, 8: bt$3, 9: yt$2, 10: wt$2, 11: H$2, 12: vt$3 }, Kr = { 2: "!0", 3: "!1", 1: "void 0", 0: "null", 4: "-0", 5: "1/0", 6: "-1/0", 7: "0/0" }, a = void 0, Qr = { 2: true, 3: false, 1: a, 0: null, 4: -0, 5: Number.POSITIVE_INFINITY, 6: Number.NEGATIVE_INFINITY, 7: Number.NaN }, St$2 = { 0: "Error", 1: "EvalError", 2: "RangeError", 3: "ReferenceError", 4: "SyntaxError", 5: "TypeError", 6: "URIError" }, Zr = { 0: Error, 1: EvalError, 2: RangeError, 3: ReferenceError, 4: SyntaxError, 5: TypeError, 6: URIError };
function m(e, t, r, n, s, i, o, u, c, l, p, d) {
  return { t: e, i: t, s: r, c: n, m: s, p: i, e: o, a: u, f: c, b: l, o: p, l: d };
}
function O(e) {
  return m(2, a, e, a, a, a, a, a, a, a, a, a);
}
var kt$2 = O(2), Rt$2 = O(3), en$1 = O(1), tn$1 = O(0), rn$1 = O(4), nn$1 = O(5), an = O(6), sn$1 = O(7);
function on$1(e) {
  switch (e) {
    case '"':
      return '\\"';
    case "\\":
      return "\\\\";
    case `
`:
      return "\\n";
    case "\r":
      return "\\r";
    case "\b":
      return "\\b";
    case "	":
      return "\\t";
    case "\f":
      return "\\f";
    case "<":
      return "\\x3C";
    case "\u2028":
      return "\\u2028";
    case "\u2029":
      return "\\u2029";
    default:
      return a;
  }
}
function k$3(e) {
  let t = "", r = 0, n;
  for (let s = 0, i = e.length; s < i; s++) n = on$1(e[s]), n && (t += e.slice(r, s) + n, r = s + 1);
  return r === 0 ? t = e : t += e.slice(r), t;
}
function un(e) {
  switch (e) {
    case "\\\\":
      return "\\";
    case '\\"':
      return '"';
    case "\\n":
      return `
`;
    case "\\r":
      return "\r";
    case "\\b":
      return "\b";
    case "\\t":
      return "	";
    case "\\f":
      return "\f";
    case "\\x3C":
      return "<";
    case "\\u2028":
      return "\u2028";
    case "\\u2029":
      return "\u2029";
    default:
      return e;
  }
}
function N$3(e) {
  return e.replace(/(\\\\|\\"|\\n|\\r|\\b|\\t|\\f|\\u2028|\\u2029|\\x3C)/g, un);
}
var G$3 = "__SEROVAL_REFS__", ne = "$R", re$1 = `self.${ne}`;
function cn(e) {
  return e == null ? `${re$1}=${re$1}||[]` : `(${re$1}=${re$1}||{})["${k$3(e)}"]=[]`;
}
var At$2 = /* @__PURE__ */ new Map(), j$2 = /* @__PURE__ */ new Map();
function _t$1(e) {
  return At$2.has(e);
}
function ln(e) {
  return j$2.has(e);
}
function fn(e) {
  if (_t$1(e)) return At$2.get(e);
  throw new jn(e);
}
function pn(e) {
  if (ln(e)) return j$2.get(e);
  throw new Mn(e);
}
typeof globalThis < "u" ? Object.defineProperty(globalThis, G$3, { value: j$2, configurable: true, writable: false, enumerable: false }) : typeof self < "u" ? Object.defineProperty(self, G$3, { value: j$2, configurable: true, writable: false, enumerable: false }) : typeof global < "u" && Object.defineProperty(global, G$3, { value: j$2, configurable: true, writable: false, enumerable: false });
function Ee(e) {
  return e instanceof EvalError ? 1 : e instanceof RangeError ? 2 : e instanceof ReferenceError ? 3 : e instanceof SyntaxError ? 4 : e instanceof TypeError ? 5 : e instanceof URIError ? 6 : 0;
}
function dn(e) {
  let t = St$2[Ee(e)];
  return e.name !== t ? { name: e.name } : e.constructor.name !== t ? { name: e.constructor.name } : {};
}
function xt$1(e, t) {
  let r = dn(e), n = Object.getOwnPropertyNames(e);
  for (let s = 0, i = n.length, o; s < i; s++) o = n[s], o !== "name" && o !== "message" && (o === "stack" ? t & 4 && (r = r || {}, r[o] = e[o]) : (r = r || {}, r[o] = e[o]));
  return r;
}
function $t$2(e) {
  return Object.isFrozen(e) ? 3 : Object.isSealed(e) ? 2 : Object.isExtensible(e) ? 0 : 1;
}
function hn(e) {
  switch (e) {
    case Number.POSITIVE_INFINITY:
      return nn$1;
    case Number.NEGATIVE_INFINITY:
      return an;
  }
  return e !== e ? sn$1 : Object.is(e, -0) ? rn$1 : m(0, a, e, a, a, a, a, a, a, a, a, a);
}
function zt(e) {
  return m(1, a, k$3(e), a, a, a, a, a, a, a, a, a);
}
function mn(e) {
  return m(3, a, "" + e, a, a, a, a, a, a, a, a, a);
}
function gn(e) {
  return m(4, e, a, a, a, a, a, a, a, a, a, a);
}
function bn(e, t) {
  let r = t.valueOf();
  return m(5, e, r !== r ? "" : t.toISOString(), a, a, a, a, a, a, a, a, a);
}
function yn(e, t) {
  return m(6, e, a, k$3(t.source), t.flags, a, a, a, a, a, a, a);
}
function wn(e, t) {
  return m(17, e, Et$2[t], a, a, a, a, a, a, a, a, a);
}
function vn(e, t) {
  return m(18, e, k$3(fn(t)), a, a, a, a, a, a, a, a, a);
}
function Ot$1(e, t, r) {
  return m(25, e, r, k$3(t), a, a, a, a, a, a, a, a);
}
function En(e, t, r) {
  return m(9, e, a, a, a, a, a, r, a, a, $t$2(t), a);
}
function Sn(e, t) {
  return m(21, e, a, a, a, a, a, a, t, a, a, a);
}
function kn(e, t, r) {
  return m(15, e, a, t.constructor.name, a, a, a, a, r, t.byteOffset, a, t.length);
}
function Rn(e, t, r) {
  return m(16, e, a, t.constructor.name, a, a, a, a, r, t.byteOffset, a, t.byteLength);
}
function An(e, t, r) {
  return m(20, e, a, a, a, a, a, a, r, t.byteOffset, a, t.byteLength);
}
function _n(e, t, r) {
  return m(13, e, Ee(t), a, k$3(t.message), r, a, a, a, a, a, a);
}
function xn(e, t, r) {
  return m(14, e, Ee(t), a, k$3(t.message), r, a, a, a, a, a, a);
}
function $n(e, t) {
  return m(7, e, a, a, a, a, a, t, a, a, a, a);
}
function zn(e, t) {
  return m(28, a, a, a, a, a, a, [e, t], a, a, a, a);
}
function On(e, t) {
  return m(30, a, a, a, a, a, a, [e, t], a, a, a, a);
}
function Pn(e, t, r) {
  return m(31, e, a, a, a, a, a, r, t, a, a, a);
}
function Cn(e, t) {
  return m(32, e, a, a, a, a, a, a, t, a, a, a);
}
function In(e, t) {
  return m(33, e, a, a, a, a, a, a, t, a, a, a);
}
function Nn(e, t) {
  return m(34, e, a, a, a, a, a, a, t, a, a, a);
}
function Ln(e, t, r, n) {
  return m(35, e, r, a, a, a, a, t, a, a, a, n);
}
var Dn = { parsing: 1, serialization: 2, deserialization: 3 };
function Tn(e) {
  return `Seroval Error (step: ${Dn[e]})`;
}
var Un = (e, t) => Tn(e), Pt$2 = class Pt extends Error {
  constructor(e, t) {
    super(Un(e)), this.cause = t;
  }
}, Me = class extends Pt$2 {
  constructor(e) {
    super("parsing", e);
  }
}, Fn = class extends Pt$2 {
  constructor(e) {
    super("deserialization", e);
  }
};
function x(e) {
  return `Seroval Error (specific: ${e})`;
}
var ae$1 = class ae extends Error {
  constructor(t) {
    super(x(1)), this.value = t;
  }
}, L = class extends Error {
  constructor(t) {
    super(x(2));
  }
}, Ct$2 = class Ct extends Error {
  constructor(e) {
    super(x(3));
  }
}, Q$2 = class Q extends Error {
  constructor(t) {
    super(x(4));
  }
}, jn = class extends Error {
  constructor(e) {
    super(x(5)), this.value = e;
  }
}, Mn = class extends Error {
  constructor(e) {
    super(x(6));
  }
}, qn = class extends Error {
  constructor(e) {
    super(x(7));
  }
}, P$1 = class P extends Error {
  constructor(t) {
    super(x(8));
  }
}, It$1 = class It extends Error {
  constructor(t) {
    super(x(9));
  }
}, Hn = class {
  constructor(t, r) {
    this.value = t, this.replacement = r;
  }
}, se$1 = () => {
  let e = { p: 0, s: 0, f: 0 };
  return e.p = new Promise((t, r) => {
    e.s = t, e.f = r;
  }), e;
}, Bn = (e, t) => {
  e.s(t), e.p.s = 1, e.p.v = t;
}, Vn = (e, t) => {
  e.f(t), e.p.s = 2, e.p.v = t;
}, Wn = se$1.toString(), Gn = Bn.toString(), Xn = Vn.toString(), Nt = () => {
  let e = [], t = [], r = true, n = false, s = 0, i = (c, l, p) => {
    for (p = 0; p < s; p++) t[p] && t[p][l](c);
  }, o = (c, l, p, d) => {
    for (l = 0, p = e.length; l < p; l++) d = e[l], !r && l === p - 1 ? c[n ? "return" : "throw"](d) : c.next(d);
  }, u = (c, l) => (r && (l = s++, t[l] = c), o(c), () => {
    r && (t[l] = t[s], t[s--] = void 0);
  });
  return { __SEROVAL_STREAM__: true, on: (c) => u(c), next: (c) => {
    r && (e.push(c), i(c, "next"));
  }, throw: (c) => {
    r && (e.push(c), i(c, "throw"), r = false, n = false, t.length = 0);
  }, return: (c) => {
    r && (e.push(c), i(c, "return"), r = false, n = true, t.length = 0);
  } };
}, Jn = Nt.toString(), Lt$2 = (e) => (t) => () => {
  let r = 0, n = { [e]: () => n, next: () => {
    if (r > t.d) return { done: true, value: void 0 };
    let s = r++, i = t.v[s];
    if (s === t.t) throw i;
    return { done: s === t.d, value: i };
  } };
  return n;
}, Yn = Lt$2.toString(), Dt = (e, t) => (r) => () => {
  let n = 0, s = -1, i = false, o = [], u = [], c = (p = 0, d = u.length) => {
    for (; p < d; p++) u[p].s({ done: true, value: void 0 });
  };
  r.on({ next: (p) => {
    let d = u.shift();
    d && d.s({ done: false, value: p }), o.push(p);
  }, throw: (p) => {
    let d = u.shift();
    d && d.f(p), c(), s = o.length, i = true, o.push(p);
  }, return: (p) => {
    let d = u.shift();
    d && d.s({ done: true, value: p }), c(), s = o.length, o.push(p);
  } });
  let l = { [e]: () => l, next: () => {
    if (s === -1) {
      let w = n++;
      if (w >= o.length) {
        let f = t();
        return u.push(f), f.p;
      }
      return { done: false, value: o[w] };
    }
    if (n > s) return { done: true, value: void 0 };
    let p = n++, d = o[p];
    if (p !== s) return { done: false, value: d };
    if (i) throw d;
    return { done: true, value: d };
  } };
  return l;
}, Kn = Dt.toString(), Tt$2 = (e) => {
  let t = atob(e), r = t.length, n = new Uint8Array(r);
  for (let s = 0; s < r; s++) n[s] = t.charCodeAt(s);
  return n.buffer;
}, Qn = Tt$2.toString();
function Zn(e) {
  return "__SEROVAL_SEQUENCE__" in e;
}
function Ut$1(e, t, r) {
  return { __SEROVAL_SEQUENCE__: true, v: e, t, d: r };
}
function ea(e) {
  let t = [], r = -1, n = -1, s = e[_]();
  for (; ; ) try {
    let i = s.next();
    if (t.push(i.value), i.done) {
      n = t.length - 1;
      break;
    }
  } catch (i) {
    r = t.length, t.push(i);
  }
  return Ut$1(t, r, n);
}
var ta = Lt$2(_);
function ra(e) {
  return ta(e);
}
var na = {}, aa = {}, sa = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {} }, ia = { 0: "[]", 1: Wn, 2: Gn, 3: Xn, 4: Jn, 5: Qn };
function ie$1(e) {
  return "__SEROVAL_STREAM__" in e;
}
function Z$2() {
  return Nt();
}
function oa(e) {
  let t = Z$2(), r = e[A$1]();
  async function n() {
    try {
      let s = await r.next();
      s.done ? t.return(s.value) : (t.next(s.value), await n());
    } catch (s) {
      t.throw(s);
    }
  }
  return n().catch(() => {
  }), t;
}
var ua = Dt(A$1, se$1);
function ca(e) {
  return ua(e);
}
function la(e, t) {
  return { plugins: t.plugins, mode: e, marked: /* @__PURE__ */ new Set(), features: 63 ^ (t.disabledFeatures || 0), refs: t.refs || /* @__PURE__ */ new Map(), depthLimit: t.depthLimit || 1e3 };
}
function fa(e, t) {
  e.marked.add(t);
}
function Ft$1(e, t) {
  let r = e.refs.size;
  return e.refs.set(t, r), r;
}
function oe$1(e, t) {
  let r = e.refs.get(t);
  return r != null ? (fa(e, r), { type: 1, value: gn(r) }) : { type: 0, value: Ft$1(e, t) };
}
function Se(e, t) {
  let r = oe$1(e, t);
  return r.type === 1 ? r : _t$1(t) ? { type: 2, value: vn(r.value, t) } : r;
}
function C$1(e, t) {
  let r = Se(e, t);
  if (r.type !== 0) return r.value;
  if (t in Et$2) return wn(r.value, t);
  throw new ae$1(t);
}
function D$3(e, t) {
  let r = oe$1(e, sa[t]);
  return r.type === 1 ? r.value : m(26, r.value, t, a, a, a, a, a, a, a, a, a);
}
function pa(e) {
  let t = oe$1(e, na);
  return t.type === 1 ? t.value : m(27, t.value, a, a, a, a, a, a, C$1(e, _), a, a, a);
}
function da(e) {
  let t = oe$1(e, aa);
  return t.type === 1 ? t.value : m(29, t.value, a, a, a, a, a, [D$3(e, 1), C$1(e, A$1)], a, a, a, a);
}
function ha(e, t, r, n) {
  return m(r ? 11 : 10, e, a, a, a, n, a, a, a, a, $t$2(t), a);
}
function ma(e, t, r, n) {
  return m(8, t, a, a, a, a, { k: r, v: n }, a, D$3(e, 0), a, a, a);
}
function ga(e, t, r) {
  return m(22, t, r, a, a, a, a, a, D$3(e, 1), a, a, a);
}
function ba(e, t, r) {
  let n = new Uint8Array(r), s = "";
  for (let i = 0, o = n.length; i < o; i++) s += String.fromCharCode(n[i]);
  return m(19, t, k$3(btoa(s)), a, a, a, a, a, D$3(e, 5), a, a, a);
}
var ya = ((e) => (e[e.Vanilla = 1] = "Vanilla", e[e.Cross = 2] = "Cross", e))(ya || {});
function jt$2(e, t) {
  for (let r = 0, n = t.length; r < n; r++) {
    let s = t[r];
    e.has(s) || (e.add(s), s.extends && jt$2(e, s.extends));
  }
}
function ke(e) {
  if (e) {
    let t = /* @__PURE__ */ new Set();
    return jt$2(t, e), [...t];
  }
}
function wa(e) {
  switch (e) {
    case "Int8Array":
      return Int8Array;
    case "Int16Array":
      return Int16Array;
    case "Int32Array":
      return Int32Array;
    case "Uint8Array":
      return Uint8Array;
    case "Uint16Array":
      return Uint16Array;
    case "Uint32Array":
      return Uint32Array;
    case "Uint8ClampedArray":
      return Uint8ClampedArray;
    case "Float32Array":
      return Float32Array;
    case "Float64Array":
      return Float64Array;
    case "BigInt64Array":
      return BigInt64Array;
    case "BigUint64Array":
      return BigUint64Array;
    default:
      throw new qn(e);
  }
}
var va = 1e6, Ea = 1e4, Sa = 2e4;
function Mt$1(e, t) {
  switch (t) {
    case 3:
      return Object.freeze(e);
    case 1:
      return Object.preventExtensions(e);
    case 2:
      return Object.seal(e);
    default:
      return e;
  }
}
var ka = 1e3;
function Ra(e, t) {
  var r;
  return { mode: e, plugins: t.plugins, refs: t.refs || /* @__PURE__ */ new Map(), features: (r = t.features) != null ? r : 63 ^ (t.disabledFeatures || 0), depthLimit: t.depthLimit || ka };
}
function Aa(e) {
  return { mode: 1, base: Ra(1, e), child: a, state: { marked: new Set(e.markedRefs) } };
}
var _a = class {
  constructor(e, t) {
    this._p = e, this.depth = t;
  }
  deserialize(e) {
    return b(this._p, this.depth, e);
  }
};
function qt$1(e, t) {
  if (t < 0 || !Number.isFinite(t) || !Number.isInteger(t)) throw new P$1({ t: 4, i: t });
  if (e.refs.has(t)) throw new Error("Conflicted ref id: " + t);
}
function xa(e, t, r) {
  return qt$1(e.base, t), e.state.marked.has(t) && e.base.refs.set(t, r), r;
}
function $a(e, t, r) {
  return qt$1(e.base, t), e.base.refs.set(t, r), r;
}
function y(e, t, r) {
  return e.mode === 1 ? xa(e, t, r) : $a(e, t, r);
}
function ge$1(e, t, r) {
  if (Object.hasOwn(t, r)) return t[r];
  throw new P$1(e);
}
function za(e, t) {
  return y(e, t.i, pn(N$3(t.s)));
}
function Oa(e, t, r) {
  let n = r.a, s = n.length, i = y(e, r.i, new Array(s));
  for (let o = 0, u; o < s; o++) u = n[o], u && (i[o] = b(e, t, u));
  return Mt$1(i, r.o), i;
}
function Pa(e) {
  switch (e) {
    case "constructor":
    case "__proto__":
    case "prototype":
    case "__defineGetter__":
    case "__defineSetter__":
    case "__lookupGetter__":
    case "__lookupSetter__":
      return false;
    default:
      return true;
  }
}
function Ca(e) {
  switch (e) {
    case A$1:
    case q$3:
    case H$2:
    case _:
      return true;
    default:
      return false;
  }
}
function qe$1(e, t, r) {
  Pa(t) ? e[t] = r : Object.defineProperty(e, t, { value: r, configurable: true, enumerable: true, writable: true });
}
function Ia(e, t, r, n, s) {
  if (typeof n == "string") qe$1(r, n, b(e, t, s));
  else {
    let i = b(e, t, n);
    switch (typeof i) {
      case "string":
        qe$1(r, i, b(e, t, s));
        break;
      case "symbol":
        Ca(i) && (r[i] = b(e, t, s));
        break;
      default:
        throw new P$1(n);
    }
  }
}
function Ht$1(e, t, r, n) {
  let s = r.k;
  if (s.length > 0) for (let i = 0, o = r.v, u = s.length; i < u; i++) Ia(e, t, n, s[i], o[i]);
  return n;
}
function Na(e, t, r) {
  let n = y(e, r.i, r.t === 10 ? {} : /* @__PURE__ */ Object.create(null));
  return Ht$1(e, t, r.p, n), Mt$1(n, r.o), n;
}
function La(e, t) {
  return y(e, t.i, new Date(t.s));
}
function Da(e, t) {
  if (e.base.features & 32) {
    let r = N$3(t.c);
    if (r.length > Sa) throw new P$1(t);
    return y(e, t.i, new RegExp(r, t.m));
  }
  throw new L(t);
}
function Ta(e, t, r) {
  let n = y(e, r.i, /* @__PURE__ */ new Set());
  for (let s = 0, i = r.a, o = i.length; s < o; s++) n.add(b(e, t, i[s]));
  return n;
}
function Ua(e, t, r) {
  let n = y(e, r.i, /* @__PURE__ */ new Map());
  for (let s = 0, i = r.e.k, o = r.e.v, u = i.length; s < u; s++) n.set(b(e, t, i[s]), b(e, t, o[s]));
  return n;
}
function Fa(e, t) {
  if (t.s.length > va) throw new P$1(t);
  return y(e, t.i, Tt$2(N$3(t.s)));
}
function ja(e, t, r) {
  var n;
  let s = wa(r.c), i = b(e, t, r.f), o = (n = r.b) != null ? n : 0;
  if (o < 0 || o > i.byteLength) throw new P$1(r);
  return y(e, r.i, new s(i, o, r.l));
}
function Ma(e, t, r) {
  var n;
  let s = b(e, t, r.f), i = (n = r.b) != null ? n : 0;
  if (i < 0 || i > s.byteLength) throw new P$1(r);
  return y(e, r.i, new DataView(s, i, r.l));
}
function Bt$1(e, t, r, n) {
  if (r.p) {
    let s = Ht$1(e, t, r.p, {});
    Object.defineProperties(n, Object.getOwnPropertyDescriptors(s));
  }
  return n;
}
function qa(e, t, r) {
  let n = y(e, r.i, new AggregateError([], N$3(r.m)));
  return Bt$1(e, t, r, n);
}
function Ha(e, t, r) {
  let n = ge$1(r, Zr, r.s), s = y(e, r.i, new n(N$3(r.m)));
  return Bt$1(e, t, r, s);
}
function Ba(e, t, r) {
  let n = se$1(), s = y(e, r.i, n.p), i = b(e, t, r.f);
  return r.s ? n.s(i) : n.f(i), s;
}
function Va(e, t, r) {
  return y(e, r.i, Object(b(e, t, r.f)));
}
function Wa(e, t, r) {
  let n = e.base.plugins;
  if (n) {
    let s = N$3(r.c);
    for (let i = 0, o = n.length; i < o; i++) {
      let u = n[i];
      if (u.tag === s) return y(e, r.i, u.deserialize(r.s, new _a(e, t), { id: r.i }));
    }
  }
  throw new Ct$2(r.c);
}
function Ga(e, t) {
  return y(e, t.i, y(e, t.s, se$1()).p);
}
function Xa(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n) return n.s(b(e, t, r.a[1])), a;
  throw new Q$2("Promise");
}
function Ja(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n) return n.f(b(e, t, r.a[1])), a;
  throw new Q$2("Promise");
}
function Ya(e, t, r) {
  b(e, t, r.a[0]);
  let n = b(e, t, r.a[1]);
  return ra(n);
}
function Ka(e, t, r) {
  b(e, t, r.a[0]);
  let n = b(e, t, r.a[1]);
  return ca(n);
}
function Qa(e, t, r) {
  let n = y(e, r.i, Z$2()), s = r.a, i = s.length;
  if (i) for (let o = 0; o < i; o++) b(e, t, s[o]);
  return n;
}
function Za(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n && ie$1(n)) return n.next(b(e, t, r.f)), a;
  throw new Q$2("Stream");
}
function es(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n && ie$1(n)) return n.throw(b(e, t, r.f)), a;
  throw new Q$2("Stream");
}
function ts(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n && ie$1(n)) return n.return(b(e, t, r.f)), a;
  throw new Q$2("Stream");
}
function rs(e, t, r) {
  return b(e, t, r.f), a;
}
function ns(e, t, r) {
  return b(e, t, r.a[1]), a;
}
function as(e, t, r) {
  let n = y(e, r.i, Ut$1([], r.s, r.l));
  for (let s = 0, i = r.a.length; s < i; s++) n.v[s] = b(e, t, r.a[s]);
  return n;
}
function b(e, t, r) {
  if (t > e.base.depthLimit) throw new It$1(e.base.depthLimit);
  switch (t += 1, r.t) {
    case 2:
      return ge$1(r, Qr, r.s);
    case 0:
      return Number(r.s);
    case 1:
      return N$3(String(r.s));
    case 3:
      if (String(r.s).length > Ea) throw new P$1(r);
      return BigInt(r.s);
    case 4:
      return e.base.refs.get(r.i);
    case 18:
      return za(e, r);
    case 9:
      return Oa(e, t, r);
    case 10:
    case 11:
      return Na(e, t, r);
    case 5:
      return La(e, r);
    case 6:
      return Da(e, r);
    case 7:
      return Ta(e, t, r);
    case 8:
      return Ua(e, t, r);
    case 19:
      return Fa(e, r);
    case 16:
    case 15:
      return ja(e, t, r);
    case 20:
      return Ma(e, t, r);
    case 14:
      return qa(e, t, r);
    case 13:
      return Ha(e, t, r);
    case 12:
      return Ba(e, t, r);
    case 17:
      return ge$1(r, Yr, r.s);
    case 21:
      return Va(e, t, r);
    case 25:
      return Wa(e, t, r);
    case 22:
      return Ga(e, r);
    case 23:
      return Xa(e, t, r);
    case 24:
      return Ja(e, t, r);
    case 28:
      return Ya(e, t, r);
    case 30:
      return Ka(e, t, r);
    case 31:
      return Qa(e, t, r);
    case 32:
      return Za(e, t, r);
    case 33:
      return es(e, t, r);
    case 34:
      return ts(e, t, r);
    case 27:
      return rs(e, t, r);
    case 29:
      return ns(e, t, r);
    case 35:
      return as(e, t, r);
    default:
      throw new L(r);
  }
}
function ss(e, t) {
  try {
    return b(e, 0, t);
  } catch (r) {
    throw new Fn(r);
  }
}
var is = () => T, os = is.toString(), Vt$1 = /=>/.test(os);
function Wt$1(e, t) {
  return Vt$1 ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>" + (t.startsWith("{") ? "(" + t + ")" : t) : "function(" + e.join(",") + "){return " + t + "}";
}
function us(e, t) {
  return Vt$1 ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>{" + t + "}" : "function(" + e.join(",") + "){" + t + "}";
}
var Gt = "hjkmoquxzABCDEFGHIJKLNPQRTUVWXYZ$_", He = Gt.length, Xt$1 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_", Be$1 = Xt$1.length;
function cs(e) {
  let t = e % He, r = Gt[t];
  for (e = (e - t) / He; e > 0; ) t = e % Be$1, r += Xt$1[t], e = (e - t) / Be$1;
  return r;
}
var ls = /^[$A-Z_][0-9A-Z_$]*$/i;
function Jt$1(e) {
  let t = e[0];
  return (t === "$" || t === "_" || t >= "A" && t <= "Z" || t >= "a" && t <= "z") && ls.test(e);
}
function X$3(e) {
  switch (e.t) {
    case 0:
      return e.s + "=" + e.v;
    case 2:
      return e.s + ".set(" + e.k + "," + e.v + ")";
    case 1:
      return e.s + ".add(" + e.v + ")";
    case 3:
      return e.s + ".delete(" + e.k + ")";
  }
}
function fs(e) {
  let t = [], r = e[0];
  for (let n = 1, s = e.length, i, o = r; n < s; n++) i = e[n], i.t === 0 && i.v === o.v ? r = { t: 0, s: i.s, k: a, v: X$3(r) } : i.t === 2 && i.s === o.s ? r = { t: 2, s: X$3(r), k: i.k, v: i.v } : i.t === 1 && i.s === o.s ? r = { t: 1, s: X$3(r), k: a, v: i.v } : i.t === 3 && i.s === o.s ? r = { t: 3, s: X$3(r), k: i.k, v: a } : (t.push(r), r = i), o = i;
  return t.push(r), t;
}
function Yt$1(e) {
  if (e.length) {
    let t = "", r = fs(e);
    for (let n = 0, s = r.length; n < s; n++) t += X$3(r[n]) + ",";
    return t;
  }
  return a;
}
var ps = "Object.create(null)", ds = "new Set", hs = "new Map", ms = "Promise.resolve", gs = "Promise.reject", bs = { 3: "Object.freeze", 2: "Object.seal", 1: "Object.preventExtensions", 0: a };
function ys(e, t) {
  return { mode: e, plugins: t.plugins, features: t.features, marked: new Set(t.markedRefs), stack: [], flags: [], assignments: [] };
}
function ws(e) {
  return { mode: 2, base: ys(2, e), state: e, child: a };
}
var vs = class {
  constructor(e) {
    this._p = e;
  }
  serialize(e) {
    return h(this._p, e);
  }
};
function Es(e, t) {
  let r = e.valid.get(t);
  r == null && (r = e.valid.size, e.valid.set(t, r));
  let n = e.vars[r];
  return n == null && (n = cs(r), e.vars[r] = n), n;
}
function Ss(e) {
  return ne + "[" + e + "]";
}
function g(e, t) {
  return e.mode === 1 ? Es(e.state, t) : Ss(t);
}
function E$1(e, t) {
  e.marked.add(t);
}
function be(e, t) {
  return e.marked.has(t);
}
function Re$1(e, t, r) {
  t !== 0 && (E$1(e.base, r), e.base.flags.push({ type: t, value: g(e, r) }));
}
function ks(e) {
  let t = "";
  for (let r = 0, n = e.flags, s = n.length; r < s; r++) {
    let i = n[r];
    t += bs[i.type] + "(" + i.value + "),";
  }
  return t;
}
function Rs(e) {
  let t = Yt$1(e.assignments), r = ks(e);
  return t ? r ? t + r : t : r;
}
function Ae(e, t, r) {
  e.assignments.push({ t: 0, s: t, k: a, v: r });
}
function As(e, t, r) {
  e.base.assignments.push({ t: 1, s: g(e, t), k: a, v: r });
}
function W$1(e, t, r, n) {
  e.base.assignments.push({ t: 2, s: g(e, t), k: r, v: n });
}
function Ve$2(e, t, r) {
  e.base.assignments.push({ t: 3, s: g(e, t), k: r, v: a });
}
function Y$3(e, t, r, n) {
  Ae(e.base, g(e, t) + "[" + r + "]", n);
}
function ye$1(e, t, r, n) {
  Ae(e.base, g(e, t) + "." + r, n);
}
function _s(e, t, r, n) {
  Ae(e.base, g(e, t) + ".v[" + r + "]", n);
}
function R$3(e, t) {
  return t.t === 4 && e.stack.includes(t.i);
}
function V(e, t, r) {
  return e.mode === 1 && !be(e.base, t) ? r : g(e, t) + "=" + r;
}
function xs(e) {
  return G$3 + '.get("' + e.s + '")';
}
function We$1(e, t, r, n) {
  return r ? R$3(e.base, r) ? (E$1(e.base, t), Y$3(e, t, n, g(e, r.i)), "") : h(e, r) : "";
}
function $s(e, t) {
  let r = t.i, n = t.a, s = n.length;
  if (s > 0) {
    e.base.stack.push(r);
    let i = We$1(e, r, n[0], 0), o = i === "";
    for (let u = 1, c; u < s; u++) c = We$1(e, r, n[u], u), i += "," + c, o = c === "";
    return e.base.stack.pop(), Re$1(e, t.o, t.i), "[" + i + (o ? ",]" : "]");
  }
  return "[]";
}
function Ge$1(e, t, r, n) {
  if (typeof r == "string") {
    let s = Number(r), i = s >= 0 && s.toString() === r || Jt$1(r);
    if (R$3(e.base, n)) {
      let o = g(e, n.i);
      return E$1(e.base, t.i), i && s !== s ? ye$1(e, t.i, r, o) : Y$3(e, t.i, i ? r : '"' + r + '"', o), "";
    }
    return (i ? r : '"' + r + '"') + ":" + h(e, n);
  }
  return "[" + h(e, r) + "]:" + h(e, n);
}
function Kt(e, t, r) {
  let n = r.k, s = n.length;
  if (s > 0) {
    let i = r.v;
    e.base.stack.push(t.i);
    let o = Ge$1(e, t, n[0], i[0]);
    for (let u = 1, c = o; u < s; u++) c = Ge$1(e, t, n[u], i[u]), o += (c && o && ",") + c;
    return e.base.stack.pop(), "{" + o + "}";
  }
  return "{}";
}
function zs(e, t) {
  return Re$1(e, t.o, t.i), Kt(e, t, t.p);
}
function Os(e, t, r, n) {
  let s = Kt(e, t, r);
  return s !== "{}" ? "Object.assign(" + n + "," + s + ")" : n;
}
function Ps(e, t, r, n, s) {
  let i = e.base, o = h(e, s), u = Number(n), c = u >= 0 && u.toString() === n || Jt$1(n);
  if (R$3(i, s)) c && u !== u ? ye$1(e, t.i, n, o) : Y$3(e, t.i, c ? n : '"' + n + '"', o);
  else {
    let l = i.assignments;
    i.assignments = r, c && u !== u ? ye$1(e, t.i, n, o) : Y$3(e, t.i, c ? n : '"' + n + '"', o), i.assignments = l;
  }
}
function Cs(e, t, r, n, s) {
  if (typeof n == "string") Ps(e, t, r, n, s);
  else {
    let i = e.base, o = i.stack;
    i.stack = [];
    let u = h(e, s);
    i.stack = o;
    let c = i.assignments;
    i.assignments = r, Y$3(e, t.i, h(e, n), u), i.assignments = c;
  }
}
function Is(e, t, r) {
  let n = r.k, s = n.length;
  if (s > 0) {
    let i = [], o = r.v;
    e.base.stack.push(t.i);
    for (let u = 0; u < s; u++) Cs(e, t, i, n[u], o[u]);
    return e.base.stack.pop(), Yt$1(i);
  }
  return a;
}
function _e(e, t, r) {
  if (t.p) {
    let n = e.base;
    if (n.features & 8) r = Os(e, t, t.p, r);
    else {
      E$1(n, t.i);
      let s = Is(e, t, t.p);
      if (s) return "(" + V(e, t.i, r) + "," + s + g(e, t.i) + ")";
    }
  }
  return r;
}
function Ns(e, t) {
  return Re$1(e, t.o, t.i), _e(e, t, ps);
}
function Ls(e) {
  return 'new Date("' + e.s + '")';
}
function Ds(e, t) {
  if (e.base.features & 32) return "/" + t.c + "/" + t.m;
  throw new L(t);
}
function Xe$1(e, t, r) {
  let n = e.base;
  return R$3(n, r) ? (E$1(n, t), As(e, t, g(e, r.i)), "") : h(e, r);
}
function Ts(e, t) {
  let r = ds, n = t.a, s = n.length, i = t.i;
  if (s > 0) {
    e.base.stack.push(i);
    let o = Xe$1(e, i, n[0]);
    for (let u = 1, c = o; u < s; u++) c = Xe$1(e, i, n[u]), o += (c && o && ",") + c;
    e.base.stack.pop(), o && (r += "([" + o + "])");
  }
  return r;
}
function Je$1(e, t, r, n, s) {
  let i = e.base;
  if (R$3(i, r)) {
    let o = g(e, r.i);
    if (E$1(i, t), R$3(i, n)) {
      let c = g(e, n.i);
      return W$1(e, t, o, c), "";
    }
    if (n.t !== 4 && n.i != null && be(i, n.i)) {
      let c = "(" + h(e, n) + ",[" + s + "," + s + "])";
      return W$1(e, t, o, g(e, n.i)), Ve$2(e, t, s), c;
    }
    let u = i.stack;
    return i.stack = [], W$1(e, t, o, h(e, n)), i.stack = u, "";
  }
  if (R$3(i, n)) {
    let o = g(e, n.i);
    if (E$1(i, t), r.t !== 4 && r.i != null && be(i, r.i)) {
      let c = "(" + h(e, r) + ",[" + s + "," + s + "])";
      return W$1(e, t, g(e, r.i), o), Ve$2(e, t, s), c;
    }
    let u = i.stack;
    return i.stack = [], W$1(e, t, h(e, r), o), i.stack = u, "";
  }
  return "[" + h(e, r) + "," + h(e, n) + "]";
}
function Us(e, t) {
  let r = hs, n = t.e.k, s = n.length, i = t.i, o = t.f, u = g(e, o.i), c = e.base;
  if (s > 0) {
    let l = t.e.v;
    c.stack.push(i);
    let p = Je$1(e, i, n[0], l[0], u);
    for (let d = 1, w = p; d < s; d++) w = Je$1(e, i, n[d], l[d], u), p += (w && p && ",") + w;
    c.stack.pop(), p && (r += "([" + p + "])");
  }
  return o.t === 26 && (E$1(c, o.i), r = "(" + h(e, o) + "," + r + ")"), r;
}
function Fs(e, t) {
  return U$2(e, t.f) + '("' + t.s + '")';
}
function js(e, t) {
  return "new " + t.c + "(" + h(e, t.f) + "," + t.b + "," + t.l + ")";
}
function Ms(e, t) {
  return "new DataView(" + h(e, t.f) + "," + t.b + "," + t.l + ")";
}
function qs(e, t) {
  let r = t.i;
  e.base.stack.push(r);
  let n = _e(e, t, 'new AggregateError([],"' + t.m + '")');
  return e.base.stack.pop(), n;
}
function Hs(e, t) {
  return _e(e, t, "new " + St$2[t.s] + '("' + t.m + '")');
}
function Bs(e, t) {
  let r, n = t.f, s = t.i, i = t.s ? ms : gs, o = e.base;
  if (R$3(o, n)) {
    let u = g(e, n.i);
    r = i + (t.s ? "().then(" + Wt$1([], u) + ")" : "().catch(" + us([], "throw " + u) + ")");
  } else {
    o.stack.push(s);
    let u = h(e, n);
    o.stack.pop(), r = i + "(" + u + ")";
  }
  return r;
}
function Vs(e, t) {
  return "Object(" + h(e, t.f) + ")";
}
function U$2(e, t) {
  let r = h(e, t);
  return t.t === 4 ? r : "(" + r + ")";
}
function Ws(e, t) {
  if (e.mode === 1) throw new L(t);
  return "(" + V(e, t.s, U$2(e, t.f) + "()") + ").p";
}
function Gs(e, t) {
  if (e.mode === 1) throw new L(t);
  return U$2(e, t.a[0]) + "(" + g(e, t.i) + "," + h(e, t.a[1]) + ")";
}
function Xs(e, t) {
  if (e.mode === 1) throw new L(t);
  return U$2(e, t.a[0]) + "(" + g(e, t.i) + "," + h(e, t.a[1]) + ")";
}
function Js(e, t) {
  let r = e.base.plugins;
  if (r) for (let n = 0, s = r.length; n < s; n++) {
    let i = r[n];
    if (i.tag === t.c) return e.child == null && (e.child = new vs(e)), i.serialize(t.s, e.child, { id: t.i });
  }
  throw new Ct$2(t.c);
}
function Ys(e, t) {
  let r = "", n = false;
  return t.f.t !== 4 && (E$1(e.base, t.f.i), r = "(" + h(e, t.f) + ",", n = true), r += V(e, t.i, "(" + Yn + ")(" + g(e, t.f.i) + ")"), n && (r += ")"), r;
}
function Ks(e, t) {
  return U$2(e, t.a[0]) + "(" + h(e, t.a[1]) + ")";
}
function Qs(e, t) {
  let r = t.a[0], n = t.a[1], s = e.base, i = "";
  r.t !== 4 && (E$1(s, r.i), i += "(" + h(e, r)), n.t !== 4 && (E$1(s, n.i), i += (i ? "," : "(") + h(e, n)), i && (i += ",");
  let o = V(e, t.i, "(" + Kn + ")(" + g(e, n.i) + "," + g(e, r.i) + ")");
  return i ? i + o + ")" : o;
}
function Zs(e, t) {
  return U$2(e, t.a[0]) + "(" + h(e, t.a[1]) + ")";
}
function ei(e, t) {
  let r = V(e, t.i, U$2(e, t.f) + "()"), n = t.a.length;
  if (n) {
    let s = h(e, t.a[0]);
    for (let i = 1; i < n; i++) s += "," + h(e, t.a[i]);
    return "(" + r + "," + s + "," + g(e, t.i) + ")";
  }
  return r;
}
function ti(e, t) {
  return g(e, t.i) + ".next(" + h(e, t.f) + ")";
}
function ri(e, t) {
  return g(e, t.i) + ".throw(" + h(e, t.f) + ")";
}
function ni(e, t) {
  return g(e, t.i) + ".return(" + h(e, t.f) + ")";
}
function Ye$1(e, t, r, n) {
  let s = e.base;
  return R$3(s, n) ? (E$1(s, t), _s(e, t, r, g(e, n.i)), "") : h(e, n);
}
function ai(e, t) {
  let r = t.a, n = r.length, s = t.i;
  if (n > 0) {
    e.base.stack.push(s);
    let i = Ye$1(e, s, 0, r[0]);
    for (let o = 1, u = i; o < n; o++) u = Ye$1(e, s, o, r[o]), i += (u && i && ",") + u;
    if (e.base.stack.pop(), i) return "{__SEROVAL_SEQUENCE__:!0,v:[" + i + "],t:" + t.s + ",d:" + t.l + "}";
  }
  return "{__SEROVAL_SEQUENCE__:!0,v:[],t:-1,d:0}";
}
function si(e, t) {
  switch (t.t) {
    case 17:
      return Jr[t.s];
    case 18:
      return xs(t);
    case 9:
      return $s(e, t);
    case 10:
      return zs(e, t);
    case 11:
      return Ns(e, t);
    case 5:
      return Ls(t);
    case 6:
      return Ds(e, t);
    case 7:
      return Ts(e, t);
    case 8:
      return Us(e, t);
    case 19:
      return Fs(e, t);
    case 16:
    case 15:
      return js(e, t);
    case 20:
      return Ms(e, t);
    case 14:
      return qs(e, t);
    case 13:
      return Hs(e, t);
    case 12:
      return Bs(e, t);
    case 21:
      return Vs(e, t);
    case 22:
      return Ws(e, t);
    case 25:
      return Js(e, t);
    case 26:
      return ia[t.s];
    case 35:
      return ai(e, t);
    default:
      throw new L(t);
  }
}
function h(e, t) {
  switch (t.t) {
    case 2:
      return Kr[t.s];
    case 0:
      return "" + t.s;
    case 1:
      return '"' + t.s + '"';
    case 3:
      return t.s + "n";
    case 4:
      return g(e, t.i);
    case 23:
      return Gs(e, t);
    case 24:
      return Xs(e, t);
    case 27:
      return Ys(e, t);
    case 28:
      return Ks(e, t);
    case 29:
      return Qs(e, t);
    case 30:
      return Zs(e, t);
    case 31:
      return ei(e, t);
    case 32:
      return ti(e, t);
    case 33:
      return ri(e, t);
    case 34:
      return ni(e, t);
    default:
      return V(e, t.i, si(e, t));
  }
}
function ii(e, t) {
  let r = h(e, t), n = t.i;
  if (n == null) return r;
  let s = Rs(e.base), i = g(e, n), o = e.state.scopeId, u = o == null ? "" : ne, c = s ? "(" + r + "," + s + i + ")" : r;
  if (u === "") return t.t === 10 && !s ? "(" + c + ")" : c;
  let l = o == null ? "()" : "(" + ne + '["' + k$3(o) + '"])';
  return "(" + Wt$1([u], c) + ")" + l;
}
var oi = class {
  constructor(e, t) {
    this._p = e, this.depth = t;
  }
  parse(e) {
    return v(this._p, this.depth, e);
  }
}, ui = class {
  constructor(e, t) {
    this._p = e, this.depth = t;
  }
  parse(e) {
    return v(this._p, this.depth, e);
  }
  parseWithError(e) {
    return I$1(this._p, this.depth, e);
  }
  isAlive() {
    return this._p.state.alive;
  }
  pushPendingState() {
    Oe(this._p);
  }
  popPendingState() {
    K$3(this._p);
  }
  onParse(e) {
    B$1(this._p, e);
  }
  onError(e) {
    $e(this._p, e);
  }
};
function ci(e) {
  return { alive: true, pending: 0, initial: true, buffer: [], onParse: e.onParse, onError: e.onError, onDone: e.onDone };
}
function Qt$1(e) {
  return { type: 2, base: la(2, e), state: ci(e) };
}
function li(e, t, r) {
  let n = [];
  for (let s = 0, i = r.length; s < i; s++) s in r ? n[s] = v(e, t, r[s]) : n[s] = 0;
  return n;
}
function fi(e, t, r, n) {
  return En(r, n, li(e, t, n));
}
function xe$1(e, t, r) {
  let n = Object.entries(r), s = [], i = [];
  for (let o = 0, u = n.length; o < u; o++) s.push(k$3(n[o][0])), i.push(v(e, t, n[o][1]));
  return _ in r && (s.push(C$1(e.base, _)), i.push(zn(pa(e.base), v(e, t, ea(r))))), A$1 in r && (s.push(C$1(e.base, A$1)), i.push(On(da(e.base), v(e, t, e.type === 1 ? Z$2() : oa(r))))), H$2 in r && (s.push(C$1(e.base, H$2)), i.push(zt(r[H$2]))), q$3 in r && (s.push(C$1(e.base, q$3)), i.push(r[q$3] ? kt$2 : Rt$2)), { k: s, v: i };
}
function le(e, t, r, n, s) {
  return ha(r, n, s, xe$1(e, t, n));
}
function pi(e, t, r, n) {
  return Sn(r, v(e, t, n.valueOf()));
}
function di(e, t, r, n) {
  return kn(r, n, v(e, t, n.buffer));
}
function hi(e, t, r, n) {
  return Rn(r, n, v(e, t, n.buffer));
}
function mi(e, t, r, n) {
  return An(r, n, v(e, t, n.buffer));
}
function Ke$1(e, t, r, n) {
  let s = xt$1(n, e.base.features);
  return _n(r, n, s ? xe$1(e, t, s) : a);
}
function gi(e, t, r, n) {
  let s = xt$1(n, e.base.features);
  return xn(r, n, s ? xe$1(e, t, s) : a);
}
function bi(e, t, r, n) {
  let s = [], i = [];
  for (let [o, u] of n.entries()) s.push(v(e, t, o)), i.push(v(e, t, u));
  return ma(e.base, r, s, i);
}
function yi(e, t, r, n) {
  let s = [];
  for (let i of n.keys()) s.push(v(e, t, i));
  return $n(r, s);
}
function wi(e, t, r, n) {
  let s = Pn(r, D$3(e.base, 4), []);
  return e.type === 1 || (Oe(e), n.on({ next: (i) => {
    if (e.state.alive) {
      let o = I$1(e, t, i);
      o && B$1(e, Cn(r, o));
    }
  }, throw: (i) => {
    if (e.state.alive) {
      let o = I$1(e, t, i);
      o && B$1(e, In(r, o));
    }
    K$3(e);
  }, return: (i) => {
    if (e.state.alive) {
      let o = I$1(e, t, i);
      o && B$1(e, Nn(r, o));
    }
    K$3(e);
  } })), s;
}
function vi(e, t, r) {
  if (this.state.alive) {
    let n = I$1(this, t, r);
    n && B$1(this, m(23, e, a, a, a, a, a, [D$3(this.base, 2), n], a, a, a, a)), K$3(this);
  }
}
function Ei(e, t, r) {
  if (this.state.alive) {
    let n = I$1(this, t, r);
    n && B$1(this, m(24, e, a, a, a, a, a, [D$3(this.base, 3), n], a, a, a, a));
  }
  K$3(this);
}
function Si(e, t, r, n) {
  let s = Ft$1(e.base, {});
  return e.type === 2 && (Oe(e), n.then(vi.bind(e, s, t), Ei.bind(e, s, t))), ga(e.base, r, s);
}
function ki(e, t, r, n, s) {
  for (let i = 0, o = s.length; i < o; i++) {
    let u = s[i];
    if (u.parse.sync && u.test(n)) return Ot$1(r, u.tag, u.parse.sync(n, new oi(e, t), { id: r }));
  }
  return a;
}
function Ri(e, t, r, n, s) {
  for (let i = 0, o = s.length; i < o; i++) {
    let u = s[i];
    if (u.parse.stream && u.test(n)) return Ot$1(r, u.tag, u.parse.stream(n, new ui(e, t), { id: r }));
  }
  return a;
}
function Zt$1(e, t, r, n) {
  let s = e.base.plugins;
  return s ? e.type === 1 ? ki(e, t, r, n, s) : Ri(e, t, r, n, s) : a;
}
function Ai(e, t, r, n) {
  let s = [];
  for (let i = 0, o = n.v.length; i < o; i++) s[i] = v(e, t, n.v[i]);
  return Ln(r, s, n.t, n.d);
}
function _i(e, t, r, n, s) {
  switch (s) {
    case Object:
      return le(e, t, r, n, false);
    case a:
      return le(e, t, r, n, true);
    case Date:
      return bn(r, n);
    case Error:
    case EvalError:
    case RangeError:
    case ReferenceError:
    case SyntaxError:
    case TypeError:
    case URIError:
      return Ke$1(e, t, r, n);
    case Number:
    case Boolean:
    case String:
    case BigInt:
      return pi(e, t, r, n);
    case ArrayBuffer:
      return ba(e.base, r, n);
    case Int8Array:
    case Int16Array:
    case Int32Array:
    case Uint8Array:
    case Uint16Array:
    case Uint32Array:
    case Uint8ClampedArray:
    case Float32Array:
    case Float64Array:
      return di(e, t, r, n);
    case DataView:
      return mi(e, t, r, n);
    case Map:
      return bi(e, t, r, n);
    case Set:
      return yi(e, t, r, n);
  }
  if (s === Promise || n instanceof Promise) return Si(e, t, r, n);
  let i = e.base.features;
  if (i & 32 && s === RegExp) return yn(r, n);
  if (i & 16) switch (s) {
    case BigInt64Array:
    case BigUint64Array:
      return hi(e, t, r, n);
  }
  if (i & 1 && typeof AggregateError < "u" && (s === AggregateError || n instanceof AggregateError)) return gi(e, t, r, n);
  if (n instanceof Error) return Ke$1(e, t, r, n);
  if (_ in n || A$1 in n) return le(e, t, r, n, !!s);
  throw new ae$1(n);
}
function xi(e, t, r, n) {
  if (Array.isArray(n)) return fi(e, t, r, n);
  if (ie$1(n)) return wi(e, t, r, n);
  if (Zn(n)) return Ai(e, t, r, n);
  let s = n.constructor;
  return s === Hn ? v(e, t, n.replacement) : Zt$1(e, t, r, n) || _i(e, t, r, n, s);
}
function $i(e, t, r) {
  let n = Se(e.base, r);
  if (n.type !== 0) return n.value;
  let s = Zt$1(e, t, n.value, r);
  if (s) return s;
  throw new ae$1(r);
}
function v(e, t, r) {
  if (t >= e.base.depthLimit) throw new It$1(e.base.depthLimit);
  switch (typeof r) {
    case "boolean":
      return r ? kt$2 : Rt$2;
    case "undefined":
      return en$1;
    case "string":
      return zt(r);
    case "number":
      return hn(r);
    case "bigint":
      return mn(r);
    case "object": {
      if (r) {
        let n = Se(e.base, r);
        return n.type === 0 ? xi(e, t + 1, n.value, r) : n.value;
      }
      return tn$1;
    }
    case "symbol":
      return C$1(e.base, r);
    case "function":
      return $i(e, t, r);
    default:
      throw new ae$1(r);
  }
}
function B$1(e, t) {
  e.state.initial ? e.state.buffer.push(t) : ze$1(e, t, false);
}
function $e(e, t) {
  if (e.state.onError) e.state.onError(t);
  else throw t instanceof Me ? t : new Me(t);
}
function er(e) {
  e.state.onDone && e.state.onDone();
}
function ze$1(e, t, r) {
  try {
    e.state.onParse(t, r);
  } catch (n) {
    $e(e, n);
  }
}
function Oe(e) {
  e.state.pending++;
}
function K$3(e) {
  --e.state.pending <= 0 && er(e);
}
function I$1(e, t, r) {
  try {
    return v(e, t, r);
  } catch (n) {
    return $e(e, n), a;
  }
}
function tr(e, t) {
  let r = I$1(e, 0, t);
  r && (ze$1(e, r, true), e.state.initial = false, zi(e, e.state), e.state.pending <= 0 && Pe(e));
}
function zi(e, t) {
  for (let r = 0, n = t.buffer.length; r < n; r++) ze$1(e, t.buffer[r], false);
}
function Pe(e) {
  e.state.alive && (er(e), e.state.alive = false);
}
function Oi(e, t) {
  let r = ke(t.plugins), n = Qt$1({ plugins: r, refs: t.refs, disabledFeatures: t.disabledFeatures, onParse(s, i) {
    let o = ws({ plugins: r, features: n.base.features, scopeId: t.scopeId, markedRefs: n.base.marked }), u;
    try {
      u = ii(o, s);
    } catch (c) {
      t.onError && t.onError(c);
      return;
    }
    t.onSerialize(u, i);
  }, onError: t.onError, onDone: t.onDone });
  return tr(n, e), Pe.bind(null, n);
}
function Pi(e, t) {
  let r = ke(t.plugins), n = Qt$1({ plugins: r, refs: t.refs, disabledFeatures: t.disabledFeatures, depthLimit: t.depthLimit, onParse: t.onParse, onError: t.onError, onDone: t.onDone });
  return tr(n, e), Pe.bind(null, n);
}
function Ci(e, t = {}) {
  var r;
  let n = ke(t.plugins), s = t.disabledFeatures || 0, i = (r = e.f) != null ? r : 63, o = Aa({ plugins: n, markedRefs: e.m, features: i & ~s, disabledFeatures: s });
  return ss(o, e.t);
}
var we$1 = (e) => {
  let t = new AbortController(), r = t.abort.bind(t);
  return e.then(r, r), t;
};
function Ii(e) {
  e(this.reason);
}
function Ni(e) {
  this.addEventListener("abort", Ii.bind(this, e), { once: true });
}
function Qe$1(e) {
  return new Promise(Ni.bind(e));
}
var J = {}, Li = { tag: "seroval-plugins/web/AbortControllerFactoryPlugin", test(e) {
  return e === J;
}, parse: { sync() {
  return J;
}, async async() {
  return await Promise.resolve(J);
}, stream() {
  return J;
} }, serialize() {
  return we$1.toString();
}, deserialize() {
  return we$1;
} }, Di = { tag: "seroval-plugins/web/AbortSignal", extends: [Li], test(e) {
  return typeof AbortSignal > "u" ? false : e instanceof AbortSignal;
}, parse: { sync(e, t) {
  return e.aborted ? { reason: t.parse(e.reason) } : {};
}, async async(e, t) {
  if (e.aborted) return { reason: await t.parse(e.reason) };
  let r = await Qe$1(e);
  return { reason: await t.parse(r) };
}, stream(e, t) {
  if (e.aborted) return { reason: t.parse(e.reason) };
  let r = Qe$1(e);
  return { factory: t.parse(J), controller: t.parse(r) };
} }, serialize(e, t) {
  return e.reason ? "AbortSignal.abort(" + t.serialize(e.reason) + ")" : e.controller && e.factory ? "(" + t.serialize(e.factory) + ")(" + t.serialize(e.controller) + ").signal" : "(new AbortController).signal";
}, deserialize(e, t) {
  return e.reason ? AbortSignal.abort(t.deserialize(e.reason)) : e.controller ? we$1(t.deserialize(e.controller)).signal : new AbortController().signal;
} }, Ti = Di;
function fe(e) {
  return { detail: e.detail, bubbles: e.bubbles, cancelable: e.cancelable, composed: e.composed };
}
var Ui = { tag: "seroval-plugins/web/CustomEvent", test(e) {
  return typeof CustomEvent > "u" ? false : e instanceof CustomEvent;
}, parse: { sync(e, t) {
  return { type: t.parse(e.type), options: t.parse(fe(e)) };
}, async async(e, t) {
  return { type: await t.parse(e.type), options: await t.parse(fe(e)) };
}, stream(e, t) {
  return { type: t.parse(e.type), options: t.parse(fe(e)) };
} }, serialize(e, t) {
  return "new CustomEvent(" + t.serialize(e.type) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new CustomEvent(t.deserialize(e.type), t.deserialize(e.options));
} }, Fi = Ui, ji = { tag: "seroval-plugins/web/DOMException", test(e) {
  return typeof DOMException > "u" ? false : e instanceof DOMException;
}, parse: { sync(e, t) {
  return { name: t.parse(e.name), message: t.parse(e.message) };
}, async async(e, t) {
  return { name: await t.parse(e.name), message: await t.parse(e.message) };
}, stream(e, t) {
  return { name: t.parse(e.name), message: t.parse(e.message) };
} }, serialize(e, t) {
  return "new DOMException(" + t.serialize(e.message) + "," + t.serialize(e.name) + ")";
}, deserialize(e, t) {
  return new DOMException(t.deserialize(e.message), t.deserialize(e.name));
} }, Mi = ji;
function pe(e) {
  return { bubbles: e.bubbles, cancelable: e.cancelable, composed: e.composed };
}
var qi = { tag: "seroval-plugins/web/Event", test(e) {
  return typeof Event > "u" ? false : e instanceof Event;
}, parse: { sync(e, t) {
  return { type: t.parse(e.type), options: t.parse(pe(e)) };
}, async async(e, t) {
  return { type: await t.parse(e.type), options: await t.parse(pe(e)) };
}, stream(e, t) {
  return { type: t.parse(e.type), options: t.parse(pe(e)) };
} }, serialize(e, t) {
  return "new Event(" + t.serialize(e.type) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new Event(t.deserialize(e.type), t.deserialize(e.options));
} }, Hi = qi, Bi = { tag: "seroval-plugins/web/File", test(e) {
  return typeof File > "u" ? false : e instanceof File;
}, parse: { async async(e, t) {
  return { name: await t.parse(e.name), options: await t.parse({ type: e.type, lastModified: e.lastModified }), buffer: await t.parse(await e.arrayBuffer()) };
} }, serialize(e, t) {
  return "new File([" + t.serialize(e.buffer) + "]," + t.serialize(e.name) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new File([t.deserialize(e.buffer)], t.deserialize(e.name), t.deserialize(e.options));
} }, Vi = Bi;
function de(e) {
  let t = [];
  return e.forEach((r, n) => {
    t.push([n, r]);
  }), t;
}
var $$2 = {}, rr = (e, t = new FormData(), r = 0, n = e.length, s) => {
  for (; r < n; r++) s = e[r], t.append(s[0], s[1]);
  return t;
}, Wi = { tag: "seroval-plugins/web/FormDataFactory", test(e) {
  return e === $$2;
}, parse: { sync() {
  return $$2;
}, async async() {
  return await Promise.resolve($$2);
}, stream() {
  return $$2;
} }, serialize() {
  return rr.toString();
}, deserialize() {
  return $$2;
} }, Gi = { tag: "seroval-plugins/web/FormData", extends: [Vi, Wi], test(e) {
  return typeof FormData > "u" ? false : e instanceof FormData;
}, parse: { sync(e, t) {
  return { factory: t.parse($$2), entries: t.parse(de(e)) };
}, async async(e, t) {
  return { factory: await t.parse($$2), entries: await t.parse(de(e)) };
}, stream(e, t) {
  return { factory: t.parse($$2), entries: t.parse(de(e)) };
} }, serialize(e, t) {
  return "(" + t.serialize(e.factory) + ")(" + t.serialize(e.entries) + ")";
}, deserialize(e, t) {
  return rr(t.deserialize(e.entries));
} }, Xi = Gi;
function he(e) {
  let t = [];
  return e.forEach((r, n) => {
    t.push([n, r]);
  }), t;
}
var Ji = { tag: "seroval-plugins/web/Headers", test(e) {
  return typeof Headers > "u" ? false : e instanceof Headers;
}, parse: { sync(e, t) {
  return { value: t.parse(he(e)) };
}, async async(e, t) {
  return { value: await t.parse(he(e)) };
}, stream(e, t) {
  return { value: t.parse(he(e)) };
} }, serialize(e, t) {
  return "new Headers(" + t.serialize(e.value) + ")";
}, deserialize(e, t) {
  return new Headers(t.deserialize(e.value));
} }, Ce = Ji, z$2 = {}, nr = (e) => new ReadableStream({ start: (t) => {
  e.on({ next: (r) => {
    try {
      t.enqueue(r);
    } catch {
    }
  }, throw: (r) => {
    t.error(r);
  }, return: () => {
    try {
      t.close();
    } catch {
    }
  } });
} }), Yi = { tag: "seroval-plugins/web/ReadableStreamFactory", test(e) {
  return e === z$2;
}, parse: { sync() {
  return z$2;
}, async async() {
  return await Promise.resolve(z$2);
}, stream() {
  return z$2;
} }, serialize() {
  return nr.toString();
}, deserialize() {
  return z$2;
} };
function Ze$2(e) {
  let t = Z$2(), r = e.getReader();
  async function n() {
    try {
      let s = await r.read();
      s.done ? t.return(s.value) : (t.next(s.value), await n());
    } catch (s) {
      t.throw(s);
    }
  }
  return n().catch(() => {
  }), t;
}
var Ki = { tag: "seroval/plugins/web/ReadableStream", extends: [Yi], test(e) {
  return typeof ReadableStream > "u" ? false : e instanceof ReadableStream;
}, parse: { sync(e, t) {
  return { factory: t.parse(z$2), stream: t.parse(Z$2()) };
}, async async(e, t) {
  return { factory: await t.parse(z$2), stream: await t.parse(Ze$2(e)) };
}, stream(e, t) {
  return { factory: t.parse(z$2), stream: t.parse(Ze$2(e)) };
} }, serialize(e, t) {
  return "(" + t.serialize(e.factory) + ")(" + t.serialize(e.stream) + ")";
}, deserialize(e, t) {
  let r = t.deserialize(e.stream);
  return nr(r);
} }, Ie = Ki;
function et$3(e, t) {
  return { body: t, cache: e.cache, credentials: e.credentials, headers: e.headers, integrity: e.integrity, keepalive: e.keepalive, method: e.method, mode: e.mode, redirect: e.redirect, referrer: e.referrer, referrerPolicy: e.referrerPolicy };
}
var Qi = { tag: "seroval-plugins/web/Request", extends: [Ie, Ce], test(e) {
  return typeof Request > "u" ? false : e instanceof Request;
}, parse: { async async(e, t) {
  return { url: await t.parse(e.url), options: await t.parse(et$3(e, e.body && !e.bodyUsed ? await e.clone().arrayBuffer() : null)) };
}, stream(e, t) {
  return { url: t.parse(e.url), options: t.parse(et$3(e, e.body && !e.bodyUsed ? e.clone().body : null)) };
} }, serialize(e, t) {
  return "new Request(" + t.serialize(e.url) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new Request(t.deserialize(e.url), t.deserialize(e.options));
} }, Zi = Qi;
function tt$3(e) {
  return { headers: e.headers, status: e.status, statusText: e.statusText };
}
var eo = { tag: "seroval-plugins/web/Response", extends: [Ie, Ce], test(e) {
  return typeof Response > "u" ? false : e instanceof Response;
}, parse: { async async(e, t) {
  return { body: await t.parse(e.body && !e.bodyUsed ? await e.clone().arrayBuffer() : null), options: await t.parse(tt$3(e)) };
}, stream(e, t) {
  return { body: t.parse(e.body && !e.bodyUsed ? e.clone().body : null), options: t.parse(tt$3(e)) };
} }, serialize(e, t) {
  return "new Response(" + t.serialize(e.body) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new Response(t.deserialize(e.body), t.deserialize(e.options));
} }, to = eo, ro = { tag: "seroval-plugins/web/URL", test(e) {
  return typeof URL > "u" ? false : e instanceof URL;
}, parse: { sync(e, t) {
  return { value: t.parse(e.href) };
}, async async(e, t) {
  return { value: await t.parse(e.href) };
}, stream(e, t) {
  return { value: t.parse(e.href) };
} }, serialize(e, t) {
  return "new URL(" + t.serialize(e.value) + ")";
}, deserialize(e, t) {
  return new URL(t.deserialize(e.value));
} }, no = ro, ao = { tag: "seroval-plugins/web/URLSearchParams", test(e) {
  return typeof URLSearchParams > "u" ? false : e instanceof URLSearchParams;
}, parse: { sync(e, t) {
  return { value: t.parse(e.toString()) };
}, async async(e, t) {
  return { value: await t.parse(e.toString()) };
}, stream(e, t) {
  return { value: t.parse(e.toString()) };
} }, serialize(e, t) {
  return "new URLSearchParams(" + t.serialize(e.value) + ")";
}, deserialize(e, t) {
  return new URLSearchParams(t.deserialize(e.value));
} }, so = ao;
const Ne = [Ti, Fi, Mi, Hi, Xi, Ce, Ie, Zi, to, so, no], io = 64, ar = ft$3.RegExp;
function sr(e) {
  const t = new TextEncoder().encode(e), r = t.length, n = r.toString(16), s = "00000000".substring(0, 8 - n.length) + n, i = new TextEncoder().encode(`;0x${s};`), o = new Uint8Array(12 + r);
  return o.set(i), o.set(t, 12), o;
}
function rt$3(e, t) {
  return new ReadableStream({ start(r) {
    Oi(t, { scopeId: e, plugins: Ne, onSerialize(n, s) {
      r.enqueue(sr(s ? `(${cn(e)},${n})` : n));
    }, onDone() {
      r.close();
    }, onError(n) {
      r.error(n);
    } });
  } });
}
function oo(e) {
  return new ReadableStream({ start(t) {
    Pi(e, { disabledFeatures: ar, depthLimit: io, plugins: Ne, onParse(r) {
      t.enqueue(sr(JSON.stringify(r)));
    }, onDone() {
      t.close();
    }, onError(r) {
      t.error(r);
    } });
  } });
}
async function nt$3(e) {
  return Ci(JSON.parse(e), { plugins: Ne, disabledFeatures: ar });
}
async function uo(e) {
  const t = Vt$2(e), r = t.request, n = r.headers.get("X-Server-Id"), s = r.headers.get("X-Server-Instance"), i = r.headers.has("X-Single-Flight"), o = new URL(r.url);
  let u, c;
  if (n) $r(typeof n == "string", "Invalid server function"), [u, c] = decodeURIComponent(n).split("#");
  else if (u = o.searchParams.get("id"), c = o.searchParams.get("name"), !u || !c) return new Response(null, { status: 404 });
  const l = Xr[u];
  let p;
  if (!l) return new Response(null, { status: 404 });
  p = await l.importer();
  const d = p[l.functionName];
  let w = [];
  if (!s || e.method === "GET") {
    const f = o.searchParams.get("args");
    if (f) {
      const S = await nt$3(f);
      for (const ee of S) w.push(ee);
    }
  }
  if (e.method === "POST") {
    const f = r.headers.get("content-type"), S = e.node.req, ee = S instanceof ReadableStream, ir = S.body instanceof ReadableStream, or = ee && S.locked || ir && S.body.locked, ur = ee ? S : S.body, ue = or ? r : new Request(r, { ...r, body: ur });
    r.headers.get("x-serialized") ? w = await nt$3(await ue.text()) : (f == null ? void 0 : f.startsWith("multipart/form-data")) || (f == null ? void 0 : f.startsWith("application/x-www-form-urlencoded")) ? w.push(await ue.formData()) : (f == null ? void 0 : f.startsWith("application/json")) && (w = await ue.json());
  }
  try {
    let f = await provideRequestEvent(t, async () => (sharedConfig.context = { event: t }, t.locals.serverFunctionMeta = { id: u + "#" + c }, d(...w)));
    if (i && s && (f = await st$3(t, f)), f instanceof Response) {
      if (f.headers && f.headers.has("X-Content-Raw")) return f;
      s && (f.headers && Zt$2(e, f.headers), f.status && (f.status < 300 || f.status >= 400) && ae$2(e, f.status), f.customBody ? f = await f.customBody() : f.body == null && (f = null));
    }
    if (!s) return at$3(f, r, w);
    return Qt$2(e, "x-serialized", "true"), Qt$2(e, "content-type", "text/javascript"), rt$3(s, f);
    return oo(f);
  } catch (f) {
    if (f instanceof Response) i && s && (f = await st$3(t, f)), f.headers && Zt$2(e, f.headers), f.status && (!s || f.status < 300 || f.status >= 400) && ae$2(e, f.status), f.customBody ? f = f.customBody() : f.body == null && (f = null), Qt$2(e, "X-Error", "true");
    else if (s) {
      const S = f instanceof Error ? f.message : typeof f == "string" ? f : "true";
      Qt$2(e, "X-Error", S.replace(/[\r\n]+/g, ""));
    } else f = at$3(f, r, w, true);
    return s ? (Qt$2(e, "x-serialized", "true"), Qt$2(e, "content-type", "text/javascript"), rt$3(s, f)) : f;
  }
}
function at$3(e, t, r, n) {
  const s = new URL(t.url), i = e instanceof Error;
  let o = 302, u;
  return e instanceof Response ? (u = new Headers(e.headers), e.headers.has("Location") && (u.set("Location", new URL(e.headers.get("Location"), s.origin + "").toString()), o = Gr(e))) : u = new Headers({ Location: new URL(t.headers.get("referer")).toString() }), e && u.append("Set-Cookie", `flash=${encodeURIComponent(JSON.stringify({ url: s.pathname + s.search, result: i ? e.message : e, thrown: n, error: i, input: [...r.slice(0, -1), [...r[r.length - 1].entries()]] }))}; Secure; HttpOnly;`), new Response(null, { status: o, headers: u });
}
let me$1;
function co(e) {
  var _a2;
  const t = new Headers(e.request.headers), r = Jt$2(e.nativeEvent), n = e.response.headers.getSetCookie();
  t.delete("cookie");
  let s = false;
  return ((_a2 = e.nativeEvent.node) == null ? void 0 : _a2.req) && (s = true, e.nativeEvent.node.req.headers.cookie = ""), n.forEach((i) => {
    if (!i) return;
    const { maxAge: o, expires: u, name: c, value: l } = Ar(i);
    if (o != null && o <= 0) {
      delete r[c];
      return;
    }
    if (u != null && u.getTime() <= Date.now()) {
      delete r[c];
      return;
    }
    r[c] = l;
  }), Object.entries(r).forEach(([i, o]) => {
    t.append("cookie", `${i}=${o}`), s && (e.nativeEvent.node.req.headers.cookie += `${i}=${o};`);
  }), t;
}
async function st$3(e, t) {
  let r, n = new URL(e.request.headers.get("referer")).toString();
  t instanceof Response && (t.headers.has("X-Revalidate") && (r = t.headers.get("X-Revalidate").split(",")), t.headers.has("Location") && (n = new URL(t.headers.get("Location"), new URL(e.request.url).origin + "").toString()));
  const s = yt$3(e);
  return s.request = new Request(n, { headers: co(e) }), await provideRequestEvent(s, async () => {
    await Vr(s), me$1 || (me$1 = (await import('../build/app-PN6qWyv6.mjs')).default), s.router.dataOnly = r || true, s.router.previousUrl = e.request.headers.get("referer");
    try {
      renderToString(() => {
        sharedConfig.context.event = s, me$1();
      });
    } catch (u) {
      console.log(u);
    }
    const i = s.router.data;
    if (!i) return t;
    let o = false;
    for (const u in i) i[u] === void 0 ? delete i[u] : o = true;
    return o && (t instanceof Response ? t.customBody && (i._$value = t.customBody()) : (i._$value = t, t = new Response(null, { status: 200 })), t.customBody = () => i, t.headers.set("X-Single-Flight", "true")), t;
  });
}
const _o = eventHandler(uo);

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, key + "" , value);
function Ve$1(t = {}) {
  let e, n = false;
  const r = (o) => {
    if (e && e !== o) throw new Error("Context conflict");
  };
  let s;
  if (t.asyncContext) {
    const o = t.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    o ? s = new o() : console.warn("[unctx] `AsyncLocalStorage` is not provided.");
  }
  const a = () => {
    if (s) {
      const o = s.getStore();
      if (o !== void 0) return o;
    }
    return e;
  };
  return { use: () => {
    const o = a();
    if (o === void 0) throw new Error("Context is not available");
    return o;
  }, tryUse: () => a(), set: (o, c) => {
    c || r(o), e = o, n = true;
  }, unset: () => {
    e = void 0, n = false;
  }, call: (o, c) => {
    r(o), e = o;
    try {
      return s ? s.run(o, c) : c();
    } finally {
      n || (e = void 0);
    }
  }, async callAsync(o, c) {
    e = o;
    const d = () => {
      e = o;
    }, p = () => e === o ? d : void 0;
    oe.add(p);
    try {
      const u = s ? s.run(o, c) : c();
      return n || (e = void 0), await u;
    } finally {
      oe.delete(p);
    }
  } };
}
function Ze$1(t = {}) {
  const e = {};
  return { get(n, r = {}) {
    return e[n] || (e[n] = Ve$1({ ...t, ...r })), e[n];
  } };
}
const N$2 = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof global < "u" ? global : {}, re = "__unctx__", et$2 = N$2[re] || (N$2[re] = Ze$1()), tt$2 = (t, e = {}) => et$2.get(t, e), se = "__unctx_async_handlers__", oe = N$2[se] || (N$2[se] = /* @__PURE__ */ new Set());
function nt$2(t) {
  let e;
  const n = ye(t), r = { duplex: "half", method: t.method, headers: t.headers };
  return t.node.req.body instanceof ArrayBuffer ? new Request(n, { ...r, body: t.node.req.body }) : new Request(n, { ...r, get body() {
    return e || (e = lt$2(t), e);
  } });
}
function rt$2(t) {
  var _a;
  return (_a = t.web) != null ? _a : t.web = { request: nt$2(t), url: ye(t) }, t.web.request;
}
function st$2() {
  return pt$2();
}
const ge = /* @__PURE__ */ Symbol("$HTTPEvent");
function ot$2(t) {
  return typeof t == "object" && (t instanceof H3Event || (t == null ? void 0 : t[ge]) instanceof H3Event || (t == null ? void 0 : t.__is_event__) === true);
}
function R$2(t) {
  return function(...e) {
    var _a;
    let n = e[0];
    if (ot$2(n)) e[0] = n instanceof H3Event || n.__is_event__ ? n : n[ge];
    else {
      if (!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (n = st$2(), !n) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      e.unshift(n);
    }
    return t(...e);
  };
}
const ye = R$2(getRequestURL), at$2 = R$2(getRequestIP), ae = R$2(setResponseStatus), ie = R$2(getResponseStatus), it$2 = R$2(getResponseStatusText), M$1 = R$2(getResponseHeaders), ce = R$2(getResponseHeader), ct$2 = R$2(setResponseHeader), ut$1 = R$2(appendResponseHeader), Jt = R$2(sendRedirect), Xt = R$2(getCookie), Yt = R$2(setCookie), Qt = R$2(setHeader), lt$2 = R$2(getRequestWebStream), ft$2 = R$2(removeResponseHeader), dt$2 = R$2(rt$2);
function ht$2() {
  var _a;
  return tt$2("nitro-app", { asyncContext: !!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function pt$2() {
  return ht$2().use().event;
}
const K$2 = "solidFetchEvent";
function gt$1(t) {
  return { request: dt$2(t), response: wt$1(t), clientAddress: at$2(t), locals: {}, nativeEvent: t };
}
function yt$1(t) {
  return { ...t };
}
function Vt(t) {
  if (!t.context[K$2]) {
    const e = gt$1(t);
    t.context[K$2] = e;
  }
  return t.context[K$2];
}
let mt$1 = class mt {
  constructor(e) {
    __publicField(this, "event");
    this.event = e;
  }
  get(e) {
    const n = ce(this.event, e);
    return Array.isArray(n) ? n.join(", ") : n || null;
  }
  has(e) {
    return this.get(e) !== null;
  }
  set(e, n) {
    return ct$2(this.event, e, n);
  }
  delete(e) {
    return ft$2(this.event, e);
  }
  append(e, n) {
    ut$1(this.event, e, n);
  }
  getSetCookie() {
    const e = ce(this.event, "Set-Cookie");
    return Array.isArray(e) ? e : [e];
  }
  forEach(e) {
    return Object.entries(M$1(this.event)).forEach(([n, r]) => e(Array.isArray(r) ? r.join(", ") : r, n, this));
  }
  entries() {
    return Object.entries(M$1(this.event)).map(([e, n]) => [e, Array.isArray(n) ? n.join(", ") : n])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(M$1(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(M$1(this.event)).map((e) => Array.isArray(e) ? e.join(", ") : e)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
};
function wt$1(t) {
  return { get status() {
    return ie(t);
  }, set status(e) {
    ae(t, e);
  }, get statusText() {
    return it$2(t);
  }, set statusText(e) {
    ae(t, ie(t), e);
  }, headers: new mt$1(t) };
}
function Zt(t, e, n) {
  if (typeof t != "function") throw new Error("Export from a 'use server' module must be a function");
  const r = "";
  return new Proxy(t, { get(s, a, o) {
    return a === "url" ? `${r}/_server?id=${encodeURIComponent(e)}&name=${encodeURIComponent(n)}` : a === "GET" ? o : s[a];
  }, apply(s, a, o) {
    const c = getRequestEvent();
    if (!c) throw new Error("Cannot call server function outside of a request");
    const d = yt$1(c);
    return d.locals.serverFunctionMeta = { id: e + "#" + n }, d.serverOnly = true, provideRequestEvent(d, () => t.apply(a, o));
  } });
}
function Rt$1() {
  let t = /* @__PURE__ */ new Set();
  function e(s) {
    return t.add(s), () => t.delete(s);
  }
  let n = false;
  function r(s, a) {
    if (n) return !(n = false);
    const o = { to: s, options: a, defaultPrevented: false, preventDefault: () => o.defaultPrevented = true };
    for (const c of t) c.listener({ ...o, from: c.location, retry: (d) => {
      d && (n = true), c.navigate(s, { ...a, resolve: false });
    } });
    return !o.defaultPrevented;
  }
  return { subscribe: e, confirm: r };
}
let X$2;
function me() {
  (!window.history.state || window.history.state._depth == null) && window.history.replaceState({ ...window.history.state, _depth: window.history.length - 1 }, ""), X$2 = window.history.state._depth;
}
isServer || me();
function en(t) {
  return { ...t, _depth: window.history.state && window.history.state._depth };
}
function tn(t, e) {
  let n = false;
  return () => {
    const r = X$2;
    me();
    const s = r == null ? null : X$2 - r;
    if (n) {
      n = false;
      return;
    }
    s && e(s) ? (n = true, window.history.go(-s)) : t();
  };
}
const vt$2 = /^(?:[a-z0-9]+:)?\/\//i, xt = /^\/+|(\/)\/+$/g, bt$2 = "http://sr";
function j$1(t, e = false) {
  const n = t.replace(xt, "$1");
  return n ? e || /^[?#]/.test(n) ? n : "/" + n : "";
}
function D$2(t, e, n) {
  if (vt$2.test(e)) return;
  const r = j$1(t), s = n && j$1(n);
  let a = "";
  return !s || e.startsWith("/") ? a = r : s.toLowerCase().indexOf(r.toLowerCase()) !== 0 ? a = r + s : a = s, (a || "/") + j$1(e, !a);
}
function St$1(t, e) {
  if (t == null) throw new Error(e);
  return t;
}
function Ct$1(t, e) {
  return j$1(t).replace(/\/*(\*.*)?$/g, "") + j$1(e);
}
function we(t) {
  const e = {};
  return t.searchParams.forEach((n, r) => {
    r in e ? Array.isArray(e[r]) ? e[r].push(n) : e[r] = [e[r], n] : e[r] = n;
  }), e;
}
function Et$1(t, e, n) {
  const [r, s] = t.split("/*", 2), a = r.split("/").filter(Boolean), o = a.length;
  return (c) => {
    const d = c.split("/").filter(Boolean), p = d.length - o;
    if (p < 0 || p > 0 && s === void 0 && !e) return null;
    const u = { path: o ? "" : "/", params: {} }, i = (y) => n === void 0 ? void 0 : n[y];
    for (let y = 0; y < o; y++) {
      const l = a[y], m = l[0] === ":", h = m ? d[y] : d[y].toLowerCase(), w = m ? l.slice(1) : l.toLowerCase();
      if (m && z$1(h, i(w))) u.params[w] = h;
      else if (m || !z$1(h, w)) return null;
      u.path += `/${h}`;
    }
    if (s) {
      const y = p ? d.slice(-p).join("/") : "";
      if (z$1(y, i(s))) u.params[s] = y;
      else return null;
    }
    return u;
  };
}
function z$1(t, e) {
  const n = (r) => r === t;
  return e === void 0 ? true : typeof e == "string" ? n(e) : typeof e == "function" ? e(t) : Array.isArray(e) ? e.some(n) : e instanceof RegExp ? e.test(t) : false;
}
function Pt$1(t) {
  const [e, n] = t.pattern.split("/*", 2), r = e.split("/").filter(Boolean);
  return r.reduce((s, a) => s + (a.startsWith(":") ? 2 : 3), r.length - (n === void 0 ? 0 : 1));
}
function Re(t) {
  const e = /* @__PURE__ */ new Map(), n = getOwner();
  return new Proxy({}, { get(r, s) {
    return e.has(s) || runWithOwner(n, () => e.set(s, createMemo(() => t()[s]))), e.get(s)();
  }, getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  }, ownKeys() {
    return Reflect.ownKeys(t());
  }, has(r, s) {
    return s in t();
  } });
}
function ve(t) {
  let e = /(\/?\:[^\/]+)\?/.exec(t);
  if (!e) return [t];
  let n = t.slice(0, e.index), r = t.slice(e.index + e[0].length);
  const s = [n, n += e[1]];
  for (; e = /^(\/\:[^\/]+)\?/.exec(r); ) s.push(n += e[1]), r = r.slice(e[0].length);
  return ve(r).reduce((a, o) => [...a, ...s.map((c) => c + o)], []);
}
const At$1 = 100, _t = createContext$1(), Ht = createContext$1(), qt = () => St$1(useContext(_t), "<A> and 'use' router primitives can be only used inside a Route."), Tt$1 = () => qt().navigatorFactory();
function Ot(t, e = "") {
  const { component: n, preload: r, load: s, children: a, info: o } = t, c = !a || Array.isArray(a) && !a.length, d = { key: t, component: n, preload: r || s, info: o };
  return xe(t.path).reduce((p, u) => {
    for (const i of ve(u)) {
      const y = Ct$1(e, i);
      let l = c ? y : y.split("/*", 1)[0];
      l = l.split("/").map((m) => m.startsWith(":") || m.startsWith("*") ? m : encodeURIComponent(m)).join("/"), p.push({ ...d, originalPath: u, pattern: l, matcher: Et$1(l, !c, t.matchFilters) });
    }
    return p;
  }, []);
}
function Lt$1(t, e = 0) {
  return { routes: t, score: Pt$1(t[t.length - 1]) * 1e4 - e, matcher(n) {
    const r = [];
    for (let s = t.length - 1; s >= 0; s--) {
      const a = t[s], o = a.matcher(n);
      if (!o) return null;
      r.unshift({ ...o, route: a });
    }
    return r;
  } };
}
function xe(t) {
  return Array.isArray(t) ? t : [t];
}
function $t$1(t, e = "", n = [], r = []) {
  const s = xe(t);
  for (let a = 0, o = s.length; a < o; a++) {
    const c = s[a];
    if (c && typeof c == "object") {
      c.hasOwnProperty("path") || (c.path = "");
      const d = Ot(c, e);
      for (const p of d) {
        n.push(p);
        const u = Array.isArray(c.children) && c.children.length === 0;
        if (c.children && !u) $t$1(c.children, p.pattern, n, r);
        else {
          const i = Lt$1([...n], r.length);
          r.push(i);
        }
        n.pop();
      }
    }
  }
  return n.length ? r : r.sort((a, o) => o.score - a.score);
}
function G$2(t, e) {
  for (let n = 0, r = t.length; n < r; n++) {
    const s = t[n].matcher(e);
    if (s) return s;
  }
  return [];
}
function Ft(t, e, n) {
  const r = new URL(bt$2), s = createMemo((u) => {
    const i = t();
    try {
      return new URL(i, r);
    } catch {
      return console.error(`Invalid path ${i}`), u;
    }
  }, r, { equals: (u, i) => u.href === i.href }), a = createMemo(() => s().pathname), o = createMemo(() => s().search, true), c = createMemo(() => s().hash), d = () => "", p = on$3(o, () => we(s()));
  return { get pathname() {
    return a();
  }, get search() {
    return o();
  }, get hash() {
    return c();
  }, get state() {
    return e();
  }, get key() {
    return d();
  }, query: n ? n(p) : Re(p) };
}
let A;
function jt$1() {
  return A;
}
let F$1 = false;
function kt$1() {
  return F$1;
}
function nn(t) {
  F$1 = t;
}
function rn(t, e, n, r = {}) {
  const { signal: [s, a], utils: o = {} } = t, c = o.parsePath || ((f) => f), d = o.renderPath || ((f) => f), p = o.beforeLeave || Rt$1(), u = D$2("", r.base || "");
  if (u === void 0) throw new Error(`${u} is not a valid base path`);
  u && !s().value && a({ value: u, replace: true, scroll: false });
  const [i, y] = createSignal(false);
  let l;
  const m = (f, g) => {
    g.value === h() && g.state === v() || (l === void 0 && y(true), A = f, l = g, startTransition(() => {
      l === g && (w(l.value), H(l.state), resetErrorBoundaries(), isServer || Q[1]((b) => b.filter((q) => q.pending)));
    }).finally(() => {
      l === g && batch(() => {
        A = void 0, f === "navigate" && Ee(l), y(false), l = void 0;
      });
    }));
  }, [h, w] = createSignal(s().value), [v, H] = createSignal(s().state), C = Ft(h, v, o.queryWrapper), E = [], Q = createSignal(isServer ? Ae() : []), V = createMemo(() => typeof r.transformUrl == "function" ? G$2(e(), r.transformUrl(C.pathname)) : G$2(e(), C.pathname)), Z = () => {
    const f = V(), g = {};
    for (let b = 0; b < f.length; b++) Object.assign(g, f[b].params);
    return g;
  }, be = o.paramsWrapper ? o.paramsWrapper(Z, e) : Re(Z), ee = { pattern: u, path: () => u, outlet: () => null, resolvePath(f) {
    return D$2(u, f);
  } };
  return createRenderEffect(on$3(s, (f) => m("native", f), { defer: true })), { base: ee, location: C, params: be, isRouting: i, renderPath: d, parsePath: c, navigatorFactory: Ce, matches: V, beforeLeave: p, preloadRoute: Pe, singleFlight: r.singleFlight === void 0 ? true : r.singleFlight, submissions: Q };
  function Se(f, g, b) {
    untrack(() => {
      if (typeof g == "number") {
        g && (o.go ? o.go(g) : console.warn("Router integration does not support relative routing"));
        return;
      }
      const q = !g || g[0] === "?", { replace: W, resolve: T, scroll: U, state: O } = { replace: false, resolve: !q, scroll: true, ...b }, L = T ? f.resolvePath(g) : D$2(q && C.pathname || "", g);
      if (L === void 0) throw new Error(`Path '${g}' is not a routable path`);
      if (E.length >= At$1) throw new Error("Too many redirects");
      const te = h();
      if (L !== te || O !== v()) if (isServer) {
        const ne = getRequestEvent();
        ne && (ne.response = { status: 302, headers: new Headers({ Location: L }) }), a({ value: L, replace: W, scroll: U, state: O });
      } else p.confirm(L, b) && (E.push({ value: te, replace: W, scroll: U, state: v() }), m("navigate", { value: L, state: O }));
    });
  }
  function Ce(f) {
    return f = f || useContext(Ht) || ee, (g, b) => Se(f, g, b);
  }
  function Ee(f) {
    const g = E[0];
    g && (a({ ...f, replace: g.replace, scroll: g.scroll }), E.length = 0);
  }
  function Pe(f, g) {
    const b = G$2(e(), f.pathname), q = A;
    A = "preload";
    for (let W in b) {
      const { route: T, params: U } = b[W];
      T.component && T.component.preload && T.component.preload();
      const { preload: O } = T;
      F$1 = true, g && O && runWithOwner(n(), () => O({ params: U, location: { pathname: f.pathname, search: f.search, hash: f.hash, query: we(f), state: null, key: "" }, intent: "preload" })), F$1 = false;
    }
    A = q;
  }
  function Ae() {
    const f = getRequestEvent();
    return f && f.router && f.router.submission ? [f.router.submission] : [];
  }
}
function sn(t, e, n, r) {
  const { base: s, location: a, params: o } = t, { pattern: c, component: d, preload: p } = r().route, u = createMemo(() => r().path);
  d && d.preload && d.preload(), F$1 = true;
  const i = p ? p({ params: o, location: a, intent: A || "initial" }) : void 0;
  return F$1 = false, { parent: e, pattern: c, path: u, outlet: () => d ? createComponent(d, { params: o, location: a, data: i, get children() {
    return n();
  } }) : n(), resolvePath(l) {
    return D$2(s.path(), l, u());
  } };
}
const It = "Location", Wt = 5e3, Ut = 18e4;
let Y$2 = /* @__PURE__ */ new Map();
isServer || setInterval(() => {
  const t = Date.now();
  for (let [e, n] of Y$2.entries()) !n[4].count && t - n[0] > Ut && Y$2.delete(e);
}, 3e5);
function k$2() {
  if (!isServer) return Y$2;
  const t = getRequestEvent();
  if (!t) throw new Error("Cannot find cache context");
  return (t.router || (t.router = {})).cache || (t.router.cache = /* @__PURE__ */ new Map());
}
function I(t, e) {
  t.GET && (t = t.GET);
  const n = (...r) => {
    const s = k$2(), a = jt$1(), o = kt$1(), d = getOwner() ? Tt$1() : void 0, p = Date.now(), u = e + ue(r);
    let i = s.get(u), y;
    if (isServer) {
      const h = getRequestEvent();
      if (h) {
        const w = (h.router || (h.router = {})).dataOnly;
        if (w) {
          const v = h && (h.router.data || (h.router.data = {}));
          if (v && u in v) return v[u];
          if (Array.isArray(w) && !Mt(u, w)) return v[u] = void 0, Promise.resolve();
        }
      }
    }
    if (getListener() && !isServer && (y = true, onCleanup(() => i[4].count--)), i && i[0] && (isServer || a === "native" || i[4].count || Date.now() - i[0] < Wt)) {
      y && (i[4].count++, i[4][0]()), i[3] === "preload" && a !== "preload" && (i[0] = p);
      let h = i[1];
      return a !== "preload" && (h = "then" in i[1] ? i[1].then(m(false), m(true)) : m(false)(i[1]), !isServer && a === "navigate" && startTransition(() => i[4][1](i[0]))), o && "then" in h && h.catch(() => {
      }), h;
    }
    let l;
    if (!isServer && sharedConfig.has && sharedConfig.has(u) ? (l = sharedConfig.load(u), delete globalThis._$HY.r[u]) : l = t(...r), i ? (i[0] = p, i[1] = l, i[3] = a, !isServer && a === "navigate" && startTransition(() => i[4][1](i[0]))) : (s.set(u, i = [p, l, , a, createSignal(p)]), i[4].count = 0), y && (i[4].count++, i[4][0]()), isServer) {
      const h = getRequestEvent();
      if (h && h.router.dataOnly) return h.router.data[u] = l;
    }
    if (a !== "preload" && (l = "then" in l ? l.then(m(false), m(true)) : m(false)(l)), o && "then" in l && l.catch(() => {
    }), isServer && sharedConfig.context && sharedConfig.context.async && !sharedConfig.context.noHydrate) {
      const h = getRequestEvent();
      (!h || !h.serverOnly) && sharedConfig.context.serialize(u, l);
    }
    return l;
    function m(h) {
      return async (w) => {
        if (w instanceof Response) {
          const v = getRequestEvent();
          if (v) for (const [C, E] of w.headers) C == "set-cookie" ? v.response.headers.append("set-cookie", E) : v.response.headers.set(C, E);
          const H = w.headers.get(It);
          if (H !== null) {
            d && H.startsWith("/") ? startTransition(() => {
              d(H, { replace: true });
            }) : isServer ? v && (v.response.status = 302) : window.location.href = H;
            return;
          }
          w.customBody && (w = await w.customBody());
        }
        if (h) throw w;
        return i[2] = w, w;
      };
    }
  };
  return n.keyFor = (...r) => e + ue(r), n.key = e, n;
}
I.get = (t) => k$2().get(t)[2];
I.set = (t, e) => {
  const n = k$2(), r = Date.now();
  let s = n.get(t);
  s ? (s[0] = r, s[1] = Promise.resolve(e), s[2] = e, s[3] = "preload") : (n.set(t, s = [r, Promise.resolve(e), e, "preload", createSignal(r)]), s[4].count = 0);
};
I.delete = (t) => k$2().delete(t);
I.clear = () => k$2().clear();
const on = I;
function Mt(t, e) {
  for (let n of e) if (n && t.startsWith(n)) return true;
  return false;
}
function ue(t) {
  return JSON.stringify(t, (e, n) => Bt(n) ? Object.keys(n).sort().reduce((r, s) => (r[s] = n[s], r), {}) : n);
}
function Bt(t) {
  let e;
  return t != null && typeof t == "object" && (!(e = Object.getPrototypeOf(t)) || e === Object.prototype);
}

var U$1 = Math.floor(Date.now() / 1e3), R$1 = getLogger("driver-solidstart"), C = async (n, e) => {
  const a = new URL(n.url), t = e == null ? void 0 : e.rivetSiteUrl;
  if (!t) throw new Error("rivetSiteUrl is required");
  const r = e == null ? void 0 : e.registry;
  if (!r) throw new Error("registry is not set");
  r.config.serveManager = false, r.config.serverless = { ...r.config.serverless, basePath: "/api/rivet" }, (e == null ? void 0 : e.isDev) ? (R$1.debug("detected development environment, auto-starting engine and auto-configuring serverless"), r.config.serverless.spawnEngine = true, r.config.serverless.configureRunnerPool = { url: `${t}/api/rivet`, minRunners: 0, maxRunners: 1e5, requestLifespan: 300, slotsPerRunner: 1, metadata: { provider: "solidstart" } }, r.config.runner = { ...r.config.runner, version: U$1 }) : R$1.debug("detected production environment, will not auto-start engine and auto-configure serverless");
  const o = `${t}${a.pathname}`, s = new Request(o, n);
  if (s.headers.set("host", new URL(o).host), s.headers.set("accept-encoding", "application/json"), e == null ? void 0 : e.headers) for (const [c, d] of Object.entries(e.headers)) s.headers.set(c, d);
  if (e == null ? void 0 : e.getHeaders) {
    const c = await e.getHeaders(n);
    for (const [d, u] of Object.entries(c)) s.headers.set(d, u);
  }
  return await r.handler(s);
}, k$1 = (n) => {
  const e = async ({ request: a }) => C(a, n);
  return { GET: e, POST: e, PUT: e, DELETE: e, PATCH: e, HEAD: e, OPTIONS: e };
}, H$1 = typeof globalThis.document < "u";
async function q$2(n, e) {
  const { actor: a, key: t, action: r, args: o = [], event: s, params: c, createInRegion: d, createWithInput: u } = e, g = Array.isArray(t) ? t : [t], v = await n.getOrCreate(a, g, { params: c, createInRegion: d, createWithInput: u }).action({ name: r, args: o });
  return H$1 ? T$2(n, e, v) : P(v);
}
function P(n) {
  const [e] = createSignal(n), [a] = createSignal(false), [t] = createSignal(void 0), [r] = createSignal(false);
  return { data: e, isLoading: a, error: t, isConnected: r };
}
function T$2(n, e, a) {
  const { actor: t, key: r, event: o, params: s, createInRegion: c, createWithInput: d, transform: u = (l, f) => f } = e, [g, m] = createSignal(a), [v, p] = createSignal(false), [E, y] = createSignal(void 0), [S, w] = createSignal(false), A = Array.isArray(r) ? r : [r], h = n.getOrCreate(t, A, { params: s, createInRegion: c, createWithInput: d }).connect();
  h.onOpen(() => {
    w(true);
  }), h.onClose(() => {
    w(false);
  }), h.onError((l) => {
    y(l instanceof Error ? l : new Error(String(l)));
  });
  const L = Array.isArray(o) ? o : [o];
  for (const l of L) h.on(l, (...f) => {
    const O = f.length === 1 ? f[0] : f;
    m(() => u(g(), O)), p(false), y(void 0);
  });
  return { data: g, isLoading: v, error: E, isConnected: S };
}

var K$1 = Object.create, $$1 = Object.defineProperty, Q$1 = Object.getOwnPropertyDescriptor, U = Object.getOwnPropertyNames, X$1 = Object.getPrototypeOf, Y$1 = Object.prototype.hasOwnProperty, Z$1 = (o, r) => function() {
  return r || (0, o[U(o)[0]])((r = { exports: {} }).exports, r), r.exports;
}, q$1 = (o, r, t, e) => {
  if (r && typeof r == "object" || typeof r == "function") for (let n of U(r)) !Y$1.call(o, n) && n !== t && $$1(o, n, { get: () => r[n], enumerable: !(e = Q$1(r, n)) || e.enumerable });
  return o;
}, tt$1 = (o, r, t) => (t = o != null ? K$1(X$1(o)) : {}, q$1($$1(t, "default", { value: o, enumerable: true }), o)), et$1 = Z$1({ "../../node_modules/.pnpm/fast-deep-equal@3.1.3/node_modules/fast-deep-equal/index.js"(o, r) {
  r.exports = function t(e, n) {
    if (e === n) return true;
    if (e && n && typeof e == "object" && typeof n == "object") {
      if (e.constructor !== n.constructor) return false;
      var i, a, s;
      if (Array.isArray(e)) {
        if (i = e.length, i != n.length) return false;
        for (a = i; a-- !== 0; ) if (!t(e[a], n[a])) return false;
        return true;
      }
      if (e.constructor === RegExp) return e.source === n.source && e.flags === n.flags;
      if (e.valueOf !== Object.prototype.valueOf) return e.valueOf() === n.valueOf();
      if (e.toString !== Object.prototype.toString) return e.toString() === n.toString();
      if (s = Object.keys(e), i = s.length, i !== Object.keys(n).length) return false;
      for (a = i; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(n, s[a])) return false;
      for (a = i; a-- !== 0; ) {
        var p = s[a];
        if (!t(e[p], n[p])) return false;
      }
      return true;
    }
    return e !== e && n !== n;
  };
} }), D$1 = /* @__PURE__ */ new WeakMap(), T$1 = /* @__PURE__ */ new WeakMap(), R = { current: [] }, M = false, j = /* @__PURE__ */ new Set(), k = /* @__PURE__ */ new Map();
function H(o) {
  const r = Array.from(o).sort((t, e) => t instanceof F && t.options.deps.includes(e) ? 1 : e instanceof F && e.options.deps.includes(t) ? -1 : 0);
  for (const t of r) {
    if (R.current.includes(t)) continue;
    R.current.push(t), t.recompute();
    const e = T$1.get(t);
    if (e) for (const n of e) {
      const i = D$1.get(n);
      i && H(i);
    }
  }
}
function nt$1(o) {
  o.listeners.forEach((r) => r({ prevVal: o.prevState, currentVal: o.state }));
}
function rt$1(o) {
  o.listeners.forEach((r) => r({ prevVal: o.prevState, currentVal: o.state }));
}
function ot$1(o) {
  var _a;
  if (j.add(o), !M) try {
    for (M = true; j.size > 0; ) {
      const r = Array.from(j);
      j.clear();
      for (const t of r) {
        const e = (_a = k.get(t)) != null ? _a : t.prevState;
        t.prevState = e, nt$1(t);
      }
      for (const t of r) {
        const e = D$1.get(t);
        e && (R.current.push(t), H(e));
      }
      for (const t of r) {
        const e = D$1.get(t);
        if (e) for (const n of e) rt$1(n);
      }
    }
  } finally {
    M = false, R.current = [], k.clear();
  }
}
function st$1(o) {
  return typeof o == "function";
}
var N$1 = class N {
  constructor(o, r) {
    this.listeners = /* @__PURE__ */ new Set(), this.subscribe = (t) => {
      var e, n;
      this.listeners.add(t);
      const i = (n = (e = this.options) == null ? void 0 : e.onSubscribe) == null ? void 0 : n.call(e, t, this);
      return () => {
        this.listeners.delete(t), i == null ? void 0 : i();
      };
    }, this.prevState = o, this.state = o, this.options = r;
  }
  setState(o) {
    var r, t, e;
    this.prevState = this.state, (r = this.options) != null && r.updateFn ? this.state = this.options.updateFn(this.prevState)(o) : st$1(o) ? this.state = o(this.prevState) : this.state = o, (e = (t = this.options) == null ? void 0 : t.onUpdate) == null || e.call(t), ot$1(this);
  }
}, F = class P {
  constructor(r) {
    this.listeners = /* @__PURE__ */ new Set(), this._subscriptions = [], this.lastSeenDepValues = [], this.getDepVals = () => {
      var _a;
      const t = [], e = [];
      for (const n of this.options.deps) t.push(n.prevState), e.push(n.state);
      return this.lastSeenDepValues = e, { prevDepVals: t, currDepVals: e, prevVal: (_a = this.prevState) != null ? _a : void 0 };
    }, this.recompute = () => {
      var t, e;
      this.prevState = this.state;
      const { prevDepVals: n, currDepVals: i, prevVal: a } = this.getDepVals();
      this.state = this.options.fn({ prevDepVals: n, currDepVals: i, prevVal: a }), (e = (t = this.options).onUpdate) == null || e.call(t);
    }, this.checkIfRecalculationNeededDeeply = () => {
      for (const i of this.options.deps) i instanceof P && i.checkIfRecalculationNeededDeeply();
      let t = false;
      const e = this.lastSeenDepValues, { currDepVals: n } = this.getDepVals();
      for (let i = 0; i < n.length; i++) if (n[i] !== e[i]) {
        t = true;
        break;
      }
      t && this.recompute();
    }, this.mount = () => (this.registerOnGraph(), this.checkIfRecalculationNeededDeeply(), () => {
      this.unregisterFromGraph();
      for (const t of this._subscriptions) t();
    }), this.subscribe = (t) => {
      var e, n;
      this.listeners.add(t);
      const i = (n = (e = this.options).onSubscribe) == null ? void 0 : n.call(e, t, this);
      return () => {
        this.listeners.delete(t), i == null ? void 0 : i();
      };
    }, this.options = r, this.state = r.fn({ prevDepVals: void 0, prevVal: void 0, currDepVals: this.getDepVals().currDepVals });
  }
  registerOnGraph(r = this.options.deps) {
    for (const t of r) if (t instanceof P) t.registerOnGraph(), this.registerOnGraph(t.options.deps);
    else if (t instanceof N$1) {
      let e = D$1.get(t);
      e || (e = /* @__PURE__ */ new Set(), D$1.set(t, e)), e.add(this);
      let n = T$1.get(this);
      n || (n = /* @__PURE__ */ new Set(), T$1.set(this, n)), n.add(t);
    }
  }
  unregisterFromGraph(r = this.options.deps) {
    for (const t of r) if (t instanceof P) this.unregisterFromGraph(t.options.deps);
    else if (t instanceof N$1) {
      const e = D$1.get(t);
      e && e.delete(this);
      const n = T$1.get(this);
      n && n.delete(t);
    }
  }
}, it$1 = class it {
  constructor(o) {
    const { eager: r, fn: t, ...e } = o;
    this._derived = new F({ ...e, fn: () => {
    }, onUpdate() {
      t();
    } }), r && t();
  }
  mount() {
    return this._derived.mount();
  }
}, ct$1 = tt$1(et$1());
function at$1(o, r = {}) {
  const t = new N$1({ actors: {} }), e = /* @__PURE__ */ new Map();
  return { getOrCreateActor: (n) => ut(o, r, t, e, n), store: t };
}
function E(o, r, t) {
  o.setState((e) => ({ ...e, actors: { ...e.actors, [r]: { ...e.actors[r], ...t } } }));
}
function ut(o, r, t, e, n) {
  var _a;
  const i = r.hashFunction || lt$1, a = { ...n, enabled: (_a = n.enabled) != null ? _a : true }, s = i(a), p = t.state.actors[s];
  p ? ft$1(p.opts, a) || queueMicrotask(() => {
    E(t, s, { opts: a });
  }) : t.setState((c) => ({ ...c, actors: { ...c.actors, [s]: { hash: s, connStatus: "idle", connection: null, handle: null, error: null, opts: a } } }));
  const V = e.get(s);
  if (V) return { ...V, state: V.state };
  const S = new F({ fn: ({ currDepVals: [c] }) => {
    const l = c.actors[s];
    return { ...l, isConnected: l.connStatus === "connected" };
  }, deps: [t] }), L = new it$1({ fn: () => {
    const c = t.state.actors[s];
    if (!c) throw new Error(`Actor with key "${s}" not found in store. This indicates a bug in cleanup logic.`);
    if (!c.opts.enabled && c.connection) {
      c.connection.dispose(), E(t, s, { connection: null, handle: null, connStatus: "idle" });
      return;
    }
    c.connStatus === "idle" && c.opts.enabled && queueMicrotask(() => {
      const l = t.state.actors[s];
      l && l.connStatus === "idle" && l.opts.enabled && G$1(o, t, s);
    });
  }, deps: [S] });
  let w = null, A = null;
  const u = () => {
    const c = e.get(s);
    if (!c) throw new Error(`Actor with key "${s}" not found in cache. This indicates a bug in cleanup logic.`);
    if (c.cleanupTimeout !== null && (clearTimeout(c.cleanupTimeout), c.cleanupTimeout = null), c.refCount++, c.refCount === 1) {
      w = S.mount(), A = L.mount();
      const l = t.state.actors[s];
      l && l.opts.enabled && l.connStatus === "idle" && G$1(o, t, s);
    }
    return () => {
      c.refCount--, c.refCount === 0 && (c.cleanupTimeout = setTimeout(() => {
        if (c.cleanupTimeout = null, c.refCount > 0) return;
        w == null ? void 0 : w(), A == null ? void 0 : A(), w = null, A = null;
        const l = t.state.actors[s];
        (l == null ? void 0 : l.connection) && l.connection.dispose(), t.setState((g) => {
          const { [s]: v, ...m } = g.actors;
          return { ...g, actors: m };
        }), e.delete(s);
      }, 0));
    };
  };
  return e.set(s, { state: S, key: s, mount: u, create: G$1.bind(void 0, o, t, s), refCount: 0, cleanupTimeout: null }), { mount: u, state: S, key: s };
}
function G$1(o, r, t) {
  const e = r.state.actors[t];
  if (!e) throw new Error(`Actor with key "${t}" not found in store. This indicates a bug in cleanup logic.`);
  E(r, t, { connStatus: "connecting", error: null });
  try {
    const n = e.opts.noCreate ? o.get(e.opts.name, e.opts.key, { params: e.opts.params }) : o.getOrCreate(e.opts.name, e.opts.key, { params: e.opts.params, createInRegion: e.opts.createInRegion, createWithInput: e.opts.createWithInput }), i = n.connect();
    E(r, t, { handle: n, connection: i }), i.onStatusChange((a) => {
      r.setState((s) => {
        var p;
        return ((p = s.actors[t]) == null ? void 0 : p.connection) === i ? { ...s, actors: { ...s.actors, [t]: { ...s.actors[t], connStatus: a, ...a === "connected" ? { error: null } : {} } } } : s;
      });
    }), i.onError((a) => {
      r.setState((s) => {
        var p;
        return ((p = s.actors[t]) == null ? void 0 : p.connection) !== i ? s : { ...s, actors: { ...s.actors, [t]: { ...s.actors[t], error: a } } };
      });
    });
  } catch (n) {
    console.error("Failed to create actor connection", n), E(r, t, { connStatus: "disconnected", error: n });
  }
}
function lt$1({ name: o, key: r, params: t, noCreate: e }) {
  return JSON.stringify({ name: o, key: r, params: t, noCreate: e });
}
function ft$1(o, r) {
  return (0, ct$1.default)(o, r);
}
function pt$1(o, r = {}) {
  const { getOrCreateActor: t } = at$1(o, r);
  function e(n) {
    const { mount: i, state: a } = t(n);
    createRoot(() => {
      i();
    });
    const [s, p] = createSignal(void 0), V = a == null ? void 0 : a.subscribe((u) => {
      p(u.currentVal);
    });
    onCleanup(() => V == null ? void 0 : V());
    function S(u, c) {
      let l = c;
      createEffect(() => {
        l = c;
      }), createEffect(() => {
        var _a;
        const g = s();
        if (!(g == null ? void 0 : g.connection)) return;
        function v(..._) {
          l(..._);
        }
        const m = (_a = g.connection) == null ? void 0 : _a.on(u, v);
        onCleanup(() => m == null ? void 0 : m());
      });
    }
    const L = { connect() {
      var _a, _b;
      (_b = (_a = s()) == null ? void 0 : _a.connection) == null ? void 0 : _b.connect();
    }, get connection() {
      var _a;
      return (_a = s()) == null ? void 0 : _a.connection;
    }, get handle() {
      var _a;
      return (_a = s()) == null ? void 0 : _a.handle;
    }, get isConnected() {
      var _a;
      return ((_a = s()) == null ? void 0 : _a.connStatus) === "connected";
    }, get isConnecting() {
      var _a;
      return ((_a = s()) == null ? void 0 : _a.connStatus) === "connecting";
    }, get isError() {
      var _a;
      return !!((_a = s()) == null ? void 0 : _a.error);
    }, get error() {
      var _a;
      return (_a = s()) == null ? void 0 : _a.error;
    }, get opts() {
      var _a;
      return (_a = s()) == null ? void 0 : _a.opts;
    }, get hash() {
      var _a;
      return (_a = s()) == null ? void 0 : _a.hash;
    } };
    function w(u) {
      var _a;
      const [c, l] = createSignal(u.initialValue), [g, v] = createSignal(true), [m, _] = createSignal(null), I = (_a = u.transform) != null ? _a : ((f, d) => f !== null && d !== null && typeof f == "object" && typeof d == "object" && !Array.isArray(f) && !Array.isArray(d) ? { ...f, ...d } : d);
      return S(u.event, (...f) => {
        const d = f.length === 1 ? f[0] : f;
        l(() => I(c(), d)), v(false), _(null);
      }), createEffect(() => {
        var _a2, _b;
        const f = (_a2 = s()) == null ? void 0 : _a2.connection;
        if (!f) return;
        const d = f[u.action];
        if (typeof d != "function") {
          _(new Error(`Action '${u.action}' not found on actor connection`)), v(false);
          return;
        }
        const x = (_b = u.args) != null ? _b : [];
        Promise.resolve(d.call(f, ...x)).then((h) => {
          l(() => h), v(false);
        }).catch((h) => {
          _(h instanceof Error ? h : new Error(String(h))), v(false);
        });
      }), { get value() {
        return c();
      }, get isLoading() {
        return g();
      }, get error() {
        return m();
      } };
    }
    function A(u) {
      const [c, l] = createSignal(u.initialValue), [g, v] = createSignal(true), [m, _] = createSignal(null), [I, f] = createSignal(0);
      function d() {
        var _a, _b, _c;
        const h = (_a = s()) == null ? void 0 : _a.connection;
        if (!h) return;
        const O = h[u.action];
        if (typeof O != "function") {
          _(new Error(`Action '${u.action}' not found on actor connection`)), v(false);
          return;
        }
        const z = (_c = (_b = u.args) == null ? void 0 : _b.call(u)) != null ? _c : [];
        v(true), Promise.resolve(O.call(h, ...z)).then((y) => {
          l(() => y), v(false), _(null);
        }).catch((y) => {
          _(y instanceof Error ? y : new Error(String(y))), v(false);
        });
      }
      const x = Array.isArray(u.event) ? u.event : [u.event];
      for (const h of x) S(h, () => {
        f((O) => O + 1);
      });
      return createEffect(() => {
        var _a, _b;
        const h = (_a = s()) == null ? void 0 : _a.connection;
        (_b = u.args) == null ? void 0 : _b.call(u), I(), h && d();
      }), { get value() {
        return c();
      }, get isLoading() {
        return g();
      }, get error() {
        return m();
      }, refetch: d };
    }
    return { current: L, useEvent: S, useQuery: w, useActionQuery: A };
  }
  return { useActor: e };
}
const dt$1 = typeof globalThis.document < "u", ht$1 = dt$1 ? `${location.origin}/api/rivet` : "http://localhost:3000/api/rivet", vt$1 = createClient(ht$1), { useActor: bt$1 } = pt$1(vt$1);

const $ = { NORMAL: 0, WILDCARD: 1, PLACEHOLDER: 2 };
function Fe(e = {}) {
  const t = { options: e, rootNode: Y(), staticRoutesMap: {} }, r = (s) => e.strictTrailingSlash ? s : s.replace(/\/$/, "") || "/";
  if (e.routes) for (const s in e.routes) q(t, r(s), e.routes[s]);
  return { ctx: t, lookup: (s) => je(t, r(s)), insert: (s, n) => q(t, r(s), n), remove: (s) => qe(t, r(s)) };
}
function je(e, t) {
  const r = e.staticRoutesMap[t];
  if (r) return r.data;
  const s = t.split("/"), n = {};
  let o = false, i = null, a = e.rootNode, l = null;
  for (let c = 0; c < s.length; c++) {
    const m = s[c];
    a.wildcardChildNode !== null && (i = a.wildcardChildNode, l = s.slice(c).join("/"));
    const v = a.children.get(m);
    if (v === void 0) {
      if (a && a.placeholderChildren.length > 1) {
        const E = s.length - c;
        a = a.placeholderChildren.find((f) => f.maxDepth === E) || null;
      } else a = a.placeholderChildren[0] || null;
      if (!a) break;
      a.paramName && (n[a.paramName] = m), o = true;
    } else a = v;
  }
  return (a === null || a.data === null) && i !== null && (a = i, n[a.paramName || "_"] = l, o = true), a ? o ? { ...a.data, params: o ? n : void 0 } : a.data : null;
}
function q(e, t, r) {
  let s = true;
  const n = t.split("/");
  let o = e.rootNode, i = 0;
  const a = [o];
  for (const l of n) {
    let c;
    if (c = o.children.get(l)) o = c;
    else {
      const m = Be(l);
      c = Y({ type: m, parent: o }), o.children.set(l, c), m === $.PLACEHOLDER ? (c.paramName = l === "*" ? `_${i++}` : l.slice(1), o.placeholderChildren.push(c), s = false) : m === $.WILDCARD && (o.wildcardChildNode = c, c.paramName = l.slice(3) || "_", s = false), a.push(c), o = c;
    }
  }
  for (const [l, c] of a.entries()) c.maxDepth = Math.max(a.length - l, c.maxDepth || 0);
  return o.data = r, s === true && (e.staticRoutesMap[t] = o), o;
}
function qe(e, t) {
  let r = false;
  const s = t.split("/");
  let n = e.rootNode;
  for (const o of s) if (n = n.children.get(o), !n) return r;
  if (n.data) {
    const o = s.at(-1) || "";
    n.data = null, Object.keys(n.children).length === 0 && n.parent && (n.parent.children.delete(o), n.parent.wildcardChildNode = null, n.parent.placeholderChildren = []), r = true;
  }
  return r;
}
function Y(e = {}) {
  return { type: e.type || $.NORMAL, maxDepth: 0, parent: e.parent || null, children: /* @__PURE__ */ new Map(), data: e.data || null, paramName: e.paramName || null, wildcardChildNode: null, placeholderChildren: [] };
}
function Be(e) {
  return e.startsWith("**") ? $.WILDCARD : e[0] === ":" || e === "*" ? $.PLACEHOLDER : $.NORMAL;
}
const Q = (e) => (t) => {
  const { base: r } = t, s = children(() => t.children), n = createMemo(() => $t$1(s(), t.base || ""));
  let o;
  const i = rn(e, n, () => o, { base: r, singleFlight: t.singleFlight, transformUrl: t.transformUrl });
  return e.create && e.create(i), createComponent$1(_t.Provider, { value: i, get children() {
    return createComponent$1(We, { routerState: i, get root() {
      return t.root;
    }, get preload() {
      return t.rootPreload || t.rootLoad;
    }, get children() {
      return [(o = getOwner()) && null, createComponent$1(Ge, { routerState: i, get branches() {
        return n();
      } })];
    } });
  } });
};
function We(e) {
  const t = e.routerState.location, r = e.routerState.params, s = createMemo(() => e.preload && untrack(() => {
    nn(true), e.preload({ params: r, location: t, intent: jt$1() || "initial" }), nn(false);
  }));
  return createComponent$1(Show, { get when() {
    return e.root;
  }, keyed: true, get fallback() {
    return e.children;
  }, children: (n) => createComponent$1(n, { params: r, location: t, get data() {
    return s();
  }, get children() {
    return e.children;
  } }) });
}
function Ge(e) {
  if (isServer) {
    const n = getRequestEvent();
    if (n && n.router && n.router.dataOnly) {
      ze(n, e.routerState, e.branches);
      return;
    }
    n && ((n.router || (n.router = {})).matches || (n.router.matches = e.routerState.matches().map(({ route: o, path: i, params: a }) => ({ path: o.originalPath, pattern: o.pattern, match: i, params: a, info: o.info }))));
  }
  const t = [];
  let r;
  const s = createMemo(on$3(e.routerState.matches, (n, o, i) => {
    let a = o && n.length === o.length;
    const l = [];
    for (let c = 0, m = n.length; c < m; c++) {
      const v = o && o[c], E = n[c];
      i && v && E.route.key === v.route.key ? l[c] = i[c] : (a = false, t[c] && t[c](), createRoot((f) => {
        t[c] = f, l[c] = sn(e.routerState, l[c - 1] || e.routerState.base, B(() => s()[c + 1]), () => {
          var _a;
          const w = e.routerState.matches();
          return (_a = w[c]) != null ? _a : w[0];
        });
      }));
    }
    return t.splice(n.length).forEach((c) => c()), i && a ? i : (r = l[0], l);
  }));
  return B(() => s() && r)();
}
const B = (e) => () => createComponent$1(Show, { get when() {
  return e();
}, keyed: true, children: (t) => createComponent$1(Ht.Provider, { value: t, get children() {
  return t.outlet();
} }) });
function ze(e, t, r) {
  const s = new URL(e.request.url), n = G$2(r, new URL(e.router.previousUrl || e.request.url).pathname), o = G$2(r, s.pathname);
  for (let i = 0; i < o.length; i++) {
    (!n[i] || o[i].route !== n[i].route) && (e.router.dataOnly = true);
    const { route: a, params: l } = o[i];
    a.preload && a.preload({ params: l, location: t.location, intent: "preload" });
  }
}
function Ke([e, t], r, s) {
  return [e, s ? (n) => t(s(n)) : t];
}
function Je(e) {
  let t = false;
  const r = (n) => typeof n == "string" ? { value: n } : n, s = Ke(createSignal(r(e.get()), { equals: (n, o) => n.value === o.value && n.state === o.state }), void 0, (n) => (!t && e.set(n), sharedConfig.registry && !sharedConfig.done && (sharedConfig.done = true), n));
  return e.init && onCleanup(e.init((n = e.get()) => {
    t = true, s[1](r(n)), t = false;
  })), Q({ signal: s, create: e.create, utils: e.utils });
}
function Ve(e, t, r) {
  return e.addEventListener(t, r), () => e.removeEventListener(t, r);
}
function Ye(e, t) {
  const r = e && document.getElementById(e);
  r ? r.scrollIntoView() : t && window.scrollTo(0, 0);
}
function Qe(e) {
  const t = new URL(e);
  return t.pathname + t.search;
}
function Xe(e) {
  let t;
  const r = { value: e.url || (t = getRequestEvent()) && Qe(t.request.url) || "" };
  return Q({ signal: [() => r, (s) => Object.assign(r, s)] })(e);
}
const Ze = /* @__PURE__ */ new Map();
function et(e = true, t = false, r = "/_server", s) {
  return (n) => {
    const o = n.base.path(), i = n.navigatorFactory(n.base);
    let a, l;
    function c(u) {
      return u.namespaceURI === "http://www.w3.org/2000/svg";
    }
    function m(u) {
      if (u.defaultPrevented || u.button !== 0 || u.metaKey || u.altKey || u.ctrlKey || u.shiftKey) return;
      const d = u.composedPath().find((M) => M instanceof Node && M.nodeName.toUpperCase() === "A");
      if (!d || t && !d.hasAttribute("link")) return;
      const g = c(d), p = g ? d.href.baseVal : d.href;
      if ((g ? d.target.baseVal : d.target) || !p && !d.hasAttribute("state")) return;
      const R = (d.getAttribute("rel") || "").split(/\s+/);
      if (d.hasAttribute("download") || R && R.includes("external")) return;
      const k = g ? new URL(p, document.baseURI) : new URL(p);
      if (!(k.origin !== window.location.origin || o && k.pathname && !k.pathname.toLowerCase().startsWith(o.toLowerCase()))) return [d, k];
    }
    function v(u) {
      const d = m(u);
      if (!d) return;
      const [g, p] = d, I = n.parsePath(p.pathname + p.search + p.hash), R = g.getAttribute("state");
      u.preventDefault(), i(I, { resolve: false, replace: g.hasAttribute("replace"), scroll: !g.hasAttribute("noscroll"), state: R ? JSON.parse(R) : void 0 });
    }
    function E(u) {
      const d = m(u);
      if (!d) return;
      const [g, p] = d;
      s && (p.pathname = s(p.pathname)), n.preloadRoute(p, g.getAttribute("preload") !== "false");
    }
    function f(u) {
      clearTimeout(a);
      const d = m(u);
      if (!d) return l = null;
      const [g, p] = d;
      l !== g && (s && (p.pathname = s(p.pathname)), a = setTimeout(() => {
        n.preloadRoute(p, g.getAttribute("preload") !== "false"), l = g;
      }, 20));
    }
    function w(u) {
      if (u.defaultPrevented) return;
      let d = u.submitter && u.submitter.hasAttribute("formaction") ? u.submitter.getAttribute("formaction") : u.target.getAttribute("action");
      if (!d) return;
      if (!d.startsWith("https://action/")) {
        const p = new URL(d, bt$2);
        if (d = n.parsePath(p.pathname + p.search), !d.startsWith(r)) return;
      }
      if (u.target.method.toUpperCase() !== "POST") throw new Error("Only POST forms are supported for Actions");
      const g = Ze.get(d);
      if (g) {
        u.preventDefault();
        const p = new FormData(u.target, u.submitter);
        g.call({ r: n, f: u.target }, u.target.enctype === "multipart/form-data" ? p : new URLSearchParams(p));
      }
    }
    delegateEvents(["click", "submit"]), document.addEventListener("click", v), e && (document.addEventListener("mousemove", f, { passive: true }), document.addEventListener("focusin", E, { passive: true }), document.addEventListener("touchstart", E, { passive: true })), document.addEventListener("submit", w), onCleanup(() => {
      document.removeEventListener("click", v), e && (document.removeEventListener("mousemove", f), document.removeEventListener("focusin", E), document.removeEventListener("touchstart", E)), document.removeEventListener("submit", w);
    });
  };
}
function tt(e) {
  if (isServer) return Xe(e);
  const t = () => {
    const s = window.location.pathname.replace(/^\/+/, "/") + window.location.search, n = window.history.state && window.history.state._depth && Object.keys(window.history.state).length === 1 ? void 0 : window.history.state;
    return { value: s + window.location.hash, state: n };
  }, r = Rt$1();
  return Je({ get: t, set({ value: s, replace: n, scroll: o, state: i }) {
    n ? window.history.replaceState(en(i), "", s) : window.history.pushState(i, "", s), Ye(decodeURIComponent(window.location.hash.slice(1)), o), me();
  }, init: (s) => Ve(window, "popstate", tn(s, (n) => {
    if (n) return !r.confirm(n);
    {
      const o = t();
      return !r.confirm(o.value, { state: o.state });
    }
  })), create: et(e.preload, e.explicitLinks, e.actionBase, e.transformUrl), utils: { go: (s) => window.history.go(s), beforeLeave: r } })(e);
}
const rt = Zt(async () => {
  const e = await q$2(vt$1, { actor: "counter", key: ["test-counter"], action: "getCount", event: "newCount" }), t = await q$2(vt$1, { actor: "counter", key: ["test-counter"], action: "getCountDouble", event: "newDoubleCount" });
  return { count: e, countDouble: t };
}, "src_routes_ssr_tsx--getCounterData_cache", "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/ssr.tsx?pick=route&tsr-directive-use-server="), nt = on(rt, "counter-data"), st = { preload: () => nt() }, X = [{ page: false, $DELETE: { src: "src/routes/api/rivet/[...rest].ts?pick=DELETE", build: () => import('../build/_...rest_8.mjs'), import: () => import('../build/_...rest_8.mjs') }, $GET: { src: "src/routes/api/rivet/[...rest].ts?pick=GET", build: () => import('../build/_...rest_22.mjs'), import: () => import('../build/_...rest_22.mjs') }, $HEAD: { src: "src/routes/api/rivet/[...rest].ts?pick=HEAD", build: () => import('../build/_...rest_32.mjs'), import: () => import('../build/_...rest_32.mjs') }, $OPTIONS: { src: "src/routes/api/rivet/[...rest].ts?pick=OPTIONS", build: () => import('../build/_...rest_42.mjs'), import: () => import('../build/_...rest_42.mjs') }, $PATCH: { src: "src/routes/api/rivet/[...rest].ts?pick=PATCH", build: () => import('../build/_...rest_52.mjs'), import: () => import('../build/_...rest_52.mjs') }, $POST: { src: "src/routes/api/rivet/[...rest].ts?pick=POST", build: () => import('../build/_...rest_62.mjs'), import: () => import('../build/_...rest_62.mjs') }, $PUT: { src: "src/routes/api/rivet/[...rest].ts?pick=PUT", build: () => import('../build/_...rest_72.mjs'), import: () => import('../build/_...rest_72.mjs') }, path: "/api/rivet/*rest", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/api/rivet/[...rest].ts" }, { page: true, $component: { src: "src/routes/index.tsx?pick=default&pick=$css", build: () => import('../build/index2.mjs'), import: () => import('../build/index2.mjs') }, path: "/", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/index.tsx" }, { page: true, $component: { src: "src/routes/ssr.tsx?pick=default&pick=$css", build: () => import('../build/ssr2.mjs'), import: () => import('../build/ssr2.mjs') }, $$route: { require: () => ({ route: st }), src: "src/routes/ssr.tsx?pick=route" }, path: "/ssr", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/ssr.tsx" }], ot = at(X.filter((e) => e.page));
function at(e) {
  function t(r, s, n, o) {
    const i = Object.values(r).find((a) => n.startsWith(a.id + "/"));
    return i ? (t(i.children || (i.children = []), s, n.slice(i.id.length)), r) : (r.push({ ...s, id: n, path: n.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), r);
  }
  return e.sort((r, s) => r.path.length - s.path.length).reduce((r, s) => t(r, s, s.path, s.path), []);
}
function it(e, t) {
  const r = lt.lookup(e);
  if (r && r.route) {
    const s = r.route, n = t === "HEAD" ? s.$HEAD || s.$GET : s[`$${t}`];
    if (n === void 0) return;
    const o = s.page === true && s.$component !== void 0;
    return { handler: n, params: r.params, isPage: o };
  }
}
function ct(e) {
  return e.$HEAD || e.$GET || e.$POST || e.$PUT || e.$PATCH || e.$DELETE;
}
const lt = Fe({ routes: X.reduce((e, t) => {
  if (!ct(t)) return e;
  let r = t.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (s, n) => `**:${n}`).split("/").map((s) => s.startsWith(":") || s.startsWith("*") ? s : encodeURIComponent(s)).join("/");
  if (/:[^/]*\?/g.test(r)) throw new Error(`Optional parameters are not supported in API routes: ${r}`);
  if (e[r]) throw new Error(`Duplicate API routes for "${r}" found at "${e[r].route.path}" and "${t.path}"`);
  return e[r] = { route: t }, e;
}, {}) });
var dt = " ";
const ht = { style: (e) => ssrElement("style", e.attrs, () => e.children, true), link: (e) => ssrElement("link", e.attrs, void 0, true), script: (e) => e.attrs.src ? ssrElement("script", mergeProps(() => e.attrs, { get id() {
  return e.key;
} }), () => ssr(dt), true) : null, noscript: (e) => ssrElement("noscript", e.attrs, () => escape(e.children), true) };
function N(e, t) {
  let { tag: r, attrs: { key: s, ...n } = { key: void 0 }, children: o } = e;
  return ht[r]({ attrs: { ...n, nonce: t }, key: s, children: o });
}
function pt(e, t, r, s = "default") {
  return lazy(async () => {
    var _a;
    {
      const o = (await e.import())[s], a = (await ((_a = t.inputs) == null ? void 0 : _a[e.src].assets())).filter((c) => c.tag === "style" || c.attrs.rel === "stylesheet");
      return { default: (c) => [...a.map((m) => N(m)), createComponent(o, c)] };
    }
  });
}
function Z() {
  function e(r) {
    return { ...r, ...r.$$route ? r.$$route.require().route : void 0, info: { ...r.$$route ? r.$$route.require().route.info : {}, filesystem: true }, component: r.$component && pt(r.$component, globalThis.MANIFEST.client, globalThis.MANIFEST.ssr), children: r.children ? r.children.map(e) : void 0 };
  }
  return ot.map(e);
}
let W;
const mt = isServer ? () => getRequestEvent().routes : () => W || (W = Z());
function ft(e) {
  const t = Xt(e.nativeEvent, "flash");
  if (t) try {
    let r = JSON.parse(t);
    if (!r || !r.result) return;
    const s = [...r.input.slice(0, -1), new Map(r.input[r.input.length - 1])], n = r.error ? new Error(r.result) : r.result;
    return { input: s, url: r.url, pending: false, result: r.thrown ? void 0 : n, error: r.thrown ? n : void 0 };
  } catch (r) {
    console.error(r);
  } finally {
    Yt(e.nativeEvent, "flash", "", { maxAge: 0 });
  }
}
async function gt(e) {
  const t = globalThis.MANIFEST.client;
  return globalThis.MANIFEST.ssr, e.response.headers.set("Content-Type", "text/html"), Object.assign(e, { manifest: await t.json(), assets: [...await t.inputs[t.handler].assets()], router: { submission: ft(e) }, routes: Z(), complete: false, $islands: /* @__PURE__ */ new Set() });
}
const wt = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function D(e) {
  return e.status && wt.has(e.status) ? e.status : 302;
}
function vt(e, t, r = {}, s) {
  return eventHandler({ handler: (n) => {
    const o = Vt(n);
    return provideRequestEvent(o, async () => {
      const i = it(new URL(o.request.url).pathname, o.request.method);
      if (i) {
        const f = await i.handler.import(), w = o.request.method === "HEAD" ? f.HEAD || f.GET : f[o.request.method];
        o.params = i.params || {}, sharedConfig.context = { event: o };
        const u = await w(o);
        if (u !== void 0) return u;
        if (o.request.method !== "GET") throw new Error(`API handler for ${o.request.method} "${o.request.url}" did not return a response.`);
        if (!i.isPage) return;
      }
      const a = await t(o), l = typeof r == "function" ? await r(a) : { ...r }, c = l.mode || "stream";
      if (l.nonce && (a.nonce = l.nonce), c === "sync") {
        const f = renderToString(() => (sharedConfig.context.event = a, e(a)), l);
        if (a.complete = true, a.response && a.response.headers.get("Location")) {
          const w = D(a.response);
          return Jt(n, a.response.headers.get("Location"), w);
        }
        return f;
      }
      if (l.onCompleteAll) {
        const f = l.onCompleteAll;
        l.onCompleteAll = (w) => {
          z(a)(w), f(w);
        };
      } else l.onCompleteAll = z(a);
      if (l.onCompleteShell) {
        const f = l.onCompleteShell;
        l.onCompleteShell = (w) => {
          G(a, n)(), f(w);
        };
      } else l.onCompleteShell = G(a, n);
      const m = renderToStream(() => (sharedConfig.context.event = a, e(a)), l);
      if (a.response && a.response.headers.get("Location")) {
        const f = D(a.response);
        return Jt(n, a.response.headers.get("Location"), f);
      }
      if (c === "async") return m;
      const { writable: v, readable: E } = new TransformStream();
      return m.pipeTo(v), E;
    });
  } });
}
function G(e, t) {
  return () => {
    if (e.response && e.response.headers.get("Location")) {
      const r = D(e.response);
      ae(t, r), Qt(t, "Location", e.response.headers.get("Location"));
    }
  };
}
function z(e) {
  return ({ write: t }) => {
    e.complete = true;
    const r = e.response && e.response.headers.get("Location");
    r && t(`<script>window.location="${r}"<\/script>`);
  };
}
function Et(e, t, r) {
  return vt(e, gt, t);
}
function bt() {
  return createComponent$1(tt, { root: (e) => createComponent$1(Suspense, { get children() {
    return e.children;
  } }), get children() {
    return createComponent$1(mt, {});
  } });
}
const ee = isServer ? (e) => {
  const t = getRequestEvent();
  return t.response.status = e.code, t.response.statusText = e.text, onCleanup(() => !t.nativeEvent.handled && !t.complete && (t.response.status = 200)), null;
} : (e) => null;
var yt = ["<span", ' style="font-size:1.5em;text-align:center;position:fixed;left:0px;bottom:55%;width:100%;">', "</span>"], St = ["<span", ' style="font-size:1.5em;text-align:center;position:fixed;left:0px;bottom:55%;width:100%;">500 | Internal Server Error</span>'];
const Ct = (e) => {
  const t = isServer ? "500 | Internal Server Error" : "Error | Uncaught Client Exception";
  return createComponent$1(ErrorBoundary, { fallback: (r) => (console.error(r), [ssr(yt, ssrHydrationKey(), escape(t)), createComponent$1(ee, { code: 500 })]), get children() {
    return e.children;
  } });
}, $t = (e) => {
  let t = false;
  const r = catchError(() => e.children, (s) => {
    console.error(s), t = !!s;
  });
  return t ? [ssr(St, ssrHydrationKey()), createComponent$1(ee, { code: 500 })] : r;
};
var K = ["<script", ">", "<\/script>"], Rt = ["<script", ' type="module"', " async", "><\/script>"], At = ["<script", ' type="module" async', "><\/script>"];
const Tt = ssr("<!DOCTYPE html>");
function te(e, t, r = []) {
  for (let s = 0; s < t.length; s++) {
    const n = t[s];
    if (n.path !== e[0].path) continue;
    let o = [...r, n];
    if (n.children) {
      const i = e.slice(1);
      if (i.length === 0 || (o = te(i, n.children, o), !o)) continue;
    }
    return o;
  }
}
function kt(e) {
  const t = getRequestEvent(), r = t.nonce;
  let s = [];
  return Promise.resolve().then(async () => {
    let n = [];
    if (t.router && t.router.matches) {
      const o = [...t.router.matches];
      for (; o.length && (!o[0].info || !o[0].info.filesystem); ) o.shift();
      const i = o.length && te(o, t.routes);
      if (i) {
        const a = globalThis.MANIFEST.client.inputs;
        for (let l = 0; l < i.length; l++) {
          const c = i[l], m = a[c.$component.src];
          n.push(m.assets());
        }
      }
    }
    s = await Promise.all(n).then((o) => [...new Map(o.flat().map((i) => [i.attrs.key, i])).values()].filter((i) => i.attrs.rel === "modulepreload" && !t.assets.find((a) => a.attrs.key === i.attrs.key)));
  }), useAssets(() => s.length ? s.map((n) => N(n)) : void 0), createComponent$1(NoHydration, { get children() {
    return [Tt, createComponent$1($t, { get children() {
      return createComponent$1(e.document, { get assets() {
        return [createComponent$1(HydrationScript, {}), t.assets.map((n) => N(n, r))];
      }, get scripts() {
        return r ? [ssr(K, ssrHydrationKey() + ssrAttribute("nonce", escape(r, true), false), `window.manifest = ${JSON.stringify(t.manifest)}`), ssr(Rt, ssrHydrationKey(), ssrAttribute("nonce", escape(r, true), false), ssrAttribute("src", escape(globalThis.MANIFEST.client.inputs[globalThis.MANIFEST.client.handler].output.path, true), false))] : [ssr(K, ssrHydrationKey(), `window.manifest = ${JSON.stringify(t.manifest)}`), ssr(At, ssrHydrationKey(), ssrAttribute("src", escape(globalThis.MANIFEST.client.inputs[globalThis.MANIFEST.client.handler].output.path, true), false))];
      }, get children() {
        return createComponent$1(Hydration, { get children() {
          return createComponent$1(Ct, { get children() {
            return createComponent$1(bt, {});
          } });
        } });
      } });
    } })];
  } });
}
var Lt = ['<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">', "</head>"], Pt = ["<html", ' lang="en">', '<body><div id="app">', "</div><!--$-->", "<!--/--></body></html>"];
const jt = Et(() => createComponent$1(kt, { document: ({ assets: e, children: t, scripts: r }) => ssr(Pt, ssrHydrationKey(), createComponent$1(NoHydration, { get children() {
  return ssr(Lt, escape(e));
} }), escape(t), escape(r)) }));

const handlers = [
  { route: '', handler: _YHSsop, lazy: false, middleware: true, method: undefined },
  { route: '/_server', handler: _o, lazy: false, middleware: true, method: undefined },
  { route: '/', handler: jt, lazy: false, middleware: true, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b$1(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C$3(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  {
    const _handler = h3App.handler;
    h3App.handler = (event) => {
      const ctx = { event };
      return nitroAsyncContext.callAsync(ctx, () => _handler(event));
    };
  }
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { $t$3 as $, Ft$2 as F, G$5 as G, Ht$2 as H, Rt$3 as R, Zt as Z, _t$2 as _, an$1 as a, bt$4 as b, bt$5 as c, we$2 as d, en$2 as e, k$1 as f, bt$1 as g, on as h, q$2 as i, vt$1 as j, k$5 as k, nodeServer as l, nn$2 as n, on$2 as o, q$5 as q, rn$2 as r, sn$2 as s, tn$2 as t, vt$4 as v, wo as w };
//# sourceMappingURL=nitro.mjs.map
