const fs = require("fs");
const tokenBase = JSON.parse(fs.readFileSync("cridentials.json")).authtokenbase;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./sql");

const register = async (req, res) => {
    try {
        const { login, pwd } = req.body;
        if (!(login && pwd)) {
            return res.status(400).send({
                result: null,
                error: "all input is required",
            });
        }

        const oldUser = await db.findUserByLogin(login);
        if (oldUser) {
            return res.status(409).send({
                result: null,
                error: "User already exists",
            });
        }

        encryptedPwd = await bcrypt.hash(pwd, 10);
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
            res.status(400).send({
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
        res.status(400).send("invalid cridentials");
    } catch (e) {
        console.error(e);
    }
};

const verifyToken = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) {
        return res.status(403).json({
            result: null,
            error: "authorization required",
        });
    }

    try {
        const decoded = jwt.verify(token, tokenBase);
        req.user = decoded;
    } catch (e) {
        return res.status(401).json({ result: null, error: "authorization required" });
    }

    return next();
};

module.exports = {
    register,
    login,
    verifyToken,
};
