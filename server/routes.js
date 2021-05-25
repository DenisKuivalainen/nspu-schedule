const { getSchedule, getCode } = require('../schedule/parser');
const Cookies = require('cookies');

module.exports.routeSchedule = async (req, res) => {
    const cookies = new Cookies(req, res);
    const url = cookies.get('url');
    const {status, timetable} = await getSchedule(url);
    res.status(getCode(status));
    res.send(timetable);
}

module.exports.routeAnyRedirect = (req, res) => {
    res.redirect(301, `https://schedule.nspu.ru/${req?._parsedOriginalUrl?.path}`);
}

module.exports.routeRoot = (req, res) => {
    //res.send('Here should be WEB page...');
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
}