const path = require('path');
const Web3 = require('web3');

const product_abi = require(path.resolve("../dapp/build/contracts/MyContract.json"));
const httpEndpoint = 'http://localhost:8540';

let contractAddress = require('../utils/parityRequests').contractAddress;

const OPTIONS = {
    defaultBlock: "latest",
    transactionConfirmationBlocks: 1,
    transactionBlockTimeout: 5
};

let web3 = new Web3(httpEndpoint, null, OPTIONS);
let MyContract = new web3.eth.Contract(product_abi.abi, contractAddress);

function renderAddStage(req, res) {
    if (!req.session.username) {
        res.redirect('/api/auth');
        res.end();
    } else {
        res.render('stages.html');
    }
}
function renderGetStages(req, res) {
    if (!req.session.username) {
        res.redirect('/api/auth');
        res.end();
    } else {
        res.render('listaEtapas.html');
    }
}

async function addStage(req, res) {
    console.log("*** addVeiculoToStage ***");
    console.dir(req.body);
    let veiculosIds = [];
    let stageDesc = req.body.stageDesc;
    let userAddr = req.session.address;
    let pass = req.session.password;
    // converter ids dos veiculos para inteiro
    for (let i = 0; i < req.body.veiculosIds.length; i++) {
        let veiculoId = parseInt(req.body.veiculosIds[i], 10);
        veiculosIds.push(veiculoId);
    }
    console.log(userAddr, veiculosIds, stageDesc);
    // unlock account
    await web3.eth.personal.unlockAccount(userAddr, pass, null)
        .then(async result => {
            console.log("Conta desbloqueada: ", result);
            // salvar etapa no contrato
            await MyContract.methods.addToStage(veiculosIds, stageDesc)
                .send({ from: userAddr, gas: 3000000 })
                .then(response => {
                    console.log("etapa registrada com sucesso");
                    console.log(response);
                    res.send({ error: false, msg: "Etapa registrada com sucesso"});
                })
                .catch(err => {
                    console.log("*** ERROR: addVeiculoToStage ***");
                    console.log(err);
                    res.send({ error: true, msg: "Erro ao registrar etapa."});
                })
        })
        .catch(err => {
            console.log("*** ERROR: addVeiculoToStage ***");
            console.log(err);
            res.send({ error: true, msg: "Erro ao desbloquear a conta."});
        })
}

async function listStages(req, res) {
    console.log("*** stages.js -> listStages ***");
    let userAddr = req.session.address;
    console.log(userAddr);
    await MyContract.methods.getStages()
        .call({ from: userAddr, gas: 3000000 })
        .then(async function(stages) {
            if (stages === null) {
                return res.send({ error: false, msg: "no stages yet"});
            }
            let stagesArray = [];
            for (let i = 0; i < stages['0'].length; i++) {
                let stageObj = {}
                stageObj.stageID = +stages['0'][i];
                stageObj.stageDesc = stages['2'][i];
                let veiculosIDs = stages['1'][i];
                let veiculos = await veiculoInfo(veiculosIDs, userAddr);
                stageObj.veiculos = veiculos;
                stagesArray.push(stageObj);
            }
            console.log(stagesArray);
            res.send({error: false, stages: stagesArray});
        })
        .catch(error => {
            console.log("*** ERROR: api -> veiculos -> stages -> listStages -> catch ***", error);
            res.send({error: true, msg: error})
        })
}

async function veiculoInfo(veiculosIds, userAddr) {
    let veiculos = [];
    for (let i = 0; i < veiculosIds.length; i++) {
        let veiculoID = +veiculosIds[i];
        await MyContract.methods.veiculoInfo(veiculoID)
            .call({ from: userAddr, gas: 3000000 })
            .then(res => {
                let veiculoObj = {}
                veiculoObj.veiculoID = +res['0'];
                veiculoObj.veiculo   = res['1'];
                veiculoObj.placa   = res['2'];
                veiculoObj.preco     = +res['4'];
                veiculos.push(veiculoObj);
            })
            .catch(err => {
                console.log("*** ERROR: api -> veiculos -> stages -> veiculoInfo -> catch ***", error);
                return null;
            });
    }
    return veiculos;
}

module.exports = {
    renderAddStage,
    renderGetStages,
    addStage,
    listStages,
    veiculoInfo
}
