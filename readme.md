# installation
```shell
$ npm install
$ npm run init
$ node app
```

# setting up database
>**sqlite.db** schema:
```sqlite
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE paste (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel varchar(20),
    author varchar(20),
    weight integer default 1000,
    content TEXT
);
CREATE TABLE user (
    id integer primary key AUTOINCREMENT,
    username varchar(20) not NULL,
    password text not NULL,
    pasteeditor integer default 0, pasteinterval integer DEFAULT -1);
CREATE TABLE timers (
    id INTEGER PRIMARY key,
    channel TEXT NOT NULL,
    pasta TEXT NOT NULL
);
```

# simple systemd service setup
> Paste following into  
**/etc/systemd/system/bot.service**  
Possibly, you will need to specify full path to node (*ExecStart*)
```shell
[Unit]
Description=twitch paste bot service

[Service]
User=root
WorkingDirectory=/path/to/project
ExecStart=node app.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```


# common errors
`ENOENT: no such file or directory, open ..... conf.json`  
you either not ran npm start or not created conf.js at project root

`systemd cofigured, but server does not work`  
run `systemctl daemon-reload`, then `systemctl enable ${servicename}`, then `systemctl start ${servicename}`

