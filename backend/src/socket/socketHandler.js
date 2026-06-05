module.exports = (io) => {
	io.on("connection", (socket) => {
		console.log(`socket connected: ${socket.id}`);

		socket.on("disconnect", (reason) => {
			console.log(`socket disconnected: ${socket.id} reason=${reason}`);
		});
	});
};
