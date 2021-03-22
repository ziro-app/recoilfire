import React, { useCallback } from "react";
import { useAuth, useFirestore } from "reactfire";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { fbAuth } from '../../../Firebase/index';
import { Request, Response } from "./types";

const matchCollectionName = {
  affiliate: "affiliates",
  catalog: "storeowners",
  operation: "team",
  suppliers: "suppliers"
};

export const useAccountManagement = (): {
  resendConfirmEmail: (data: Request.ConfirmLink) => Promise<Response.Default>;
  changeEmail: (data: Request.ChangeEmail) => Promise<Response.Default>;
  changePassword: (data: Request.UpdatePassword) => Promise<Response.Default>;
  deleteAccount: (data: Request.DeleteAccount) => Promise<Response.Default>;
} => {
  const auth = useAuth();
  const usersRef = useFirestore().collection("users");
  const collaboratorsRef = useFirestore().collection("collaborators");
  const storeownersRef = useFirestore().collection("storeowners");
  const teamRef = useFirestore().collection("team");

  const matchRef = (collection) => {
    if (collection === "collaborators") return collaboratorsRef;
    if (collection === "storeowners") return storeownersRef;
    if (collection === "team") return teamRef;
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

  const updateSheet = useCallback(async (data: Request.UpdateSheetData): Promise<Response.Default> => {
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
        const credential = fbAuth.EmailAuthProvider.credential(oldOmail, data.password);
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

      // TODO -> Atualizar nas planilhas
      if (data.sheetRange && data.sheetId) {
        const updateSheetData: Request.UpdateSheetData = {
          apiResource: "values",
          apiMethod: "update",
          range: data.sheetRange,
          resource: { values: [[newEmail]] },
          spreadsheetId: data.sheetId,
          valueInputOption: "raw"
        };
        console.log(updateSheetData);
        await updateSheet(updateSheetData);
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
        const credential = fbAuth.EmailAuthProvider.credential(
          auth.currentUser.email,
          data.oldPassword
        );
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
        const credential = fbAuth.EmailAuthProvider.credential(email, data.password);
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

  return { resendConfirmEmail, changeEmail, changePassword, deleteAccount };
};
