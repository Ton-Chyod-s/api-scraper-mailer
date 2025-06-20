document.addEventListener('DOMContentLoaded', () => {
  console.log('JS carregado com sucesso!');
  const botao = document.getElementById('meu-botao');
  if (botao) {
    botao.addEventListener('click', () => {
      alert('Você clicou no botão!');
    });
  }
});
