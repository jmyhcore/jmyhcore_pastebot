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

    async archive(channel, author, message, weight = 1000) {
        return new Promise( resolve => {
            let sql = ` insert into paste(channel, author, content, weight) values((?), (?), (?), (?)) `
            this.db.run(sql, [channel, author, message, weight], (err) => {
                if (err) resolve([err, false])
                else resolve([null, true])
            })
        })
    }
}

module.exports = new DB()