export type BackendAction =
	{type: "Backend_RequestStarted", async: true, url: string} |
	{type: "Backend_RequestEnded", async: true, url: string} |
	{type: "Backend_LoginNeeded"} |
	{type: "Backend_Error"};