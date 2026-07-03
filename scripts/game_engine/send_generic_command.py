import socket

GAME_IP = "127.0.0.1"
GAME_PORT = 7297

API_IP = "127.0.0.1"
API_PORT = 7298

MESSAGE = '{"type":2, "playerId":42, "X":0, "Y":0}'

print("message:", MESSAGE)

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((API_IP, API_PORT))
sock.sendto(MESSAGE.encode(), (GAME_IP, GAME_PORT))

data, addr = sock.recvfrom(4096)

print("received", str(data))
