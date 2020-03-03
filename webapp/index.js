const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

const veiculos = require("./apis/veiculos.js");
const stages = require("./apis/stages");
const history = require("./apis/history.js");
const users = require("./apis/users.js");

// set default views folder
app.set('views', __dirname + "/views");
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// registra a sessão do usuário
app.use(session({
    secret: 'mysecret',
    saveUninitialized: false,
    resave: false
}));

const authRoutes = require('./apis/routes/auth.js');

app.get('/', (req, res) => {
    res.redirect('/api/auth');
});

// * Auth pages * //
app.use("/api/auth", authRoutes);

// * Veiculos pages * //
app.get("/addVeiculos", veiculos.renderAddVeiculos);
app.get("/getVeiculos", veiculos.renderGetVeiculos);
app.get("/listaVeiculos", veiculos.getVeiculos);
app.post("/addVeiculo", veiculos.addVeiculo);
app.get("/editVeiculo", veiculos.renderEditVeiculo);
app.post("/updateVeiculo", veiculos.updateVeiculo);
app.post("/getVeiculo", veiculos.getVeiculo);

app.get("/profile", users.renderProfile);
app.post("/getProfile", users.getProfile);
app.post("/updateProfile", users.updateProfile);

// * Estágios * //
app.get("/addStage", stages.renderAddStage);
app.post("/addStage", stages.addStage);
app.get("/getStages", stages.renderGetStages);
app.get("/listStages", stages.listStages);

// * History * //
app.get("/addHistory", history.renderAddHistory);
app.post("/addHistory", history.addHistory);
app.get("/getHistory", history.getHistory);
app.get("/listHistory", history.renderGetHistory);


const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log(`App listening on port ${PORT}`);
})
