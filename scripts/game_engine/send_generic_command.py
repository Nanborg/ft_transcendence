import socket

GAME_IP = "127.0.0.1"
GAME_PORT = 7297

API_IP = "127.0.0.1"
API_PORT = 7298

#MESSAGE = '{"type":8, "roomId": "room-1234"}'
MESSAGE = '{"type":0}' # ping
#MESSAGE = '{"type":1, "playerId":0}' # join as player 0
#MESSAGE = '{"type":2, "playerId":0}' # leave as player 0
#MESSAGE = '{"type":4, "playerId":0, "typeId":2, "X":0, "Y":20}' # build
#MESSAGE = '{"type":5, "playerId":0, "entityId":4}' # entity

print("message:", MESSAGE)

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((API_IP, API_PORT))
sock.sendto(MESSAGE.encode(), (GAME_IP, GAME_PORT))

while(True):
	data = sock.recv(4096)
	print("received", str(data))
