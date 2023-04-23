const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidv4 } = require("uuid");
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, { debug: true });
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use("/peerjs", peerServer);

app.get("/home", (req, res) => {
	res.send("welcome");
});

app.get("/", (req, res) => {
	res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
	res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
	socket.on("join-room", (roomId, id) => {
		socket.join(roomId);
		socket.broadcast.to(roomId).emit("user-connected", id);
		socket.on("message", (msg) => {
			io.to(roomId).emit("message", msg);
		});
		socket.on("disconnect", () => {
			socket.broadcast.to(roomId).emit("user-disconnected", id);
		});
	});
});
server.listen(3000);
