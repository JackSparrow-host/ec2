/**
 * Returns the error message from the provided error object.
 * If the error object is an instance of Error, the error message is returned.
 * Otherwise, the error object is converted to a string and returned.
 * @param error - The error object.
 * @returns The error message.
 */
function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    return String(error);
}

export default getErrorMessage;