# Projeto Fullstack Dictionary

## Coodesh Challenge - Dictionary

Este projeto é parte do **Coodesh Fullstack Challenge**. O desafio visa avaliar as habilidades como Fullstack Developer. O objetivo é desenvolver um aplicativo que liste palavras em inglês utilizando a **Free Dictionary API**. O aplicativo deve exibir termos em inglês e gerenciar palavras visualizadas, conforme descrito nos casos de uso abaixo.

## Backend

### Configuração e Execução

1. **Instalação das Dependências**:

   - Navegue até o diretório `dic-server` e instale as dependências:
     ```bash
     npm install
     ```

2. **Configuração do `storeWords.js`**:

   - O arquivo `storeWords.js` faz o download do arquivo que contém as palavras do dicionário no GitHub e as envia para o MongoDB.

3. **Configuração das Variáveis de Ambiente**:

   - Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis de ambiente:
     ```env
     MONGO_URI=mongodb+srv://guilhermegomesti1:9diPem91eOvPieb1@cluster0.sh4ko.mongodb.net/myDictionaryDB?retryWrites=true&w=majority
     FILE_URL=https://raw.githubusercontent.com/meetDeveloper/freeDictionaryAPI/master/meta/wordList/english.txt
     JWT_SECRET=e7d3bfa8c9a0a5d2a8eabfa7c4e8a16d9b99b934f10b8e9f2b7fc6ab54697b2e
     ```

4. **Execução do Script**:

   - Para executar o script `storeWords.js` e popular o banco de dados, use:
     ```bash
     node storeWords.js
     ```

5. **Início do Servidor**:
   - No diretório `dic-server`, inicie o servidor com:
     ```bash
     npm start
     ```
   - O servidor estará disponível na porta 5000.

### Endpoints da API

#### Autenticação

- `POST /auth/register`: Registra um novo usuário. Requer `email` e `password` no corpo da requisição.
- `POST /auth/login`: Faz login e retorna um token JWT. Requer `email` e `password` no corpo da requisição.

#### Usuário

- `GET /user/me`: Retorna informações do usuário autenticado.
- `GET /user/me/history`: Retorna o histórico de palavras visualizadas pelo usuário autenticado.
- `GET /user/me/favorites`: Retorna as palavras favoritas do usuário autenticado.

#### Palavras

- `GET /entries/en`: Busca palavras com paginação e filtragem. Parâmetros: `page`, `limit`, `search`, `startLetter`.
- `GET /entries/en/:word`: Obtém informações detalhadas sobre uma palavra. Requer `word` como parâmetro de URL.
- `POST /entries/en/:word/favorite`: Adiciona uma palavra aos favoritos do usuário autenticado. Requer `word` como parâmetro de URL.
- `DELETE /entries/en/:word/unfavorite`: Remove uma palavra dos favoritos do usuário autenticado. Requer `word` como parâmetro de URL.
- `POST /entries/en/:word/viewed`: Adiciona uma palavra ao histórico de visualizações do usuário autenticado. Requer `word` como parâmetro de URL.

## Frontend

### Dependências

- **Tecnologias**: next (14.2.3), react (18), tailwindcss, tanstack/react-query, axios, TypeScript

### Instalação

1. Navegue até o diretório `dic-fullstack` do projeto e instale as dependências usando:

   ```bash
   npm install

   Para iniciar a aplicação, use o comando:
   ```

```bash
   npm start


Estrutura do Projeto
src/app/page.tsx: Página Principal - Contém o componente LoginForm, onde o usuário faz login com email e senha armazenados no MongoDB.

register.tsx: Página de Cadastro de usuários.

dashboard.tsx: Página responsável pela renderização do dicionário com o usuário autenticado.

Services/api
fetchWords: Obtém uma lista de palavras com base na página, na pesquisa e na letra inicial fornecidas.
fetchPhonetics:  Obtém os dados fonéticos de uma palavra específica.
fetchFavorites: Obtém a lista de palavras favoritas do usuário.
fetchViewed: Obtém o histórico de palavras visualizadas pelo usuário.

Componentes
Login: Componente do formulário de login.

MarkAsViewed: Marca uma palavra como visualizada ao enviar uma solicitação para o backend e executa uma função de callback quando a ação é bem-sucedida.

Providers: Fornece um contexto global para o gerenciamento de estado com o QueryClient do React Query, envolto nos componentes filhos.

SearchBar: Exibe uma barra de pesquisa com campo de entrada e botões de pesquisa e retorno, permitindo ao usuário buscar palavras e navegar.

ToggleFavorite: Alterna o status de favorito de uma palavra, enviando uma solicitação para adicionar ou remover a palavra dos favoritos e atualizando a interface de usuário com base no estado.

AlphabetMenu:  Exibe um menu de seleção ou botões para filtrar palavras por letras do alfabeto.
```
