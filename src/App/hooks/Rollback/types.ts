export type RollbackTypes = "Firebase" | "Sheets" | "Zoop" | "Auth";
export type Collections = "affiliates" | "collaborators" | "storeowners" | "team" | "suppliers" | "users";
export type ZoopResources = "sellers" | "buyer" | "card" | "payments" | "split_rules" | "bank_account";

interface CommonProps {
  origin: RollbackTypes;
}

export interface IFirebaseData extends CommonProps {
  collection: Collections;
  field: string;
  identifier: string;
}

export interface IZoopData extends CommonProps {
  resource: ZoopResources;
  resourceId: string;
  splitTransactionId?: string;
}

export interface ISheetsData extends CommonProps {
  idToSearch: string;
  rangeToSearch: string;
  rangeToUpdate: string;
  spreadsheetId: string;
  values: Array<string>;
}

export interface IUserData extends CommonProps {
  password: string;
}

export interface IApiData extends CommonProps {
  url: string;
  body: object;
  config: object;
}

export type RollbackObject = IApiData | IFirebaseData | ISheetsData | IUserData | IZoopData;

export interface StoreFormat {
  state: Array<RollbackObject>;
  setState: (newState: RollbackObject) => void;
  setters: any[];
}
