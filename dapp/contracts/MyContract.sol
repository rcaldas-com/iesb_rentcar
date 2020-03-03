pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract MyContract {
  // evento para notificar o cliente que a conta foi atualizada
  event userRegisted(address _addr, string newEmail);
  // que o produto foi registrado
  event veiculoRegistered(uint id);
  // que a Etapa foi registrada
  event StageRegistered(uint[]);
  // que um histórico foi registrado
  event historyRegistered(string _msg);
  // que um produto foi atualizado
  event veiculoUpdated(uint _veiculoId, string _msg);
  event clienteUpdated(address _clienteAddr, string _msg);
  // estrutura para manter dados do usuário
  struct User {
    string nome;
    string email;
    uint cpf;
    string endereco;
  }
  // estrutura para registar o estagio de um produto
  struct Stage {
      uint id;
      uint[] veiculos;
      string desc;
      address owner;
  }
  // estrutura para manter dados do veiculo
  struct Veiculo {
      uint id;
      string desc;
      string placa;
      uint price;
      address owner;
  }
  // estrutura para manter dados de um histórico
  struct History {
      uint veiculoId;
      string[] stageDesc;
      string[] dates;
      address veiculoOwner;
  }

  // mapeia um id a um veiculo
  mapping (uint => Veiculo) veiculos;
  uint[] public veiculosIds;
  // mapeia um id a uma etapa
  mapping(uint => Stage) stages;
  uint[] public stagesIds;

  mapping (uint => History) histories;
  uint[] public historiesIds;
  uint[] public veiculosInHistory;
  // mapeia endereço do usuário a sua estrutura
  mapping (address => User) users;
  // state variables
  uint256 private lastId = 0;
  uint256 private stagesId = 0;
  uint256 private historyId = 0;

  // função para cadastrar conta do usuário
  function setUser(address _addr, string memory _email) public {
      User storage user = users[_addr];
      user.email = _email;
      // notifica o cliente através do evento
      emit userRegisted(_addr, "Conta registrada!");
  }
  // função para resgatar dados do usuário
  function getUser(address _addr) public view returns(string memory) {
      User memory user = users[_addr];
      return (user.email);
  }
  // função para cadastrar um veiculo
  function addVeiculo(string memory _desc, string memory _placa, uint _price) public {
    require(bytes(_desc).length >= 1, "Descrição inválida");
    require(bytes(_placa).length >= 1, "Placa inválida");
    require(_price > 0, "Price must be higher than zero");

    veiculos[lastId] = Veiculo(lastId, _desc, _placa, _price, msg.sender);
    veiculosIds.push(lastId);
    lastId++;
    emit veiculoRegistered(lastId);
  }
  function updateVeiculo(uint _veiculoId, string memory _newDesc, string memory _newPlaca, uint _newPrice) public {
      require(bytes(_newDesc).length >= 1, "Invalid name");
      require(_newPrice > 0, "New price must be higher than zero");

      Veiculo storage veic = veiculos[_veiculoId];
      // require(veic.owner == msg.sender, "Only the owner can update the veiculo");
      veic.desc = _newDesc;
      veic.placa = _newPlaca;
      veic.price = _newPrice;
      emit veiculoUpdated(_veiculoId, "Veiculo atualizado com successo");
  }
  function updateCliente(address _clienteAddr, string memory _newNome, string memory _newEmail, uint _newCpf, string memory _newEndereco) public {
      User storage cliente = users[_clienteAddr];
//      require(veic.owner == msg.sender, "Only the owner can update the veiculo");
      cliente.nome = _newNome;
      cliente.email = _newEmail;
      cliente.cpf = _newCpf;
      cliente.endereco = _newEndereco;
      emit clienteUpdated(_clienteAddr, "Cliente atualizado com successo");
  }
  // função para resgatar info de um veiculo
  function veiculoInfo(uint _id) public view returns(uint, string memory, string memory, address, uint) {
    require(_id <= lastId, "Veiculo does not exist");
    Veiculo memory veiculo = veiculos[_id];
    return (
      veiculo.id,
      veiculo.desc,
      veiculo.placa,
      veiculos[_id].owner,
      veiculo.price
    );
  }
  // função para resgatar info de um cliente
  function clienteInfo() public view returns(string memory, string memory, uint, string memory) {
    User memory cliente = users[msg.sender];
    return (
      cliente.nome,
      cliente.email,
      cliente.cpf,
      cliente.endereco
    );
  }
  // função que retorna todos os produtos de um usuário
  function getVeiculos() public view returns(uint[] memory, string[] memory, string[] memory, address[] memory, uint[] memory) {
    uint[] memory ids = veiculosIds;
    uint[] memory idsVeiculos = new uint[](ids.length);
    string[] memory descs = new string[](ids.length);
    string[] memory placas = new string[](ids.length);
    address[] memory owners = new address[](ids.length);
    uint[] memory prices = new uint[](ids.length);
    for (uint i = 0; i < ids.length; i++) {
      (idsVeiculos[i], descs[i], placas[i], owners[i], prices[i]) = veiculoInfo(i);
    }
    return (idsVeiculos, descs, placas, owners, prices);
  }

  function isVeiculoInHistory(uint _id) public view returns (bool) {
      for (uint i = 0; i < veiculosInHistory.length; i++) {
          if (veiculosInHistory[i] == _id)
              return true;
      }
      return false;
  }

  // função para adicionar o histórico de um produto
  function addNewHistory(uint _veiculoId, string[] memory _stageDesc, string[] memory _dates) public {
      require(_veiculoId >= 0, "invalid veiculoId");
      if (!isVeiculoInHistory(_veiculoId)) {
          histories[historyId] = History(_veiculoId, _stageDesc, _dates, msg.sender);
          historiesIds.push(historyId);
          veiculosInHistory.push(_veiculoId);
          historyId++;
          emit historyRegistered("History saved!");
      } else {
          bool added = addToHistory(_veiculoId, _stageDesc, _dates);
          if (added) {
              emit historyRegistered("History saved!");
          }
      }
  }

  function addToHistory(uint _veiculoId, string[] memory _stageDesc, string[] memory _dates) public returns (bool) {
      uint size = historiesIds.length;
      for (uint i = 0; i < size; i++) {
          if (histories[i].veiculoId == _veiculoId) {
              History storage his = histories[i];
              his.stageDesc.push(_stageDesc[0]);
              his.dates.push(_dates[0]);
              return true;
          }
      }
      return false;
  }

  function HistoryInfo(uint _id) public view returns (uint, string[] memory, string[] memory, address) {
      require(_id <= historyId, "History does not exist");

      History memory his = histories[_id];
      return (
          his.veiculoId,
          his.stageDesc,
          his.dates,
          his.veiculoOwner
      );
  }

  function getHistories() public view returns (string[] memory, string[][] memory, string[][] memory, address[] memory) {
      uint[] memory ids = historiesIds;

      uint[] memory veicsIds = new uint[](ids.length);
      string[] memory veiculosNames = new string[](ids.length);
      string[][] memory stageDesc = new string[][](ids.length);
      string[][] memory dates = new string[][](ids.length);
      address[] memory addrs = new address[](ids.length);

      for (uint i = 0; i < ids.length; i++) {
          (veicsIds[i], stageDesc[i], dates[i], addrs[i]) = HistoryInfo(i);
          (, veiculosNames[i], , ,) = veiculoInfo(veicsIds[i]);
      }
      return (veiculosNames, stageDesc, dates, addrs);
  }

  // função para adicionar produtos à um estágio
  function addToStage(uint[] memory _veiculosIds, string memory _stageDesc) public {
    require(bytes(_stageDesc).length >= 1, "Name invalid");
//    require(_veiculosIds.length > 0, "No itens selecteds");
    stages[stagesId] = Stage(stagesId, _veiculosIds, _stageDesc, msg.sender);
    stagesIds.push(stagesId);
    stagesId++;
    emit StageRegistered(_veiculosIds);
  }

  // função para resgatar info de um estágio
  function stageInfo(uint _id) public view returns (uint, uint[] memory, string memory, address) {
      require(_id <= stagesId, "Veiculo stage does not exist");
      Stage memory stage = stages[_id];
      return (stage.id, stage.veiculos, stage.desc, stage.owner);
  }

  // função que retorna todos os estagios
  function getStages() public view returns (uint[] memory, uint[][] memory, string[] memory, address[] memory) {
      uint[] memory ids = stagesIds;
      uint[] memory idsStages = new uint[](ids.length);
      uint[][] memory veics = new uint[][](ids.length);
      string[] memory veics_desc = new string[](ids.length);
      address[] memory owners = new address[](ids.length);
      for(uint i = 0; i < ids.length; i++) {
          (idsStages[i], veics[i], veics_desc[i], owners[i]) = stageInfo(i);
      }
      return (ids, veics, veics_desc, owners);
  }
}
