const { getSchedule, getCode } = require('../schedule/parser');
const Cookies = require('cookies');

module.exports = async (req, res) => {
    const cookies = new Cookies(req, res);
    const url = cookies.get('url');
    const {status, timetable} = await getSchedule(url);
    res.status(getCode(status));
    res.send(timetable);
}