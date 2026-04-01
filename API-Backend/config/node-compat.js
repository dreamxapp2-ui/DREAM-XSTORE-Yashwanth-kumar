const bufferModule = require('buffer');

// Older JWT dependencies still reference SlowBuffer.prototype.
// Node 25 no longer exposes SlowBuffer, so alias it to Buffer for startup compatibility.
if (!bufferModule.SlowBuffer) {
  bufferModule.SlowBuffer = bufferModule.Buffer;
}