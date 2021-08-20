const codes = require("../codes.json");

module.exports = async (req, res) => {
    const code = req?.query?.code;
    res.status(200);
    if (!code) {res.send({status: false}); return;}
    let data = codes[code];
    if (!data || !(data.text || data.img)) {res.send({status: false}); return;}
    res.send({status: true, ...data})
}