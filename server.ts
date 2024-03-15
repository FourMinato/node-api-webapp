import http from "http";
import { app } from "./app/app";

const port = process.env.port || 3000;
const server = http.createServer(app);

server.listen(port, () => {
    console.log("=====================");
    console.log("Server is started");
    console.log("=====================");
});