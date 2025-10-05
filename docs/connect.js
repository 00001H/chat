const netstat = document.getElementById("netstat");
export let connection;
function update_label() {
    switch (connection.readyState) {
        case connection.CLOSED:
        case connection.CLOSING:
            netstat.textContent = "No connection";
            netstat.setAttribute("data-netstate", "closed");
            break;
        case connection.CONNECTING:
            netstat.textContent = "Connecting...";
            netstat.setAttribute("data-netstate", "connecting");
            break;
        case connection.OPEN:
            netstat.textContent = "Connected";
            netstat.setAttribute("data-netstate", "connected");
            break;
    }
}
export function connect(server) {
    connection = new WebSocket(server);
    connection.addEventListener("close", update_label);
    connection.addEventListener("open", update_label);
    update_label();
}
