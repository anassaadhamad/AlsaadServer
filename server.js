const mongoose = require("mongoose");
const http = require("http");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require(`${__dirname}/app`);

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connected Successfully.");
  });

// Start the server.
const port = process.env.SERVER_PORT || 3000;
const host = process.env.SERVER_IP;

// app.listen(port, host, () => {
//   console.log(`Server is running at http://${host}:${port}`);
// });

const server = http.createServer(app);

server.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}/`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLER REJECTION 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
