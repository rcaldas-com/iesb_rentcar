// mantem etapas em memoria para verificar
// se ha um determinado veiculo nela
var stages;
// dados para registrar o historico
var dataToServer = {}

window.addEventListener('load', function() {
    console.log("hello from addToHistory");
    // carrega veiculos e etapas para os selects
    addToSelect();
    // resgata formulário select
    let form = document.getElementById("addToSelect");
    form.addEventListener('submit', compare);
});
// adicionar veiculos e etapas ao select
function addToSelect() {
    // resgata veiculos e adiciona no select
    $.get("/listaVeiculos", function(res) {
        if (!res.error) {
            console.log("*** listaVeiculos ***");
            if (res.msg === "no veiculos yet") {
                return;
            }
            let veiculos = res.veiculos;

            veiculos.forEach(function(veiculo) {
                $('select#veiculoSelect').append($('<option>', {
                    value: veiculo.id,
                    text: veiculo.desc
                }));
            });
        } else {
            alert("Erro ao resgatar veiculos do servidor." + res.msg);
        }
    });
    // resgata etapas e adiciona no select
    $.get("/listStages", function(res) {
        if (!res.error) {
            console.log("*** listStages ***", res.msg);
            stages = res.stages;
            console.table(stages);

            stages.forEach(function(stage) {
                $('select#stageSelect').append($('<option>', {
                    value: stage.stageID,
                    text: stage.stageDesc
                }));
            });
        } else {
            alert("Erro ao resgatar etapas do servidor." + res.msg);
        }
    })
}

// resgata e cria dados para enviar ao servidor
// compara se o veiculo percente a uma etapa
function compare(event) {
    console.log("*** compare: ***");
    // previne recarregamento de pagina
    event.preventDefault();
    $('#load').attr('disabled', 'disabled');
    // resgata dados do formulário
    let veiculo = $("#veiculoSelect option:selected").val();
    let etapa = $("#stageSelect option:selected").val();
    console.log("etapa: ", etapa);
    console.log("veiculo: ", veiculo);

    let isIn = isVeiculoInStage(parseInt(veiculo, 10), etapa);

    // Se o veiculo estiver cadastrado na etapa escolhida
    // entao uma requisao ao servidor e enviada
    // para registrar no historico
    if (isIn) {
        console.log("*** registrando histórico... ***");
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        const hours = date.getHours();
        const min = date.getMinutes();
        const sec = date.getSeconds();
        const dateString = `${day}/${month+1}/${year} - ${hours}:${min}:${sec}`;
        dataToServer.date = dateString;
        console.log(dataToServer);
        addToHistory(dataToServer);
    } else {
        alert("Este veiculo não está registrado nesta etapa");
        $('#load').attr('disabled', false);
    }
}

// verifica se veiculo percente a uma etapa
// retorna true ou false
function isVeiculoInStage(veiculoId, stageId) {
    let veiculos;
    for (let i = 0; i < stages.length; i++) {
        if (stages[i].stageID == stageId) {
            console.log(stages[i].veiculos);
            veiculos = stages[i].veiculos;
            dataToServer.stage = stages[i].stageDesc;
        }
    }
    if (veiculos) {
        for (let j = 0; j < veiculos.length; j++) {
            if (veiculos[j].veiculoID == veiculoId) {
                console.log(veiculos[j])
                dataToServer.veiculoId = veiculos[j].veiculoID;
                return true;
            }
        }
    }
// IGNORANDO SE O VEICULO NAO ESTA NO ESTAGIO
dataToServer.veiculoId = veiculoId;
return true;
//    return false;
}

// envia dados ao servidor
// para registrar um historico
function addToHistory(data) {
    $.post("/addHistory", data, function(res) {
        if (!res.error) {
            $('#load').attr('disabled', false);
            alert(res.msg);
        } else {
            $('#load').attr('disabled', false);
            alert(res.msg);
        }
    })
}
