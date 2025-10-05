from websockets.asyncio.server import serve,ServerConnection,broadcast
from asyncio import run
i = 0
clients: dict[ServerConnection] = {}
def encode_message(sender: str,content: str):
    senderb = sender.encode()
    return len(senderb).to_bytes(4,"little")+senderb+content.encode()
async def hand(conn: ServerConnection):
    global i
    name = str(i)
    whisper = ""
    i = i+1
    clients[name] = conn
    try:
        async for msg in conn:
            if msg.startswith("/") and len(msg) >= 2:
                match msg[1]:
                    case "?":
                        await conn.send(encode_message("SERVER","""\
Commands:
/?        display this help message
/^alice   change your name to alice
/wbob     all messages from now on are privately sent to bob
/p        go back to public chat"""))
                    case "^":
                        if not any(map(str.isalnum,msg[2:])) or msg[2:] in clients or msg[2:] == "SYSTEM":
                            await conn.send(encode_message("SERVER","Name invalid or in use"))
                        else:
                            del clients[name]
                            name = msg[2:]
                            clients[name] = conn
                    case "w":
                        if msg[2:] in clients:
                            whisper = msg[2:]
                        else:
                            await conn.send(encode_message("SERVER","Can't find the person you want to whisper to"))
                    case "p":
                        whisper = ""
                    case _:
                        await conn.send(encode_message("SERVER","Unknown command. Type /? for help."))
            else:
                if whisper:
                    if (dst := clients.get(whisper,None)) is not None:
                        await dst.send(encode_message(name+" (PM to you)",msg))
                    else:
                        await conn.send(encode_message("SERVER","Can't find the person you want to whisper to"))
                else:
                    broadcast(clients.values(),encode_message(name,msg))
    finally:
        del clients[name]
async def main():
    async with serve(hand,"",8080) as server:
        await server.serve_forever()
run(main())
