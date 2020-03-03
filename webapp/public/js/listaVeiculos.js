window.addEventListener("load", function() {
  // função para carregar produtos
  getVeiculos();
})

function getVeiculos() {
  console.log("*** Getting Veículos ***");
  $.get("/listaVeiculos", function(res) {
    if (!res.error) {
      console.log("*** Listando Veiculos ***", res.msg);
      if (res.msg === "sem veiculos cadastrados") {
        return;
      }
      let veiculos = res.veiculos;
      // adiciona veiculos na tabela
      for (let i = 0; i < veiculos.length; i++) {
        let newRow = $("<tr>");
        let cols = "";
        let desc = veiculos[i].desc;
        let placa = veiculos[i].placa;
        let preco = veiculos[i].preco;
        let owner = veiculos[i].addr;

        cols += `<td> ${desc} </td>`;
        cols += `<td> ${placa} </td>`;
        cols += `<td> ${preco} </td>`;
        cols += `<td> ${owner.substring(3, 20)} </td>`;
        cols += `<td align="center">
        <span style="font-size: 1em; color: Dodgerblue; cursor: pointer; ">
        <a href="/editVeiculo?id=${veiculos[i].id}"><i class="fas fa-edit"></i></a>
        </span>
        </td>`
        newRow.append(cols);
        $("#tabelaVeiculos").append(newRow);
      }
    } else {
      alert("Erro ao resgatar veículos do servidor." + res.msg);
    }
  })
}
