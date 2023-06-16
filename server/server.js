const PORT = 8000;
const express = require("express");
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

//Default
app.get('/', (req, res) => {
    res.status(200).json('Resource server running.');
});


app.use('/assets', express.static('assets'));

app.listen(PORT, console.log("Server is listeneing on port: " + PORT));