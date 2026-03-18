import{betterAuth as a}from"better-auth";import t from"better-sqlite3";const o=a({database:new t("./auth.db"),emailAndPassword:{enabled:!0}});export{o as a};
