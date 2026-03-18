import { createComponent } from 'solid-js/web';
import { createContext, useContext } from 'solid-js';

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var RivetContext = createContext();
var RivetProvider = (props) => {
  return createComponent(RivetContext.Provider, {
    get value() {
      return {
        client: props.client
      };
    },
    get children() {
      return props.children;
    }
  });
};
function useRivet() {
  const ctx = useContext(RivetContext);
  if (!ctx) {
    throw new Error("useRivet() must be used inside a <RivetProvider>. Wrap your app with <RivetProvider client={...}>.");
  }
  return ctx;
}

export { RivetContext, RivetProvider, __commonJS, __toESM, useRivet };
