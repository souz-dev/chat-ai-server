#!/bin/bash

echo "🚀 Configurando Firebase Cloud Functions para IA..."

# Instalar dependências do projeto principal
echo "📦 Instalando dependências do projeto principal..."
npm install firebase firebase-admin

# Navegar para a pasta functions e instalar dependências
echo "📦 Instalando dependências das Cloud Functions..."
cd functions
npm install

# Configurar a chave da API do Gemini no Firebase
echo "🔧 Configurando variáveis de ambiente do Firebase..."
echo "Execute este comando para configurar a chave da API do Gemini:"
echo "firebase functions:config:set gemini.api_key=\"AIzaSyCx4FND6gwsRZwl3uJ13ORsD34RywkcRTo\""

# Voltar para a pasta raiz
cd ..

echo "✅ Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute: firebase login"
echo "2. Execute: firebase functions:config:set gemini.api_key=\"AIzaSyCx4FND6gwsRZwl3uJ13ORsD34RywkcRTo\""
echo "3. Execute: firebase deploy --only functions"
echo ""
echo "🔧 Para desenvolvimento local:"
echo "1. Execute: firebase emulators:start --only functions"
echo "2. Configure o cliente para usar o emulador em firebase-ai-client.ts"