// let veiculoId, newDesc, newPlaca, newPrice;

window.addEventListener('load', () => {
    console.log("*** editing veiculo page loaded ");
    let url_string = window.location.href;
    let url = new URL(url_string);
    veiculoId = parseInt(url.searchParams.get("id"), 10);
    console.log("Product ID: ", veiculoId);

    $.post("/getVeiculo", {veiculoId}, function(res) {
      console.log(res);
      if (!res.error) {
          console.log("*** getVeiculo ***", res.veiculo);
          $("#veiculo").val(res.veiculo.desc);
          $("#placa").val(res.veiculo.placa);
          $("#preco").val(res.veiculo.preco);
      } else {
          alert("Erro ao buscar veiculo." + res.msg);
      }
    });
    let form = document.getElementById("editVeiculo");
    form.addEventListener('submit', updateVeiculo);
});

function updateVeiculo(event) {
    event.preventDefault();
    console.log("*** Editing veiculo: ", veiculoId);
    $('#load').attr('disabled', 'disabled');
    // resgata os dados do formulário
    let newDesc = $("#veiculo").val();
    let newPlaca = $("#placa").val();
    let newPrice = $("#preco").val();
    // envia a requisição para o servidor
    $.post("/updateVeiculo", {veiculoId, newDesc, newPlaca, newPrice}, function(res) {
        console.log(res);
        // verifica resposta do servidor
        if (!res.error) {
            console.log("*** editVeiculo.js ***", res.msg);
            $("#veiculo").val("");
            $("#placa").val("");
            $("#preco").val("");
            $('#load').attr('disabled', false);
            alert("Veículo atualizado com sucesso");
            window.location.href = "/getVeiculos";
        } else {
            alert("Erro ao atualizar veiculo." + res.msg);
        }

    });
}
