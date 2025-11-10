"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/until-async";
exports.ids = ["vendor-chunks/until-async"];
exports.modules = {

/***/ "(ssr)/./node_modules/until-async/lib/index.js":
/*!***********************************************!*\
  !*** ./node_modules/until-async/lib/index.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   until: () => (/* binding */ until)\n/* harmony export */ });\n//#region src/index.ts\n/**\n* Gracefully handles a callback that returns a promise.\n*\n* @example\n* await until(() => Promise.resolve(123))\n* // [null, 123]\n*\n* await until(() => Promise.reject(new Error('Oops!')))\n* // [new Error('Oops!'), null]\n*/\nasync function until(callback) {\n\ttry {\n\t\treturn [null, await callback().catch((error) => {\n\t\t\tthrow error;\n\t\t})];\n\t} catch (error) {\n\t\treturn [error, null];\n\t}\n}\n\n//#endregion\n\n//# sourceMappingURL=index.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvdW50aWwtYXN5bmMvbGliL2luZGV4LmpzIiwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNpQjtBQUNqQiIsInNvdXJjZXMiOlsiRDpcXHdlYiBTY3JpcHRpbmcgd2l0aCBVZFxcRHJlYW1cXERSRUFNLVhTVE9SRVxcRHJlYW14c3RvcmVcXG5vZGVfbW9kdWxlc1xcdW50aWwtYXN5bmNcXGxpYlxcaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8jcmVnaW9uIHNyYy9pbmRleC50c1xuLyoqXG4qIEdyYWNlZnVsbHkgaGFuZGxlcyBhIGNhbGxiYWNrIHRoYXQgcmV0dXJucyBhIHByb21pc2UuXG4qXG4qIEBleGFtcGxlXG4qIGF3YWl0IHVudGlsKCgpID0+IFByb21pc2UucmVzb2x2ZSgxMjMpKVxuKiAvLyBbbnVsbCwgMTIzXVxuKlxuKiBhd2FpdCB1bnRpbCgoKSA9PiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ09vcHMhJykpKVxuKiAvLyBbbmV3IEVycm9yKCdPb3BzIScpLCBudWxsXVxuKi9cbmFzeW5jIGZ1bmN0aW9uIHVudGlsKGNhbGxiYWNrKSB7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIFtudWxsLCBhd2FpdCBjYWxsYmFjaygpLmNhdGNoKChlcnJvcikgPT4ge1xuXHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0fSldO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdHJldHVybiBbZXJyb3IsIG51bGxdO1xuXHR9XG59XG5cbi8vI2VuZHJlZ2lvblxuZXhwb3J0IHsgdW50aWwgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/until-async/lib/index.js\n");

/***/ })

};
;