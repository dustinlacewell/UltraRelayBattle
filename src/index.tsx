import React from "react"

import { Box } from "ink"
import { TelnetCommand, Telnet, CompatibilityTable, TelnetOption } from "libtelnet-ts";

import { render } from "ink"

import net from "net";

import { Readable, Writable } from 'stream';
import { Test } from "./ui";

const server = net.createServer();

let table: any;

class TelnetStdout extends Writable {
    telnet: Telnet;
    constructor(telnet: Telnet) {
        super();
        this.telnet = telnet
    }

    _write(chunk: any, encoding: any, done: any) {
        this.telnet.send(chunk)
    }
}

class TelnetStdin extends Readable {
    telnet: Telnet;
    buffer: any[];
    isRaw: boolean;
    isTTY: boolean;

    constructor(telnet: Telnet) {
        super();
        this.telnet = telnet
        this.buffer = []
        this.isRaw = true
        this.isTTY = true
    }

    setRawMode(mode: boolean) {
        this.isRaw = mode
    }

    write(chunk: any) {
        console.log(`Adding chunk: ${chunk}`)
        this.buffer.push(chunk)
    }

    _read() {
        process.stdout.write("reading from stdin\n")
        this.push(this.buffer.shift())
    }
}


server.on("connection", (socket) => {

  const telnet = new Telnet(table, 0);
  const stdin = new TelnetStdin(telnet)
  const stdout = new TelnetStdout(telnet)

  // send remote data through telnet
  socket.on("data", (bytes) => {
    telnet.receive(bytes);
  });

  // pipe telnet processed data to stdin
  telnet.on("data", (event) => {
    process.stdout.write(event.buffer)
    stdin.write(event.buffer)
  });

  // telnet sends output through socket
  telnet.on("send", (event) => {
    socket.write(event.buffer);
  });

  // always call telnet.dispose() when a socket closees
  socket.on("close", () => {
    telnet.dispose();
  });

  telnet.negotiate(TelnetCommand.DO, TelnetOption.LINEMODE)
  telnet.negotiate(TelnetCommand.WILL, TelnetOption.ECHO)
  const renderer = render(<Box><Test /></Box>, { stdin: stdin as any, stdout: stdout as any })
  renderer.waitUntilExit().then(() => console.log("Done."))
});

Telnet.ready.then((e) => {
  // must wait for the runtime to initialize the table
  table = CompatibilityTable.create()
    .support(TelnetOption.ECHO, true, false) // local and remote echo
    .finish();
  server.listen(1234);
});