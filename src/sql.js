const sqlite3 = require("sqlite3").verbose();
const utils = require("./utils");
class DB {
    constructor(dbFilePath = __dirname + "/../sqlite.db") {
        this.connectionState = false;
        this.db = new sqlite3.Database(dbFilePath, (err) => {
            if (err) console.error(err);
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

    async getRandomPasta(excludeList = null) {
        return new Promise(resolve => {
            let sql = `select * from paste`;

            
            if (excludeList) {
                let excludeListString = ''
                excludeList.forEach(item => {
                    excludeListString +=`${item}, `
                })
                excludeListString = excludeListString.slice(0, -2); 
                sql += ' '
                sql += `where id not in (${excludeListString})`
            }

            sql +=  ` order by RANDOM() limit 1`
            this.db.all(sql, (err, data) => {
                if (err) resolve([err, null]);
                else resolve([null, data[0]]);
            });
        });
    }

    async getPastaById(id) {
        return new Promise(resolve => {
            let sql = `select * from paste where id = ?`
            this.db.all(sql, id, (err, data) => {
                if (err) resolve([err, null])
                else resolve([null, data[0]])
            })
        })
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

    findUserByUsername = async(username) => {
        return new Promise(async(resolve) => {
            let sql = `select * from user where username = (?)`
            this.db.all(sql, username, (err, data) => {
                if (err) resolve(null)
                else resolve(data[0])
            })
        })
    }

    createUser = async(username, hashedPwd) => {
        return new Promise(async(resolve) => {
            let sql = `insert into user(username, password) values((?), (?))`
            this.db.run(sql, [username, hashedPwd], err => {
                if (err) resolve(err)
                else resolve({username})
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

    getTimerList = async() => {
        return new Promise( async(resolve) => {
            let sql = `select id, channel, pasta from timers`
            this.db.all(sql, (err, data) => {
                if (err) resolve(null)
                else resolve(data)
            })
        })
    }

    getTimerByChannel = async(channel) => {
        return new Promise( async(resolve) => {
            let sql = `select * from timers where channel = (?)`
            this.db.all(sql, channel, (err, data) => {
                if (err) resolve(null)
                else resolve(data)
            })
        })
    }

    addTimerByChannel = async(channel, pasta) =>  {
        return new Promise(async(resolve) => {
            let sql = `insert into timers(channel, pasta) values((?), (?))`
            this.db.run(sql, [channel, pasta], err => {
                if (err) resolve([err, false])
                else resolve([null, true])
            })
        })
    }

    removeTimerById = async(id) => {
        return new Promise(async(resolve) => {
            let sql = `delete from timers where id = (?)`
            this.db.run(sql, id, err => {
                if (err) resolve([err, false])
                else resolve([null, true])
            })
        })
    }

    updateTimerById = async(id, newtext) => {
        return new Promise(async(resolve) => {
            let sql = `update timers set pasta = (?) where id = (?)`
            this.db.run(sql, [newtext, id], err => {
                if (err) resolve([err, false])
                else resolve([null, true])
            })
        })
    }

    getAllTimerUsers = async() => {
        return new Promise( async(resolve) => {
            let sql = `select * from user where pasteinterval > 0`
            this.db.all(sql, (err, data) => {
                if (err) resolve(null)
                else resolve(data)
            })
        })
    }

    getPeriodForUser = async(username) => {
        return new Promise( async(resolve) => {
            let sql = `select pasteinterval from user where username = (?)`
            this.db.all(sql, username, (err, data) => {
                if (err) resolve(null)
                else resolve(data[0])
            })
        })
    }
}

module.exports = new DB()