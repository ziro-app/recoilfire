import React, { useCallback } from "react";
import { useAuth, useFirestore, auth as fbAuth } from "reactfire";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
// Switch to importing lib into production
import { useRollback } from '../Rollback';
import { Request, Response } from "./types";

const matchCollectionName = {
  affiliate: "affiliates",
  catalog: "storeowners",
  operation: "team",
  suppliers: "suppliers"
};
const collectionList = ["affiliates", "storeowners", "team", "suppliers"];

export const useAccountManagement = (): {
  resendConfirmEmail: (data: Request.ConfirmLink) => Promise<Response.Default>;
  changeEmail: (data: Request.ChangeEmail) => Promise<Response.Default>;
  changePassword: (data: Request.UpdatePassword) => Promise<Response.Default>;
  deleteAccount: (data: Request.DeleteAccount) => Promise<Response.Default>;
  resetPassword: (data: Request.ResetPassword) => Promise<Response.Default>;
  logIn: (data: Request.LogIn) => Promise<void>;
  logOut: () => Promise<void>;
  createUser: (data: Request.CreateUser) => Promise<Response.Default>;
} => {
  const { addRollback, execute } = useRollback();
  const auth = useAuth();
  const emailAuth = fbAuth.EmailAuthProvider;
  const usersRef = useFirestore().collection("users");
  const affiliatesRef = useFirestore().collection("affiliates");
  const collaboratorsRef = useFirestore().collection("collaborators");
  const storeownersRef = useFirestore().collection("storeowners");
  const teamRef = useFirestore().collection("team");
  const suppliersRef = useFirestore().collection("suppliers");

  const matchRef = (collection) => {
    if (collection === "affiliates") return affiliatesRef;
    if (collection === "collaborators") return collaboratorsRef;
    if (collection === "storeowners") return storeownersRef;
    if (collection === "team") return teamRef;
    if (collection === "suppliers") return suppliersRef;
    if (collection === "users") return usersRef;
    return null;
  };

  const generateConfirmLink = useCallback(
    async (data: Request.ConfirmLink): Promise<Response.ConfirmLink> => {
      try {
        const config: AxiosRequestConfig = {
          url: `${process.env.FIREBASE_AUTH_URL}resendConfirmEmail`,
          method: "POST",
          headers: {
            Origin: "https://ziro.app",
            "Content-Type": "application/json"
          }
        };
        const {
          data: responseData
        }: AxiosResponse<Response.ConfirmLink> = await axios({
          ...config,
          data
        });
        return responseData;
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const sendEmail = useCallback(async (data: Request.SendEmail): Promise<Response.Default> => {
    try {
      const config: AxiosRequestConfig = {
        url: process.env.API_EMAIL,
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: process.env.EMAIL_TOKEN
        }
      };
      await axios({ ...config, data });
      return { ok: true, msg: 'Email enviado com sucesso!' };
    } catch (error) {
      throw error;
    }
  }, []);

  const resendConfirmEmail = useCallback(async (data: Request.ConfirmLink): Promise<Response.Default> => {
    try {
      const { ok, link } = await generateConfirmLink(data);
      if (ok) throw new Error("Email já validado!");
      const emailData: Request.SendEmail = {
        to: data.email,
        customEmail: false,
        confirmEmail: { link }
      };
      return await sendEmail(emailData);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, []);

  const updateAuthUser = useCallback(async (data: Request.UpdateUser): Promise<Response.Default> => {
    try {
      const config: AxiosRequestConfig = {
        url: `${process.env.FIREBASE_AUTH_URL}updateUserInfo`,
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      };
      const {
        data: { ok }
      }: AxiosResponse<{ ok: boolean }> = await axios({ ...config, data });
      return { ok, msg: 'Usuário atualizado com sucesso!' };
    } catch (error) {
      throw error;
    }
  }, []);

  const requestSheet = useCallback(async (data: Request.SheetData): Promise<Response.Default> => {
    const config: AxiosRequestConfig = {
      url: process.env.SHEET_URL,
      method: 'POST',
      headers: {
        "Content-type": "application/json",
        Authorization: process.env.SHEET_TOKEN
      }
    };
    try {
      await axios({ ...config, data });
      return { ok: true, msg: 'Planilha atualizada com sucesso!' };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, []);

  const changeEmail = useCallback(async (data: Request.ChangeEmail): Promise<Response.Default> => {
    try {
      if (!auth.currentUser) throw new Error("O usuário deve estar logado para acionar o hook");
      if (!data.newEmail) throw new Error("O novo email é necessário para acionar o hook");
      if (!data.password) throw new Error("A senha atual é necessária para validação!");
      const oldOmail = auth.currentUser.email;
      const newEmail = data.newEmail.toLowerCase();
      try {
        const credential = emailAuth.credential(oldOmail, data.password);
        await auth.currentUser.reauthenticateWithCredential(credential);
      } catch (error) {
        throw new Error("Erro de autenticação! Verifique a senha e tente novamente");
      }
      const updateData = {
        uid: auth.currentUser.uid,
        prop: {
          email: newEmail,
          emailVerified: false
        }
      };
      const { ok } = await updateAuthUser(updateData);
      if (!ok) throw new Error("Erro ao atualizar usuário");

      const userCollection = usersRef.where("email", "==", oldOmail).limit(1).get();
      const app = (await userCollection).docs[0]?.data()?.app;
      if (app === "admin") throw new Error("Não permitido para admins!");
      const collection = matchCollectionName[app] || null;
      if (!collection) throw new Error("Usuário inválido!");
      const docRefUsers = (await userCollection).docs[0]?.ref || null;
      if (docRefUsers) await docRefUsers.update({ email: newEmail });

      const collectionRef =
        matchRef(collection) &&
        matchRef(collection).where("email", "==", oldOmail).limit(1).get();
      const docRefCollection = (await collectionRef).docs[0]?.ref || null;
      if (docRefCollection) await docRefCollection.update({ email: newEmail });

      const resendConfirmEmailData: Request.ConfirmLink = {
        email: newEmail,
        type: "Email"
      };
      await resendConfirmEmail(resendConfirmEmailData);

      if (data.sheetRange && data.sheetId) {
        const requestSheetData: Request.SheetData = {
          apiResource: "values",
          apiMethod: "update",
          range: data.sheetRange,
          resource: { values: [[newEmail]] },
          spreadsheetId: data.sheetId,
          valueInputOption: "raw"
        };
        await requestSheet(requestSheetData);
      }
      await auth.signOut();
      return { ok: true, msg: 'Email atualizado com sucesso!' };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, []);

  const changePassword = useCallback(async (data: Request.UpdatePassword): Promise<Response.Default> => {
    try {
      if (!auth.currentUser) throw new Error("O usuário deve estar logado para acionar o hook");
      if (!data.oldPassword) throw new Error("A senha atual é necessária para validação!");
      if (!data.newPassword) throw new Error("O envio da nova senha é obrigatório!");
      try {
        const credential = emailAuth.credential(auth.currentUser.email, data.oldPassword);
        await auth.currentUser.reauthenticateWithCredential(credential);
      } catch (error) {
        throw new Error("Erro de autenticação! Verifique a senha e tente novamente");
      }
      await auth.currentUser.updatePassword(data.newPassword);
      return { ok: true, msg: "Senha atualizada com sucesso!" };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, []);

  const deleteAccount = useCallback(async (data: Request.DeleteAccount): Promise<Response.Default> => {
    try {
      if (!auth.currentUser) throw new Error("O usuário deve estar logado para acionar o hook");
      if (!data.password) throw new Error("A senha atual é necessária para validação!");
      const email = auth.currentUser.email;
      try {
        const credential = emailAuth.credential(email, data.password);
        await auth.currentUser.reauthenticateWithCredential(credential);
      } catch (error) {
        throw new Error("Erro de autenticação! Verifique a senha e tente novamente");
      }
      const userCollection = usersRef.where("email", "==", email).limit(1).get();
      const app = (await userCollection).docs[0]?.data()?.app;
      if (app === "admin") throw new Error("Não permitido para admins!");
      const collection = matchCollectionName[app] || null;
      if (!collection) throw new Error("Usuário inválido!");
      const docRefUsers = (await userCollection).docs[0]?.ref || null;
      if (docRefUsers) await docRefUsers.delete();
      console.log("userCollection: apagou");

      const collectionRef =
        matchRef(collection) &&
        matchRef(collection).where("email", "==", email).limit(1).get();
      const docRefCollection = (await collectionRef).docs[0]?.ref || null;
      if (docRefCollection) await docRefCollection.delete();
      console.log("collectionRef: apagou");

      await auth.currentUser.delete();
      console.log("Deu tudo bom");
      return { ok: true, msg: "Usuário excluído com sucesso!" };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (data: Request.ResetPassword): Promise<Response.Default> => {
    try {
      const { email } = data;
      const userCollection = usersRef.where("email", "==", email).limit(1).get();
      const app = (await userCollection).docs[0]?.data()?.app;
      if (app === "admin") throw new Error("Não permitido para admins!");
      const collection = matchCollectionName[app] || null;
      if (!collection) throw new Error("Usuário inválido!");
      await auth.sendPasswordResetEmail(email);
      return { ok: true, msg: 'Email enviado com sucesso !' };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, []);

  const logIn = useCallback(async (data: Request.LogIn): Promise<void> => {
    try {
      if (auth.currentUser) throw new Error('Usuário deve estar deslogado para acionar o hook!');
      if (!data.email) throw new Error('Email deve ser fornecido para acionar o hook!');
      if (!data.password) throw new Error('Senha deve ser fornecida para autenticação!');
      const { email, password } = data;
      const { user: { emailVerified } } = await auth.signInWithEmailAndPassword(email.toLowerCase(), password);
      if (!emailVerified) {
        await auth.signOut()
        throw { msg: 'Acesse o email de confirmação', customError: true }
      }
    } catch (error) {
      if (error.code) {
        switch (error.code) {
          case 'auth/network-request-failed': throw { msg: 'Sem conexão com a rede', customError: true }
          case 'auth/invalid-email': throw { msg: 'Email inválido', customError: true }
          case 'auth/user-disabled': throw { msg: 'Usuário bloqueado', customError: true }
          case 'auth/user-not-found': throw { msg: 'Usuário não cadastrado', customError: true }
          case 'auth/wrong-password': throw { msg: 'Senha incorreta', customError: true }
          case 'auth/too-many-requests': throw { msg: 'Muitas tentativas. Tente mais tarde', customError: true }
        }
      } else throw error;
    }
  }, []);

  const logOut = useCallback(async () => {
    if (!auth.currentUser) throw new Error('O usuário deve estar logado para usar o hook!');
    await auth.signOut();
  }, []);

  const createUser = useCallback(async (data: Request.CreateUser) => {
    try {
      if (auth.currentUser) throw new Error("O usuário deve estar deslogado para acionar o hook");
      if (!data.email) throw new Error("O email é necessário para acionar o hook");
      if (!data.password) throw new Error("A senha é necessária para acionar o hook");
      if (!data.collection || !collectionList.includes(data.collection)) throw new Error("O app é necessário para acionar o hook");
      if (!data.collectionData) throw new Error("Os dados do usuário são necessários para acionar o hook");
      if (!data.continueUrl) throw new Error("O parâmetro continueUrl é necessário para acionar o hook");
      const { app, email, password, collection, collectionData, idToSearch,
        spreadsheetData, spreadsheetId, spreadsheetRange, continueUrl,
        rangeToSearch, rangeToUpdate, values } = data;
      const lowerEmail = email.toLowerCase();
      // auth
      const { user: { uid } } = await auth.createUserWithEmailAndPassword(lowerEmail, password);
      addRollback({ origin: 'Auth', password });
      // users collection
      await usersRef.add({ email: lowerEmail, app });
      addRollback({ origin: 'Firebase', collection: 'users', field: 'email', identifier: lowerEmail });
      // app collection
      const collectionRef = matchRef(collection);
      await collectionRef.doc(uid).set({ ...collectionData, email: lowerEmail, uid });
      addRollback({ origin: 'Firebase', collection, field: 'uid', identifier: uid });

      if (spreadsheetData && spreadsheetId && spreadsheetRange) {
        const sheetData: Request.SheetData = {
          apiResource: 'values',
          apiMethod: 'append',
          spreadsheetId,
          range: spreadsheetRange,
          resource: { values: [spreadsheetData] },
          valueInputOption: 'user_entered'
        };
        await requestSheet(sheetData);
        addRollback({ origin: 'Sheets', idToSearch: idToSearch || '', rangeToSearch: rangeToSearch || '', rangeToUpdate: rangeToUpdate || '', values: values || [], spreadsheetId: spreadsheetId || '' });
      }
      await auth.currentUser.sendEmailVerification({ url: continueUrl });
      await auth.signOut();
      return { ok: true, msg: 'Usuário cadastrado com sucesso!' };
    } catch (error) {
      execute();
      console.log(error);
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-exists': throw { msg: 'Email utilizado em outra conta', customError: true };
          case 'auth/app-delete': throw { msg: 'Usuário já excluído', customError: true };
          case 'auth/argument-error': throw { msg: 'Argumentos inválidos, tente novamente', customError: true };
          case 'auth/invalid-user-token': throw { msg: 'Token inválido, faça login novamente', customError: true };
          case 'auth/user-not-found': throw { msg: 'Usuário não encontrado', customError: true };
          case 'auth/network-request-failed': throw { msg: 'Falha na conexão, tente novamente', customError: true };
          case 'auth/too-many-requests': throw { msg: 'Muitas requisições, tente novamente mais tarde', customError: true };
          case 'auth/user-disabled': throw { msg: 'Usuário desativado', customError: true };
          case 'auth/invalid-email': throw { msg: 'Email mal formatado', customError: true };
          case 'resource-exhausted': throw { msg: 'Indisponível no momento, tente novamente mais tarde', customError: true };
          default: throw { msg: 'Erro no servidor, tente novamente em alguns minutos', customError: true };
        }
      } else throw error;
    }
  }, []);

  return { resendConfirmEmail, changeEmail, changePassword, deleteAccount, resetPassword, logIn, logOut, createUser };
};
