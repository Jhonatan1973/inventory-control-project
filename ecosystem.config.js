module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "./front-angular",
      script: "npx",
      args: "dotenv-cli -e .env.local -- ng serve --host 0.0.0.0 --port 4500",
      watch: false
    },
    {
      name: "backend",
      cwd: "./back-spring/controle-estoque",
      script: "mvn",
      args: "spring-boot:run",
      watch: false
    }
  ]
};
