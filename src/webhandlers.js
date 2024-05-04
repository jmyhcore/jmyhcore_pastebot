const fs = require("fs");
const tokenBase = JSON.parse(fs.readFileSync("cridentials.json")).authtokenbase;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./sql");
const handlers = require('./handlers')

const register = async (req, res) => {
    try {
        const { login, pwd } = req.body;
        if (!(login && pwd)) {
            return res.status(200).send({
                result: null,
                error: "all input is required",
            });
        }

        const oldUser = await db.findUserByLogin(login);
        if (oldUser) {
            return res.status(200).send({
                result: null,
                error: "User already exists",
            });
        }

        let encryptedPwd = await bcrypt.hash(pwd, 10);
        const user = await db.createUser(login, encryptedPwd);
        const token = jwt.sign({ user_id: login }, tokenBase, { expiresIn: "7d" });

        user.token = token;
        delete user.password;

        res.status(201).json(user);
    } catch (e) {
        console.error(e);
    }
};

const login = async (req, res) => {
    try {
        const { login, pwd } = req.body;

        if (!(login && pwd)) {
            res.status(200).send({
                result: null,
                error: "all input is required",
            });
            return;
        }
        const user = await db.findUserByLogin(login);

        if (user && (await bcrypt.compare(pwd, user.password))) {
            const token = jwt.sign({ user_id: login }, tokenBase, {
                expiresIn: "7d",
            });

            user.token = token;
            delete user.password;

            return res.status(200).json(user);
        }
        res.status(200).send("invalid cridentials");
    } catch (e) {
        console.error(e);
    }
};

const verifyToken = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) {
        return res.status(200).json({
            result: null,
            error: "authorization required",
        });
    }

    try {
        const decoded = jwt.verify(token, tokenBase);
        req.user = decoded;
    } catch (e) {
        return res.status(200).json({ result: null, error: "authorization required" });
    }

    return next();
};

const newPaste = async(req, res) => {
    const {channel, author, content, weight} = req.body
    contextMock = {
        mod: true,
        username: author
    }
    let result = await handlers.archive(channel,contextMock, content, weight)
    res.status(200).json({
        result: result,
        error: null
    })
}

const pasteList = async(req, res) => {
    result = await db.getPastaList()
    if (result[0]) res.status(200).json({result: null, error: result[1]})
    else res.status(200).json({error: null, result: result[1]})
}

const deletePaste = async(req, res) => {
    if (!req.body.id) {
        return res.status(200).json({error: 'invalid id', result: null})
    }
    result = await db.deletePaste(req.body.id)
    if (result[0]) res.status(200).json({result: null, error: result[1]})
    else res.status(200).json({error: null, result: true})
}

const updatePaste = async(req, res) => {
    if (!req.body.content && !req.body.id) {
        return res.status(200).json({error: 'invalid content', result: null})
    }
    result = await db.updatePaste(req.body.id, req.body.content)
    if (result[0]) res.status(200).json({result: null, error: result[1]})
    else res.status(200).json({error: null, result: true})
}

const sendpaste = async (req, res, client) => {
    let {id} = req.body
    if (!id) return res.status(200).json({error: 'wrong id', result: null})

    let [error, result] = await db.getPastaById(id)

    client.say('cptlenivka', result.content)
    res.status(200).json({error: null, result})
}


const timerAdd = async(req, res) => {
    const {channel, pasta} = req.body
    result = await db.addTimerByChannel(channel, pasta)
    if (result[0]) res.status(200).json({result: null, error: result[1]})
    else res.status(200).json({error: null, result: result[1]})
}

const timerList = async(req, res) => {
    if (!req.body.channel) {
        res.status(200).json({result: null, error: 'no channel provided'})
        return
    }
    result = await db.getTimerByChannel(req.body.channel)
    if (result) res.status(200).json({result, error: null})
    else res.status(200).json({error: 'null', result: null})
}

const timerDelete = async(req, res) => {
    if (!req.body.id) {
        return res.status(200).json({error: 'invalid id', result: null})
    }
    result = await db.removeTimerById(req.body.id)
    if (result[0]) res.status(200).json({result: null, error: result[1]})
    else res.status(200).json({error: null, result: true})
}

const timerUpdate = async(req, res) => {
    if (!req.body.pasta && !req.body.id) {
        return res.status(200).json({error: 'invalid content', result: null})
    }
    result = await db.updateTimerById(req.body.id, req.body.pasta)
    if (result[0]) res.status(200).json({result: null, error: result[1]})
    else res.status(200).json({error: null, result: true})
}



module.exports = {
    register,
    login,
    verifyToken,
    newPaste,
    pasteList,
    updatePaste,
    deletePaste,
    sendpaste,
    timerAdd,
    timerUpdate,
    timerDelete,
    timerList
};
