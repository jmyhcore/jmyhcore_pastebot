const sqlite3 = require("sqlite3").verbose();
const utils = require("./utils");
class DB {
    constructor(dbFilePath = __dirname + "/../sqlite.db") {
        this.connectionState = false;
        this.db = new sqlite3.Database(dbFilePath, (err) => {
            if (err) console.log(err);
            this.connectionState = true;
        });
    }

    async awaitConnection() {
        return new Promise((resolve) => {
            if (this.connectionState) resolve(true);
            let checkInterval = setInterval(() => {
                if (this.connectionState) {
                    clearInterval(checkInterval);
                    resolve(true);
                }
            }, 100);
        });
    }

    async getRandomPasta() {
        return new Promise(resolve => {
            let sql = `select * from paste order by RANDOM() limit 1`;
            this.db.all(sql, (err, data) => {
                if (err) resolve([err, null]);
                else resolve([null, data[0]]);
            });
        });
    }

    async getWeightedPasta() {
        return new Promise(resolve => {
            let sql = `select * from paste`;
            this.db.all(sql, (err, data) => {
                if (err) resolve([err, null]);
                else {
                    let paste = utils.weightedRandomGenerator(data)
                    resolve([null, paste[0]])
                }
            });
        });
    }

    async getPastaList() {
        return new Promise(resolve => {
            let sql = `select * from paste order by id`;
            this.db.all(sql, (err, data) => {
                if (err) resolve([err, null]);
                else resolve([null, data]);
            });
        });
    }

    async archive(channel, author, message, weight) {
        return new Promise( resolve => {
            let sql = ` insert into paste(channel, author, content, weight) values((?), (?), (?), (?)) `
            this.db.run(sql, [channel, author, message, weight], (err) => {
                if (err) resolve([err, false])
                else resolve([null, true])
            })
        })
    }

    findUserByLogin = async(login) => {
        return new Promise(async(resolve) => {
            let sql = `select * from user where login = (?)`
            this.db.all(sql, login, (err, data) => {
                if (err) resolve(null)
                else resolve(data[0])
            })
        })
    }

    createUser = async(login, hashedPwd) => {
        return new Promise(async(resolve) => {
            let sql = `insert into user(login, password) values((?), (?))`
            this.db.run(sql, [login, hashedPwd], err => {
                if (err) resolve(err)
                else resolve({login})
            })
        })
    }

    deletePaste = async(id) => {
        return new Promise(async(resolve) => {
            let sql = `delete from paste where id = (?)`
            this.db.run(sql, id, err => {
                if (err) resolve([err, false])
                else resolve([null, true])
            })
        })
    }

    updatePaste = async(id, content) => {
        return new Promise(async(resolve) => {
            let sql = `update paste set content = (?) where id = (?)`
            this.db.run(sql, [content, id], err => {
                if (err) resolve([err, false])
                else resolve([null, true])
            })
        })
    }
}

module.exports = new DB()