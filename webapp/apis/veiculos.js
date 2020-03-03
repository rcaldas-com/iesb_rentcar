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
    renderAddVeiculos: function(req, res) {
        // verifica se usuario esta logado
        if (!req.session.username) {
            res.redirect('/api/auth');
            res.end();
        } else {
            res.render('addVeiculos.html');
        }
    },
    renderGetVeiculos: function(req, res) {
        // verifica se usuario esta logado
        if (!req.session.username) {
            res.redirect('/api/auth');
            res.end();
        } else {
            res.render('listaVeiculos.html');
        }
    },
    renderEditVeiculo: function(req, res) {
        // verifica se usuario esta logado
        if (!req.session.username) {
            res.redirect('/api/auth');
            res.end();
        } else {
            res.render('editVeiculo.html');
        }
    },
    getVeiculos: async function(req, res) {
        console.log(contractAddress)
        let userAddr = req.session.address;
        console.log("*** Getting Veiculos ***", userAddr);

        await MyContract.methods.getVeiculos()
            .call({ from: userAddr, gas: 3000000 })
            .then(function (veic) {
                console.log("veic", veic);
                if (veic === null) {
                    return res.send({ error: false, msg: "sem veiculos cadastrados"});
                }
                let veiculos = [];
                for (i = 0; i < veic['0'].length; i++) {
                    veiculos.push({ 'id': +veic['0'][i], 'desc': veic['1'][i], 'placa': veic['2'][i], 'addr': veic['3'][i], 'preco': +veic['4'][i] });
                }
                console.log("Veiculos", veiculos);

                res.send({ error: false, msg: "veiculos resgatados com sucesso", veiculos});
                return true;
            })
            .catch(error => {
                console.log("*** getVeiculos *** error:", error);
                res.send({ error: true, msg: error});
            })
    },
    getVeiculo: async function(req, res) {
        console.log(contractAddress)
        let userAddr = req.session.address;
        console.log("*** Getting um Veiculo ***", req.body.veiculoId);
        await MyContract.methods.veiculoInfo(req.body.veiculoId)
            .call({ from: userAddr, gas: 3000000 })
            .then(function (veic) {
              console.log("veic", veic);
              if (veic === null) {
                  return res.send({ error: false, msg: "veiculo nao encontrado"});
              }
              veiculo = {'id': +veic['0'], 'desc': veic['1'], 'placa': veic['2'], 'addr': veic['3'], 'preco': +veic['4']};
              console.log("Veiculo", veiculo);

              res.send({ error: false, msg: "veiculo resgatado com sucesso", veiculo});
              return true;
            })
            .catch(error => {
                console.log("*** getVeiculos *** error:", error);
                res.send({ error: true, msg: error});
            })
    },
    addVeiculo: async function(req, res) {
      if (!req.session.username) {
        res.redirect('/');
        res.end();
      } else {
          console.log("*** Post AddVeiculo ***");
          console.log(req.body);

          let veiculo = req.body.veiculo;
          let placa   = req.body.placa;
          let preco   = req.body.preco;
          let userAddr = req.session.address;
          let pass     = req.session.password;
          try {
              let accountUnlocked = await web3.eth.personal.unlockAccount(userAddr, pass, null)
              if (accountUnlocked) {
                  await MyContract.methods.addVeiculo(veiculo, placa, preco)
                      .send({ from: userAddr, gas: 3000000 })
                      .then(function(result) {
                          console.log(result);
                          return res.send({ 'error': false, 'msg': 'Cadastrado com sucesso.'});
                      })
                      .catch(function(err) {
                          console.log(err);
                          return res.send({ 'error': true, 'msg': 'Erro ao comunicar com o contrato.'});
                      })
              }
          } catch (err) {
              return res.send({ 'error': true, 'msg': 'Erro ao desbloquear sua conta.'});
          }
      }
    },
    updateVeiculo: async (req, res) => {
        if (!req.session.username) {
            res.redirect('/');
            res.end();
        } else {
            let veiculoId = req.body.veiculoId;
            let newDesc   = req.body.newDesc;
            let newPlaca   = req.body.newPlaca;
            let newPrice  = req.body.newPrice;
            let userAddr  = req.session.address;
            let pass      = req.session.password;
            console.log(" UpdateVeiculo ", userAddr, veiculoId, newDesc, newPlaca, newPrice);
            try {
                let accountUnlocked = await web3.eth.personal.unlockAccount(userAddr, pass, null)
                console.log("Account unlocked?", accountUnlocked);
                if (accountUnlocked) {
                    await MyContract.methods.updateVeiculo(veiculoId, newDesc, newPlaca, newPrice)
                        .send({ from: userAddr, gas: 3000000 })
                        .then(receipt => {
                            console.log(receipt);
                            return res.send({ 'error': false, 'msg': 'Veiculo atualizado com sucesso.'});
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
