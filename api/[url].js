module.exports = (req, res) => {
    const { query } = req;
    const url = query?.url;
    delete query.url;
    const params = Object.entries(query).map(arr => arr.join("=")).join("&");
    res.redirect(301, `https://schedule.nspu.ru/${url}?${params}`);
  };