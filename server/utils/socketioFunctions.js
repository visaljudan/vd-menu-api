import { io } from "../index.js";

export const emitRoleEvent = (event, data) => {
  io.emit(event, data);
};

export const emitSubscriptionPlan = (event, data) => {
  io.emit(event, data);
};

export const emitUserEvent = (event, data) => {
  io.emit(event, data);
};

export const emitUserSubscriptionPlan = (event, data) => {
  io.emit(event, data);
};

export const emitCategoryEvent = (event, data) => {
  io.emit(event, data);
};

export const emitItemEvent = (event, data) => {
  io.emit(event, data);
};
