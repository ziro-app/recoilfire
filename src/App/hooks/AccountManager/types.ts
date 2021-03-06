export type Apps = "affiliate" | "catalog" | "operation" | "suppliers";
export type ConfirmLinkTypes = "Email" | "CNPJ";
export type Collections = "affiliates" | "collaborators" | "storeowners" | "team" | "suppliers" | "users";

export namespace Request {
  export interface ConfirmLink {
    email: string;
    type: ConfirmLinkTypes;
    uid?: string;
    app?: Apps;
  }
  export interface SendEmail {
    to: string;
    customEmail: boolean;
    confirmEmail: object;
  }
  export interface UpdateUser {
    uid: string;
    prop: object;
  }
  export interface ChangeEmail {
    newEmail: string;
    password: string;
    sheetId?: string;
    sheetRange?: string;
  }
  export interface SheetData {
    apiResource: string;
    apiMethod: string;
    range: string;
    spreadsheetId: string;
    resource: object;
    valueInputOption: string;
  }
  export interface UpdatePassword {
    oldPassword: string;
    newPassword: string;
  }
  export interface DeleteAccount {
    password: string;
    sheetId?: string;
    sheetRange?: string;
  }
  export interface ResetPassword {
    email: string;
  }
  export interface LogIn {
    email: string;
    password: string;
  }
  export interface CreateUser {
    email: string;
    password: string;
    app: Apps;
    collection: Collections;
    collectionData: object;
    continueUrl: string;
    spreadsheetData?: Array<string>;
    spreadsheetId?: string;
    spreadsheetRange?: string;
    // Rollback-related fields if the action fails
    idToSearch?: string;
    rangeToSearch?: string;
    rangeToUpdate?: string;
    values?: Array<string>;
  }
}

export namespace Response {
  export interface ConfirmLink {
    ok: boolean;
    link?: string;
  }
  export interface Default {
    ok: boolean;
    msg?: string;
  }
}
