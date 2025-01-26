import { io } from "../index.js";

export const emitUserEvent = (event, data) => {
  io.emit(event, data);
};
