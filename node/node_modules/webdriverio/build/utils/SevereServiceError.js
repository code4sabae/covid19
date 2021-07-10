"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Error to be thrown when a severe error was encountered when a Service is being ran.
 */
class SevereServiceError extends Error {
    constructor(message = 'Severe Service Error occurred.') {
        super(message);
        this.name = 'SevereServiceError';
    }
}
exports.default = SevereServiceError;
