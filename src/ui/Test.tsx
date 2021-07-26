

import { Box, Text, useStdin } from "ink"
import TextInput from "ink-text-input"
import React, { useState } from "react"

export const Test = () => {
    const [query, setQuery] = useState('');
    return <Box>
        <Text color="red">{'> '}</Text>
        <TextInput value={query} onChange={setQuery} />
    </Box>
}