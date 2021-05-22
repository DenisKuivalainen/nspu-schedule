const Cookies = require('cookies');
const express = require('express');
const path = require('path');
const { getSchedule } = require('./schedule/parser');

const port = process.env.PORT || 8080;

const app = express();

const getCode = (status) => {
    switch (status) {
        case 2:
            return 200;
        case 3:
            return 500;
        default:
            return 400;
    }
}
 
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));

app.get('/schedule', async (req, res) => {
    const cookies = new Cookies(req, res);
    const url = cookies.get('url');
    const {status, timetable} = await getSchedule(url);
    res.status(getCode(status));
    res.send(timetable);
});

app.get('/:url', function (req, res) {
    res.redirect(301, `https://schedule.nspu.ru/${req?._parsedOriginalUrl?.path}`)
});

app.get('/*', function (req, res) {
    //res.send('Here should be WEB page...');
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port);