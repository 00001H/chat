import { connection, connect } from "./connect.js";
const search = new URLSearchParams(location.search);
const server = search.get("server");
if (server === null) {
    alert("No server URL specified");
    throw new Error("No server URL specified");
}
connect(server);
connection.binaryType = "arraybuffer";
const hist = document.getElementById("hist");
const msgbox = document.getElementById("msgbox");
function create_message(sender, content) {
    const el = document.createElement("p");
    el.classList.add("message");
    const author_label = document.createElement("label");
    author_label.textContent = `<${sender}>`;
    const content_element = document.createElement("span");
    content_element.textContent = content;
    el.append(author_label, content_element);
    return el;
}
const u8enc = new TextEncoder();
const u8dec = new TextDecoder();
connection.addEventListener("message", (e) => {
    const dv = new DataView(e.data);
    const nsrc = dv.getUint32(0, true);
    if (nsrc === 0) {
        // control command
    }
    else {
        const sender = u8dec.decode(e.data.slice(4, 4 + nsrc));
        const message = u8dec.decode(e.data.slice(4 + nsrc));
        const mel = create_message(sender, message);
        hist.append(mel);
    }
});
msgbox.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        if (msgbox.value.length > 0) {
            connection.send(msgbox.value);
            msgbox.value = "";
        }
    }
});
