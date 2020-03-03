window.addEventListener('load', () => {
    $.post("/getProfile", function(res) {
      console.log(res);
      if (!res.error) {
          console.log("*** getProfile ***", res.profile);
          $("#nome").val(res.profile.nome);
          $("#email").val(res.profile.email);
          $("#cpf").val(res.profile.cpf);
          $("#endereco").val(res.profile.endereco);
      } else {
          alert("Erro ao buscar profile." + res.msg);
      }
    });
    let form = document.getElementById("editProfile");
    form.addEventListener('submit', updateProfile);
});

function updateProfile(event) {
  event.preventDefault();
  $('#load').attr('disabled', 'disabled');
  let newNome = $("#nome").val();
  let newEmail = $("#email").val();
  let newCPF = $("#cpf").val();
  let newEnde = $("#endereco").val();
  $.post("/updateProfile", {newNome, newEmail, newCPF, newEnde}, function(res) {
    console.log(res);
    if (!res.error) {
      $('#load').attr('disabled', false);
      alert("Profile atualizado com sucesso");
      // window.location.href = "/profile";
    } else {
      alert("Erro ao atualizar Profile." + res.msg);
    }
  // window.location.href = "/";
  });
}
