config = require('./config')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./sql");
const handlers = require('./handlers')

const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!(username && password)) {
            return res.status(200).send({
                result: null,
                error: "all input is required",
            });
        }

        const oldUser = await db.findUserByUsername(username);
        if (oldUser) {
            return res.status(200).send({
                result: null,
                error: "User already exists",
            });
        }

        let encryptedPwd = await bcrypt.hash(pwd, 10);
        const user = await db.createUser(username, encryptedPwd);
        const token = jwt.sign({ user_id: username }, config.token, { expiresIn: "7d" });

        user.token = token;
        delete user.password;

        res.status(201).json(user);
    } catch (e) {
        console.error(e);
    }
};

const authByPassword = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!(username && password)) {
            res.status(200).send({
                result: null,
                error: "all input is required",
            });
            return;
        }
        const user = await db.findUserByUsername(username);

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ user_id: username }, config.token, {
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
        const decoded = jwt.verify(token, config.token);
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

module.exports = {
    register,
    authByPassword,
    verifyToken,
    newPaste,
    pasteList,
    updatePaste,
    deletePaste,
    sendpaste,
};
