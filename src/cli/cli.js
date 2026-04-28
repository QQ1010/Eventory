import "dotenv/config";
import { Command } from "commander";
import { validEventTypes } from "../controllers/event.controller.js";
const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:3000";
const program = new Command();
program
    .name("eventory-cli")
    .description("CLI for Eventory")
    .version("1.0.0");
program
    .command("add-event")
    .description("Add a new event")
    .argument("<title>", "event title")
    .requiredOption("--userId <userId>", "user id", "user_1")
    .requiredOption("--type <type>", "event type")
    .requiredOption("--content <content>", "event content")
    .option("--tag <tag>", "event tags", collectRepeatedOption, [])
    .option("--occurredAt <occurredAt>", "occurred at date")
    .action(async (title, options) => {
    try {
        // validate type
        if (!isValidEventType(options.type)) {
            console.error("Invalid event type. Must be one of: learning, note, leetcode, activity.");
            process.exit(1);
        }
        if (!options.userId) {
            console.error("UserId is required.");
            process.exit(1);
        }
        // build request body
        const requestBody = {
            userId: options.userId,
            type: options.type,
            title,
            content: options.content,
            tags: options.tags,
        };
        if (options.occurredAt) {
            requestBody.occurredAt = options.occurredAt;
        }
        // call API
        const response = await fetch(`${apiBaseUrl}/events`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });
        // print result
        const result = await response.json();
        if (!response.ok) {
            console.error(`Failed to add event: ${result.message ?? "Unknown error"}`);
            process.exit(1);
        }
        console.log("Event accepted");
        console.log(`JobId: ${result.jobId}`);
    }
    catch (error) {
        console.error("Failed to connect Eventory API");
        console.error(error);
        process.exit(1);
    }
});
program.parseAsync(process.argv);
function collectRepeatedOption(value, previous) {
    return [...previous, value];
}
function isValidEventType(value) {
    return validEventTypes.includes(value);
}
//# sourceMappingURL=cli.js.map