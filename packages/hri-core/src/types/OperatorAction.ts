export interface OperatorAction {
  actionId: string;
  type: string;
  payload?: any;
  acknowledged: boolean;
  timestamp: string;
}
