import socket

UDP_IP = "127.0.0.1"
UDP_PORT = 8888
HEX = "00000000000000000000000000000000"

def move(x:int, y:int) -> str:
	x = x % 4294967296;
	y = y % 4294967296;
	ret = ""
	padding = 2
	for i in range(0, 32, 8):
		val=(x>>i)%256
		ret += f"{val:0{padding}x}"
	for i in range(0, 32, 8):
		val=(y>>i)%256
		ret += f"{val:0{padding}x}"
	return ret

# format defined in server_io.md (on discord), written in hexadecimal
#HEX = "010F0000000000000000000000000000" # join
#HEX = "030F" + move(0, 0) + "000000000000" # move
#HEX = "020F0000000000000000000000000000" # leave



assert(len(HEX)%2 == 0)
MESSAGE = bytes([int(HEX[i:i+2], 16) for i in range(0, len(HEX), 2)])

print("UDP target IP:", UDP_IP)
print("UDP target port:", UDP_PORT)
print("message:", MESSAGE)

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # UDP
sock.sendto(MESSAGE, (UDP_IP, UDP_PORT))