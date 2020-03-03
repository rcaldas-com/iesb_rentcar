window.addEventListener("load", function() {
  // restaga formulário
  let form = document.getElementById("formAddVeiculo");
  // adiciona uma função para fazer o login quando o formulário for submetido
  form.addEventListener('submit', addVeiculo);
})

function addVeiculo() {
  // previne a página de ser recarregada
  event.preventDefault();
  $('#load').attr('disabled', 'disabled');
  // resgata os dados do formulário
  let veiculo = $("#veiculo").val();
  let placa = $("#placa").val();
  let preco = $("#preco").val();
  // envia a requisição para o servidor
  $.post("/addVeiculo", {veiculo: veiculo, placa: placa, preco: preco}, function(res) {
    console.log(res);
    // verifica resposta do servidor
    if (!res.error) {
      console.log("*** Views -> js -> veiculos.js -> addVeiculo: ***", res.msg);
      // limpa dados do formulário
      $("#veiculo").val("");
      $("#placa").val("");
      $("#preco").val("");
      // remove atributo disabled do botao
      $('#load').attr('disabled', false);
      alert("Cadastrado com sucesso");
    } else {
      alert("Erro ao cadastrar o veículo." + res.msg);
    }
  });
}
