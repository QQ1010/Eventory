import { buildApp } from "./app.js";

const port = 3000;

async function start() {
    try {
        const app = await buildApp();
        await app.listen(port, () => {
            console.log(`Server listening at http://localhost:${port}`);
        })
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

start();