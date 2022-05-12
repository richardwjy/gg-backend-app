const express = require('express');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const port = 8000;
const routes = require('./routes/routes');

app.use(helmet());
app.use(express.json());
app.use('/v1/api', routes);

app.get('/', (req, res) => {
    const expDate = new Date();
    console.log(typeof Date.now());
    console.log(process.env.REDIS_HOST);
    return res.json({ expDate });
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})