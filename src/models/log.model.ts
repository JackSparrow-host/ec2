import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Represents a log entry.
 */
export interface ILog {
  timestamp: Date;
  label: string;
  level: string;
  message: string;
}

/**
 * Represents a document that extends the ILog interface and the Document interface.
 */
export interface ILogDocument extends ILog, Document {};

/**
 * Represents the schema for a log document.
 */
const LogSchema: Schema = new Schema<ILogDocument>({
  timestamp: { type: Date, required: true },
  label: { type: String, required: true },
  level: { type: String, required: true },
  message: { type: String, required: true },
});

/**
 * Represents a log document.
 */
export const Log: Model<ILogDocument> = mongoose.model<ILogDocument>('Log', LogSchema);

/**
 * Retrieves logs from the database.
 * @returns {Promise<Log[]>} A promise that resolves to an array of Log objects.
 */
export const getLogs = Log.find().exec();

/**
 * Retrieves logs by timestamp.
 * @param timeStamp - The timestamp to search for.
 * @returns A promise that resolves to the log found, or null if not found.
 */
export const getLogsByTimestamp = (timeStamp: Date) => Log.findOne({ timeStamp }).exec();

/**
 * Creates a new log entry with the given values.
 * @param values - The values for the log entry.
 * @returns A promise that resolves to the created log entry as an object.
 */
export const createLog = (values: Record<string, any>) => new Log(values).save().then((log) => log.toObject());