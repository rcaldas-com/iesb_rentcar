const path = require('path');
const Web3 = require("web3");
const product_abi = require(path.resolve("../dapp/build/contracts/MyContract.json"));
const httpEndpoint = 'http://127.0.0.1:8540';
let contractAddress = require('../utils/parityRequests').contractAddress;
const OPTIONS = {
    defaultBlock: "latest",
    transactionConfirmationBlocks: 1,
    transactionBlockTimeout: 5
};
let web3 = new Web3(httpEndpoint, null, OPTIONS);
let MyContract = new web3.eth.Contract(product_abi.abi, contractAddress);

module.exports = {
    renderProfile: function(req, res) {
        if (!req.session.username) {
            res.redirect('/api/auth');
            res.end();
        } else {
            res.render('profile.html');
        }
    },
    getProfile: async function(req, res) {
        console.log(contractAddress)
        let userAddr = req.session.address;
        console.log("*** Getting um Profile ***", userAddr);
        await MyContract.methods.clienteInfo()
            .call({ from: userAddr, gas: 3000000 })
            .then(function (prof) {
              console.log("prof", prof);
              if (prof === null) {
                  return res.send({ error: false, msg: "profile nao encontrado"});
              }
              profile = {'nome': prof['0'], 'email': prof['1'], 'cpf': +prof['2'], 'endereco': prof['3']};
              console.log("Profile", profile);
              res.send({ error: false, msg: "profile resgatado com sucesso", profile});
              return true;
            })
            .catch(error => {
                console.log("*** getProfile *** error:", error);
                res.send({ error: true, msg: error});
            })
    },
    updateProfile: async (req, res) => {
        if (!req.session.username) {
            res.redirect('/');
            res.end();
        } else {
            let newNome   = req.body.newNome;
            let newEmail   = req.body.newEmail;
            let newCPF  = req.body.newCPF;
            let newEnde = req.body.newEnde;
            let userAddr  = req.session.address;
            let pass      = req.session.password;
            console.log(" updateProfile ", newNome, newEmail, newCPF, newEnde, userAddr);
            try {
                let accountUnlocked = await web3.eth.personal.unlockAccount(userAddr, pass, null)
                console.log("Account unlocked?", accountUnlocked);
                if (accountUnlocked) {
                    await MyContract.methods.updateCliente(userAddr, newNome, newEmail, newCPF, newEnde)
                        .send({ from: userAddr, gas: 3000000 })
                        .then(receipt => {
                            console.log(receipt);
                            return res.send({ 'error': false, 'msg': 'Profile atualizado com sucesso.'});
                        })
                        .catch((err) => {
                            console.log(err);
                            return res.json({ 'error': true, msg: "erro ao se comunicar com o contrato"});
                        })
                }
            } catch (error) {
                return res.send({ 'error': true, 'msg': 'Erro ao desbloquear sua conta.'});
            }
        }
    }
}
