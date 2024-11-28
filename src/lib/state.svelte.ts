import type { UserType } from "./models/User";

export interface StateType {
  user: null | UserType;
}

export const state: StateType = $state({
  user: null,
});
