# Bikobom — versão web

App web do Bikobom (Fase 1): cadastro/login, busca de prestadores por categoria e cidade, e perfil. Conecta no mesmo banco de dados Supabase que o app mobile já usa — nada nos dados existentes é alterado.

## 1. Pegar as chaves do Supabase

1. Entre em https://supabase.com/dashboard/project/rifxrmtuciujxukicvkn
2. Se aparecer um botão "Restore project" (projeto pausado), clique nele primeiro.
3. Vá em **Project Settings > API**.
4. Copie:
   - **Project URL**
   - **anon / public key** (nunca use a "service_role", essa é secreta)

## 2. Configurar o projeto

```bash
cp .env.example .env
```

Abra o arquivo `.env` e cole a URL e a chave que você copiou.

## 3. Instalar e rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## 4. Publicar (deixar online com um link)

A forma mais simples pra quem tá começando é o [Vercel](https://vercel.com):

1. Crie uma conta gratuita no Vercel.
2. Suba esse projeto pra um repositório no GitHub (dá pra fazer isso direto pelo GitHub Desktop, sem linha de comando, se preferir).
3. No Vercel, clique em "New Project" e selecione o repositório.
4. Em "Environment Variables", adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os mesmos valores do seu `.env`.
5. Clique em Deploy. Em poucos minutos você tem um link público (ex: `bikobom.vercel.app`).

## O que já funciona

- Cadastro e login (usa o mesmo sistema de autenticação do app mobile)
- Tela inicial com categorias e profissionais em destaque
- Busca por categoria e cidade
- Perfil do usuário logado com opção de sair

## O que vem depois (fases seguintes)

- Chat entre cliente e prestador (a tabela `chats`/`messages` já existe no banco)
- Mural de troca/sobra de material de construção
- Sistema de pontos de recompensa
- Marketplace de anunciantes e carrossel de lojas regionais
