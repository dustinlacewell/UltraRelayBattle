import React from 'react';

import { Spacer, Text, Box, render } from "ink"
import { Test, Fullscreen } from './ui';
var telnet = require('telnet2');

telnet({ tty: true }, function(client) {
    client.columns = 30;
    client.rows = 20;
    client.setEncoding = () => {};
    client.once("term", () => {
        try {
            render(<Fullscreen>
            <Box flexGrow={1} borderStyle="single" borderColor="blue" flexDirection="column">
                <Text>Check this out!</Text>
                <Spacer />
                <Test />
            </Box>
            <Box borderStyle="single" borderColor="blue" width="20%">
                <Text>Users:</Text>
            </Box>
            </Fullscreen>, { stdin: client, stdout: client });
        } catch (error) {
            throw error;
        }
    });

    client.on("end", function () {
        client.end();
    });
    client.once("close", () => {
        client.destroy();
        client = undefined;
    });

}).listen(8000);