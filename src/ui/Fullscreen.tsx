import React, { useState, useEffect } from "react";

import { Box, useStdout } from "ink"

export const Fullscreen: React.FC = (props) => {
    const { stdout } = useStdout()
	const [size, setSize] = useState({
		columns: stdout.columns,
		rows: stdout.rows,
	});

	useEffect(() => {
		function onResize() {
			setSize({
				columns: stdout.columns,
				rows: stdout.rows,
			});
		}

		stdout.on("resize", onResize);
		stdout.write("\x1b[?1049h");
		return () => {
			stdout.off("resize", onResize);
			stdout.write("\x1b[?1049l");
		};
	}, []);

	return (
		<Box alignItems="stretch" width={size.columns} height={size.rows}>
			{props.children}
		</Box>
	);
};