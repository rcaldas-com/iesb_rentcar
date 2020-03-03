window.addEventListener("load", function() {
    // restaga formulário de cadastro de etapas
    let form = document.getElementById("addStage");
    // função para enviar dados ao servidor quando formulário for submetido
    form.addEventListener('submit', addStage);
    getVeiculos();
})

function addStage(event) {
    event.preventDefault();
    event.preventDefault();
    console.log("*** Adding to Stage ***");
    // bloqueia botão
    $('#load').attr('disabled', 'disabled');
    // pega o valor dos checkboxes selecionados e adiciona no array veiculosIds
    let veiculosIds = [];
    $.each($("input[name='veiculo']:checked"), function() {
        let id = $(this).val();
        veiculosIds.push(parseInt(id, 10));
    });
    // verifica se há checkboxes selecionados
    if (veiculosIds.length === 0) {
        alert("Nenhum veiculo selecionado");
        $('#load').attr('disabled', false);
        return;
    }
    // resgata a descrição da etapa
    let stageDesc = $("#desc").val();
    // reset os checkboxes
    $('input[type=checkbox]').prop('checked', false);
    console.log(veiculosIds, stageDesc);
    // dados para enviar ao servidor
    const data = { veiculosIds, stageDesc }
    $.post("/addStage", data, function(res) {
        console.log(res);
        if (!res.error) {
            alert(res.msg);
            $("#desc").val("");
            $('#load').attr('disabled', false);
        } else {
            alert(res.msg);
            $('#load').attr('disabled', false);
        }
    })
}

function getVeiculos() {
    console.log("*** Getting Veiculos ***");
    $.get("/listaVeiculos", function(res) {
        if (!res.error) {
          console.log("*** getVeiuculos ***", res.msg);
          if (res.msg === "no veiculos yet") {
            return;
          }
          let veiculos = res.veiculos;
          // adiciona veiculos na tabela
          for (let i = 0; i < veiculos.length; i++) {
            let newRow = $("<tr>");
            let cols = "";

            cols += `<td width="60">
            <div class="form-check">
            <input class="form-check-input" type="checkbox" name="veiculo" value="${veiculos[i].id}" id="addToStageCheck">
            </div>
            </td>`;
            cols += `<td> ${veiculos[i].desc} </td>`;
            cols += `<td> ${veiculos[i].placa} </td>`;
            cols += `<td> ${veiculos[i].preco} </td>`;

            newRow.append(cols);
            $("#veiculos-table").append(newRow);
          }
        } else {
            alert("Erro ao resgatar veiculos do servidor." + res.msg);
        }
    })
}
