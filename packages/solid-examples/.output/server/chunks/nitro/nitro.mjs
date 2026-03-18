import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { sharedConfig, lazy, createComponent, useContext, createResource, createSignal, createEffect, onCleanup, createContext as createContext$1, createRoot, catchError, ErrorBoundary, Suspense, children, createMemo, getOwner, createRenderEffect, on as on$2, runWithOwner, untrack, Show, startTransition, resetErrorBoundaries, batch } from 'solid-js';
import http, { Server as Server$1 } from 'node:http';
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
import { renderToString, isServer, getRequestEvent, ssrElement, escape, mergeProps, ssr, renderToStream, createComponent as createComponent$1, ssrHydrationKey, NoHydration, useAssets, Hydration, ssrAttribute, HydrationScript, ssrStyleProperty, delegateEvents } from 'solid-js/web';
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

function o(n){throw new Error(`${n} is not implemented yet!`)}let i$1 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o("Readable.asyncIterator")}iterator(e){throw o("Readable.iterator")}map(e,t){throw o("Readable.map")}filter(e,t){throw o("Readable.filter")}forEach(e,t){throw o("Readable.forEach")}reduce(e,t,r){throw o("Readable.reduce")}find(e,t){throw o("Readable.find")}findIndex(e,t){throw o("Readable.findIndex")}some(e,t){throw o("Readable.some")}toArray(e){throw o("Readable.toArray")}every(e,t){throw o("Readable.every")}flatMap(e,t){throw o("Readable.flatMap")}drop(e,t){throw o("Readable.drop")}take(e,t){throw o("Readable.take")}asIndexedPairs(e){throw o("Readable.asIndexedPairs")}};let l$1 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c=class{allowHalfOpen=true;_destroy;constructor(e=new i$1,t=new l$1){Object.assign(this,e),Object.assign(this,t),this._destroy=m$2(e._destroy,t._destroy);}};function _$1(){return Object.assign(c.prototype,i$1.prototype),Object.assign(c.prototype,l$1.prototype),c}function m$2(...n){return function(...e){for(const t of n)t(...e);}}const g$1=_$1();let A$1 = class A extends g$1{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}};let y$1 = class y extends i$1{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A$1;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}};function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$1{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E$2=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R(n={}){const e=new E$2,t=Array.isArray(n)||H$3(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H$3(n){return typeof n?.entries=="function"}function v$1(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S$3=new Set([101,204,205,304]);async function b$2(n,e){const t=new y$1,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S$3.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C$2(n,e,t={}){try{const r=await b$2(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v$1(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

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

const s$2=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

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
const Headers$1 = globalThis.Headers || s$2;
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

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r="sha256",s$1="base64url";function digest(t){if(e)return e(r,t,s$1);const o=createHash(r).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s$1):o.digest(s$1)}

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

const appConfig = {"name":"vinxi","routers":[{"name":"public","type":"static","base":"/","dir":"./public","root":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples","order":0,"outDir":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/.vinxi/build/public"},{"name":"ssr","type":"http","link":{"client":"client"},"handler":"src/entry-server.tsx","extensions":["js","jsx","ts","tsx"],"target":"server","root":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples","base":"/","outDir":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/.vinxi/build/ssr","order":1},{"name":"client","type":"client","base":"/_build","handler":"src/entry-client.tsx","extensions":["js","jsx","ts","tsx"],"target":"browser","root":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples","outDir":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/.vinxi/build/client","order":2},{"name":"server-fns","type":"http","base":"/_server","handler":"../../node_modules/.pnpm/@solidjs+start@1.3.2_solid-js@1.9.11_vinxi@0.5.11_@types+node@25.3.2_better-sqlite3@12._f39fa21beae717bdabf8c75c8695bb6d/node_modules/@solidjs/start/dist/runtime/server-handler.js","target":"server","root":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples","outDir":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/.vinxi/build/server-fns","order":3}],"server":{"compressPublicAssets":{"brotli":true},"routeRules":{"/_build/assets/**":{"headers":{"cache-control":"public, immutable, max-age=31536000"}}},"experimental":{"asyncContext":true},"preset":"node-server"},"root":"/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples"};
					const buildManifest = {"ssr":{"_auth-BxWnXXi5.js":{"file":"assets/auth-BxWnXXi5.js","name":"auth"},"_auth-client-soFIT0rW.js":{"file":"assets/auth-client-soFIT0rW.js","name":"auth-client"},"_chunk-ACNSKN6D-CWv6jrK3.js":{"file":"assets/chunk-ACNSKN6D-CWv6jrK3.js","name":"chunk-ACNSKN6D"},"_chunk-UFMCWDHH-DWEZyrAY.js":{"file":"assets/chunk-UFMCWDHH-DWEZyrAY.js","name":"chunk-UFMCWDHH","imports":["_chunk-ACNSKN6D-CWv6jrK3.js"]},"_registry-Tw_eAXpK.js":{"file":"assets/registry-Tw_eAXpK.js","name":"registry"},"src/routes/api/auth/[...all].ts?pick=GET":{"file":"_...all_.js","name":"_...all_","src":"src/routes/api/auth/[...all].ts?pick=GET","isEntry":true,"isDynamicEntry":true,"imports":["_auth-BxWnXXi5.js"]},"src/routes/api/auth/[...all].ts?pick=POST":{"file":"_...all_2.js","name":"_...all_","src":"src/routes/api/auth/[...all].ts?pick=POST","isEntry":true,"isDynamicEntry":true,"imports":["_auth-BxWnXXi5.js"]},"src/routes/api/rivet/[...rest].ts?pick=DELETE":{"file":"_...rest_.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=DELETE","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-ACNSKN6D-CWv6jrK3.js","_registry-Tw_eAXpK.js"]},"src/routes/api/rivet/[...rest].ts?pick=GET":{"file":"_...rest_2.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=GET","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-ACNSKN6D-CWv6jrK3.js","_registry-Tw_eAXpK.js"]},"src/routes/api/rivet/[...rest].ts?pick=HEAD":{"file":"_...rest_3.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=HEAD","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-ACNSKN6D-CWv6jrK3.js","_registry-Tw_eAXpK.js"]},"src/routes/api/rivet/[...rest].ts?pick=OPTIONS":{"file":"_...rest_4.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=OPTIONS","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-ACNSKN6D-CWv6jrK3.js","_registry-Tw_eAXpK.js"]},"src/routes/api/rivet/[...rest].ts?pick=PATCH":{"file":"_...rest_5.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=PATCH","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-ACNSKN6D-CWv6jrK3.js","_registry-Tw_eAXpK.js"]},"src/routes/api/rivet/[...rest].ts?pick=POST":{"file":"_...rest_6.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=POST","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-ACNSKN6D-CWv6jrK3.js","_registry-Tw_eAXpK.js"]},"src/routes/api/rivet/[...rest].ts?pick=PUT":{"file":"_...rest_7.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=PUT","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-ACNSKN6D-CWv6jrK3.js","_registry-Tw_eAXpK.js"]},"src/routes/api/token.ts?pick=GET":{"file":"token.js","name":"token","src":"src/routes/api/token.ts?pick=GET","isEntry":true,"isDynamicEntry":true,"imports":["_auth-BxWnXXi5.js"]},"src/routes/auth.tsx?pick=default&pick=$css":{"file":"auth.js","name":"auth","src":"src/routes/auth.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_auth-client-soFIT0rW.js"]},"src/routes/index.tsx?pick=default&pick=$css":{"file":"index.js","name":"index","src":"src/routes/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-UFMCWDHH-DWEZyrAY.js","_chunk-ACNSKN6D-CWv6jrK3.js","_auth-client-soFIT0rW.js"]},"src/routes/ssr.tsx?pick=default&pick=$css":{"file":"ssr2.js","name":"ssr","src":"src/routes/ssr.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-ACNSKN6D-CWv6jrK3.js","_chunk-UFMCWDHH-DWEZyrAY.js","_auth-client-soFIT0rW.js"]},"virtual:$vinxi/handler/ssr":{"file":"ssr.js","name":"ssr","src":"virtual:$vinxi/handler/ssr","isEntry":true,"imports":["_chunk-UFMCWDHH-DWEZyrAY.js","_chunk-ACNSKN6D-CWv6jrK3.js"],"dynamicImports":["src/routes/api/auth/[...all].ts?pick=GET","src/routes/api/auth/[...all].ts?pick=GET","src/routes/api/auth/[...all].ts?pick=GET","src/routes/api/auth/[...all].ts?pick=GET","src/routes/api/auth/[...all].ts?pick=POST","src/routes/api/auth/[...all].ts?pick=POST","src/routes/api/rivet/[...rest].ts?pick=DELETE","src/routes/api/rivet/[...rest].ts?pick=DELETE","src/routes/api/rivet/[...rest].ts?pick=GET","src/routes/api/rivet/[...rest].ts?pick=GET","src/routes/api/rivet/[...rest].ts?pick=HEAD","src/routes/api/rivet/[...rest].ts?pick=HEAD","src/routes/api/rivet/[...rest].ts?pick=OPTIONS","src/routes/api/rivet/[...rest].ts?pick=OPTIONS","src/routes/api/rivet/[...rest].ts?pick=PATCH","src/routes/api/rivet/[...rest].ts?pick=PATCH","src/routes/api/rivet/[...rest].ts?pick=POST","src/routes/api/rivet/[...rest].ts?pick=POST","src/routes/api/rivet/[...rest].ts?pick=PUT","src/routes/api/rivet/[...rest].ts?pick=PUT","src/routes/api/token.ts?pick=GET","src/routes/api/token.ts?pick=GET","src/routes/api/token.ts?pick=GET","src/routes/api/token.ts?pick=GET","src/routes/auth.tsx?pick=default&pick=$css","src/routes/auth.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/ssr.tsx?pick=default&pick=$css","src/routes/ssr.tsx?pick=default&pick=$css"]}},"client":{"_auth-client--KWWk1vB.js":{"file":"assets/auth-client--KWWk1vB.js","name":"auth-client","imports":["_web-BFfPZmCU.js"]},"_chunk-ACNSKN6D-CtZbuKrs.js":{"file":"assets/chunk-ACNSKN6D-CtZbuKrs.js","name":"chunk-ACNSKN6D","imports":["_web-BFfPZmCU.js"]},"_web-BFfPZmCU.js":{"file":"assets/web-BFfPZmCU.js","name":"web"},"src/routes/auth.tsx?pick=default&pick=$css":{"file":"assets/auth-BLguUpMG.js","name":"auth","src":"src/routes/auth.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-BFfPZmCU.js","_auth-client--KWWk1vB.js"]},"src/routes/index.tsx?pick=default&pick=$css":{"file":"assets/index-D58nVcFf.js","name":"index","src":"src/routes/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-BFfPZmCU.js","_chunk-ACNSKN6D-CtZbuKrs.js","_auth-client--KWWk1vB.js"]},"src/routes/ssr.tsx?pick=default&pick=$css":{"file":"assets/ssr-gMV1DFTc.js","name":"ssr","src":"src/routes/ssr.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-BFfPZmCU.js","_chunk-ACNSKN6D-CtZbuKrs.js","_auth-client--KWWk1vB.js"]},"virtual:$vinxi/handler/client":{"file":"assets/client-CxpZaY5m.js","name":"client","src":"virtual:$vinxi/handler/client","isEntry":true,"imports":["_web-BFfPZmCU.js","_chunk-ACNSKN6D-CtZbuKrs.js"],"dynamicImports":["src/routes/auth.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/ssr.tsx?pick=default&pick=$css"]}},"server-fns":{"_auth-BxWnXXi5.js":{"file":"assets/auth-BxWnXXi5.js","name":"auth"},"_auth-client-soFIT0rW.js":{"file":"assets/auth-client-soFIT0rW.js","name":"auth-client"},"_chunk-ACNSKN6D-CWv6jrK3.js":{"file":"assets/chunk-ACNSKN6D-CWv6jrK3.js","name":"chunk-ACNSKN6D"},"_chunk-UFMCWDHH-DWEZyrAY.js":{"file":"assets/chunk-UFMCWDHH-DWEZyrAY.js","name":"chunk-UFMCWDHH","imports":["_chunk-ACNSKN6D-CWv6jrK3.js"]},"_registry-Tw_eAXpK.js":{"file":"assets/registry-Tw_eAXpK.js","name":"registry"},"_server-fns-xgF3ZN0E.js":{"file":"assets/server-fns-xgF3ZN0E.js","name":"server-fns","dynamicImports":["src/routes/api/auth/[...all].ts?pick=GET","src/routes/api/auth/[...all].ts?pick=GET","src/routes/api/auth/[...all].ts?pick=GET","src/routes/api/auth/[...all].ts?pick=GET","src/routes/api/auth/[...all].ts?pick=POST","src/routes/api/auth/[...all].ts?pick=POST","src/routes/api/rivet/[...rest].ts?pick=DELETE","src/routes/api/rivet/[...rest].ts?pick=DELETE","src/routes/api/rivet/[...rest].ts?pick=GET","src/routes/api/rivet/[...rest].ts?pick=GET","src/routes/api/rivet/[...rest].ts?pick=HEAD","src/routes/api/rivet/[...rest].ts?pick=HEAD","src/routes/api/rivet/[...rest].ts?pick=OPTIONS","src/routes/api/rivet/[...rest].ts?pick=OPTIONS","src/routes/api/rivet/[...rest].ts?pick=PATCH","src/routes/api/rivet/[...rest].ts?pick=PATCH","src/routes/api/rivet/[...rest].ts?pick=POST","src/routes/api/rivet/[...rest].ts?pick=POST","src/routes/api/rivet/[...rest].ts?pick=PUT","src/routes/api/rivet/[...rest].ts?pick=PUT","src/routes/api/token.ts?pick=GET","src/routes/api/token.ts?pick=GET","src/routes/api/token.ts?pick=GET","src/routes/api/token.ts?pick=GET","src/routes/auth.tsx?pick=default&pick=$css","src/routes/auth.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/ssr.tsx?pick=default&pick=$css","src/routes/ssr.tsx?pick=default&pick=$css","src/app.tsx"]},"src/app.tsx":{"file":"assets/app-De9iMQfE.js","name":"app","src":"src/app.tsx","isDynamicEntry":true,"imports":["_server-fns-xgF3ZN0E.js","_chunk-UFMCWDHH-DWEZyrAY.js","_chunk-ACNSKN6D-CWv6jrK3.js"]},"src/routes/api/auth/[...all].ts?pick=GET":{"file":"_...all_.js","name":"_...all_","src":"src/routes/api/auth/[...all].ts?pick=GET","isEntry":true,"isDynamicEntry":true,"imports":["_auth-BxWnXXi5.js"]},"src/routes/api/auth/[...all].ts?pick=POST":{"file":"_...all_2.js","name":"_...all_","src":"src/routes/api/auth/[...all].ts?pick=POST","isEntry":true,"isDynamicEntry":true,"imports":["_auth-BxWnXXi5.js"]},"src/routes/api/rivet/[...rest].ts?pick=DELETE":{"file":"_...rest_.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=DELETE","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-ACNSKN6D-CWv6jrK3.js","_registry-Tw_eAXpK.js"]},"src/routes/api/rivet/[...rest].ts?pick=GET":{"file":"_...rest_2.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=GET","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-ACNSKN6D-CWv6jrK3.js","_registry-Tw_eAXpK.js"]},"src/routes/api/rivet/[...rest].ts?pick=HEAD":{"file":"_...rest_3.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=HEAD","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-ACNSKN6D-CWv6jrK3.js","_registry-Tw_eAXpK.js"]},"src/routes/api/rivet/[...rest].ts?pick=OPTIONS":{"file":"_...rest_4.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=OPTIONS","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-ACNSKN6D-CWv6jrK3.js","_registry-Tw_eAXpK.js"]},"src/routes/api/rivet/[...rest].ts?pick=PATCH":{"file":"_...rest_5.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=PATCH","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-ACNSKN6D-CWv6jrK3.js","_registry-Tw_eAXpK.js"]},"src/routes/api/rivet/[...rest].ts?pick=POST":{"file":"_...rest_6.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=POST","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-ACNSKN6D-CWv6jrK3.js","_registry-Tw_eAXpK.js"]},"src/routes/api/rivet/[...rest].ts?pick=PUT":{"file":"_...rest_7.js","name":"_...rest_","src":"src/routes/api/rivet/[...rest].ts?pick=PUT","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-ACNSKN6D-CWv6jrK3.js","_registry-Tw_eAXpK.js"]},"src/routes/api/token.ts?pick=GET":{"file":"token.js","name":"token","src":"src/routes/api/token.ts?pick=GET","isEntry":true,"isDynamicEntry":true,"imports":["_auth-BxWnXXi5.js"]},"src/routes/auth.tsx?pick=default&pick=$css":{"file":"auth.js","name":"auth","src":"src/routes/auth.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_auth-client-soFIT0rW.js"]},"src/routes/index.tsx?pick=default&pick=$css":{"file":"index.js","name":"index","src":"src/routes/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-UFMCWDHH-DWEZyrAY.js","_chunk-ACNSKN6D-CWv6jrK3.js","_auth-client-soFIT0rW.js"]},"src/routes/ssr.tsx?pick=default&pick=$css":{"file":"ssr.js","name":"ssr","src":"src/routes/ssr.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_chunk-ACNSKN6D-CWv6jrK3.js","_chunk-UFMCWDHH-DWEZyrAY.js","_auth-client-soFIT0rW.js"]},"virtual:$vinxi/handler/server-fns":{"file":"server-fns.js","name":"server-fns","src":"virtual:$vinxi/handler/server-fns","isEntry":true,"imports":["_server-fns-xgF3ZN0E.js"]}}};

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
    "etag": "\"729-1fYMZPwxVOdfTctw8vgUclb3xAk\"",
    "mtime": "2026-03-18T11:30:28.589Z",
    "size": 1833,
    "path": "../public/_build/.vite/manifest.json"
  },
  "/_build/.vite/manifest.json.br": {
    "type": "application/json",
    "encoding": "br",
    "etag": "\"159-YXTWp4LVcsYz3ap+dnYIltZ1HFQ\"",
    "mtime": "2026-03-18T11:30:28.608Z",
    "size": 345,
    "path": "../public/_build/.vite/manifest.json.br"
  },
  "/_build/.vite/manifest.json.gz": {
    "type": "application/json",
    "encoding": "gzip",
    "etag": "\"18f-YqY/Y/55sydSk8sKBYSQJqJCpqs\"",
    "mtime": "2026-03-18T11:30:28.608Z",
    "size": 399,
    "path": "../public/_build/.vite/manifest.json.gz"
  },
  "/_build/assets/auth-BLguUpMG.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"9a6-345TPckPKl3LR+POwuSbKf/emF0\"",
    "mtime": "2026-03-18T11:30:28.589Z",
    "size": 2470,
    "path": "../public/_build/assets/auth-BLguUpMG.js"
  },
  "/_build/assets/auth-BLguUpMG.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3bd-5MdcUxS9kJBQBESvWntYrdbAobQ\"",
    "mtime": "2026-03-18T11:30:28.641Z",
    "size": 957,
    "path": "../public/_build/assets/auth-BLguUpMG.js.br"
  },
  "/_build/assets/auth-BLguUpMG.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"46b-utcSqqBHNDb1EOSbomdUnWGjuSU\"",
    "mtime": "2026-03-18T11:30:28.608Z",
    "size": 1131,
    "path": "../public/_build/assets/auth-BLguUpMG.js.gz"
  },
  "/_build/assets/auth-client--KWWk1vB.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"80b3-AExijYtPNLXgUHkfYqV4JGgqJ3w\"",
    "mtime": "2026-03-18T11:30:28.590Z",
    "size": 32947,
    "path": "../public/_build/assets/auth-client--KWWk1vB.js"
  },
  "/_build/assets/auth-client--KWWk1vB.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2c0a-QQebQGTtZy0gwSc5BIaetswpAlo\"",
    "mtime": "2026-03-18T11:30:28.643Z",
    "size": 11274,
    "path": "../public/_build/assets/auth-client--KWWk1vB.js.br"
  },
  "/_build/assets/auth-client--KWWk1vB.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"30d8-Qv9ewLzPizrtrbYvzi10owFOceE\"",
    "mtime": "2026-03-18T11:30:28.643Z",
    "size": 12504,
    "path": "../public/_build/assets/auth-client--KWWk1vB.js.gz"
  },
  "/_build/assets/chunk-ACNSKN6D-CtZbuKrs.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"20352-0446KcdXI5QuTUkf4ZB8wffqRkM\"",
    "mtime": "2026-03-18T11:30:28.590Z",
    "size": 131922,
    "path": "../public/_build/assets/chunk-ACNSKN6D-CtZbuKrs.js"
  },
  "/_build/assets/client-CxpZaY5m.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"f083-Kc49jQAUyqT+YKRvArjMdlIJ9mA\"",
    "mtime": "2026-03-18T11:30:28.960Z",
    "size": 61571,
    "path": "../public/_build/assets/client-CxpZaY5m.js.br"
  },
  "/_build/assets/chunk-ACNSKN6D-CtZbuKrs.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"92c7-QEeCJCAKLjwGfcYaO9bCgDflhPg\"",
    "mtime": "2026-03-18T11:30:28.658Z",
    "size": 37575,
    "path": "../public/_build/assets/chunk-ACNSKN6D-CtZbuKrs.js.gz"
  },
  "/_build/assets/chunk-ACNSKN6D-CtZbuKrs.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"7d98-2PeDKgyuUGrCoGTHU0Sd+2wSPtI\"",
    "mtime": "2026-03-18T11:30:28.768Z",
    "size": 32152,
    "path": "../public/_build/assets/chunk-ACNSKN6D-CtZbuKrs.js.br"
  },
  "/_build/assets/client-CxpZaY5m.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"12058-mzvgL+9NDMuBM9BWKWZyYdeyOBo\"",
    "mtime": "2026-03-18T11:30:28.659Z",
    "size": 73816,
    "path": "../public/_build/assets/client-CxpZaY5m.js.gz"
  },
  "/_build/assets/index-D58nVcFf.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"8a5-EZIbmpMaa5eaTu8KYu+UyqlSJeQ\"",
    "mtime": "2026-03-18T11:30:28.590Z",
    "size": 2213,
    "path": "../public/_build/assets/index-D58nVcFf.js"
  },
  "/_build/assets/index-D58nVcFf.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3d7-UWwmZFyIgy046fkkKjCKgzZUFn0\"",
    "mtime": "2026-03-18T11:30:28.659Z",
    "size": 983,
    "path": "../public/_build/assets/index-D58nVcFf.js.gz"
  },
  "/_build/assets/client-CxpZaY5m.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"44419-VBVdWPCWI1SkgJS1TCDye6gTZZI\"",
    "mtime": "2026-03-18T11:30:28.590Z",
    "size": 279577,
    "path": "../public/_build/assets/client-CxpZaY5m.js"
  },
  "/_build/assets/index-D58nVcFf.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"36e-YVAZP0fLElJP4O4aBfCR5Gogi1A\"",
    "mtime": "2026-03-18T11:30:28.659Z",
    "size": 878,
    "path": "../public/_build/assets/index-D58nVcFf.js.br"
  },
  "/_build/assets/ssr-gMV1DFTc.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"963-yBi5NXjUcLA9TfKihdJKVKvB7lk\"",
    "mtime": "2026-03-18T11:30:28.589Z",
    "size": 2403,
    "path": "../public/_build/assets/ssr-gMV1DFTc.js"
  },
  "/_build/assets/web-BFfPZmCU.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2157-9WOBOGULC9lm9/gWXk+SXWDEgyA\"",
    "mtime": "2026-03-18T11:30:28.672Z",
    "size": 8535,
    "path": "../public/_build/assets/web-BFfPZmCU.js.br"
  },
  "/_build/assets/ssr-gMV1DFTc.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"42b-ZS3up7tWUV6p38aHtMhXZtTqlt0\"",
    "mtime": "2026-03-18T11:30:28.659Z",
    "size": 1067,
    "path": "../public/_build/assets/ssr-gMV1DFTc.js.gz"
  },
  "/_build/assets/web-BFfPZmCU.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"5fd0-OUaYk3J3zlIyfEKpIr6NEaP08hY\"",
    "mtime": "2026-03-18T11:30:28.590Z",
    "size": 24528,
    "path": "../public/_build/assets/web-BFfPZmCU.js"
  },
  "/_build/assets/ssr-gMV1DFTc.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3a5-H2mjcmW1QPgqSWOdGQun5IWwCtU\"",
    "mtime": "2026-03-18T11:30:28.659Z",
    "size": 933,
    "path": "../public/_build/assets/ssr-gMV1DFTc.js.br"
  },
  "/_build/assets/web-BFfPZmCU.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2491-zNcjcFQHQ3c239qpaRMwLSoqS04\"",
    "mtime": "2026-03-18T11:30:28.659Z",
    "size": 9361,
    "path": "../public/_build/assets/web-BFfPZmCU.js.gz"
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
const _viL2zm = eventHandler((event) => {
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

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
function Vr$1(e, t) {
  const r = (e || "").split(";").filter((c) => typeof c == "string" && !!c.trim()), n = r.shift() || "", a = Wr$1(n), i = a.name;
  let o = a.value;
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
function Wr$1(e) {
  let t = "", r = "";
  const n = e.split("=");
  return n.length > 1 ? (t = n.shift(), r = n.join("=")) : r = e, { name: t, value: r };
}
function Gr$1(e = {}) {
  let t, r = false;
  const n = (o) => {
    if (t && t !== o) throw new Error("Context conflict");
  };
  let a;
  if (e.asyncContext) {
    const o = e.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    o ? a = new o() : console.warn("[unctx] `AsyncLocalStorage` is not provided.");
  }
  const i = () => {
    if (a) {
      const o = a.getStore();
      if (o !== void 0) return o;
    }
    return t;
  };
  return { use: () => {
    const o = i();
    if (o === void 0) throw new Error("Context is not available");
    return o;
  }, tryUse: () => i(), set: (o, u) => {
    u || n(o), t = o, r = true;
  }, unset: () => {
    t = void 0, r = false;
  }, call: (o, u) => {
    n(o), t = o;
    try {
      return a ? a.run(o, u) : u();
    } finally {
      r || (t = void 0);
    }
  }, async callAsync(o, u) {
    t = o;
    const c = () => {
      t = o;
    }, l = () => t === o ? c : void 0;
    Me$1.add(l);
    try {
      const p = a ? a.run(o, u) : u();
      return r || (t = void 0), await p;
    } finally {
      Me$1.delete(l);
    }
  } };
}
function Xr$1(e = {}) {
  const t = {};
  return { get(r, n = {}) {
    return t[r] || (t[r] = Gr$1({ ...e, ...n })), t[r];
  } };
}
const ae$1 = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof global < "u" ? global : {}, He$1 = "__unctx__", Jr$1 = ae$1[He$1] || (ae$1[He$1] = Xr$1()), Yr$1 = (e, t = {}) => Jr$1.get(e, t), qe$1 = "__unctx_async_handlers__", Me$1 = ae$1[qe$1] || (ae$1[qe$1] = /* @__PURE__ */ new Set());
function Kr$1(e) {
  let t;
  const r = bt(e), n = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(r, { ...n, body: e.node.req.body }) : new Request(r, { ...n, get body() {
    return t || (t = un$1(e), t);
  } });
}
function Qr$1(e) {
  var _a2;
  return (_a2 = e.web) != null ? _a2 : e.web = { request: Kr$1(e), url: bt(e) }, e.web.request;
}
function Zr$1() {
  return pn$1();
}
const mt = /* @__PURE__ */ Symbol("$HTTPEvent");
function en$1(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[mt]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function S$2(e) {
  return function(...t) {
    var _a2;
    let r = t[0];
    if (en$1(r)) t[0] = r instanceof H3Event || r.__is_event__ ? r : r[mt];
    else {
      if (!((_a2 = globalThis.app.config.server.experimental) == null ? void 0 : _a2.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (r = Zr$1(), !r) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      t.unshift(r);
    }
    return e(...t);
  };
}
const bt = S$2(getRequestURL), tn$1 = S$2(getRequestIP), ie$1 = S$2(setResponseStatus), Be$1 = S$2(getResponseStatus), rn$1 = S$2(getResponseStatusText), ne$2 = S$2(getResponseHeaders), Ve = S$2(getResponseHeader), nn$1 = S$2(setResponseHeader), yt = S$2(appendResponseHeader), sn$1 = S$2(parseCookies), an$1 = S$2(getCookie), on$1 = S$2(setCookie), F$2 = S$2(setHeader), un$1 = S$2(getRequestWebStream), cn$1 = S$2(removeResponseHeader), ln$1 = S$2(Qr$1);
function fn$1() {
  var _a2;
  return Yr$1("nitro-app", { asyncContext: !!((_a2 = globalThis.app.config.server.experimental) == null ? void 0 : _a2.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function pn$1() {
  return fn$1().use().event;
}
const de = "Invariant Violation", { setPrototypeOf: dn$1 = function(e, t) {
  return e.__proto__ = t, e;
} } = Object;
class xe extends Error {
  constructor(t = de) {
    super(typeof t == "number" ? `${de}: ${t} (see https://github.com/apollographql/invariant-packages)` : t);
    __publicField$1(this, "framesToPop", 1);
    __publicField$1(this, "name", de);
    dn$1(this, xe.prototype);
  }
}
function hn$1(e, t) {
  if (!e) throw new xe(t);
}
const he$1 = "solidFetchEvent";
function gn(e) {
  return { request: ln$1(e), response: wn(e), clientAddress: tn$1(e), locals: {}, nativeEvent: e };
}
function mn(e) {
  return { ...e };
}
function bn(e) {
  if (!e.context[he$1]) {
    const t = gn(e);
    e.context[he$1] = t;
  }
  return e.context[he$1];
}
function We$1(e, t) {
  for (const [r, n] of t.entries()) yt(e, r, n);
}
class yn {
  constructor(t) {
    __publicField$1(this, "event");
    this.event = t;
  }
  get(t) {
    const r = Ve(this.event, t);
    return Array.isArray(r) ? r.join(", ") : r || null;
  }
  has(t) {
    return this.get(t) !== null;
  }
  set(t, r) {
    return nn$1(this.event, t, r);
  }
  delete(t) {
    return cn$1(this.event, t);
  }
  append(t, r) {
    yt(this.event, t, r);
  }
  getSetCookie() {
    const t = Ve(this.event, "Set-Cookie");
    return Array.isArray(t) ? t : [t];
  }
  forEach(t) {
    return Object.entries(ne$2(this.event)).forEach(([r, n]) => t(Array.isArray(n) ? n.join(", ") : n, r, this));
  }
  entries() {
    return Object.entries(ne$2(this.event)).map(([t, r]) => [t, Array.isArray(r) ? r.join(", ") : r])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(ne$2(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(ne$2(this.event)).map((t) => Array.isArray(t) ? t.join(", ") : t)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
}
function wn(e) {
  return { get status() {
    return Be$1(e);
  }, set status(t) {
    ie$1(e, t);
  }, get statusText() {
    return rn$1(e);
  }, set statusText(t) {
    ie$1(e, Be$1(e), t);
  }, headers: new yn(e) };
}
const q$1 = { NORMAL: 0, WILDCARD: 1, PLACEHOLDER: 2 };
function vn(e = {}) {
  const t = { options: e, rootNode: wt(), staticRoutesMap: {} }, r = (n) => e.strictTrailingSlash ? n : n.replace(/\/$/, "") || "/";
  if (e.routes) for (const n in e.routes) Ge$1(t, r(n), e.routes[n]);
  return { ctx: t, lookup: (n) => Sn(t, r(n)), insert: (n, a) => Ge$1(t, r(n), a), remove: (n) => En(t, r(n)) };
}
function Sn(e, t) {
  const r = e.staticRoutesMap[t];
  if (r) return r.data;
  const n = t.split("/"), a = {};
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
      u.paramName && (a[u.paramName] = p), i = true;
    } else u = d;
  }
  return (u === null || u.data === null) && o !== null && (u = o, a[u.paramName || "_"] = c, i = true), u ? i ? { ...u.data, params: i ? a : void 0 } : u.data : null;
}
function Ge$1(e, t, r) {
  let n = true;
  const a = t.split("/");
  let i = e.rootNode, o = 0;
  const u = [i];
  for (const c of a) {
    let l;
    if (l = i.children.get(c)) i = l;
    else {
      const p = Rn(c);
      l = wt({ type: p, parent: i }), i.children.set(c, l), p === q$1.PLACEHOLDER ? (l.paramName = c === "*" ? `_${o++}` : c.slice(1), i.placeholderChildren.push(l), n = false) : p === q$1.WILDCARD && (i.wildcardChildNode = l, l.paramName = c.slice(3) || "_", n = false), u.push(l), i = l;
    }
  }
  for (const [c, l] of u.entries()) l.maxDepth = Math.max(u.length - c, l.maxDepth || 0);
  return i.data = r, n === true && (e.staticRoutesMap[t] = i), i;
}
function En(e, t) {
  let r = false;
  const n = t.split("/");
  let a = e.rootNode;
  for (const i of n) if (a = a.children.get(i), !a) return r;
  if (a.data) {
    const i = n.at(-1) || "";
    a.data = null, Object.keys(a.children).length === 0 && a.parent && (a.parent.children.delete(i), a.parent.wildcardChildNode = null, a.parent.placeholderChildren = []), r = true;
  }
  return r;
}
function wt(e = {}) {
  return { type: e.type || q$1.NORMAL, maxDepth: 0, parent: e.parent || null, children: /* @__PURE__ */ new Map(), data: e.data || null, paramName: e.paramName || null, wildcardChildNode: null, placeholderChildren: [] };
}
function Rn(e) {
  return e.startsWith("**") ? q$1.WILDCARD : e[0] === ":" || e === "*" ? q$1.PLACEHOLDER : q$1.NORMAL;
}
const vt = [{ page: false, $GET: { src: "src/routes/api/auth/[...all].ts?pick=GET", build: () => import('../build/_...all_.mjs'), import: () => import('../build/_...all_.mjs') }, $HEAD: { src: "src/routes/api/auth/[...all].ts?pick=GET", build: () => import('../build/_...all_.mjs'), import: () => import('../build/_...all_.mjs') }, $POST: { src: "src/routes/api/auth/[...all].ts?pick=POST", build: () => import('../build/_...all_2.mjs'), import: () => import('../build/_...all_2.mjs') }, path: "/api/auth/*all", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/api/auth/[...all].ts" }, { page: false, $DELETE: { src: "src/routes/api/rivet/[...rest].ts?pick=DELETE", build: () => import('../build/_...rest_.mjs'), import: () => import('../build/_...rest_.mjs') }, $GET: { src: "src/routes/api/rivet/[...rest].ts?pick=GET", build: () => import('../build/_...rest_2.mjs'), import: () => import('../build/_...rest_2.mjs') }, $HEAD: { src: "src/routes/api/rivet/[...rest].ts?pick=HEAD", build: () => import('../build/_...rest_3.mjs'), import: () => import('../build/_...rest_3.mjs') }, $OPTIONS: { src: "src/routes/api/rivet/[...rest].ts?pick=OPTIONS", build: () => import('../build/_...rest_4.mjs'), import: () => import('../build/_...rest_4.mjs') }, $PATCH: { src: "src/routes/api/rivet/[...rest].ts?pick=PATCH", build: () => import('../build/_...rest_5.mjs'), import: () => import('../build/_...rest_5.mjs') }, $POST: { src: "src/routes/api/rivet/[...rest].ts?pick=POST", build: () => import('../build/_...rest_6.mjs'), import: () => import('../build/_...rest_6.mjs') }, $PUT: { src: "src/routes/api/rivet/[...rest].ts?pick=PUT", build: () => import('../build/_...rest_7.mjs'), import: () => import('../build/_...rest_7.mjs') }, path: "/api/rivet/*rest", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/api/rivet/[...rest].ts" }, { page: false, $GET: { src: "src/routes/api/token.ts?pick=GET", build: () => import('../build/token.mjs'), import: () => import('../build/token.mjs') }, $HEAD: { src: "src/routes/api/token.ts?pick=GET", build: () => import('../build/token.mjs'), import: () => import('../build/token.mjs') }, path: "/api/token", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/api/token.ts" }, { page: true, $component: { src: "src/routes/auth.tsx?pick=default&pick=$css", build: () => import('../build/auth.mjs'), import: () => import('../build/auth.mjs') }, path: "/auth", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/auth.tsx" }, { page: true, $component: { src: "src/routes/index.tsx?pick=default&pick=$css", build: () => import('../build/index.mjs'), import: () => import('../build/index.mjs') }, path: "/", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/index.tsx" }, { page: true, $component: { src: "src/routes/ssr.tsx?pick=default&pick=$css", build: () => import('../build/ssr.mjs'), import: () => import('../build/ssr.mjs') }, path: "/ssr", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/ssr.tsx" }], kn = An$1(vt.filter((e) => e.page));
function An$1(e) {
  function t(r, n, a, i) {
    const o = Object.values(r).find((u) => a.startsWith(u.id + "/"));
    return o ? (t(o.children || (o.children = []), n, a.slice(o.id.length)), r) : (r.push({ ...n, id: a, path: a.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), r);
  }
  return e.sort((r, n) => r.path.length - n.path.length).reduce((r, n) => t(r, n, n.path, n.path), []);
}
function xn(e) {
  return e.$HEAD || e.$GET || e.$POST || e.$PUT || e.$PATCH || e.$DELETE;
}
vn({ routes: vt.reduce((e, t) => {
  if (!xn(t)) return e;
  let r = t.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (n, a) => `**:${a}`).split("/").map((n) => n.startsWith(":") || n.startsWith("*") ? n : encodeURIComponent(n)).join("/");
  if (/:[^/]*\?/g.test(r)) throw new Error(`Optional parameters are not supported in API routes: ${r}`);
  if (e[r]) throw new Error(`Duplicate API routes for "${r}" found at "${e[r].route.path}" and "${t.path}"`);
  return e[r] = { route: t }, e;
}, {}) });
var _n = " ";
const Pn = { style: (e) => ssrElement("style", e.attrs, () => e.children, true), link: (e) => ssrElement("link", e.attrs, void 0, true), script: (e) => e.attrs.src ? ssrElement("script", mergeProps(() => e.attrs, { get id() {
  return e.key;
} }), () => ssr(_n), true) : null, noscript: (e) => ssrElement("noscript", e.attrs, () => escape(e.children), true) };
function Tn(e, t) {
  let { tag: r, attrs: { key: n, ...a } = { key: void 0 }, children: i } = e;
  return Pn[r]({ attrs: { ...a, nonce: t }, key: n, children: i });
}
function zn(e, t, r, n = "default") {
  return lazy(async () => {
    var _a2;
    {
      const i = (await e.import())[n], u = (await ((_a2 = t.inputs) == null ? void 0 : _a2[e.src].assets())).filter((l) => l.tag === "style" || l.attrs.rel === "stylesheet");
      return { default: (l) => [...u.map((p) => Tn(p)), createComponent(i, l)] };
    }
  });
}
function St() {
  function e(r) {
    return { ...r, ...r.$$route ? r.$$route.require().route : void 0, info: { ...r.$$route ? r.$$route.require().route.info : {}, filesystem: true }, component: r.$component && zn(r.$component, globalThis.MANIFEST.client, globalThis.MANIFEST.ssr), children: r.children ? r.children.map(e) : void 0 };
  }
  return kn.map(e);
}
let Xe;
const nu = isServer ? () => getRequestEvent().routes : () => Xe || (Xe = St());
function Cn(e) {
  const t = an$1(e.nativeEvent, "flash");
  if (t) try {
    let r = JSON.parse(t);
    if (!r || !r.result) return;
    const n = [...r.input.slice(0, -1), new Map(r.input[r.input.length - 1])], a = r.error ? new Error(r.result) : r.result;
    return { input: n, url: r.url, pending: false, result: r.thrown ? void 0 : a, error: r.thrown ? a : void 0 };
  } catch (r) {
    console.error(r);
  } finally {
    on$1(e.nativeEvent, "flash", "", { maxAge: 0 });
  }
}
async function On(e) {
  const t = globalThis.MANIFEST.client;
  return globalThis.MANIFEST.ssr, e.response.headers.set("Content-Type", "text/html"), Object.assign(e, { manifest: await t.json(), assets: [...await t.inputs[t.handler].assets()], router: { submission: Cn(e) }, routes: St(), complete: false, $islands: /* @__PURE__ */ new Set() });
}
const Ln = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function In(e) {
  return e.status && Ln.has(e.status) ? e.status : 302;
}
const Nn = {};
var Et = ((e) => (e[e.AggregateError = 1] = "AggregateError", e[e.ArrowFunction = 2] = "ArrowFunction", e[e.ErrorPrototypeStack = 4] = "ErrorPrototypeStack", e[e.ObjectAssign = 8] = "ObjectAssign", e[e.BigIntTypedArray = 16] = "BigIntTypedArray", e[e.RegExp = 32] = "RegExp", e))(Et || {}), x = Symbol.asyncIterator, Rt = Symbol.hasInstance, M$2 = Symbol.isConcatSpreadable, $$2 = Symbol.iterator, kt = Symbol.match, At = Symbol.matchAll, xt = Symbol.replace, $t = Symbol.search, _t = Symbol.species, Pt = Symbol.split, Tt = Symbol.toPrimitive, B$2 = Symbol.toStringTag, zt$1 = Symbol.unscopables, Un = { 0: "Symbol.asyncIterator", 1: "Symbol.hasInstance", 2: "Symbol.isConcatSpreadable", 3: "Symbol.iterator", 4: "Symbol.match", 5: "Symbol.matchAll", 6: "Symbol.replace", 7: "Symbol.search", 8: "Symbol.species", 9: "Symbol.split", 10: "Symbol.toPrimitive", 11: "Symbol.toStringTag", 12: "Symbol.unscopables" }, Ct = { [x]: 0, [Rt]: 1, [M$2]: 2, [$$2]: 3, [kt]: 4, [At]: 5, [xt]: 6, [$t]: 7, [_t]: 8, [Pt]: 9, [Tt]: 10, [B$2]: 11, [zt$1]: 12 }, jn = { 0: x, 1: Rt, 2: M$2, 3: $$2, 4: kt, 5: At, 6: xt, 7: $t, 8: _t, 9: Pt, 10: Tt, 11: B$2, 12: zt$1 }, Dn = { 2: "!0", 3: "!1", 1: "void 0", 0: "null", 4: "-0", 5: "1/0", 6: "-1/0", 7: "0/0" }, s = void 0, Fn = { 2: true, 3: false, 1: s, 0: null, 4: -0, 5: Number.POSITIVE_INFINITY, 6: Number.NEGATIVE_INFINITY, 7: Number.NaN }, Ot = { 0: "Error", 1: "EvalError", 2: "RangeError", 3: "ReferenceError", 4: "SyntaxError", 5: "TypeError", 6: "URIError" }, Hn = { 0: Error, 1: EvalError, 2: RangeError, 3: ReferenceError, 4: SyntaxError, 5: TypeError, 6: URIError };
function g(e, t, r, n, a, i, o, u, c, l, p, d) {
  return { t: e, i: t, s: r, c: n, m: a, p: i, e: o, a: u, f: c, b: l, o: p, l: d };
}
function C$1(e) {
  return g(2, s, e, s, s, s, s, s, s, s, s, s);
}
var Lt = C$1(2), It$1 = C$1(3), qn = C$1(1), Mn = C$1(0), Bn = C$1(4), Vn = C$1(5), Wn = C$1(6), Gn = C$1(7);
function Xn(e) {
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
      return s;
  }
}
function k$1(e) {
  let t = "", r = 0, n;
  for (let a = 0, i = e.length; a < i; a++) n = Xn(e[a]), n && (t += e.slice(r, a) + n, r = a + 1);
  return r === 0 ? t = e : t += e.slice(r), t;
}
function Jn(e) {
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
function N(e) {
  return e.replace(/(\\\\|\\"|\\n|\\r|\\b|\\t|\\f|\\u2028|\\u2029|\\x3C)/g, Jn);
}
var X$1 = "__SEROVAL_REFS__", oe$1 = "$R", se$2 = `self.${oe$1}`;
function Yn(e) {
  return e == null ? `${se$2}=${se$2}||[]` : `(${se$2}=${se$2}||{})["${k$1(e)}"]=[]`;
}
var Nt = /* @__PURE__ */ new Map(), H$2 = /* @__PURE__ */ new Map();
function Ut$1(e) {
  return Nt.has(e);
}
function Kn(e) {
  return H$2.has(e);
}
function Qn(e) {
  if (Ut$1(e)) return Nt.get(e);
  throw new $s(e);
}
function Zn(e) {
  if (Kn(e)) return H$2.get(e);
  throw new _s(e);
}
typeof globalThis < "u" ? Object.defineProperty(globalThis, X$1, { value: H$2, configurable: true, writable: false, enumerable: false }) : typeof self < "u" ? Object.defineProperty(self, X$1, { value: H$2, configurable: true, writable: false, enumerable: false }) : typeof global < "u" && Object.defineProperty(global, X$1, { value: H$2, configurable: true, writable: false, enumerable: false });
function $e(e) {
  return e instanceof EvalError ? 1 : e instanceof RangeError ? 2 : e instanceof ReferenceError ? 3 : e instanceof SyntaxError ? 4 : e instanceof TypeError ? 5 : e instanceof URIError ? 6 : 0;
}
function es(e) {
  let t = Ot[$e(e)];
  return e.name !== t ? { name: e.name } : e.constructor.name !== t ? { name: e.constructor.name } : {};
}
function jt$1(e, t) {
  let r = es(e), n = Object.getOwnPropertyNames(e);
  for (let a = 0, i = n.length, o; a < i; a++) o = n[a], o !== "name" && o !== "message" && (o === "stack" ? t & 4 && (r = r || {}, r[o] = e[o]) : (r = r || {}, r[o] = e[o]));
  return r;
}
function Dt(e) {
  return Object.isFrozen(e) ? 3 : Object.isSealed(e) ? 2 : Object.isExtensible(e) ? 0 : 1;
}
function ts(e) {
  switch (e) {
    case Number.POSITIVE_INFINITY:
      return Vn;
    case Number.NEGATIVE_INFINITY:
      return Wn;
  }
  return e !== e ? Gn : Object.is(e, -0) ? Bn : g(0, s, e, s, s, s, s, s, s, s, s, s);
}
function Ft$1(e) {
  return g(1, s, k$1(e), s, s, s, s, s, s, s, s, s);
}
function rs(e) {
  return g(3, s, "" + e, s, s, s, s, s, s, s, s, s);
}
function ns(e) {
  return g(4, e, s, s, s, s, s, s, s, s, s, s);
}
function ss(e, t) {
  let r = t.valueOf();
  return g(5, e, r !== r ? "" : t.toISOString(), s, s, s, s, s, s, s, s, s);
}
function as(e, t) {
  return g(6, e, s, k$1(t.source), t.flags, s, s, s, s, s, s, s);
}
function is(e, t) {
  return g(17, e, Ct[t], s, s, s, s, s, s, s, s, s);
}
function os(e, t) {
  return g(18, e, k$1(Qn(t)), s, s, s, s, s, s, s, s, s);
}
function Ht(e, t, r) {
  return g(25, e, r, k$1(t), s, s, s, s, s, s, s, s);
}
function us(e, t, r) {
  return g(9, e, s, s, s, s, s, r, s, s, Dt(t), s);
}
function cs(e, t) {
  return g(21, e, s, s, s, s, s, s, t, s, s, s);
}
function ls(e, t, r) {
  return g(15, e, s, t.constructor.name, s, s, s, s, r, t.byteOffset, s, t.length);
}
function fs(e, t, r) {
  return g(16, e, s, t.constructor.name, s, s, s, s, r, t.byteOffset, s, t.byteLength);
}
function ps(e, t, r) {
  return g(20, e, s, s, s, s, s, s, r, t.byteOffset, s, t.byteLength);
}
function ds(e, t, r) {
  return g(13, e, $e(t), s, k$1(t.message), r, s, s, s, s, s, s);
}
function hs(e, t, r) {
  return g(14, e, $e(t), s, k$1(t.message), r, s, s, s, s, s, s);
}
function gs(e, t) {
  return g(7, e, s, s, s, s, s, t, s, s, s, s);
}
function ms(e, t) {
  return g(28, s, s, s, s, s, s, [e, t], s, s, s, s);
}
function bs(e, t) {
  return g(30, s, s, s, s, s, s, [e, t], s, s, s, s);
}
function ys(e, t, r) {
  return g(31, e, s, s, s, s, s, r, t, s, s, s);
}
function ws(e, t) {
  return g(32, e, s, s, s, s, s, s, t, s, s, s);
}
function vs(e, t) {
  return g(33, e, s, s, s, s, s, s, t, s, s, s);
}
function Ss(e, t) {
  return g(34, e, s, s, s, s, s, s, t, s, s, s);
}
function Es(e, t, r, n) {
  return g(35, e, r, s, s, s, s, t, s, s, s, n);
}
var Rs = { parsing: 1, serialization: 2, deserialization: 3 };
function ks(e) {
  return `Seroval Error (step: ${Rs[e]})`;
}
var As = (e, t) => ks(e), qt$1 = class qt extends Error {
  constructor(e, t) {
    super(As(e)), this.cause = t;
  }
}, Je = class extends qt$1 {
  constructor(e) {
    super("parsing", e);
  }
}, xs = class extends qt$1 {
  constructor(e) {
    super("deserialization", e);
  }
};
function _(e) {
  return `Seroval Error (specific: ${e})`;
}
var ue = class extends Error {
  constructor(t) {
    super(_(1)), this.value = t;
  }
}, U = class extends Error {
  constructor(t) {
    super(_(2));
  }
}, Mt$1 = class Mt extends Error {
  constructor(e) {
    super(_(3));
  }
}, Z$2 = class Z extends Error {
  constructor(t) {
    super(_(4));
  }
}, $s = class extends Error {
  constructor(e) {
    super(_(5)), this.value = e;
  }
}, _s = class extends Error {
  constructor(e) {
    super(_(6));
  }
}, Ps = class extends Error {
  constructor(e) {
    super(_(7));
  }
}, O = class extends Error {
  constructor(t) {
    super(_(8));
  }
}, Bt$1 = class Bt extends Error {
  constructor(t) {
    super(_(9));
  }
}, Ts = class {
  constructor(t, r) {
    this.value = t, this.replacement = r;
  }
}, ce = () => {
  let e = { p: 0, s: 0, f: 0 };
  return e.p = new Promise((t, r) => {
    e.s = t, e.f = r;
  }), e;
}, zs = (e, t) => {
  e.s(t), e.p.s = 1, e.p.v = t;
}, Cs = (e, t) => {
  e.f(t), e.p.s = 2, e.p.v = t;
}, Os = ce.toString(), Ls = zs.toString(), Is = Cs.toString(), Vt$1 = () => {
  let e = [], t = [], r = true, n = false, a = 0, i = (c, l, p) => {
    for (p = 0; p < a; p++) t[p] && t[p][l](c);
  }, o = (c, l, p, d) => {
    for (l = 0, p = e.length; l < p; l++) d = e[l], !r && l === p - 1 ? c[n ? "return" : "throw"](d) : c.next(d);
  }, u = (c, l) => (r && (l = a++, t[l] = c), o(c), () => {
    r && (t[l] = t[a], t[a--] = void 0);
  });
  return { __SEROVAL_STREAM__: true, on: (c) => u(c), next: (c) => {
    r && (e.push(c), i(c, "next"));
  }, throw: (c) => {
    r && (e.push(c), i(c, "throw"), r = false, n = false, t.length = 0);
  }, return: (c) => {
    r && (e.push(c), i(c, "return"), r = false, n = true, t.length = 0);
  } };
}, Ns = Vt$1.toString(), Wt$1 = (e) => (t) => () => {
  let r = 0, n = { [e]: () => n, next: () => {
    if (r > t.d) return { done: true, value: void 0 };
    let a = r++, i = t.v[a];
    if (a === t.t) throw i;
    return { done: a === t.d, value: i };
  } };
  return n;
}, Us = Wt$1.toString(), Gt$1 = (e, t) => (r) => () => {
  let n = 0, a = -1, i = false, o = [], u = [], c = (p = 0, d = u.length) => {
    for (; p < d; p++) u[p].s({ done: true, value: void 0 });
  };
  r.on({ next: (p) => {
    let d = u.shift();
    d && d.s({ done: false, value: p }), o.push(p);
  }, throw: (p) => {
    let d = u.shift();
    d && d.f(p), c(), a = o.length, i = true, o.push(p);
  }, return: (p) => {
    let d = u.shift();
    d && d.s({ done: true, value: p }), c(), a = o.length, o.push(p);
  } });
  let l = { [e]: () => l, next: () => {
    if (a === -1) {
      let w = n++;
      if (w >= o.length) {
        let f = t();
        return u.push(f), f.p;
      }
      return { done: false, value: o[w] };
    }
    if (n > a) return { done: true, value: void 0 };
    let p = n++, d = o[p];
    if (p !== a) return { done: false, value: d };
    if (i) throw d;
    return { done: true, value: d };
  } };
  return l;
}, js = Gt$1.toString(), Xt$1 = (e) => {
  let t = atob(e), r = t.length, n = new Uint8Array(r);
  for (let a = 0; a < r; a++) n[a] = t.charCodeAt(a);
  return n.buffer;
}, Ds = Xt$1.toString();
function Fs(e) {
  return "__SEROVAL_SEQUENCE__" in e;
}
function Jt$1(e, t, r) {
  return { __SEROVAL_SEQUENCE__: true, v: e, t, d: r };
}
function Hs(e) {
  let t = [], r = -1, n = -1, a = e[$$2]();
  for (; ; ) try {
    let i = a.next();
    if (t.push(i.value), i.done) {
      n = t.length - 1;
      break;
    }
  } catch (i) {
    r = t.length, t.push(i);
  }
  return Jt$1(t, r, n);
}
var qs = Wt$1($$2);
function Ms(e) {
  return qs(e);
}
var Bs = {}, Vs = {}, Ws = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {} }, Gs = { 0: "[]", 1: Os, 2: Ls, 3: Is, 4: Ns, 5: Ds };
function le(e) {
  return "__SEROVAL_STREAM__" in e;
}
function ee() {
  return Vt$1();
}
function Xs(e) {
  let t = ee(), r = e[x]();
  async function n() {
    try {
      let a = await r.next();
      a.done ? t.return(a.value) : (t.next(a.value), await n());
    } catch (a) {
      t.throw(a);
    }
  }
  return n().catch(() => {
  }), t;
}
var Js = Gt$1(x, ce);
function Ys(e) {
  return Js(e);
}
function Ks(e, t) {
  return { plugins: t.plugins, mode: e, marked: /* @__PURE__ */ new Set(), features: 63 ^ (t.disabledFeatures || 0), refs: t.refs || /* @__PURE__ */ new Map(), depthLimit: t.depthLimit || 1e3 };
}
function Qs(e, t) {
  e.marked.add(t);
}
function Yt$1(e, t) {
  let r = e.refs.size;
  return e.refs.set(t, r), r;
}
function fe$1(e, t) {
  let r = e.refs.get(t);
  return r != null ? (Qs(e, r), { type: 1, value: ns(r) }) : { type: 0, value: Yt$1(e, t) };
}
function _e$1(e, t) {
  let r = fe$1(e, t);
  return r.type === 1 ? r : Ut$1(t) ? { type: 2, value: os(r.value, t) } : r;
}
function L$1(e, t) {
  let r = _e$1(e, t);
  if (r.type !== 0) return r.value;
  if (t in Ct) return is(r.value, t);
  throw new ue(t);
}
function j$2(e, t) {
  let r = fe$1(e, Ws[t]);
  return r.type === 1 ? r.value : g(26, r.value, t, s, s, s, s, s, s, s, s, s);
}
function Zs(e) {
  let t = fe$1(e, Bs);
  return t.type === 1 ? t.value : g(27, t.value, s, s, s, s, s, s, L$1(e, $$2), s, s, s);
}
function ea(e) {
  let t = fe$1(e, Vs);
  return t.type === 1 ? t.value : g(29, t.value, s, s, s, s, s, [j$2(e, 1), L$1(e, x)], s, s, s, s);
}
function ta(e, t, r, n) {
  return g(r ? 11 : 10, e, s, s, s, n, s, s, s, s, Dt(t), s);
}
function ra(e, t, r, n) {
  return g(8, t, s, s, s, s, { k: r, v: n }, s, j$2(e, 0), s, s, s);
}
function na(e, t, r) {
  return g(22, t, r, s, s, s, s, s, j$2(e, 1), s, s, s);
}
function sa(e, t, r) {
  let n = new Uint8Array(r), a = "";
  for (let i = 0, o = n.length; i < o; i++) a += String.fromCharCode(n[i]);
  return g(19, t, k$1(btoa(a)), s, s, s, s, s, j$2(e, 5), s, s, s);
}
var aa = ((e) => (e[e.Vanilla = 1] = "Vanilla", e[e.Cross = 2] = "Cross", e))(aa || {});
function Kt$1(e, t) {
  for (let r = 0, n = t.length; r < n; r++) {
    let a = t[r];
    e.has(a) || (e.add(a), a.extends && Kt$1(e, a.extends));
  }
}
function Pe(e) {
  if (e) {
    let t = /* @__PURE__ */ new Set();
    return Kt$1(t, e), [...t];
  }
}
function ia(e) {
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
      throw new Ps(e);
  }
}
var oa = 1e6, ua = 1e4, ca = 2e4;
function Qt$1(e, t) {
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
var la = 1e3;
function fa(e, t) {
  var r;
  return { mode: e, plugins: t.plugins, refs: t.refs || /* @__PURE__ */ new Map(), features: (r = t.features) != null ? r : 63 ^ (t.disabledFeatures || 0), depthLimit: t.depthLimit || la };
}
function pa(e) {
  return { mode: 1, base: fa(1, e), child: s, state: { marked: new Set(e.markedRefs) } };
}
var da = class {
  constructor(e, t) {
    this._p = e, this.depth = t;
  }
  deserialize(e) {
    return b$1(this._p, this.depth, e);
  }
};
function Zt$1(e, t) {
  if (t < 0 || !Number.isFinite(t) || !Number.isInteger(t)) throw new O({ t: 4, i: t });
  if (e.refs.has(t)) throw new Error("Conflicted ref id: " + t);
}
function ha(e, t, r) {
  return Zt$1(e.base, t), e.state.marked.has(t) && e.base.refs.set(t, r), r;
}
function ga(e, t, r) {
  return Zt$1(e.base, t), e.base.refs.set(t, r), r;
}
function y(e, t, r) {
  return e.mode === 1 ? ha(e, t, r) : ga(e, t, r);
}
function Ee$1(e, t, r) {
  if (Object.hasOwn(t, r)) return t[r];
  throw new O(e);
}
function ma(e, t) {
  return y(e, t.i, Zn(N(t.s)));
}
function ba(e, t, r) {
  let n = r.a, a = n.length, i = y(e, r.i, new Array(a));
  for (let o = 0, u; o < a; o++) u = n[o], u && (i[o] = b$1(e, t, u));
  return Qt$1(i, r.o), i;
}
function ya(e) {
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
function wa(e) {
  switch (e) {
    case x:
    case M$2:
    case B$2:
    case $$2:
      return true;
    default:
      return false;
  }
}
function Ye(e, t, r) {
  ya(t) ? e[t] = r : Object.defineProperty(e, t, { value: r, configurable: true, enumerable: true, writable: true });
}
function va(e, t, r, n, a) {
  if (typeof n == "string") Ye(r, n, b$1(e, t, a));
  else {
    let i = b$1(e, t, n);
    switch (typeof i) {
      case "string":
        Ye(r, i, b$1(e, t, a));
        break;
      case "symbol":
        wa(i) && (r[i] = b$1(e, t, a));
        break;
      default:
        throw new O(n);
    }
  }
}
function er$1(e, t, r, n) {
  let a = r.k;
  if (a.length > 0) for (let i = 0, o = r.v, u = a.length; i < u; i++) va(e, t, n, a[i], o[i]);
  return n;
}
function Sa(e, t, r) {
  let n = y(e, r.i, r.t === 10 ? {} : /* @__PURE__ */ Object.create(null));
  return er$1(e, t, r.p, n), Qt$1(n, r.o), n;
}
function Ea(e, t) {
  return y(e, t.i, new Date(t.s));
}
function Ra(e, t) {
  if (e.base.features & 32) {
    let r = N(t.c);
    if (r.length > ca) throw new O(t);
    return y(e, t.i, new RegExp(r, t.m));
  }
  throw new U(t);
}
function ka(e, t, r) {
  let n = y(e, r.i, /* @__PURE__ */ new Set());
  for (let a = 0, i = r.a, o = i.length; a < o; a++) n.add(b$1(e, t, i[a]));
  return n;
}
function Aa(e, t, r) {
  let n = y(e, r.i, /* @__PURE__ */ new Map());
  for (let a = 0, i = r.e.k, o = r.e.v, u = i.length; a < u; a++) n.set(b$1(e, t, i[a]), b$1(e, t, o[a]));
  return n;
}
function xa(e, t) {
  if (t.s.length > oa) throw new O(t);
  return y(e, t.i, Xt$1(N(t.s)));
}
function $a(e, t, r) {
  var n;
  let a = ia(r.c), i = b$1(e, t, r.f), o = (n = r.b) != null ? n : 0;
  if (o < 0 || o > i.byteLength) throw new O(r);
  return y(e, r.i, new a(i, o, r.l));
}
function _a(e, t, r) {
  var n;
  let a = b$1(e, t, r.f), i = (n = r.b) != null ? n : 0;
  if (i < 0 || i > a.byteLength) throw new O(r);
  return y(e, r.i, new DataView(a, i, r.l));
}
function tr$1(e, t, r, n) {
  if (r.p) {
    let a = er$1(e, t, r.p, {});
    Object.defineProperties(n, Object.getOwnPropertyDescriptors(a));
  }
  return n;
}
function Pa(e, t, r) {
  let n = y(e, r.i, new AggregateError([], N(r.m)));
  return tr$1(e, t, r, n);
}
function Ta(e, t, r) {
  let n = Ee$1(r, Hn, r.s), a = y(e, r.i, new n(N(r.m)));
  return tr$1(e, t, r, a);
}
function za(e, t, r) {
  let n = ce(), a = y(e, r.i, n.p), i = b$1(e, t, r.f);
  return r.s ? n.s(i) : n.f(i), a;
}
function Ca(e, t, r) {
  return y(e, r.i, Object(b$1(e, t, r.f)));
}
function Oa(e, t, r) {
  let n = e.base.plugins;
  if (n) {
    let a = N(r.c);
    for (let i = 0, o = n.length; i < o; i++) {
      let u = n[i];
      if (u.tag === a) return y(e, r.i, u.deserialize(r.s, new da(e, t), { id: r.i }));
    }
  }
  throw new Mt$1(r.c);
}
function La(e, t) {
  return y(e, t.i, y(e, t.s, ce()).p);
}
function Ia(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n) return n.s(b$1(e, t, r.a[1])), s;
  throw new Z$2("Promise");
}
function Na(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n) return n.f(b$1(e, t, r.a[1])), s;
  throw new Z$2("Promise");
}
function Ua(e, t, r) {
  b$1(e, t, r.a[0]);
  let n = b$1(e, t, r.a[1]);
  return Ms(n);
}
function ja(e, t, r) {
  b$1(e, t, r.a[0]);
  let n = b$1(e, t, r.a[1]);
  return Ys(n);
}
function Da(e, t, r) {
  let n = y(e, r.i, ee()), a = r.a, i = a.length;
  if (i) for (let o = 0; o < i; o++) b$1(e, t, a[o]);
  return n;
}
function Fa(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n && le(n)) return n.next(b$1(e, t, r.f)), s;
  throw new Z$2("Stream");
}
function Ha(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n && le(n)) return n.throw(b$1(e, t, r.f)), s;
  throw new Z$2("Stream");
}
function qa(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n && le(n)) return n.return(b$1(e, t, r.f)), s;
  throw new Z$2("Stream");
}
function Ma(e, t, r) {
  return b$1(e, t, r.f), s;
}
function Ba(e, t, r) {
  return b$1(e, t, r.a[1]), s;
}
function Va(e, t, r) {
  let n = y(e, r.i, Jt$1([], r.s, r.l));
  for (let a = 0, i = r.a.length; a < i; a++) n.v[a] = b$1(e, t, r.a[a]);
  return n;
}
function b$1(e, t, r) {
  if (t > e.base.depthLimit) throw new Bt$1(e.base.depthLimit);
  switch (t += 1, r.t) {
    case 2:
      return Ee$1(r, Fn, r.s);
    case 0:
      return Number(r.s);
    case 1:
      return N(String(r.s));
    case 3:
      if (String(r.s).length > ua) throw new O(r);
      return BigInt(r.s);
    case 4:
      return e.base.refs.get(r.i);
    case 18:
      return ma(e, r);
    case 9:
      return ba(e, t, r);
    case 10:
    case 11:
      return Sa(e, t, r);
    case 5:
      return Ea(e, r);
    case 6:
      return Ra(e, r);
    case 7:
      return ka(e, t, r);
    case 8:
      return Aa(e, t, r);
    case 19:
      return xa(e, r);
    case 16:
    case 15:
      return $a(e, t, r);
    case 20:
      return _a(e, t, r);
    case 14:
      return Pa(e, t, r);
    case 13:
      return Ta(e, t, r);
    case 12:
      return za(e, t, r);
    case 17:
      return Ee$1(r, jn, r.s);
    case 21:
      return Ca(e, t, r);
    case 25:
      return Oa(e, t, r);
    case 22:
      return La(e, r);
    case 23:
      return Ia(e, t, r);
    case 24:
      return Na(e, t, r);
    case 28:
      return Ua(e, t, r);
    case 30:
      return ja(e, t, r);
    case 31:
      return Da(e, t, r);
    case 32:
      return Fa(e, t, r);
    case 33:
      return Ha(e, t, r);
    case 34:
      return qa(e, t, r);
    case 27:
      return Ma(e, t, r);
    case 29:
      return Ba(e, t, r);
    case 35:
      return Va(e, t, r);
    default:
      throw new U(r);
  }
}
function Wa(e, t) {
  try {
    return b$1(e, 0, t);
  } catch (r) {
    throw new xs(r);
  }
}
var Ga = () => T, Xa = Ga.toString(), rr$1 = /=>/.test(Xa);
function nr$1(e, t) {
  return rr$1 ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>" + (t.startsWith("{") ? "(" + t + ")" : t) : "function(" + e.join(",") + "){return " + t + "}";
}
function Ja(e, t) {
  return rr$1 ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>{" + t + "}" : "function(" + e.join(",") + "){" + t + "}";
}
var sr$1 = "hjkmoquxzABCDEFGHIJKLNPQRTUVWXYZ$_", Ke$1 = sr$1.length, ar$1 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_", Qe = ar$1.length;
function Ya(e) {
  let t = e % Ke$1, r = sr$1[t];
  for (e = (e - t) / Ke$1; e > 0; ) t = e % Qe, r += ar$1[t], e = (e - t) / Qe;
  return r;
}
var Ka = /^[$A-Z_][0-9A-Z_$]*$/i;
function ir$1(e) {
  let t = e[0];
  return (t === "$" || t === "_" || t >= "A" && t <= "Z" || t >= "a" && t <= "z") && Ka.test(e);
}
function J$2(e) {
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
function Qa(e) {
  let t = [], r = e[0];
  for (let n = 1, a = e.length, i, o = r; n < a; n++) i = e[n], i.t === 0 && i.v === o.v ? r = { t: 0, s: i.s, k: s, v: J$2(r) } : i.t === 2 && i.s === o.s ? r = { t: 2, s: J$2(r), k: i.k, v: i.v } : i.t === 1 && i.s === o.s ? r = { t: 1, s: J$2(r), k: s, v: i.v } : i.t === 3 && i.s === o.s ? r = { t: 3, s: J$2(r), k: i.k, v: s } : (t.push(r), r = i), o = i;
  return t.push(r), t;
}
function or$1(e) {
  if (e.length) {
    let t = "", r = Qa(e);
    for (let n = 0, a = r.length; n < a; n++) t += J$2(r[n]) + ",";
    return t;
  }
  return s;
}
var Za = "Object.create(null)", ei = "new Set", ti = "new Map", ri = "Promise.resolve", ni = "Promise.reject", si = { 3: "Object.freeze", 2: "Object.seal", 1: "Object.preventExtensions", 0: s };
function ai(e, t) {
  return { mode: e, plugins: t.plugins, features: t.features, marked: new Set(t.markedRefs), stack: [], flags: [], assignments: [] };
}
function ii(e) {
  return { mode: 2, base: ai(2, e), state: e, child: s };
}
var oi = class {
  constructor(e) {
    this._p = e;
  }
  serialize(e) {
    return h(this._p, e);
  }
};
function ui(e, t) {
  let r = e.valid.get(t);
  r == null && (r = e.valid.size, e.valid.set(t, r));
  let n = e.vars[r];
  return n == null && (n = Ya(r), e.vars[r] = n), n;
}
function ci(e) {
  return oe$1 + "[" + e + "]";
}
function m$1(e, t) {
  return e.mode === 1 ? ui(e.state, t) : ci(t);
}
function E$1(e, t) {
  e.marked.add(t);
}
function Re$1(e, t) {
  return e.marked.has(t);
}
function Te(e, t, r) {
  t !== 0 && (E$1(e.base, r), e.base.flags.push({ type: t, value: m$1(e, r) }));
}
function li(e) {
  let t = "";
  for (let r = 0, n = e.flags, a = n.length; r < a; r++) {
    let i = n[r];
    t += si[i.type] + "(" + i.value + "),";
  }
  return t;
}
function fi(e) {
  let t = or$1(e.assignments), r = li(e);
  return t ? r ? t + r : t : r;
}
function ze(e, t, r) {
  e.assignments.push({ t: 0, s: t, k: s, v: r });
}
function pi(e, t, r) {
  e.base.assignments.push({ t: 1, s: m$1(e, t), k: s, v: r });
}
function G$1(e, t, r, n) {
  e.base.assignments.push({ t: 2, s: m$1(e, t), k: r, v: n });
}
function Ze(e, t, r) {
  e.base.assignments.push({ t: 3, s: m$1(e, t), k: r, v: s });
}
function K$1(e, t, r, n) {
  ze(e.base, m$1(e, t) + "[" + r + "]", n);
}
function ke$1(e, t, r, n) {
  ze(e.base, m$1(e, t) + "." + r, n);
}
function di(e, t, r, n) {
  ze(e.base, m$1(e, t) + ".v[" + r + "]", n);
}
function A(e, t) {
  return t.t === 4 && e.stack.includes(t.i);
}
function W$3(e, t, r) {
  return e.mode === 1 && !Re$1(e.base, t) ? r : m$1(e, t) + "=" + r;
}
function hi(e) {
  return X$1 + '.get("' + e.s + '")';
}
function et$1(e, t, r, n) {
  return r ? A(e.base, r) ? (E$1(e.base, t), K$1(e, t, n, m$1(e, r.i)), "") : h(e, r) : "";
}
function gi(e, t) {
  let r = t.i, n = t.a, a = n.length;
  if (a > 0) {
    e.base.stack.push(r);
    let i = et$1(e, r, n[0], 0), o = i === "";
    for (let u = 1, c; u < a; u++) c = et$1(e, r, n[u], u), i += "," + c, o = c === "";
    return e.base.stack.pop(), Te(e, t.o, t.i), "[" + i + (o ? ",]" : "]");
  }
  return "[]";
}
function tt$1(e, t, r, n) {
  if (typeof r == "string") {
    let a = Number(r), i = a >= 0 && a.toString() === r || ir$1(r);
    if (A(e.base, n)) {
      let o = m$1(e, n.i);
      return E$1(e.base, t.i), i && a !== a ? ke$1(e, t.i, r, o) : K$1(e, t.i, i ? r : '"' + r + '"', o), "";
    }
    return (i ? r : '"' + r + '"') + ":" + h(e, n);
  }
  return "[" + h(e, r) + "]:" + h(e, n);
}
function ur$1(e, t, r) {
  let n = r.k, a = n.length;
  if (a > 0) {
    let i = r.v;
    e.base.stack.push(t.i);
    let o = tt$1(e, t, n[0], i[0]);
    for (let u = 1, c = o; u < a; u++) c = tt$1(e, t, n[u], i[u]), o += (c && o && ",") + c;
    return e.base.stack.pop(), "{" + o + "}";
  }
  return "{}";
}
function mi(e, t) {
  return Te(e, t.o, t.i), ur$1(e, t, t.p);
}
function bi(e, t, r, n) {
  let a = ur$1(e, t, r);
  return a !== "{}" ? "Object.assign(" + n + "," + a + ")" : n;
}
function yi(e, t, r, n, a) {
  let i = e.base, o = h(e, a), u = Number(n), c = u >= 0 && u.toString() === n || ir$1(n);
  if (A(i, a)) c && u !== u ? ke$1(e, t.i, n, o) : K$1(e, t.i, c ? n : '"' + n + '"', o);
  else {
    let l = i.assignments;
    i.assignments = r, c && u !== u ? ke$1(e, t.i, n, o) : K$1(e, t.i, c ? n : '"' + n + '"', o), i.assignments = l;
  }
}
function wi(e, t, r, n, a) {
  if (typeof n == "string") yi(e, t, r, n, a);
  else {
    let i = e.base, o = i.stack;
    i.stack = [];
    let u = h(e, a);
    i.stack = o;
    let c = i.assignments;
    i.assignments = r, K$1(e, t.i, h(e, n), u), i.assignments = c;
  }
}
function vi(e, t, r) {
  let n = r.k, a = n.length;
  if (a > 0) {
    let i = [], o = r.v;
    e.base.stack.push(t.i);
    for (let u = 0; u < a; u++) wi(e, t, i, n[u], o[u]);
    return e.base.stack.pop(), or$1(i);
  }
  return s;
}
function Ce(e, t, r) {
  if (t.p) {
    let n = e.base;
    if (n.features & 8) r = bi(e, t, t.p, r);
    else {
      E$1(n, t.i);
      let a = vi(e, t, t.p);
      if (a) return "(" + W$3(e, t.i, r) + "," + a + m$1(e, t.i) + ")";
    }
  }
  return r;
}
function Si(e, t) {
  return Te(e, t.o, t.i), Ce(e, t, Za);
}
function Ei(e) {
  return 'new Date("' + e.s + '")';
}
function Ri(e, t) {
  if (e.base.features & 32) return "/" + t.c + "/" + t.m;
  throw new U(t);
}
function rt$1(e, t, r) {
  let n = e.base;
  return A(n, r) ? (E$1(n, t), pi(e, t, m$1(e, r.i)), "") : h(e, r);
}
function ki(e, t) {
  let r = ei, n = t.a, a = n.length, i = t.i;
  if (a > 0) {
    e.base.stack.push(i);
    let o = rt$1(e, i, n[0]);
    for (let u = 1, c = o; u < a; u++) c = rt$1(e, i, n[u]), o += (c && o && ",") + c;
    e.base.stack.pop(), o && (r += "([" + o + "])");
  }
  return r;
}
function nt$1(e, t, r, n, a) {
  let i = e.base;
  if (A(i, r)) {
    let o = m$1(e, r.i);
    if (E$1(i, t), A(i, n)) {
      let c = m$1(e, n.i);
      return G$1(e, t, o, c), "";
    }
    if (n.t !== 4 && n.i != null && Re$1(i, n.i)) {
      let c = "(" + h(e, n) + ",[" + a + "," + a + "])";
      return G$1(e, t, o, m$1(e, n.i)), Ze(e, t, a), c;
    }
    let u = i.stack;
    return i.stack = [], G$1(e, t, o, h(e, n)), i.stack = u, "";
  }
  if (A(i, n)) {
    let o = m$1(e, n.i);
    if (E$1(i, t), r.t !== 4 && r.i != null && Re$1(i, r.i)) {
      let c = "(" + h(e, r) + ",[" + a + "," + a + "])";
      return G$1(e, t, m$1(e, r.i), o), Ze(e, t, a), c;
    }
    let u = i.stack;
    return i.stack = [], G$1(e, t, h(e, r), o), i.stack = u, "";
  }
  return "[" + h(e, r) + "," + h(e, n) + "]";
}
function Ai(e, t) {
  let r = ti, n = t.e.k, a = n.length, i = t.i, o = t.f, u = m$1(e, o.i), c = e.base;
  if (a > 0) {
    let l = t.e.v;
    c.stack.push(i);
    let p = nt$1(e, i, n[0], l[0], u);
    for (let d = 1, w = p; d < a; d++) w = nt$1(e, i, n[d], l[d], u), p += (w && p && ",") + w;
    c.stack.pop(), p && (r += "([" + p + "])");
  }
  return o.t === 26 && (E$1(c, o.i), r = "(" + h(e, o) + "," + r + ")"), r;
}
function xi(e, t) {
  return D$1(e, t.f) + '("' + t.s + '")';
}
function $i(e, t) {
  return "new " + t.c + "(" + h(e, t.f) + "," + t.b + "," + t.l + ")";
}
function _i(e, t) {
  return "new DataView(" + h(e, t.f) + "," + t.b + "," + t.l + ")";
}
function Pi(e, t) {
  let r = t.i;
  e.base.stack.push(r);
  let n = Ce(e, t, 'new AggregateError([],"' + t.m + '")');
  return e.base.stack.pop(), n;
}
function Ti(e, t) {
  return Ce(e, t, "new " + Ot[t.s] + '("' + t.m + '")');
}
function zi(e, t) {
  let r, n = t.f, a = t.i, i = t.s ? ri : ni, o = e.base;
  if (A(o, n)) {
    let u = m$1(e, n.i);
    r = i + (t.s ? "().then(" + nr$1([], u) + ")" : "().catch(" + Ja([], "throw " + u) + ")");
  } else {
    o.stack.push(a);
    let u = h(e, n);
    o.stack.pop(), r = i + "(" + u + ")";
  }
  return r;
}
function Ci(e, t) {
  return "Object(" + h(e, t.f) + ")";
}
function D$1(e, t) {
  let r = h(e, t);
  return t.t === 4 ? r : "(" + r + ")";
}
function Oi(e, t) {
  if (e.mode === 1) throw new U(t);
  return "(" + W$3(e, t.s, D$1(e, t.f) + "()") + ").p";
}
function Li(e, t) {
  if (e.mode === 1) throw new U(t);
  return D$1(e, t.a[0]) + "(" + m$1(e, t.i) + "," + h(e, t.a[1]) + ")";
}
function Ii(e, t) {
  if (e.mode === 1) throw new U(t);
  return D$1(e, t.a[0]) + "(" + m$1(e, t.i) + "," + h(e, t.a[1]) + ")";
}
function Ni(e, t) {
  let r = e.base.plugins;
  if (r) for (let n = 0, a = r.length; n < a; n++) {
    let i = r[n];
    if (i.tag === t.c) return e.child == null && (e.child = new oi(e)), i.serialize(t.s, e.child, { id: t.i });
  }
  throw new Mt$1(t.c);
}
function Ui(e, t) {
  let r = "", n = false;
  return t.f.t !== 4 && (E$1(e.base, t.f.i), r = "(" + h(e, t.f) + ",", n = true), r += W$3(e, t.i, "(" + Us + ")(" + m$1(e, t.f.i) + ")"), n && (r += ")"), r;
}
function ji(e, t) {
  return D$1(e, t.a[0]) + "(" + h(e, t.a[1]) + ")";
}
function Di(e, t) {
  let r = t.a[0], n = t.a[1], a = e.base, i = "";
  r.t !== 4 && (E$1(a, r.i), i += "(" + h(e, r)), n.t !== 4 && (E$1(a, n.i), i += (i ? "," : "(") + h(e, n)), i && (i += ",");
  let o = W$3(e, t.i, "(" + js + ")(" + m$1(e, n.i) + "," + m$1(e, r.i) + ")");
  return i ? i + o + ")" : o;
}
function Fi(e, t) {
  return D$1(e, t.a[0]) + "(" + h(e, t.a[1]) + ")";
}
function Hi(e, t) {
  let r = W$3(e, t.i, D$1(e, t.f) + "()"), n = t.a.length;
  if (n) {
    let a = h(e, t.a[0]);
    for (let i = 1; i < n; i++) a += "," + h(e, t.a[i]);
    return "(" + r + "," + a + "," + m$1(e, t.i) + ")";
  }
  return r;
}
function qi(e, t) {
  return m$1(e, t.i) + ".next(" + h(e, t.f) + ")";
}
function Mi(e, t) {
  return m$1(e, t.i) + ".throw(" + h(e, t.f) + ")";
}
function Bi(e, t) {
  return m$1(e, t.i) + ".return(" + h(e, t.f) + ")";
}
function st$1(e, t, r, n) {
  let a = e.base;
  return A(a, n) ? (E$1(a, t), di(e, t, r, m$1(e, n.i)), "") : h(e, n);
}
function Vi(e, t) {
  let r = t.a, n = r.length, a = t.i;
  if (n > 0) {
    e.base.stack.push(a);
    let i = st$1(e, a, 0, r[0]);
    for (let o = 1, u = i; o < n; o++) u = st$1(e, a, o, r[o]), i += (u && i && ",") + u;
    if (e.base.stack.pop(), i) return "{__SEROVAL_SEQUENCE__:!0,v:[" + i + "],t:" + t.s + ",d:" + t.l + "}";
  }
  return "{__SEROVAL_SEQUENCE__:!0,v:[],t:-1,d:0}";
}
function Wi(e, t) {
  switch (t.t) {
    case 17:
      return Un[t.s];
    case 18:
      return hi(t);
    case 9:
      return gi(e, t);
    case 10:
      return mi(e, t);
    case 11:
      return Si(e, t);
    case 5:
      return Ei(t);
    case 6:
      return Ri(e, t);
    case 7:
      return ki(e, t);
    case 8:
      return Ai(e, t);
    case 19:
      return xi(e, t);
    case 16:
    case 15:
      return $i(e, t);
    case 20:
      return _i(e, t);
    case 14:
      return Pi(e, t);
    case 13:
      return Ti(e, t);
    case 12:
      return zi(e, t);
    case 21:
      return Ci(e, t);
    case 22:
      return Oi(e, t);
    case 25:
      return Ni(e, t);
    case 26:
      return Gs[t.s];
    case 35:
      return Vi(e, t);
    default:
      throw new U(t);
  }
}
function h(e, t) {
  switch (t.t) {
    case 2:
      return Dn[t.s];
    case 0:
      return "" + t.s;
    case 1:
      return '"' + t.s + '"';
    case 3:
      return t.s + "n";
    case 4:
      return m$1(e, t.i);
    case 23:
      return Li(e, t);
    case 24:
      return Ii(e, t);
    case 27:
      return Ui(e, t);
    case 28:
      return ji(e, t);
    case 29:
      return Di(e, t);
    case 30:
      return Fi(e, t);
    case 31:
      return Hi(e, t);
    case 32:
      return qi(e, t);
    case 33:
      return Mi(e, t);
    case 34:
      return Bi(e, t);
    default:
      return W$3(e, t.i, Wi(e, t));
  }
}
function Gi(e, t) {
  let r = h(e, t), n = t.i;
  if (n == null) return r;
  let a = fi(e.base), i = m$1(e, n), o = e.state.scopeId, u = o == null ? "" : oe$1, c = a ? "(" + r + "," + a + i + ")" : r;
  if (u === "") return t.t === 10 && !a ? "(" + c + ")" : c;
  let l = o == null ? "()" : "(" + oe$1 + '["' + k$1(o) + '"])';
  return "(" + nr$1([u], c) + ")" + l;
}
var Xi = class {
  constructor(e, t) {
    this._p = e, this.depth = t;
  }
  parse(e) {
    return v(this._p, this.depth, e);
  }
}, Ji = class {
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
    Ne$1(this._p);
  }
  popPendingState() {
    Q$3(this._p);
  }
  onParse(e) {
    V$2(this._p, e);
  }
  onError(e) {
    Le(this._p, e);
  }
};
function Yi(e) {
  return { alive: true, pending: 0, initial: true, buffer: [], onParse: e.onParse, onError: e.onError, onDone: e.onDone };
}
function cr$1(e) {
  return { type: 2, base: Ks(2, e), state: Yi(e) };
}
function Ki(e, t, r) {
  let n = [];
  for (let a = 0, i = r.length; a < i; a++) a in r ? n[a] = v(e, t, r[a]) : n[a] = 0;
  return n;
}
function Qi(e, t, r, n) {
  return us(r, n, Ki(e, t, n));
}
function Oe$1(e, t, r) {
  let n = Object.entries(r), a = [], i = [];
  for (let o = 0, u = n.length; o < u; o++) a.push(k$1(n[o][0])), i.push(v(e, t, n[o][1]));
  return $$2 in r && (a.push(L$1(e.base, $$2)), i.push(ms(Zs(e.base), v(e, t, Hs(r))))), x in r && (a.push(L$1(e.base, x)), i.push(bs(ea(e.base), v(e, t, e.type === 1 ? ee() : Xs(r))))), B$2 in r && (a.push(L$1(e.base, B$2)), i.push(Ft$1(r[B$2]))), M$2 in r && (a.push(L$1(e.base, M$2)), i.push(r[M$2] ? Lt : It$1)), { k: a, v: i };
}
function ge$1(e, t, r, n, a) {
  return ta(r, n, a, Oe$1(e, t, n));
}
function Zi(e, t, r, n) {
  return cs(r, v(e, t, n.valueOf()));
}
function eo(e, t, r, n) {
  return ls(r, n, v(e, t, n.buffer));
}
function to(e, t, r, n) {
  return fs(r, n, v(e, t, n.buffer));
}
function ro(e, t, r, n) {
  return ps(r, n, v(e, t, n.buffer));
}
function at$1(e, t, r, n) {
  let a = jt$1(n, e.base.features);
  return ds(r, n, a ? Oe$1(e, t, a) : s);
}
function no(e, t, r, n) {
  let a = jt$1(n, e.base.features);
  return hs(r, n, a ? Oe$1(e, t, a) : s);
}
function so(e, t, r, n) {
  let a = [], i = [];
  for (let [o, u] of n.entries()) a.push(v(e, t, o)), i.push(v(e, t, u));
  return ra(e.base, r, a, i);
}
function ao(e, t, r, n) {
  let a = [];
  for (let i of n.keys()) a.push(v(e, t, i));
  return gs(r, a);
}
function io(e, t, r, n) {
  let a = ys(r, j$2(e.base, 4), []);
  return e.type === 1 || (Ne$1(e), n.on({ next: (i) => {
    if (e.state.alive) {
      let o = I$1(e, t, i);
      o && V$2(e, ws(r, o));
    }
  }, throw: (i) => {
    if (e.state.alive) {
      let o = I$1(e, t, i);
      o && V$2(e, vs(r, o));
    }
    Q$3(e);
  }, return: (i) => {
    if (e.state.alive) {
      let o = I$1(e, t, i);
      o && V$2(e, Ss(r, o));
    }
    Q$3(e);
  } })), a;
}
function oo(e, t, r) {
  if (this.state.alive) {
    let n = I$1(this, t, r);
    n && V$2(this, g(23, e, s, s, s, s, s, [j$2(this.base, 2), n], s, s, s, s)), Q$3(this);
  }
}
function uo(e, t, r) {
  if (this.state.alive) {
    let n = I$1(this, t, r);
    n && V$2(this, g(24, e, s, s, s, s, s, [j$2(this.base, 3), n], s, s, s, s));
  }
  Q$3(this);
}
function co(e, t, r, n) {
  let a = Yt$1(e.base, {});
  return e.type === 2 && (Ne$1(e), n.then(oo.bind(e, a, t), uo.bind(e, a, t))), na(e.base, r, a);
}
function lo(e, t, r, n, a) {
  for (let i = 0, o = a.length; i < o; i++) {
    let u = a[i];
    if (u.parse.sync && u.test(n)) return Ht(r, u.tag, u.parse.sync(n, new Xi(e, t), { id: r }));
  }
  return s;
}
function fo(e, t, r, n, a) {
  for (let i = 0, o = a.length; i < o; i++) {
    let u = a[i];
    if (u.parse.stream && u.test(n)) return Ht(r, u.tag, u.parse.stream(n, new Ji(e, t), { id: r }));
  }
  return s;
}
function lr$1(e, t, r, n) {
  let a = e.base.plugins;
  return a ? e.type === 1 ? lo(e, t, r, n, a) : fo(e, t, r, n, a) : s;
}
function po(e, t, r, n) {
  let a = [];
  for (let i = 0, o = n.v.length; i < o; i++) a[i] = v(e, t, n.v[i]);
  return Es(r, a, n.t, n.d);
}
function ho(e, t, r, n, a) {
  switch (a) {
    case Object:
      return ge$1(e, t, r, n, false);
    case s:
      return ge$1(e, t, r, n, true);
    case Date:
      return ss(r, n);
    case Error:
    case EvalError:
    case RangeError:
    case ReferenceError:
    case SyntaxError:
    case TypeError:
    case URIError:
      return at$1(e, t, r, n);
    case Number:
    case Boolean:
    case String:
    case BigInt:
      return Zi(e, t, r, n);
    case ArrayBuffer:
      return sa(e.base, r, n);
    case Int8Array:
    case Int16Array:
    case Int32Array:
    case Uint8Array:
    case Uint16Array:
    case Uint32Array:
    case Uint8ClampedArray:
    case Float32Array:
    case Float64Array:
      return eo(e, t, r, n);
    case DataView:
      return ro(e, t, r, n);
    case Map:
      return so(e, t, r, n);
    case Set:
      return ao(e, t, r, n);
  }
  if (a === Promise || n instanceof Promise) return co(e, t, r, n);
  let i = e.base.features;
  if (i & 32 && a === RegExp) return as(r, n);
  if (i & 16) switch (a) {
    case BigInt64Array:
    case BigUint64Array:
      return to(e, t, r, n);
  }
  if (i & 1 && typeof AggregateError < "u" && (a === AggregateError || n instanceof AggregateError)) return no(e, t, r, n);
  if (n instanceof Error) return at$1(e, t, r, n);
  if ($$2 in n || x in n) return ge$1(e, t, r, n, !!a);
  throw new ue(n);
}
function go(e, t, r, n) {
  if (Array.isArray(n)) return Qi(e, t, r, n);
  if (le(n)) return io(e, t, r, n);
  if (Fs(n)) return po(e, t, r, n);
  let a = n.constructor;
  return a === Ts ? v(e, t, n.replacement) : lr$1(e, t, r, n) || ho(e, t, r, n, a);
}
function mo(e, t, r) {
  let n = _e$1(e.base, r);
  if (n.type !== 0) return n.value;
  let a = lr$1(e, t, n.value, r);
  if (a) return a;
  throw new ue(r);
}
function v(e, t, r) {
  if (t >= e.base.depthLimit) throw new Bt$1(e.base.depthLimit);
  switch (typeof r) {
    case "boolean":
      return r ? Lt : It$1;
    case "undefined":
      return qn;
    case "string":
      return Ft$1(r);
    case "number":
      return ts(r);
    case "bigint":
      return rs(r);
    case "object": {
      if (r) {
        let n = _e$1(e.base, r);
        return n.type === 0 ? go(e, t + 1, n.value, r) : n.value;
      }
      return Mn;
    }
    case "symbol":
      return L$1(e.base, r);
    case "function":
      return mo(e, t, r);
    default:
      throw new ue(r);
  }
}
function V$2(e, t) {
  e.state.initial ? e.state.buffer.push(t) : Ie$1(e, t, false);
}
function Le(e, t) {
  if (e.state.onError) e.state.onError(t);
  else throw t instanceof Je ? t : new Je(t);
}
function fr$1(e) {
  e.state.onDone && e.state.onDone();
}
function Ie$1(e, t, r) {
  try {
    e.state.onParse(t, r);
  } catch (n) {
    Le(e, n);
  }
}
function Ne$1(e) {
  e.state.pending++;
}
function Q$3(e) {
  --e.state.pending <= 0 && fr$1(e);
}
function I$1(e, t, r) {
  try {
    return v(e, t, r);
  } catch (n) {
    return Le(e, n), s;
  }
}
function pr$1(e, t) {
  let r = I$1(e, 0, t);
  r && (Ie$1(e, r, true), e.state.initial = false, bo(e, e.state), e.state.pending <= 0 && Ue$1(e));
}
function bo(e, t) {
  for (let r = 0, n = t.buffer.length; r < n; r++) Ie$1(e, t.buffer[r], false);
}
function Ue$1(e) {
  e.state.alive && (fr$1(e), e.state.alive = false);
}
function yo(e, t) {
  let r = Pe(t.plugins), n = cr$1({ plugins: r, refs: t.refs, disabledFeatures: t.disabledFeatures, onParse(a, i) {
    let o = ii({ plugins: r, features: n.base.features, scopeId: t.scopeId, markedRefs: n.base.marked }), u;
    try {
      u = Gi(o, a);
    } catch (c) {
      t.onError && t.onError(c);
      return;
    }
    t.onSerialize(u, i);
  }, onError: t.onError, onDone: t.onDone });
  return pr$1(n, e), Ue$1.bind(null, n);
}
function wo(e, t) {
  let r = Pe(t.plugins), n = cr$1({ plugins: r, refs: t.refs, disabledFeatures: t.disabledFeatures, depthLimit: t.depthLimit, onParse: t.onParse, onError: t.onError, onDone: t.onDone });
  return pr$1(n, e), Ue$1.bind(null, n);
}
function vo(e, t = {}) {
  var r;
  let n = Pe(t.plugins), a = t.disabledFeatures || 0, i = (r = e.f) != null ? r : 63, o = pa({ plugins: n, markedRefs: e.m, features: i & ~a, disabledFeatures: a });
  return Wa(o, e.t);
}
var Ae = (e) => {
  let t = new AbortController(), r = t.abort.bind(t);
  return e.then(r, r), t;
};
function So(e) {
  e(this.reason);
}
function Eo(e) {
  this.addEventListener("abort", So.bind(this, e), { once: true });
}
function it(e) {
  return new Promise(Eo.bind(e));
}
var Y$2 = {}, Ro = { tag: "seroval-plugins/web/AbortControllerFactoryPlugin", test(e) {
  return e === Y$2;
}, parse: { sync() {
  return Y$2;
}, async async() {
  return await Promise.resolve(Y$2);
}, stream() {
  return Y$2;
} }, serialize() {
  return Ae.toString();
}, deserialize() {
  return Ae;
} }, ko = { tag: "seroval-plugins/web/AbortSignal", extends: [Ro], test(e) {
  return typeof AbortSignal > "u" ? false : e instanceof AbortSignal;
}, parse: { sync(e, t) {
  return e.aborted ? { reason: t.parse(e.reason) } : {};
}, async async(e, t) {
  if (e.aborted) return { reason: await t.parse(e.reason) };
  let r = await it(e);
  return { reason: await t.parse(r) };
}, stream(e, t) {
  if (e.aborted) return { reason: t.parse(e.reason) };
  let r = it(e);
  return { factory: t.parse(Y$2), controller: t.parse(r) };
} }, serialize(e, t) {
  return e.reason ? "AbortSignal.abort(" + t.serialize(e.reason) + ")" : e.controller && e.factory ? "(" + t.serialize(e.factory) + ")(" + t.serialize(e.controller) + ").signal" : "(new AbortController).signal";
}, deserialize(e, t) {
  return e.reason ? AbortSignal.abort(t.deserialize(e.reason)) : e.controller ? Ae(t.deserialize(e.controller)).signal : new AbortController().signal;
} }, Ao = ko;
function me$1(e) {
  return { detail: e.detail, bubbles: e.bubbles, cancelable: e.cancelable, composed: e.composed };
}
var xo = { tag: "seroval-plugins/web/CustomEvent", test(e) {
  return typeof CustomEvent > "u" ? false : e instanceof CustomEvent;
}, parse: { sync(e, t) {
  return { type: t.parse(e.type), options: t.parse(me$1(e)) };
}, async async(e, t) {
  return { type: await t.parse(e.type), options: await t.parse(me$1(e)) };
}, stream(e, t) {
  return { type: t.parse(e.type), options: t.parse(me$1(e)) };
} }, serialize(e, t) {
  return "new CustomEvent(" + t.serialize(e.type) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new CustomEvent(t.deserialize(e.type), t.deserialize(e.options));
} }, $o = xo, _o = { tag: "seroval-plugins/web/DOMException", test(e) {
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
} }, Po = _o;
function be$1(e) {
  return { bubbles: e.bubbles, cancelable: e.cancelable, composed: e.composed };
}
var To = { tag: "seroval-plugins/web/Event", test(e) {
  return typeof Event > "u" ? false : e instanceof Event;
}, parse: { sync(e, t) {
  return { type: t.parse(e.type), options: t.parse(be$1(e)) };
}, async async(e, t) {
  return { type: await t.parse(e.type), options: await t.parse(be$1(e)) };
}, stream(e, t) {
  return { type: t.parse(e.type), options: t.parse(be$1(e)) };
} }, serialize(e, t) {
  return "new Event(" + t.serialize(e.type) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new Event(t.deserialize(e.type), t.deserialize(e.options));
} }, zo = To, Co = { tag: "seroval-plugins/web/File", test(e) {
  return typeof File > "u" ? false : e instanceof File;
}, parse: { async async(e, t) {
  return { name: await t.parse(e.name), options: await t.parse({ type: e.type, lastModified: e.lastModified }), buffer: await t.parse(await e.arrayBuffer()) };
} }, serialize(e, t) {
  return "new File([" + t.serialize(e.buffer) + "]," + t.serialize(e.name) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new File([t.deserialize(e.buffer)], t.deserialize(e.name), t.deserialize(e.options));
} }, Oo = Co;
function ye$1(e) {
  let t = [];
  return e.forEach((r, n) => {
    t.push([n, r]);
  }), t;
}
var P = {}, dr$1 = (e, t = new FormData(), r = 0, n = e.length, a) => {
  for (; r < n; r++) a = e[r], t.append(a[0], a[1]);
  return t;
}, Lo = { tag: "seroval-plugins/web/FormDataFactory", test(e) {
  return e === P;
}, parse: { sync() {
  return P;
}, async async() {
  return await Promise.resolve(P);
}, stream() {
  return P;
} }, serialize() {
  return dr$1.toString();
}, deserialize() {
  return P;
} }, Io = { tag: "seroval-plugins/web/FormData", extends: [Oo, Lo], test(e) {
  return typeof FormData > "u" ? false : e instanceof FormData;
}, parse: { sync(e, t) {
  return { factory: t.parse(P), entries: t.parse(ye$1(e)) };
}, async async(e, t) {
  return { factory: await t.parse(P), entries: await t.parse(ye$1(e)) };
}, stream(e, t) {
  return { factory: t.parse(P), entries: t.parse(ye$1(e)) };
} }, serialize(e, t) {
  return "(" + t.serialize(e.factory) + ")(" + t.serialize(e.entries) + ")";
}, deserialize(e, t) {
  return dr$1(t.deserialize(e.entries));
} }, No = Io;
function we$1(e) {
  let t = [];
  return e.forEach((r, n) => {
    t.push([n, r]);
  }), t;
}
var Uo = { tag: "seroval-plugins/web/Headers", test(e) {
  return typeof Headers > "u" ? false : e instanceof Headers;
}, parse: { sync(e, t) {
  return { value: t.parse(we$1(e)) };
}, async async(e, t) {
  return { value: await t.parse(we$1(e)) };
}, stream(e, t) {
  return { value: t.parse(we$1(e)) };
} }, serialize(e, t) {
  return "new Headers(" + t.serialize(e.value) + ")";
}, deserialize(e, t) {
  return new Headers(t.deserialize(e.value));
} }, je$1 = Uo, z$1 = {}, hr$1 = (e) => new ReadableStream({ start: (t) => {
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
} }), jo = { tag: "seroval-plugins/web/ReadableStreamFactory", test(e) {
  return e === z$1;
}, parse: { sync() {
  return z$1;
}, async async() {
  return await Promise.resolve(z$1);
}, stream() {
  return z$1;
} }, serialize() {
  return hr$1.toString();
}, deserialize() {
  return z$1;
} };
function ot$1(e) {
  let t = ee(), r = e.getReader();
  async function n() {
    try {
      let a = await r.read();
      a.done ? t.return(a.value) : (t.next(a.value), await n());
    } catch (a) {
      t.throw(a);
    }
  }
  return n().catch(() => {
  }), t;
}
var Do = { tag: "seroval/plugins/web/ReadableStream", extends: [jo], test(e) {
  return typeof ReadableStream > "u" ? false : e instanceof ReadableStream;
}, parse: { sync(e, t) {
  return { factory: t.parse(z$1), stream: t.parse(ee()) };
}, async async(e, t) {
  return { factory: await t.parse(z$1), stream: await t.parse(ot$1(e)) };
}, stream(e, t) {
  return { factory: t.parse(z$1), stream: t.parse(ot$1(e)) };
} }, serialize(e, t) {
  return "(" + t.serialize(e.factory) + ")(" + t.serialize(e.stream) + ")";
}, deserialize(e, t) {
  let r = t.deserialize(e.stream);
  return hr$1(r);
} }, De$1 = Do;
function ut(e, t) {
  return { body: t, cache: e.cache, credentials: e.credentials, headers: e.headers, integrity: e.integrity, keepalive: e.keepalive, method: e.method, mode: e.mode, redirect: e.redirect, referrer: e.referrer, referrerPolicy: e.referrerPolicy };
}
var Fo = { tag: "seroval-plugins/web/Request", extends: [De$1, je$1], test(e) {
  return typeof Request > "u" ? false : e instanceof Request;
}, parse: { async async(e, t) {
  return { url: await t.parse(e.url), options: await t.parse(ut(e, e.body && !e.bodyUsed ? await e.clone().arrayBuffer() : null)) };
}, stream(e, t) {
  return { url: t.parse(e.url), options: t.parse(ut(e, e.body && !e.bodyUsed ? e.clone().body : null)) };
} }, serialize(e, t) {
  return "new Request(" + t.serialize(e.url) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new Request(t.deserialize(e.url), t.deserialize(e.options));
} }, Ho = Fo;
function ct(e) {
  return { headers: e.headers, status: e.status, statusText: e.statusText };
}
var qo = { tag: "seroval-plugins/web/Response", extends: [De$1, je$1], test(e) {
  return typeof Response > "u" ? false : e instanceof Response;
}, parse: { async async(e, t) {
  return { body: await t.parse(e.body && !e.bodyUsed ? await e.clone().arrayBuffer() : null), options: await t.parse(ct(e)) };
}, stream(e, t) {
  return { body: t.parse(e.body && !e.bodyUsed ? e.clone().body : null), options: t.parse(ct(e)) };
} }, serialize(e, t) {
  return "new Response(" + t.serialize(e.body) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new Response(t.deserialize(e.body), t.deserialize(e.options));
} }, Mo = qo, Bo = { tag: "seroval-plugins/web/URL", test(e) {
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
} }, Vo = Bo, Wo = { tag: "seroval-plugins/web/URLSearchParams", test(e) {
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
} }, Go = Wo;
const Fe$1 = [Ao, $o, Po, zo, No, je$1, De$1, Ho, Mo, Go, Vo], Xo = 64, gr = Et.RegExp;
function mr$1(e) {
  const t = new TextEncoder().encode(e), r = t.length, n = r.toString(16), a = "00000000".substring(0, 8 - n.length) + n, i = new TextEncoder().encode(`;0x${a};`), o = new Uint8Array(12 + r);
  return o.set(i), o.set(t, 12), o;
}
function lt(e, t) {
  return new ReadableStream({ start(r) {
    yo(t, { scopeId: e, plugins: Fe$1, onSerialize(n, a) {
      r.enqueue(mr$1(a ? `(${Yn(e)},${n})` : n));
    }, onDone() {
      r.close();
    }, onError(n) {
      r.error(n);
    } });
  } });
}
function Jo(e) {
  return new ReadableStream({ start(t) {
    wo(e, { disabledFeatures: gr, depthLimit: Xo, plugins: Fe$1, onParse(r) {
      t.enqueue(mr$1(JSON.stringify(r)));
    }, onDone() {
      t.close();
    }, onError(r) {
      t.error(r);
    } });
  } });
}
async function ft(e) {
  return vo(JSON.parse(e), { plugins: Fe$1, disabledFeatures: gr });
}
async function Yo(e) {
  const t = bn(e), r = t.request, n = r.headers.get("X-Server-Id"), a = r.headers.get("X-Server-Instance"), i = r.headers.has("X-Single-Flight"), o = new URL(r.url);
  let u, c;
  if (n) hn$1(typeof n == "string", "Invalid server function"), [u, c] = decodeURIComponent(n).split("#");
  else if (u = o.searchParams.get("id"), c = o.searchParams.get("name"), !u || !c) return new Response(null, { status: 404 });
  const l = Nn[u];
  let p;
  if (!l) return new Response(null, { status: 404 });
  p = await l.importer();
  const d = p[l.functionName];
  let w = [];
  if (!a || e.method === "GET") {
    const f = o.searchParams.get("args");
    if (f) {
      const R = await ft(f);
      for (const te of R) w.push(te);
    }
  }
  if (e.method === "POST") {
    const f = r.headers.get("content-type"), R = e.node.req, te = R instanceof ReadableStream, br = R.body instanceof ReadableStream, yr = te && R.locked || br && R.body.locked, wr = te ? R : R.body, pe = yr ? r : new Request(r, { ...r, body: wr });
    r.headers.get("x-serialized") ? w = await ft(await pe.text()) : (f == null ? void 0 : f.startsWith("multipart/form-data")) || (f == null ? void 0 : f.startsWith("application/x-www-form-urlencoded")) ? w.push(await pe.formData()) : (f == null ? void 0 : f.startsWith("application/json")) && (w = await pe.json());
  }
  try {
    let f = await provideRequestEvent(t, async () => (sharedConfig.context = { event: t }, t.locals.serverFunctionMeta = { id: u + "#" + c }, d(...w)));
    if (i && a && (f = await dt(t, f)), f instanceof Response) {
      if (f.headers && f.headers.has("X-Content-Raw")) return f;
      a && (f.headers && We$1(e, f.headers), f.status && (f.status < 300 || f.status >= 400) && ie$1(e, f.status), f.customBody ? f = await f.customBody() : f.body == null && (f = null));
    }
    if (!a) return pt(f, r, w);
    return F$2(e, "x-serialized", "true"), F$2(e, "content-type", "text/javascript"), lt(a, f);
    return Jo(f);
  } catch (f) {
    if (f instanceof Response) i && a && (f = await dt(t, f)), f.headers && We$1(e, f.headers), f.status && (!a || f.status < 300 || f.status >= 400) && ie$1(e, f.status), f.customBody ? f = f.customBody() : f.body == null && (f = null), F$2(e, "X-Error", "true");
    else if (a) {
      const R = f instanceof Error ? f.message : typeof f == "string" ? f : "true";
      F$2(e, "X-Error", R.replace(/[\r\n]+/g, ""));
    } else f = pt(f, r, w, true);
    return a ? (F$2(e, "x-serialized", "true"), F$2(e, "content-type", "text/javascript"), lt(a, f)) : f;
  }
}
function pt(e, t, r, n) {
  const a = new URL(t.url), i = e instanceof Error;
  let o = 302, u;
  return e instanceof Response ? (u = new Headers(e.headers), e.headers.has("Location") && (u.set("Location", new URL(e.headers.get("Location"), a.origin + "").toString()), o = In(e))) : u = new Headers({ Location: new URL(t.headers.get("referer")).toString() }), e && u.append("Set-Cookie", `flash=${encodeURIComponent(JSON.stringify({ url: a.pathname + a.search, result: i ? e.message : e, thrown: n, error: i, input: [...r.slice(0, -1), [...r[r.length - 1].entries()]] }))}; Secure; HttpOnly;`), new Response(null, { status: o, headers: u });
}
let ve$1;
function Ko(e) {
  var _a2;
  const t = new Headers(e.request.headers), r = sn$1(e.nativeEvent), n = e.response.headers.getSetCookie();
  t.delete("cookie");
  let a = false;
  return ((_a2 = e.nativeEvent.node) == null ? void 0 : _a2.req) && (a = true, e.nativeEvent.node.req.headers.cookie = ""), n.forEach((i) => {
    if (!i) return;
    const { maxAge: o, expires: u, name: c, value: l } = Vr$1(i);
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
    t.append("cookie", `${i}=${o}`), a && (e.nativeEvent.node.req.headers.cookie += `${i}=${o};`);
  }), t;
}
async function dt(e, t) {
  let r, n = new URL(e.request.headers.get("referer")).toString();
  t instanceof Response && (t.headers.has("X-Revalidate") && (r = t.headers.get("X-Revalidate").split(",")), t.headers.has("Location") && (n = new URL(t.headers.get("Location"), new URL(e.request.url).origin + "").toString()));
  const a = mn(e);
  return a.request = new Request(n, { headers: Ko(e) }), await provideRequestEvent(a, async () => {
    await On(a), ve$1 || (ve$1 = (await import('../build/app-De9iMQfE.mjs')).default), a.router.dataOnly = r || true, a.router.previousUrl = e.request.headers.get("referer");
    try {
      renderToString(() => {
        sharedConfig.context.event = a, ve$1();
      });
    } catch (u) {
      console.log(u);
    }
    const i = a.router.data;
    if (!i) return t;
    let o = false;
    for (const u in i) i[u] === void 0 ? delete i[u] : o = true;
    return o && (t instanceof Response ? t.customBody && (i._$value = t.customBody()) : (i._$value = t, t = new Response(null, { status: 200 })), t.customBody = () => i, t.headers.set("X-Single-Flight", "true")), t;
  });
}
const lu = eventHandler(Yo);

var W$2 = Object.create, E = Object.defineProperty, $$1 = Object.getOwnPropertyDescriptor, m = Object.getOwnPropertyNames, K = Object.getPrototypeOf, Q$2 = Object.prototype.hasOwnProperty, te$1 = (r, e) => function() {
  return e || (0, r[m(r)[0]])((e = { exports: {} }).exports, e), e.exports;
}, V$1 = (r, e, t, a) => {
  if (e && typeof e == "object" || typeof e == "function") for (let n of m(e)) !Q$2.call(r, n) && n !== t && E(r, n, { get: () => e[n], enumerable: !(a = $$1(e, n)) || a.enumerable });
  return r;
}, ne$1 = (r, e, t) => (t = r != null ? W$2(K(r)) : {}, V$1(E(t, "default", { value: r, enumerable: true }), r)), S$1 = createContext$1(), oe = (r) => React.createElement(S$1.Provider, { value: { client: r.client } }, r.children);
function z() {
  const r = useContext(S$1);
  if (!r) throw new Error("useRivet() must be used inside a <RivetProvider>. Wrap your app with <RivetProvider client={...}>.");
  return r;
}
var B$1 = Math.floor(Date.now() / 1e3), b = getLogger("driver-solidstart"), G = async (r, e) => {
  const { request: t } = r, a = new URL(t.url), n = e == null ? void 0 : e.rivetSiteUrl;
  if (!n) throw new Error("rivetSiteUrl is required");
  const o = e == null ? void 0 : e.registry;
  if (!o) throw new Error("registry is not set");
  o.config.serveManager = false, o.config.serverless = { ...o.config.serverless, basePath: "/api/rivet" }, (e == null ? void 0 : e.isDev) ? (b.debug("detected development environment, auto-starting engine and auto-configuring serverless"), o.config.serverless.spawnEngine = true, o.config.serverless.configureRunnerPool = { url: `${n}/api/rivet`, minRunners: 0, maxRunners: 1e5, requestLifespan: 300, slotsPerRunner: 1, metadata: { provider: "solidstart" } }, o.config.runner = { ...o.config.runner, version: B$1 }) : b.debug("detected production environment, will not auto-start engine and auto-configure serverless");
  const d = `${n}${a.pathname}`, i = new Request(d, t);
  if (i.headers.set("host", new URL(d).host), i.headers.set("accept-encoding", "application/json"), e == null ? void 0 : e.headers) for (const [v, c] of Object.entries(e.headers)) i.headers.set(v, c);
  if (e == null ? void 0 : e.getHeaders) {
    const v = await e.getHeaders(r);
    for (const [c, p] of Object.entries(v)) i.headers.set(c, p);
  }
  return await o.handler(i);
}, se$1 = (r) => {
  const e = async (t) => G(t, r);
  return { GET: e, POST: e, PUT: e, DELETE: e, PATCH: e, HEAD: e, OPTIONS: e };
}, J$1 = typeof globalThis.document < "u";
function ae(r) {
  const { client: e } = z();
  return F$1(e, r);
}
function F$1(r, e) {
  const { actor: t, key: a, action: n, args: o = [], params: d, createInRegion: i, createWithInput: v, event: c, transform: p = (s, u) => u } = e, w = Array.isArray(a) ? a : [a], [g, { refetch: j }] = createResource(async () => r.getOrCreate(t, w, { params: d, createInRegion: i, createWithInput: v }).action({ name: n, args: o })), [C, R] = createSignal(void 0), [x, h] = createSignal(false), [L, O] = createSignal(void 0);
  return J$1 && createEffect(() => {
    const s = g();
    if (s === void 0) return;
    R(() => s);
    const f = r.getOrCreate(t, w, { params: d, createInRegion: i, createWithInput: v }).connect();
    f.onOpen(() => h(true)), f.onClose(() => h(false)), f.onError((l) => {
      O(l instanceof Error ? l : new Error(String(l)));
    });
    const q = Array.isArray(c) ? c : [c], P = [];
    for (const l of q) {
      const D = f.on(l, (...y) => {
        const U = y.length === 1 ? y[0] : y;
        R((H) => p(H != null ? H : s, U)), O(void 0);
      });
      P.push(D);
    }
    onCleanup(() => {
      for (const l of P) l();
      f.disconnect(), h(false);
    });
  }), { data: () => {
    const s = C();
    return s !== void 0 ? s : g();
  }, isLoading: () => g.loading, error: () => {
    const s = L();
    if (s) return s;
    const u = g.error;
    return u instanceof Error ? u : u ? new Error(String(u)) : void 0;
  }, isConnected: x, refetch: j };
}

var Q$1 = te$1({ "../../node_modules/.pnpm/fast-deep-equal@3.1.3/node_modules/fast-deep-equal/index.js"(s, r) {
  r.exports = function t(e, n) {
    if (e === n) return true;
    if (e && n && typeof e == "object" && typeof n == "object") {
      if (e.constructor !== n.constructor) return false;
      var c, a, o;
      if (Array.isArray(e)) {
        if (c = e.length, c != n.length) return false;
        for (a = c; a-- !== 0; ) if (!t(e[a], n[a])) return false;
        return true;
      }
      if (e.constructor === RegExp) return e.source === n.source && e.flags === n.flags;
      if (e.valueOf !== Object.prototype.valueOf) return e.valueOf() === n.valueOf();
      if (e.toString !== Object.prototype.toString) return e.toString() === n.toString();
      if (o = Object.keys(e), c = o.length, c !== Object.keys(n).length) return false;
      for (a = c; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(n, o[a])) return false;
      for (a = c; a-- !== 0; ) {
        var d = o[a];
        if (!t(e[d], n[d])) return false;
      }
      return true;
    }
    return e !== e && n !== n;
  };
} }), D = /* @__PURE__ */ new WeakMap(), L = /* @__PURE__ */ new WeakMap(), j$1 = { current: [] }, M$1 = false, F = /* @__PURE__ */ new Set(), $ = /* @__PURE__ */ new Map();
function H$1(s) {
  const r = Array.from(s).sort((t, e) => t instanceof I && t.options.deps.includes(e) ? 1 : e instanceof I && e.options.deps.includes(t) ? -1 : 0);
  for (const t of r) {
    if (j$1.current.includes(t)) continue;
    j$1.current.push(t), t.recompute();
    const e = L.get(t);
    if (e) for (const n of e) {
      const c = D.get(n);
      c && H$1(c);
    }
  }
}
function B(s) {
  s.listeners.forEach((r) => r({ prevVal: s.prevState, currentVal: s.state }));
}
function X(s) {
  s.listeners.forEach((r) => r({ prevVal: s.prevState, currentVal: s.state }));
}
function Y$1(s) {
  var _a;
  if (F.add(s), !M$1) try {
    for (M$1 = true; F.size > 0; ) {
      const r = Array.from(F);
      F.clear();
      for (const t of r) {
        const e = (_a = $.get(t)) != null ? _a : t.prevState;
        t.prevState = e, B(t);
      }
      for (const t of r) {
        const e = D.get(t);
        e && (j$1.current.push(t), H$1(e));
      }
      for (const t of r) {
        const e = D.get(t);
        if (e) for (const n of e) X(n);
      }
    }
  } finally {
    M$1 = false, j$1.current = [], $.clear();
  }
}
function Z$1(s) {
  return typeof s == "function";
}
var k = class {
  constructor(s, r) {
    this.listeners = /* @__PURE__ */ new Set(), this.subscribe = (t) => {
      var e, n;
      this.listeners.add(t);
      const c = (n = (e = this.options) == null ? void 0 : e.onSubscribe) == null ? void 0 : n.call(e, t, this);
      return () => {
        this.listeners.delete(t), c == null ? void 0 : c();
      };
    }, this.prevState = s, this.state = s, this.options = r;
  }
  setState(s) {
    var r, t, e;
    this.prevState = this.state, (r = this.options) != null && r.updateFn ? this.state = this.options.updateFn(this.prevState)(s) : Z$1(s) ? this.state = s(this.prevState) : this.state = s, (e = (t = this.options) == null ? void 0 : t.onUpdate) == null || e.call(t), Y$1(this);
  }
}, I = class R {
  constructor(r) {
    this.listeners = /* @__PURE__ */ new Set(), this._subscriptions = [], this.lastSeenDepValues = [], this.getDepVals = () => {
      var _a;
      const t = [], e = [];
      for (const n of this.options.deps) t.push(n.prevState), e.push(n.state);
      return this.lastSeenDepValues = e, { prevDepVals: t, currDepVals: e, prevVal: (_a = this.prevState) != null ? _a : void 0 };
    }, this.recompute = () => {
      var t, e;
      this.prevState = this.state;
      const { prevDepVals: n, currDepVals: c, prevVal: a } = this.getDepVals();
      this.state = this.options.fn({ prevDepVals: n, currDepVals: c, prevVal: a }), (e = (t = this.options).onUpdate) == null || e.call(t);
    }, this.checkIfRecalculationNeededDeeply = () => {
      for (const c of this.options.deps) c instanceof R && c.checkIfRecalculationNeededDeeply();
      let t = false;
      const e = this.lastSeenDepValues, { currDepVals: n } = this.getDepVals();
      for (let c = 0; c < n.length; c++) if (n[c] !== e[c]) {
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
      const c = (n = (e = this.options).onSubscribe) == null ? void 0 : n.call(e, t, this);
      return () => {
        this.listeners.delete(t), c == null ? void 0 : c();
      };
    }, this.options = r, this.state = r.fn({ prevDepVals: void 0, prevVal: void 0, currDepVals: this.getDepVals().currDepVals });
  }
  registerOnGraph(r = this.options.deps) {
    for (const t of r) if (t instanceof R) t.registerOnGraph(), this.registerOnGraph(t.options.deps);
    else if (t instanceof k) {
      let e = D.get(t);
      e || (e = /* @__PURE__ */ new Set(), D.set(t, e)), e.add(this);
      let n = L.get(this);
      n || (n = /* @__PURE__ */ new Set(), L.set(this, n)), n.add(t);
    }
  }
  unregisterFromGraph(r = this.options.deps) {
    for (const t of r) if (t instanceof R) this.unregisterFromGraph(t.options.deps);
    else if (t instanceof k) {
      const e = D.get(t);
      e && e.delete(this);
      const n = L.get(this);
      n && n.delete(t);
    }
  }
}, q = class {
  constructor(s) {
    const { eager: r, fn: t, ...e } = s;
    this._derived = new I({ ...e, fn: () => {
    }, onUpdate() {
      t();
    } }), r && t();
  }
  mount() {
    return this._derived.mount();
  }
}, tt = ne$1(Q$1());
function et(s, r = {}) {
  const t = new k({ actors: {} }), e = /* @__PURE__ */ new Map();
  return { getOrCreateActor: (n) => nt(s, r, t, e, n), store: t };
}
function C(s, r, t) {
  s.setState((e) => ({ ...e, actors: { ...e.actors, [r]: { ...e.actors[r], ...t } } }));
}
function nt(s, r, t, e, n) {
  var _a;
  const c = r.hashFunction || ot, a = { ...n, enabled: (_a = n.enabled) != null ? _a : true }, o = c(a), d = t.state.actors[o];
  d ? rt(d.opts, a) || queueMicrotask(() => {
    C(t, o, { opts: a });
  }) : t.setState((i) => ({ ...i, actors: { ...i.actors, [o]: { hash: o, connStatus: "idle", connection: null, handle: null, error: null, opts: a } } }));
  const A = e.get(o);
  if (A) return { ...A, state: A.state };
  const _ = new I({ fn: ({ currDepVals: [i] }) => {
    const l = i.actors[o];
    return { ...l, isConnected: l.connStatus === "connected" };
  }, deps: [t] }), O = new q({ fn: () => {
    const i = t.state.actors[o];
    if (!i) throw new Error(`Actor with key "${o}" not found in store. This indicates a bug in cleanup logic.`);
    if (!i.opts.enabled && i.connection) {
      i.connection.dispose(), C(t, o, { connection: null, handle: null, connStatus: "idle" });
      return;
    }
    i.connStatus === "idle" && i.opts.enabled && queueMicrotask(() => {
      const l = t.state.actors[o];
      l && l.connStatus === "idle" && l.opts.enabled && W$1(s, t, o);
    });
  }, deps: [_] });
  let b = null, w = null;
  const u = () => {
    const i = e.get(o);
    if (!i) throw new Error(`Actor with key "${o}" not found in cache. This indicates a bug in cleanup logic.`);
    if (i.cleanupTimeout !== null && (clearTimeout(i.cleanupTimeout), i.cleanupTimeout = null), i.refCount++, i.refCount === 1) {
      b = _.mount(), w = O.mount();
      const l = t.state.actors[o];
      l && l.opts.enabled && l.connStatus === "idle" && W$1(s, t, o);
    }
    return () => {
      i.refCount--, i.refCount === 0 && (i.cleanupTimeout = setTimeout(() => {
        if (i.cleanupTimeout = null, i.refCount > 0) return;
        b == null ? void 0 : b(), w == null ? void 0 : w(), b = null, w = null;
        const l = t.state.actors[o];
        (l == null ? void 0 : l.connection) && l.connection.dispose(), t.setState((g) => {
          const { [o]: v, ...V } = g.actors;
          return { ...g, actors: V };
        }), e.delete(o);
      }, 0));
    };
  };
  return e.set(o, { state: _, key: o, mount: u, create: W$1.bind(void 0, s, t, o), refCount: 0, cleanupTimeout: null }), { mount: u, state: _, key: o };
}
function W$1(s, r, t) {
  const e = r.state.actors[t];
  if (!e) throw new Error(`Actor with key "${t}" not found in store. This indicates a bug in cleanup logic.`);
  C(r, t, { connStatus: "connecting", error: null });
  try {
    const n = e.opts.noCreate ? s.get(e.opts.name, e.opts.key, { params: e.opts.params }) : s.getOrCreate(e.opts.name, e.opts.key, { params: e.opts.params, createInRegion: e.opts.createInRegion, createWithInput: e.opts.createWithInput }), c = n.connect();
    C(r, t, { handle: n, connection: c }), c.onStatusChange((a) => {
      r.setState((o) => {
        var d;
        return ((d = o.actors[t]) == null ? void 0 : d.connection) === c ? { ...o, actors: { ...o.actors, [t]: { ...o.actors[t], connStatus: a, ...a === "connected" ? { error: null } : {} } } } : o;
      });
    }), c.onError((a) => {
      r.setState((o) => {
        var d;
        return ((d = o.actors[t]) == null ? void 0 : d.connection) !== c ? o : { ...o, actors: { ...o.actors, [t]: { ...o.actors[t], error: a } } };
      });
    });
  } catch (n) {
    console.error("Failed to create actor connection", n), C(r, t, { connStatus: "disconnected", error: n });
  }
}
function ot({ name: s, key: r, params: t, noCreate: e }) {
  return JSON.stringify({ name: s, key: r, params: t, noCreate: e });
}
function rt(s, r) {
  return (0, tt.default)(s, r);
}
function st(s, r = {}) {
  const { getOrCreateActor: t } = et(s, r);
  function e(n) {
    const { mount: c, state: a } = t(n);
    createRoot(() => {
      c();
    });
    const [o, d] = createSignal(void 0), A = a == null ? void 0 : a.subscribe((u) => {
      d(u.currentVal);
    });
    onCleanup(() => A == null ? void 0 : A());
    function _(u, i) {
      let l = i;
      createEffect(() => {
        l = i;
      }), createEffect(() => {
        var _a;
        const g = o();
        if (!(g == null ? void 0 : g.connection)) return;
        function v(...S) {
          l(...S);
        }
        const V = (_a = g.connection) == null ? void 0 : _a.on(u, v);
        onCleanup(() => V == null ? void 0 : V());
      });
    }
    const O = { connect() {
      var _a, _b;
      (_b = (_a = o()) == null ? void 0 : _a.connection) == null ? void 0 : _b.connect();
    }, get connection() {
      var _a;
      return (_a = o()) == null ? void 0 : _a.connection;
    }, get handle() {
      var _a;
      return (_a = o()) == null ? void 0 : _a.handle;
    }, get isConnected() {
      var _a;
      return ((_a = o()) == null ? void 0 : _a.connStatus) === "connected";
    }, get isConnecting() {
      var _a;
      return ((_a = o()) == null ? void 0 : _a.connStatus) === "connecting";
    }, get isError() {
      var _a;
      return !!((_a = o()) == null ? void 0 : _a.error);
    }, get error() {
      var _a;
      return (_a = o()) == null ? void 0 : _a.error;
    }, get opts() {
      var _a;
      return (_a = o()) == null ? void 0 : _a.opts;
    }, get hash() {
      var _a;
      return (_a = o()) == null ? void 0 : _a.hash;
    } };
    function b(u) {
      var _a;
      const [i, l] = createSignal(u.initialValue), [g, v] = createSignal(true), [V, S] = createSignal(null), x = (_a = u.transform) != null ? _a : ((f, p) => f !== null && p !== null && typeof f == "object" && typeof p == "object" && !Array.isArray(f) && !Array.isArray(p) ? { ...f, ...p } : p);
      return _(u.event, (...f) => {
        const p = f.length === 1 ? f[0] : f;
        l(() => x(i(), p)), v(false), S(null);
      }), createEffect(() => {
        var _a2, _b;
        const f = (_a2 = o()) == null ? void 0 : _a2.connection;
        if (!f) return;
        const p = f[u.action];
        if (typeof p != "function") {
          S(new Error(`Action '${u.action}' not found on actor connection`)), v(false);
          return;
        }
        const G = (_b = u.args) != null ? _b : [];
        Promise.resolve(p.call(f, ...G)).then((h) => {
          l(() => h), v(false);
        }).catch((h) => {
          S(h instanceof Error ? h : new Error(String(h))), v(false);
        });
      }), { get value() {
        return i();
      }, get isLoading() {
        return g();
      }, get error() {
        return V();
      } };
    }
    function w(u) {
      const [i, l] = createSignal(u.initialValue), [g, v] = createSignal(true), [V, S] = createSignal(null), [x, f] = createSignal(0);
      function p() {
        var _a, _b, _c;
        const h = (_a = o()) == null ? void 0 : _a.connection;
        if (!h) return;
        const T = h[u.action];
        if (typeof T != "function") {
          S(new Error(`Action '${u.action}' not found on actor connection`)), v(false);
          return;
        }
        const N = (_c = (_b = u.args) == null ? void 0 : _b.call(u)) != null ? _c : [];
        v(true), Promise.resolve(T.call(h, ...N)).then((E) => {
          l(() => E), v(false), S(null);
        }).catch((E) => {
          S(E instanceof Error ? E : new Error(String(E))), v(false);
        });
      }
      const G = Array.isArray(u.event) ? u.event : [u.event];
      for (const h of G) _(h, () => {
        f((T) => T + 1);
      });
      return createEffect(() => {
        var _a, _b;
        const h = (_a = o()) == null ? void 0 : _a.connection;
        (_b = u.args) == null ? void 0 : _b.call(u), x(), h && p();
      }), { get value() {
        return i();
      }, get isLoading() {
        return g();
      }, get error() {
        return V();
      }, refetch: p };
    }
    return { current: O, useEvent: _, useQuery: b, useActionQuery: w };
  }
  return { useActor: e };
}
function at(s) {
  const { client: r } = z(), { useActor: t } = st(r);
  return t(s);
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, key + "" , value);
function qt(e = {}) {
  let t, r = false;
  const s = (a) => {
    if (t && t !== a) throw new Error("Context conflict");
  };
  let n;
  if (e.asyncContext) {
    const a = e.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    a ? n = new a() : console.warn("[unctx] `AsyncLocalStorage` is not provided.");
  }
  const o = () => {
    if (n) {
      const a = n.getStore();
      if (a !== void 0) return a;
    }
    return t;
  };
  return { use: () => {
    const a = o();
    if (a === void 0) throw new Error("Context is not available");
    return a;
  }, tryUse: () => o(), set: (a, i) => {
    i || s(a), t = a, r = true;
  }, unset: () => {
    t = void 0, r = false;
  }, call: (a, i) => {
    s(a), t = a;
    try {
      return n ? n.run(a, i) : i();
    } finally {
      r || (t = void 0);
    }
  }, async callAsync(a, i) {
    t = a;
    const l = () => {
      t = a;
    }, c = () => t === a ? l : void 0;
    fe.add(c);
    try {
      const u = n ? n.run(a, i) : i();
      return r || (t = void 0), await u;
    } finally {
      fe.delete(c);
    }
  } };
}
function It(e = {}) {
  const t = {};
  return { get(r, s = {}) {
    return t[r] || (t[r] = qt({ ...e, ...s })), t[r];
  } };
}
const Y = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof global < "u" ? global : {}, pe = "__unctx__", jt = Y[pe] || (Y[pe] = It()), Ut = (e, t = {}) => jt.get(e, t), he = "__unctx_async_handlers__", fe = Y[he] || (Y[he] = /* @__PURE__ */ new Set());
function Ft(e) {
  let t;
  const r = He(e), s = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(r, { ...s, body: e.node.req.body }) : new Request(r, { ...s, get body() {
    return t || (t = Qt(e), t);
  } });
}
function Mt(e) {
  var _a;
  return (_a = e.web) != null ? _a : e.web = { request: Ft(e), url: He(e) }, e.web.request;
}
function Wt() {
  return rr();
}
const ke = /* @__PURE__ */ Symbol("$HTTPEvent");
function Bt(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[ke]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function S(e) {
  return function(...t) {
    var _a;
    let r = t[0];
    if (Bt(r)) t[0] = r instanceof H3Event || r.__is_event__ ? r : r[ke];
    else {
      if (!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (r = Wt(), !r) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      t.unshift(r);
    }
    return e(...t);
  };
}
const He = S(getRequestURL), Gt = S(getRequestIP), te = S(setResponseStatus), me = S(getResponseStatus), Kt = S(getResponseStatusText), J = S(getResponseHeaders), ge = S(getResponseHeader), zt = S(setResponseHeader), Jt = S(appendResponseHeader), ye = S(sendRedirect), Vt = S(getCookie), Yt = S(setCookie), Xt = S(setHeader), Qt = S(getRequestWebStream), Zt = S(removeResponseHeader), er = S(Mt);
function tr() {
  var _a;
  return Ut("nitro-app", { asyncContext: !!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function rr() {
  return tr().use().event;
}
const j = { NORMAL: 0, WILDCARD: 1, PLACEHOLDER: 2 };
function nr(e = {}) {
  const t = { options: e, rootNode: Oe(), staticRoutesMap: {} }, r = (s) => e.strictTrailingSlash ? s : s.replace(/\/$/, "") || "/";
  if (e.routes) for (const s in e.routes) we(t, r(s), e.routes[s]);
  return { ctx: t, lookup: (s) => sr(t, r(s)), insert: (s, n) => we(t, r(s), n), remove: (s) => or(t, r(s)) };
}
function sr(e, t) {
  const r = e.staticRoutesMap[t];
  if (r) return r.data;
  const s = t.split("/"), n = {};
  let o = false, a = null, i = e.rootNode, l = null;
  for (let c = 0; c < s.length; c++) {
    const u = s[c];
    i.wildcardChildNode !== null && (a = i.wildcardChildNode, l = s.slice(c).join("/"));
    const y = i.children.get(u);
    if (y === void 0) {
      if (i && i.placeholderChildren.length > 1) {
        const m = s.length - c;
        i = i.placeholderChildren.find((p) => p.maxDepth === m) || null;
      } else i = i.placeholderChildren[0] || null;
      if (!i) break;
      i.paramName && (n[i.paramName] = u), o = true;
    } else i = y;
  }
  return (i === null || i.data === null) && a !== null && (i = a, n[i.paramName || "_"] = l, o = true), i ? o ? { ...i.data, params: o ? n : void 0 } : i.data : null;
}
function we(e, t, r) {
  let s = true;
  const n = t.split("/");
  let o = e.rootNode, a = 0;
  const i = [o];
  for (const l of n) {
    let c;
    if (c = o.children.get(l)) o = c;
    else {
      const u = ar(l);
      c = Oe({ type: u, parent: o }), o.children.set(l, c), u === j.PLACEHOLDER ? (c.paramName = l === "*" ? `_${a++}` : l.slice(1), o.placeholderChildren.push(c), s = false) : u === j.WILDCARD && (o.wildcardChildNode = c, c.paramName = l.slice(3) || "_", s = false), i.push(c), o = c;
    }
  }
  for (const [l, c] of i.entries()) c.maxDepth = Math.max(i.length - l, c.maxDepth || 0);
  return o.data = r, s === true && (e.staticRoutesMap[t] = o), o;
}
function or(e, t) {
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
function Oe(e = {}) {
  return { type: e.type || j.NORMAL, maxDepth: 0, parent: e.parent || null, children: /* @__PURE__ */ new Map(), data: e.data || null, paramName: e.paramName || null, wildcardChildNode: null, placeholderChildren: [] };
}
function ar(e) {
  return e.startsWith("**") ? j.WILDCARD : e[0] === ":" || e === "*" ? j.PLACEHOLDER : j.NORMAL;
}
const _e = [{ page: false, $GET: { src: "src/routes/api/auth/[...all].ts?pick=GET", build: () => import('../build/_...all_3.mjs'), import: () => import('../build/_...all_3.mjs') }, $HEAD: { src: "src/routes/api/auth/[...all].ts?pick=GET", build: () => import('../build/_...all_3.mjs'), import: () => import('../build/_...all_3.mjs') }, $POST: { src: "src/routes/api/auth/[...all].ts?pick=POST", build: () => import('../build/_...all_22.mjs'), import: () => import('../build/_...all_22.mjs') }, path: "/api/auth/*all", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/api/auth/[...all].ts" }, { page: false, $DELETE: { src: "src/routes/api/rivet/[...rest].ts?pick=DELETE", build: () => import('../build/_...rest_8.mjs'), import: () => import('../build/_...rest_8.mjs') }, $GET: { src: "src/routes/api/rivet/[...rest].ts?pick=GET", build: () => import('../build/_...rest_22.mjs'), import: () => import('../build/_...rest_22.mjs') }, $HEAD: { src: "src/routes/api/rivet/[...rest].ts?pick=HEAD", build: () => import('../build/_...rest_32.mjs'), import: () => import('../build/_...rest_32.mjs') }, $OPTIONS: { src: "src/routes/api/rivet/[...rest].ts?pick=OPTIONS", build: () => import('../build/_...rest_42.mjs'), import: () => import('../build/_...rest_42.mjs') }, $PATCH: { src: "src/routes/api/rivet/[...rest].ts?pick=PATCH", build: () => import('../build/_...rest_52.mjs'), import: () => import('../build/_...rest_52.mjs') }, $POST: { src: "src/routes/api/rivet/[...rest].ts?pick=POST", build: () => import('../build/_...rest_62.mjs'), import: () => import('../build/_...rest_62.mjs') }, $PUT: { src: "src/routes/api/rivet/[...rest].ts?pick=PUT", build: () => import('../build/_...rest_72.mjs'), import: () => import('../build/_...rest_72.mjs') }, path: "/api/rivet/*rest", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/api/rivet/[...rest].ts" }, { page: false, $GET: { src: "src/routes/api/token.ts?pick=GET", build: () => import('../build/token2.mjs'), import: () => import('../build/token2.mjs') }, $HEAD: { src: "src/routes/api/token.ts?pick=GET", build: () => import('../build/token2.mjs'), import: () => import('../build/token2.mjs') }, path: "/api/token", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/api/token.ts" }, { page: true, $component: { src: "src/routes/auth.tsx?pick=default&pick=$css", build: () => import('../build/auth2.mjs'), import: () => import('../build/auth2.mjs') }, path: "/auth", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/auth.tsx" }, { page: true, $component: { src: "src/routes/index.tsx?pick=default&pick=$css", build: () => import('../build/index2.mjs'), import: () => import('../build/index2.mjs') }, path: "/", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/index.tsx" }, { page: true, $component: { src: "src/routes/ssr.tsx?pick=default&pick=$css", build: () => import('../build/ssr2.mjs'), import: () => import('../build/ssr2.mjs') }, path: "/ssr", filePath: "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/ssr.tsx" }], ir = cr(_e.filter((e) => e.page));
function cr(e) {
  function t(r, s, n, o) {
    const a = Object.values(r).find((i) => n.startsWith(i.id + "/"));
    return a ? (t(a.children || (a.children = []), s, n.slice(a.id.length)), r) : (r.push({ ...s, id: n, path: n.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), r);
  }
  return e.sort((r, s) => r.path.length - s.path.length).reduce((r, s) => t(r, s, s.path, s.path), []);
}
function lr(e, t) {
  const r = dr.lookup(e);
  if (r && r.route) {
    const s = r.route, n = t === "HEAD" ? s.$HEAD || s.$GET : s[`$${t}`];
    if (n === void 0) return;
    const o = s.page === true && s.$component !== void 0;
    return { handler: n, params: r.params, isPage: o };
  }
}
function ur(e) {
  return e.$HEAD || e.$GET || e.$POST || e.$PUT || e.$PATCH || e.$DELETE;
}
const dr = nr({ routes: _e.reduce((e, t) => {
  if (!ur(t)) return e;
  let r = t.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (s, n) => `**:${n}`).split("/").map((s) => s.startsWith(":") || s.startsWith("*") ? s : encodeURIComponent(s)).join("/");
  if (/:[^/]*\?/g.test(r)) throw new Error(`Optional parameters are not supported in API routes: ${r}`);
  if (e[r]) throw new Error(`Duplicate API routes for "${r}" found at "${e[r].route.path}" and "${t.path}"`);
  return e[r] = { route: t }, e;
}, {}) }), Q = "solidFetchEvent";
function pr(e) {
  return { request: er(e), response: mr(e), clientAddress: Gt(e), locals: {}, nativeEvent: e };
}
function hr(e) {
  if (!e.context[Q]) {
    const t = pr(e);
    e.context[Q] = t;
  }
  return e.context[Q];
}
class fr {
  constructor(t) {
    __publicField(this, "event");
    this.event = t;
  }
  get(t) {
    const r = ge(this.event, t);
    return Array.isArray(r) ? r.join(", ") : r || null;
  }
  has(t) {
    return this.get(t) !== null;
  }
  set(t, r) {
    return zt(this.event, t, r);
  }
  delete(t) {
    return Zt(this.event, t);
  }
  append(t, r) {
    Jt(this.event, t, r);
  }
  getSetCookie() {
    const t = ge(this.event, "Set-Cookie");
    return Array.isArray(t) ? t : [t];
  }
  forEach(t) {
    return Object.entries(J(this.event)).forEach(([r, s]) => t(Array.isArray(s) ? s.join(", ") : s, r, this));
  }
  entries() {
    return Object.entries(J(this.event)).map(([t, r]) => [t, Array.isArray(r) ? r.join(", ") : r])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(J(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(J(this.event)).map((t) => Array.isArray(t) ? t.join(", ") : t)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
}
function mr(e) {
  return { get status() {
    return me(e);
  }, set status(t) {
    te(e, t);
  }, get statusText() {
    return Kt(e);
  }, set statusText(t) {
    te(e, me(e), t);
  }, headers: new fr(e) };
}
var yr = " ";
const wr = { style: (e) => ssrElement("style", e.attrs, () => e.children, true), link: (e) => ssrElement("link", e.attrs, void 0, true), script: (e) => e.attrs.src ? ssrElement("script", mergeProps(() => e.attrs, { get id() {
  return e.key;
} }), () => ssr(yr), true) : null, noscript: (e) => ssrElement("noscript", e.attrs, () => escape(e.children), true) };
function re(e, t) {
  let { tag: r, attrs: { key: s, ...n } = { key: void 0 }, children: o } = e;
  return wr[r]({ attrs: { ...n, nonce: t }, key: s, children: o });
}
function vr(e, t, r, s = "default") {
  return lazy(async () => {
    var _a;
    {
      const o = (await e.import())[s], i = (await ((_a = t.inputs) == null ? void 0 : _a[e.src].assets())).filter((c) => c.tag === "style" || c.attrs.rel === "stylesheet");
      return { default: (c) => [...i.map((u) => re(u)), createComponent(o, c)] };
    }
  });
}
function Ne() {
  function e(r) {
    return { ...r, ...r.$$route ? r.$$route.require().route : void 0, info: { ...r.$$route ? r.$$route.require().route.info : {}, filesystem: true }, component: r.$component && vr(r.$component, globalThis.MANIFEST.client, globalThis.MANIFEST.ssr), children: r.children ? r.children.map(e) : void 0 };
  }
  return ir.map(e);
}
let ve;
const br = isServer ? () => getRequestEvent().routes : () => ve || (ve = Ne());
function Rr(e) {
  const t = Vt(e.nativeEvent, "flash");
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
async function Sr(e) {
  const t = globalThis.MANIFEST.client;
  return globalThis.MANIFEST.ssr, e.response.headers.set("Content-Type", "text/html"), Object.assign(e, { manifest: await t.json(), assets: [...await t.inputs[t.handler].assets()], router: { submission: Rr(e) }, routes: Ne(), complete: false, $islands: /* @__PURE__ */ new Set() });
}
const Er = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function ne(e) {
  return e.status && Er.has(e.status) ? e.status : 302;
}
function Ar(e, t, r = {}, s) {
  return eventHandler({ handler: (n) => {
    const o = hr(n);
    return provideRequestEvent(o, async () => {
      const a = lr(new URL(o.request.url).pathname, o.request.method);
      if (a) {
        const p = await a.handler.import(), g = o.request.method === "HEAD" ? p.HEAD || p.GET : p[o.request.method];
        o.params = a.params || {}, sharedConfig.context = { event: o };
        const d = await g(o);
        if (d !== void 0) return d;
        if (o.request.method !== "GET") throw new Error(`API handler for ${o.request.method} "${o.request.url}" did not return a response.`);
        if (!a.isPage) return;
      }
      const i = await t(o), l = typeof r == "function" ? await r(i) : { ...r }, c = l.mode || "stream";
      if (l.nonce && (i.nonce = l.nonce), c === "sync") {
        const p = renderToString(() => (sharedConfig.context.event = i, e(i)), l);
        if (i.complete = true, i.response && i.response.headers.get("Location")) {
          const g = ne(i.response);
          return ye(n, i.response.headers.get("Location"), g);
        }
        return p;
      }
      if (l.onCompleteAll) {
        const p = l.onCompleteAll;
        l.onCompleteAll = (g) => {
          Re(i)(g), p(g);
        };
      } else l.onCompleteAll = Re(i);
      if (l.onCompleteShell) {
        const p = l.onCompleteShell;
        l.onCompleteShell = (g) => {
          be(i, n)(), p(g);
        };
      } else l.onCompleteShell = be(i, n);
      const u = renderToStream(() => (sharedConfig.context.event = i, e(i)), l);
      if (i.response && i.response.headers.get("Location")) {
        const p = ne(i.response);
        return ye(n, i.response.headers.get("Location"), p);
      }
      if (c === "async") return u;
      const { writable: y, readable: m } = new TransformStream();
      return u.pipeTo(y), m;
    });
  } });
}
function be(e, t) {
  return () => {
    if (e.response && e.response.headers.get("Location")) {
      const r = ne(e.response);
      te(t, r), Xt(t, "Location", e.response.headers.get("Location"));
    }
  };
}
function Re(e) {
  return ({ write: t }) => {
    e.complete = true;
    const r = e.response && e.response.headers.get("Location");
    r && t(`<script>window.location="${r}"<\/script>`);
  };
}
function $r(e, t, r) {
  return Ar(e, Sr, t);
}
function De() {
  let e = /* @__PURE__ */ new Set();
  function t(n) {
    return e.add(n), () => e.delete(n);
  }
  let r = false;
  function s(n, o) {
    if (r) return !(r = false);
    const a = { to: n, options: o, defaultPrevented: false, preventDefault: () => a.defaultPrevented = true };
    for (const i of e) i.listener({ ...a, from: i.location, retry: (l) => {
      l && (r = true), i.navigate(n, { ...o, resolve: false });
    } });
    return !a.defaultPrevented;
  }
  return { subscribe: t, confirm: s };
}
let se;
function ie() {
  (!window.history.state || window.history.state._depth == null) && window.history.replaceState({ ...window.history.state, _depth: window.history.length - 1 }, ""), se = window.history.state._depth;
}
isServer || ie();
function Pr(e) {
  return { ...e, _depth: window.history.state && window.history.state._depth };
}
function Cr(e, t) {
  let r = false;
  return () => {
    const s = se;
    ie();
    const n = s == null ? null : se - s;
    if (r) {
      r = false;
      return;
    }
    n && t(n) ? (r = true, window.history.go(-n)) : e();
  };
}
const Tr = /^(?:[a-z0-9]+:)?\/\//i, xr = /^\/+|(\/)\/+$/g, qe = "http://sr";
function M(e, t = false) {
  const r = e.replace(xr, "$1");
  return r ? t || /^[?#]/.test(r) ? r : "/" + r : "";
}
function V(e, t, r) {
  if (Tr.test(t)) return;
  const s = M(e), n = r && M(r);
  let o = "";
  return !n || t.startsWith("/") ? o = s : n.toLowerCase().indexOf(s.toLowerCase()) !== 0 ? o = s + n : o = n, (o || "/") + M(t, !o);
}
function Lr(e, t) {
  return M(e).replace(/\/*(\*.*)?$/g, "") + M(t);
}
function Ie(e) {
  const t = {};
  return e.searchParams.forEach((r, s) => {
    s in t ? Array.isArray(t[s]) ? t[s].push(r) : t[s] = [t[s], r] : t[s] = r;
  }), t;
}
function kr(e, t, r) {
  const [s, n] = e.split("/*", 2), o = s.split("/").filter(Boolean), a = o.length;
  return (i) => {
    const l = i.split("/").filter(Boolean), c = l.length - a;
    if (c < 0 || c > 0 && n === void 0 && !t) return null;
    const u = { path: a ? "" : "/", params: {} }, y = (m) => r === void 0 ? void 0 : r[m];
    for (let m = 0; m < a; m++) {
      const p = o[m], g = p[0] === ":", d = g ? l[m] : l[m].toLowerCase(), h = g ? p.slice(1) : p.toLowerCase();
      if (g && Z(d, y(h))) u.params[h] = d;
      else if (g || !Z(d, h)) return null;
      u.path += `/${d}`;
    }
    if (n) {
      const m = c ? l.slice(-c).join("/") : "";
      if (Z(m, y(n))) u.params[n] = m;
      else return null;
    }
    return u;
  };
}
function Z(e, t) {
  const r = (s) => s === e;
  return t === void 0 ? true : typeof t == "string" ? r(t) : typeof t == "function" ? t(e) : Array.isArray(t) ? t.some(r) : t instanceof RegExp ? t.test(e) : false;
}
function Hr(e) {
  const [t, r] = e.pattern.split("/*", 2), s = t.split("/").filter(Boolean);
  return s.reduce((n, o) => n + (o.startsWith(":") ? 2 : 3), s.length - (r === void 0 ? 0 : 1));
}
function je(e) {
  const t = /* @__PURE__ */ new Map(), r = getOwner();
  return new Proxy({}, { get(s, n) {
    return t.has(n) || runWithOwner(r, () => t.set(n, createMemo(() => e()[n]))), t.get(n)();
  }, getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  }, ownKeys() {
    return Reflect.ownKeys(e());
  }, has(s, n) {
    return n in e();
  } });
}
function Ue(e) {
  let t = /(\/?\:[^\/]+)\?/.exec(e);
  if (!t) return [e];
  let r = e.slice(0, t.index), s = e.slice(t.index + t[0].length);
  const n = [r, r += t[1]];
  for (; t = /^(\/\:[^\/]+)\?/.exec(s); ) n.push(r += t[1]), s = s.slice(t[0].length);
  return Ue(s).reduce((o, a) => [...o, ...n.map((i) => i + a)], []);
}
const Or = 100, _r = createContext$1(), Fe = createContext$1();
function Nr(e, t = "") {
  const { component: r, preload: s, load: n, children: o, info: a } = e, i = !o || Array.isArray(o) && !o.length, l = { key: e, component: r, preload: s || n, info: a };
  return Me(e.path).reduce((c, u) => {
    for (const y of Ue(u)) {
      const m = Lr(t, y);
      let p = i ? m : m.split("/*", 1)[0];
      p = p.split("/").map((g) => g.startsWith(":") || g.startsWith("*") ? g : encodeURIComponent(g)).join("/"), c.push({ ...l, originalPath: u, pattern: p, matcher: kr(p, !i, e.matchFilters) });
    }
    return c;
  }, []);
}
function Dr(e, t = 0) {
  return { routes: e, score: Hr(e[e.length - 1]) * 1e4 - t, matcher(r) {
    const s = [];
    for (let n = e.length - 1; n >= 0; n--) {
      const o = e[n], a = o.matcher(r);
      if (!a) return null;
      s.unshift({ ...a, route: o });
    }
    return s;
  } };
}
function Me(e) {
  return Array.isArray(e) ? e : [e];
}
function We(e, t = "", r = [], s = []) {
  const n = Me(e);
  for (let o = 0, a = n.length; o < a; o++) {
    const i = n[o];
    if (i && typeof i == "object") {
      i.hasOwnProperty("path") || (i.path = "");
      const l = Nr(i, t);
      for (const c of l) {
        r.push(c);
        const u = Array.isArray(i.children) && i.children.length === 0;
        if (i.children && !u) We(i.children, c.pattern, r, s);
        else {
          const y = Dr([...r], s.length);
          s.push(y);
        }
        r.pop();
      }
    }
  }
  return r.length ? s : s.sort((o, a) => a.score - o.score);
}
function W(e, t) {
  for (let r = 0, s = e.length; r < s; r++) {
    const n = e[r].matcher(t);
    if (n) return n;
  }
  return [];
}
function qr(e, t, r) {
  const s = new URL(qe), n = createMemo((u) => {
    const y = e();
    try {
      return new URL(y, s);
    } catch {
      return console.error(`Invalid path ${y}`), u;
    }
  }, s, { equals: (u, y) => u.href === y.href }), o = createMemo(() => n().pathname), a = createMemo(() => n().search, true), i = createMemo(() => n().hash), l = () => "", c = on$2(a, () => Ie(n()));
  return { get pathname() {
    return o();
  }, get search() {
    return a();
  }, get hash() {
    return i();
  }, get state() {
    return t();
  }, get key() {
    return l();
  }, query: r ? r(c) : je(c) };
}
let H;
function Ir() {
  return H;
}
function jr(e, t, r, s = {}) {
  const { signal: [n, o], utils: a = {} } = e, i = a.parsePath || ((f) => f), l = a.renderPath || ((f) => f), c = a.beforeLeave || De(), u = V("", s.base || "");
  if (u === void 0) throw new Error(`${u} is not a valid base path`);
  u && !n().value && o({ value: u, replace: true, scroll: false });
  const [y, m] = createSignal(false);
  let p;
  const g = (f, w) => {
    w.value === d() && w.state === R() || (p === void 0 && m(true), H = f, p = w, startTransition(() => {
      p === w && (h(p.value), v(p.state), resetErrorBoundaries(), isServer || k[1]((E) => E.filter((_) => _.pending)));
    }).finally(() => {
      p === w && batch(() => {
        H = void 0, f === "navigate" && Ye(p), m(false), p = void 0;
      });
    }));
  }, [d, h] = createSignal(n().value), [R, v] = createSignal(n().state), L = qr(d, R, a.queryWrapper), $ = [], k = createSignal(isServer ? Qe() : []), U = createMemo(() => typeof s.transformUrl == "function" ? W(t(), s.transformUrl(L.pathname)) : W(t(), L.pathname)), ce = () => {
    const f = U(), w = {};
    for (let E = 0; E < f.length; E++) Object.assign(w, f[E].params);
    return w;
  }, ze = a.paramsWrapper ? a.paramsWrapper(ce, t) : je(ce), le = { pattern: u, path: () => u, outlet: () => null, resolvePath(f) {
    return V(u, f);
  } };
  return createRenderEffect(on$2(n, (f) => g("native", f), { defer: true })), { base: le, location: L, params: ze, isRouting: y, renderPath: l, parsePath: i, navigatorFactory: Ve, matches: U, beforeLeave: c, preloadRoute: Xe, singleFlight: s.singleFlight === void 0 ? true : s.singleFlight, submissions: k };
  function Je(f, w, E) {
    untrack(() => {
      if (typeof w == "number") {
        w && (a.go ? a.go(w) : console.warn("Router integration does not support relative routing"));
        return;
      }
      const _ = !w || w[0] === "?", { replace: B, resolve: N, scroll: G, state: D } = { replace: false, resolve: !_, scroll: true, ...E }, q = N ? f.resolvePath(w) : V(_ && L.pathname || "", w);
      if (q === void 0) throw new Error(`Path '${w}' is not a routable path`);
      if ($.length >= Or) throw new Error("Too many redirects");
      const ue = d();
      if (q !== ue || D !== R()) if (isServer) {
        const de = getRequestEvent();
        de && (de.response = { status: 302, headers: new Headers({ Location: q }) }), o({ value: q, replace: B, scroll: G, state: D });
      } else c.confirm(q, E) && ($.push({ value: ue, replace: B, scroll: G, state: R() }), g("navigate", { value: q, state: D }));
    });
  }
  function Ve(f) {
    return f = f || useContext(Fe) || le, (w, E) => Je(f, w, E);
  }
  function Ye(f) {
    const w = $[0];
    w && (o({ ...f, replace: w.replace, scroll: w.scroll }), $.length = 0);
  }
  function Xe(f, w) {
    const E = W(t(), f.pathname), _ = H;
    H = "preload";
    for (let B in E) {
      const { route: N, params: G } = E[B];
      N.component && N.component.preload && N.component.preload();
      const { preload: D } = N;
      w && D && runWithOwner(r(), () => D({ params: G, location: { pathname: f.pathname, search: f.search, hash: f.hash, query: Ie(f), state: null, key: "" }, intent: "preload" }));
    }
    H = _;
  }
  function Qe() {
    const f = getRequestEvent();
    return f && f.router && f.router.submission ? [f.router.submission] : [];
  }
}
function Ur(e, t, r, s) {
  const { base: n, location: o, params: a } = e, { pattern: i, component: l, preload: c } = s().route, u = createMemo(() => s().path);
  l && l.preload && l.preload();
  const y = c ? c({ params: a, location: o, intent: H || "initial" }) : void 0;
  return { parent: t, pattern: i, path: u, outlet: () => l ? createComponent(l, { params: a, location: o, data: y, get children() {
    return r();
  } }) : r(), resolvePath(p) {
    return V(n.path(), p, u());
  } };
}
const Be = (e) => (t) => {
  const { base: r } = t, s = children(() => t.children), n = createMemo(() => We(s(), t.base || ""));
  let o;
  const a = jr(e, n, () => o, { base: r, singleFlight: t.singleFlight, transformUrl: t.transformUrl });
  return e.create && e.create(a), createComponent$1(_r.Provider, { value: a, get children() {
    return createComponent$1(Fr, { routerState: a, get root() {
      return t.root;
    }, get preload() {
      return t.rootPreload || t.rootLoad;
    }, get children() {
      return [(o = getOwner()) && null, createComponent$1(Mr, { routerState: a, get branches() {
        return n();
      } })];
    } });
  } });
};
function Fr(e) {
  const t = e.routerState.location, r = e.routerState.params, s = createMemo(() => e.preload && untrack(() => {
    e.preload({ params: r, location: t, intent: Ir() || "initial" });
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
function Mr(e) {
  if (isServer) {
    const n = getRequestEvent();
    if (n && n.router && n.router.dataOnly) {
      Wr(n, e.routerState, e.branches);
      return;
    }
    n && ((n.router || (n.router = {})).matches || (n.router.matches = e.routerState.matches().map(({ route: o, path: a, params: i }) => ({ path: o.originalPath, pattern: o.pattern, match: a, params: i, info: o.info }))));
  }
  const t = [];
  let r;
  const s = createMemo(on$2(e.routerState.matches, (n, o, a) => {
    let i = o && n.length === o.length;
    const l = [];
    for (let c = 0, u = n.length; c < u; c++) {
      const y = o && o[c], m = n[c];
      a && y && m.route.key === y.route.key ? l[c] = a[c] : (i = false, t[c] && t[c](), createRoot((p) => {
        t[c] = p, l[c] = Ur(e.routerState, l[c - 1] || e.routerState.base, Se(() => s()[c + 1]), () => {
          var _a;
          const g = e.routerState.matches();
          return (_a = g[c]) != null ? _a : g[0];
        });
      }));
    }
    return t.splice(n.length).forEach((c) => c()), a && i ? a : (r = l[0], l);
  }));
  return Se(() => s() && r)();
}
const Se = (e) => () => createComponent$1(Show, { get when() {
  return e();
}, keyed: true, children: (t) => createComponent$1(Fe.Provider, { value: t, get children() {
  return t.outlet();
} }) });
function Wr(e, t, r) {
  const s = new URL(e.request.url), n = W(r, new URL(e.router.previousUrl || e.request.url).pathname), o = W(r, s.pathname);
  for (let a = 0; a < o.length; a++) {
    (!n[a] || o[a].route !== n[a].route) && (e.router.dataOnly = true);
    const { route: i, params: l } = o[a];
    i.preload && i.preload({ params: l, location: t.location, intent: "preload" });
  }
}
function Br([e, t], r, s) {
  return [e, s ? (n) => t(s(n)) : t];
}
function Gr(e) {
  let t = false;
  const r = (n) => typeof n == "string" ? { value: n } : n, s = Br(createSignal(r(e.get()), { equals: (n, o) => n.value === o.value && n.state === o.state }), void 0, (n) => (!t && e.set(n), sharedConfig.registry && !sharedConfig.done && (sharedConfig.done = true), n));
  return e.init && onCleanup(e.init((n = e.get()) => {
    t = true, s[1](r(n)), t = false;
  })), Be({ signal: s, create: e.create, utils: e.utils });
}
function Kr(e, t, r) {
  return e.addEventListener(t, r), () => e.removeEventListener(t, r);
}
function zr(e, t) {
  const r = e && document.getElementById(e);
  r ? r.scrollIntoView() : t && window.scrollTo(0, 0);
}
function Jr(e) {
  const t = new URL(e);
  return t.pathname + t.search;
}
function Vr(e) {
  let t;
  const r = { value: e.url || (t = getRequestEvent()) && Jr(t.request.url) || "" };
  return Be({ signal: [() => r, (s) => Object.assign(r, s)] })(e);
}
const Yr = /* @__PURE__ */ new Map();
function Xr(e = true, t = false, r = "/_server", s) {
  return (n) => {
    const o = n.base.path(), a = n.navigatorFactory(n.base);
    let i, l;
    function c(d) {
      return d.namespaceURI === "http://www.w3.org/2000/svg";
    }
    function u(d) {
      if (d.defaultPrevented || d.button !== 0 || d.metaKey || d.altKey || d.ctrlKey || d.shiftKey) return;
      const h = d.composedPath().find((U) => U instanceof Node && U.nodeName.toUpperCase() === "A");
      if (!h || t && !h.hasAttribute("link")) return;
      const R = c(h), v = R ? h.href.baseVal : h.href;
      if ((R ? h.target.baseVal : h.target) || !v && !h.hasAttribute("state")) return;
      const $ = (h.getAttribute("rel") || "").split(/\s+/);
      if (h.hasAttribute("download") || $ && $.includes("external")) return;
      const k = R ? new URL(v, document.baseURI) : new URL(v);
      if (!(k.origin !== window.location.origin || o && k.pathname && !k.pathname.toLowerCase().startsWith(o.toLowerCase()))) return [h, k];
    }
    function y(d) {
      const h = u(d);
      if (!h) return;
      const [R, v] = h, L = n.parsePath(v.pathname + v.search + v.hash), $ = R.getAttribute("state");
      d.preventDefault(), a(L, { resolve: false, replace: R.hasAttribute("replace"), scroll: !R.hasAttribute("noscroll"), state: $ ? JSON.parse($) : void 0 });
    }
    function m(d) {
      const h = u(d);
      if (!h) return;
      const [R, v] = h;
      s && (v.pathname = s(v.pathname)), n.preloadRoute(v, R.getAttribute("preload") !== "false");
    }
    function p(d) {
      clearTimeout(i);
      const h = u(d);
      if (!h) return l = null;
      const [R, v] = h;
      l !== R && (s && (v.pathname = s(v.pathname)), i = setTimeout(() => {
        n.preloadRoute(v, R.getAttribute("preload") !== "false"), l = R;
      }, 20));
    }
    function g(d) {
      if (d.defaultPrevented) return;
      let h = d.submitter && d.submitter.hasAttribute("formaction") ? d.submitter.getAttribute("formaction") : d.target.getAttribute("action");
      if (!h) return;
      if (!h.startsWith("https://action/")) {
        const v = new URL(h, qe);
        if (h = n.parsePath(v.pathname + v.search), !h.startsWith(r)) return;
      }
      if (d.target.method.toUpperCase() !== "POST") throw new Error("Only POST forms are supported for Actions");
      const R = Yr.get(h);
      if (R) {
        d.preventDefault();
        const v = new FormData(d.target, d.submitter);
        R.call({ r: n, f: d.target }, d.target.enctype === "multipart/form-data" ? v : new URLSearchParams(v));
      }
    }
    delegateEvents(["click", "submit"]), document.addEventListener("click", y), e && (document.addEventListener("mousemove", p, { passive: true }), document.addEventListener("focusin", m, { passive: true }), document.addEventListener("touchstart", m, { passive: true })), document.addEventListener("submit", g), onCleanup(() => {
      document.removeEventListener("click", y), e && (document.removeEventListener("mousemove", p), document.removeEventListener("focusin", m), document.removeEventListener("touchstart", m)), document.removeEventListener("submit", g);
    });
  };
}
function Qr(e) {
  if (isServer) return Vr(e);
  const t = () => {
    const s = window.location.pathname.replace(/^\/+/, "/") + window.location.search, n = window.history.state && window.history.state._depth && Object.keys(window.history.state).length === 1 ? void 0 : window.history.state;
    return { value: s + window.location.hash, state: n };
  }, r = De();
  return Gr({ get: t, set({ value: s, replace: n, scroll: o, state: a }) {
    n ? window.history.replaceState(Pr(a), "", s) : window.history.pushState(a, "", s), zr(decodeURIComponent(window.location.hash.slice(1)), o), ie();
  }, init: (s) => Kr(window, "popstate", Cr(s, (n) => {
    if (n) return !r.confirm(n);
    {
      const o = t();
      return !r.confirm(o.value, { state: o.state });
    }
  })), create: Xr(e.preload, e.explicitLinks, e.actionBase, e.transformUrl), utils: { go: (s) => window.history.go(s), beforeLeave: r } })(e);
}
const Zr = typeof globalThis.document < "u", en = Zr ? `${location.origin}/api/rivet` : "http://localhost:3000/api/rivet", tn = createClient(en);
var rn = ["<div", '><nav style="', '"><a href="/">Counter</a> | <a href="/ssr">SSR Counter</a> | <a href="/auth">Auth</a></nav><main style="', '">', "</main></div>"];
function nn() {
  return createComponent$1(oe, { client: tn, get children() {
    return createComponent$1(Qr, { root: (e) => ssr(rn, ssrHydrationKey(), ssrStyleProperty("padding:", "1rem") + ssrStyleProperty(";border-bottom:", "1px solid #ccc"), ssrStyleProperty("padding:", "1rem"), escape(createComponent$1(Suspense, { get children() {
      return e.children;
    } }))), get children() {
      return createComponent$1(br, {});
    } });
  } });
}
const Ge = isServer ? (e) => {
  const t = getRequestEvent();
  return t.response.status = e.code, t.response.statusText = e.text, onCleanup(() => !t.nativeEvent.handled && !t.complete && (t.response.status = 200)), null;
} : (e) => null;
var sn = ["<span", ' style="font-size:1.5em;text-align:center;position:fixed;left:0px;bottom:55%;width:100%;">', "</span>"], on = ["<span", ' style="font-size:1.5em;text-align:center;position:fixed;left:0px;bottom:55%;width:100%;">500 | Internal Server Error</span>'];
const an = (e) => {
  const t = isServer ? "500 | Internal Server Error" : "Error | Uncaught Client Exception";
  return createComponent$1(ErrorBoundary, { fallback: (r) => (console.error(r), [ssr(sn, ssrHydrationKey(), escape(t)), createComponent$1(Ge, { code: 500 })]), get children() {
    return e.children;
  } });
}, cn = (e) => {
  let t = false;
  const r = catchError(() => e.children, (s) => {
    console.error(s), t = !!s;
  });
  return t ? [ssr(on, ssrHydrationKey()), createComponent$1(Ge, { code: 500 })] : r;
};
var Ee = ["<script", ">", "<\/script>"], ln = ["<script", ' type="module"', " async", "><\/script>"], un = ["<script", ' type="module" async', "><\/script>"];
const dn = ssr("<!DOCTYPE html>");
function Ke(e, t, r = []) {
  for (let s = 0; s < t.length; s++) {
    const n = t[s];
    if (n.path !== e[0].path) continue;
    let o = [...r, n];
    if (n.children) {
      const a = e.slice(1);
      if (a.length === 0 || (o = Ke(a, n.children, o), !o)) continue;
    }
    return o;
  }
}
function pn(e) {
  const t = getRequestEvent(), r = t.nonce;
  let s = [];
  return Promise.resolve().then(async () => {
    let n = [];
    if (t.router && t.router.matches) {
      const o = [...t.router.matches];
      for (; o.length && (!o[0].info || !o[0].info.filesystem); ) o.shift();
      const a = o.length && Ke(o, t.routes);
      if (a) {
        const i = globalThis.MANIFEST.client.inputs;
        for (let l = 0; l < a.length; l++) {
          const c = a[l], u = i[c.$component.src];
          n.push(u.assets());
        }
      }
    }
    s = await Promise.all(n).then((o) => [...new Map(o.flat().map((a) => [a.attrs.key, a])).values()].filter((a) => a.attrs.rel === "modulepreload" && !t.assets.find((i) => i.attrs.key === a.attrs.key)));
  }), useAssets(() => s.length ? s.map((n) => re(n)) : void 0), createComponent$1(NoHydration, { get children() {
    return [dn, createComponent$1(cn, { get children() {
      return createComponent$1(e.document, { get assets() {
        return [createComponent$1(HydrationScript, {}), t.assets.map((n) => re(n, r))];
      }, get scripts() {
        return r ? [ssr(Ee, ssrHydrationKey() + ssrAttribute("nonce", escape(r, true), false), `window.manifest = ${JSON.stringify(t.manifest)}`), ssr(ln, ssrHydrationKey(), ssrAttribute("nonce", escape(r, true), false), ssrAttribute("src", escape(globalThis.MANIFEST.client.inputs[globalThis.MANIFEST.client.handler].output.path, true), false))] : [ssr(Ee, ssrHydrationKey(), `window.manifest = ${JSON.stringify(t.manifest)}`), ssr(un, ssrHydrationKey(), ssrAttribute("src", escape(globalThis.MANIFEST.client.inputs[globalThis.MANIFEST.client.handler].output.path, true), false))];
      }, get children() {
        return createComponent$1(Hydration, { get children() {
          return createComponent$1(an, { get children() {
            return createComponent$1(nn, {});
          } });
        } });
      } });
    } })];
  } });
}
var hn = ['<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">', "</head>"], fn = ["<html", ' lang="en">', '<body><div id="app">', "</div><!--$-->", "<!--/--></body></html>"];
const An = $r(() => createComponent$1(pn, { document: ({ assets: e, children: t, scripts: r }) => ssr(fn, ssrHydrationKey(), createComponent$1(NoHydration, { get children() {
  return ssr(hn, escape(e));
} }), escape(t), escape(r)) }));

const handlers = [
  { route: '', handler: _viL2zm, lazy: false, middleware: true, method: undefined },
  { route: '/_server', handler: lu, lazy: false, middleware: true, method: undefined },
  { route: '/', handler: An, lazy: false, middleware: true, method: undefined }
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
  const localCall = (aRequest) => b$2(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C$2(
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

export { at as a, ae as b, nodeServer as c, nu as n, se$1 as s };
//# sourceMappingURL=nitro.mjs.map
