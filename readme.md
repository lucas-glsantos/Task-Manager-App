# **TaskManager With MERN STACK**

> Aplicação disponível em: *[TaskManager](https://web-taskmanager.vercel.app/login)*
---


## **💡 Introdução:**

O que é **MERN**?

MERN stack é um acrônimo que representa um conjunto de tecnologias open-source baseadas em JavaScript usadas para desenvolver aplicações web full-stack

O nome vem das quatro tecnologias principais:

<div align="left">
    <img
        alt="MongoDB"
        title="MongoDB"
        width="50px"
        style="padding-right: 50px;"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original-wordmark.svg" 
    />
    <img 
        alt="Express"
        title="Express"
        width="50px"
        style="padding-right: 50px;"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original-wordmark.svg" 
    />
    <img
        alt="React"
        title="React"
        width="50px"
        style="padding-right: 50px;"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" 
    />
    <img 
        alt="NodeJS"
        title="NodeJS"
        width="50px"
        style="padding-right: 50px;"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original-wordmark.svg" 
    />
</div>

<br/>

A Stack MERN é popular porque permite que desenvolvedores usem apenas uma linguagem **(JavaScript)** em todo o processo de desenvolvimento, desde o front-end passando pelo back-end indo até o banco de dados, o que simplifica o aprendizado, aumenta a produtividade e facilita a manutenção de código.


---


### **💻 Desenvolvimento:** 

O TaskManager está sendo desenvolvido seguindo padrões sólidos de segurança de sistemas e desenvolvimento de software, de uma forma simples.

Abaixo listo algumas regras gerais:

- Frontend: **React**
- Backend: **Node.js** & **Express**
- Database: **MongoDB**

Implementação de operações CRUD completas para gerenciamento de tarefas:

- Criação de tarefas com validação de título e descrição da tarefa.
- Atualização parcial e total de tarefas.
- Exclusão de tarefas.

API REST seguindo boas práticas:

- Uso correto de verbos HTTP.
- Estrutura de endpoints orientada a recursos.
- Respostas em JSON.
- Tratamento centralizado de erros.


Rate Limit implementado para proteção contra abuso de API:

- Limite de 20 requisições por usuário a cada minuto com [Upstash Redis](https://upstash.com/).


Interface de Usuário responsiva desenvolvida com CSS Flexbox/Grid, adaptável para mobile device & desktop


---


### **⚙️ Stack Tecnologicas:**

Tecnologias utilizadas:

- MongoDB (dbms nosql)
- Upstash Redis (serverless database)
- NodeJS (runtime environment)
- React (library frontend)
- Express (framework backend)
- Vite (build tool & development server)
- Tailwind (framework css)


---


## 📜 Licença
MIT License - livre para estudo, modificação e uso comercial.


---


## 👨‍💻 Autor
Projeto desenvolvido por autoria própria, para fins educacionais e de portfólio, com foco em boas práticas de Software Engineering, Arquitetura escalável e MERN Development. Contato-me via *[Bluesky](https://bsky.app/profile/lucasglsantos-dev.bsky.social)*