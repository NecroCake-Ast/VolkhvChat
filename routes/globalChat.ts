import express = require('express');

const globalRouter = express.Router();

/*
 * \brief Подключение к глобальному чату
 */
globalRouter.get("/", async function (req: express.Request, res: express.Response) {
    try {
        res.sendFile(__dirname, "/frontend/global.html");
    } catch (e) {
        console.error(e);
        res.send(false);
    }
});

export default globalRouter;
