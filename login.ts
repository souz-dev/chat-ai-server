// login.ts
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBrVB2Ukl8tVwT7ANPioc5lThQERC5CvKk",
  authDomain: "letmeask-a154a.firebaseapp.com",
  projectId: "letmeask-a154a",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function main() {
  try {
    console.log("🔐 Tentando fazer login...");
    const cred = await signInWithEmailAndPassword(
      auth,
      "souz.developer@gmail.com",
      "H48625i@"
    );
    const token = await cred.user.getIdToken();
    console.log("✅ Login realizado com sucesso!");
    console.log("📧 Email:", cred.user.email);
    console.log("🔑 ID Token:", token);
  } catch (error: any) {
    console.error("❌ Erro no login:", error.code);

    switch (error.code) {
      case "auth/operation-not-allowed":
        console.log("🔧 Solução: Habilite Email/Password no Firebase Console");
        console.log(
          "   https://console.firebase.google.com/project/letmeask-a154a/authentication/providers"
        );
        break;
      case "auth/user-not-found":
        console.log(
          "👤 Usuário não encontrado. Crie um usuário no Firebase Console"
        );
        break;
      case "auth/wrong-password":
        console.log("🔒 Senha incorreta");
        break;
      default:
        console.log("🐛 Erro:", error.message);
    }
  }
}

main();
