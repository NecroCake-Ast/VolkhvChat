import * as bodyParser from 'body-parser'
import * as express from 'express';
import * as path from 'path';
import * as console from 'console';

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(async function (req, res, next) {
    console.warn((new Date()).toLocaleString('ru') + ': Unknow address \'' + req.url + '\'');
    res.status(404);
    res.json({error: 'Not found'});
    return;
});

app.listen(1337, async function () {
    console.info('Starting listen an port 1337\n');
});