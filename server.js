const express = require('express');
const path = require('path');
const r = require('./server/routes');
const { doge } = require('./server/textPic');


const port = process.env.PORT || 8080;

const app = express();
 
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));

app.get('/schedule', r.routeSchedule);

app.get('/:url', r.routeAnyRedirect);

app.get('/*', r.routeRoot);

app.listen(port, () => {
    doge();
    console.log(`Server is live at \x1b[33mhttp://localhost:${port}\x1b[0m`)
});

//https://medium.com/stackavenue/implementing-background-sync-in-react-39bcde8978bb