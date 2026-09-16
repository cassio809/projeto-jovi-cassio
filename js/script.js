const camera = document.querySelector("#camera");
const photoCanvas = document.querySelector("#photo-canvas");
const captureButton = document.querySelector("#capture-button");

const cameraScreen = document.querySelector("#camera-screen");
const previewScreen = document.querySelector("#preview-screen");
const shareScreen = document.querySelector("#share-screen");

const capturedPhoto = document.querySelector("#captured-photo");
const previewBackground = document.querySelector("#preview-background");
const sharePhoto = document.querySelector("#share-photo");
const shareBackground = document.querySelector("#share-background");

const deletePhotoButton = document.querySelector("#delete-photo");
const storeButton = document.querySelector("#store-button");
const shareButton = document.querySelector("#share-button");
const nativeShareButton = document.querySelector("#native-share-button");
const backToPreviewButton = document.querySelector("#back-to-preview-button");

const switchCameraButton = document.querySelector("#switch-camera-button");
const flashButton = document.querySelector("#flash-button");
const timerButton = document.querySelector("#timer-button");
const ratioButton = document.querySelector("#ratio-button");

const settingsButton = document.querySelector("#settings-button");
const closeSettingsButton = document.querySelector("#close-settings-button");
const settingsPanel = document.querySelector("#settings-panel");
const gridToggle = document.querySelector("#grid-toggle");
const cameraGrid = document.querySelector("#camera-grid");

const openImagePickerButton = document.querySelector("#open-image-picker");
const openPreviewButton = document.querySelector("#open-preview-button");
const imagePicker = document.querySelector("#image-picker");

const socialShareButtons = document.querySelectorAll(".social-share-button");

const focusIndicator = document.querySelector("#focus-indicator");
const captureDim = document.querySelector("#capture-dim");
const countdown = document.querySelector("#countdown");
const toast = document.querySelector("#toast");

let cameraAtual = "environment";
let flashAtivo = false;
let emCaptura = false;
let inicioX = 0;
let inicioY = 0;
let temporizadorIndex = 0;
let proporcaoIndex = 0;
let ultimaFoto = "";

const temporizadores = [0, 3, 5];

const proporcoes = [
  { texto: "4:3", valor: 4 / 3 },
  { texto: "1:1", valor: 1 },
  { texto: "16:9", valor: 16 / 9 }
];

function mostrarMensagem(mensagem) {
  toast.textContent = mensagem;
  toast.classList.add("visivel");

  clearTimeout(mostrarMensagem.tempo);

  mostrarMensagem.tempo = setTimeout(() => {
    toast.classList.remove("visivel");
  }, 2600);
}

function esconderTodasAsTelas() {
  cameraScreen.classList.add("hidden");

  previewScreen.classList.add("hidden");
  previewScreen.classList.remove("flex");

  shareScreen.classList.add("hidden");
  shareScreen.classList.remove("flex");
}

function mostrarCamera() {
  esconderTodasAsTelas();
  cameraScreen.classList.remove("hidden");
}

function mostrarPrevia() {
  esconderTodasAsTelas();

  previewScreen.classList.remove("hidden");
  previewScreen.classList.add("flex");
}

function mostrarCompartilhamento() {
  esconderTodasAsTelas();

  shareScreen.classList.remove("hidden");
  shareScreen.classList.add("flex");
}

function prepararFoto(foto) {
  ultimaFoto = foto;

  capturedPhoto.src = foto;
  previewBackground.src = foto;
  sharePhoto.src = foto;
  shareBackground.src = foto;

  mostrarPrevia();
}

function dispararEscurecimento() {
  captureDim.classList.remove("ativo");

  void captureDim.offsetWidth;

  captureDim.classList.add("ativo");
}

async function iniciarCamera() {
  try {
    const streamAtual = camera.srcObject;

    if (streamAtual) {
      streamAtual.getTracks().forEach((track) => track.stop());
    }

    const proporcaoSelecionada = proporcoes[proporcaoIndex];

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          ideal: cameraAtual
        },
        aspectRatio: {
          ideal: proporcaoSelecionada.valor
        }
      },
      audio: false
    });

    camera.srcObject = stream;
  } catch (erro) {
    console.error("Não foi possível acessar a câmera:", erro);
    mostrarMensagem("Não foi possível iniciar a câmera neste dispositivo.");
  }
}

async function alternarFlash() {
  const stream = camera.srcObject;

  if (!stream) {
    mostrarMensagem("A câmera ainda não está disponível.");
    return;
  }

  const track = stream.getVideoTracks()[0];
  const capacidades = track.getCapabilities ? track.getCapabilities() : {};

  if (!capacidades.torch) {
    mostrarMensagem("Este aparelho não oferece controle de flash no navegador.");
    return;
  }

  try {
    flashAtivo = !flashAtivo;

    await track.applyConstraints({
      advanced: [{ torch: flashAtivo }]
    });

    flashButton.classList.toggle("ativo", flashAtivo);

    mostrarMensagem(
      flashAtivo
        ? "Flash ativado."
        : "Flash desativado."
    );
  } catch (erro) {
    console.error("Não foi possível alterar o flash:", erro);
    mostrarMensagem("Não foi possível alterar o flash.");
  }
}

function alterarTemporizador() {
  temporizadorIndex = (temporizadorIndex + 1) % temporizadores.length;

  const tempoSelecionado = temporizadores[temporizadorIndex];

  timerButton.textContent = `${tempoSelecionado}s`;
  timerButton.classList.toggle("ativo", tempoSelecionado > 0);

  mostrarMensagem(
    tempoSelecionado === 0
      ? "Temporizador desativado."
      : `Temporizador definido para ${tempoSelecionado} segundos.`
  );
}

function alterarProporcao() {
  proporcaoIndex = (proporcaoIndex + 1) % proporcoes.length;

  ratioButton.textContent = proporcoes[proporcaoIndex].texto;

  mostrarMensagem(`Proporção ${proporcoes[proporcaoIndex].texto} selecionada.`);

  iniciarCamera();
}

function abrirConfiguracoes() {
  settingsPanel.classList.remove("hidden");
}

function fecharConfiguracoes() {
  settingsPanel.classList.add("hidden");
}

function atualizarGrade() {
  cameraGrid.classList.toggle("hidden", !gridToggle.checked);

  mostrarMensagem(
    gridToggle.checked
      ? "Grade de enquadramento ativada."
      : "Grade de enquadramento desativada."
  );
}

async function marcarFoco(evento) {
  const limitesCamera = camera.getBoundingClientRect();

  const posicaoX = evento.clientX - limitesCamera.left;
  const posicaoY = evento.clientY - limitesCamera.top;

  focusIndicator.style.left = `${posicaoX}px`;
  focusIndicator.style.top = `${posicaoY}px`;

  focusIndicator.classList.remove("ativo");

  void focusIndicator.offsetWidth;

  focusIndicator.classList.add("ativo");

  const stream = camera.srcObject;

  if (!stream) {
    return;
  }

  const track = stream.getVideoTracks()[0];
  const capacidades = track.getCapabilities ? track.getCapabilities() : {};

  if (capacidades.focusMode && capacidades.focusMode.includes("continuous")) {
    try {
      await track.applyConstraints({
        advanced: [{ focusMode: "continuous" }]
      });
    } catch (erro) {
      console.log("Foco automático não pôde ser ajustado.", erro);
    }
  }

  if (navigator.vibrate) {
    navigator.vibrate(15);
  }
}

function aguardarContagem(tempo) {
  return new Promise((resolver) => {
    let restante = tempo;

    countdown.classList.remove("hidden");
    countdown.classList.add("flex");
    countdown.textContent = restante;

    const intervalo = setInterval(() => {
      restante -= 1;

      if (restante === 0) {
        clearInterval(intervalo);

        countdown.classList.add("hidden");
        countdown.classList.remove("flex");

        resolver();
        return;
      }

      countdown.textContent = restante;
    }, 1000);
  });
}

async function capturarFoto() {
  if (emCaptura) {
    return;
  }

  if (!camera.videoWidth) {
    mostrarMensagem("A câmera ainda não está disponível.");
    return;
  }

  emCaptura = true;

  const tempoSelecionado = temporizadores[temporizadorIndex];

  if (tempoSelecionado > 0) {
    await aguardarContagem(tempoSelecionado);
  }

  photoCanvas.width = camera.videoWidth;
  photoCanvas.height = camera.videoHeight;

  const contexto = photoCanvas.getContext("2d");

  contexto.drawImage(
    camera,
    0,
    0,
    photoCanvas.width,
    photoCanvas.height
  );

  const fotoCapturada = photoCanvas.toDataURL("image/png");

  dispararEscurecimento();

  if (navigator.vibrate) {
    navigator.vibrate(30);
  }

  prepararFoto(fotoCapturada);

  emCaptura = false;
}

function armazenarFoto() {
  if (!ultimaFoto) {
    mostrarMensagem("Capture ou selecione uma foto antes de armazenar.");
    return;
  }

  const linkDownload = document.createElement("a");

  linkDownload.href = ultimaFoto;
  linkDownload.download = "smartcapture-foto.png";

  linkDownload.click();

  mostrarMensagem("Download da foto iniciado.");
}

function excluirFoto() {
  ultimaFoto = "";

  capturedPhoto.src = "";
  previewBackground.src = "";
  sharePhoto.src = "";
  shareBackground.src = "";

  imagePicker.value = "";

  mostrarCamera();
  mostrarMensagem("Foto excluída.");
}

async function compartilharFoto(redeSelecionada = "") {
  if (!ultimaFoto) {
    mostrarMensagem("Capture ou selecione uma foto antes de compartilhar.");
    return;
  }

  if (!navigator.share) {
    mostrarMensagem("Seu navegador não oferece compartilhamento nativo.");
    return;
  }

  if (redeSelecionada) {
    mostrarMensagem(`Escolha ${redeSelecionada} no menu do celular.`);
  }

  try {
    const resposta = await fetch(ultimaFoto);
    const imagemBlob = await resposta.blob();

    const arquivoImagem = new File(
      [imagemBlob],
      "smartcapture-foto.png",
      { type: "image/png" }
    );

    const dadosCompartilhamento = {
      title: "SmartCapture",
      text: "Foto capturada com o SmartCapture",
      files: [arquivoImagem]
    };

    if (navigator.canShare && navigator.canShare(dadosCompartilhamento)) {
      await navigator.share(dadosCompartilhamento);
    } else {
      await navigator.share({
        title: "SmartCapture",
        text: "Foto capturada com o SmartCapture"
      });
    }
  } catch (erro) {
    console.log("Compartilhamento cancelado ou indisponível.", erro);
  }
}

captureButton.addEventListener("click", capturarFoto);

openImagePickerButton.addEventListener("click", () => {
  imagePicker.click();
});

openPreviewButton.addEventListener("click", () => {
  if (!ultimaFoto) {
    mostrarMensagem("Ainda não existe uma foto para visualizar.");
    return;
  }

  mostrarPrevia();
});

imagePicker.addEventListener("change", () => {
  const arquivoSelecionado = imagePicker.files[0];

  if (!arquivoSelecionado) {
    return;
  }

  const leitorArquivo = new FileReader();

  leitorArquivo.addEventListener("load", () => {
    prepararFoto(leitorArquivo.result);
    mostrarMensagem("Foto carregada da galeria.");
  });

  leitorArquivo.readAsDataURL(arquivoSelecionado);
});

deletePhotoButton.addEventListener("click", excluirFoto);

storeButton.addEventListener("click", armazenarFoto);

shareButton.addEventListener("click", mostrarCompartilhamento);

backToPreviewButton.addEventListener("click", mostrarPrevia);

nativeShareButton.addEventListener("click", () => {
  compartilharFoto();
});

socialShareButtons.forEach((button) => {
  button.addEventListener("click", () => {
    compartilharFoto(button.dataset.network);
  });
});

switchCameraButton.addEventListener("click", () => {
  cameraAtual = cameraAtual === "environment" ? "user" : "environment";

  iniciarCamera();

  mostrarMensagem(
    cameraAtual === "environment"
      ? "Câmera traseira selecionada."
      : "Câmera frontal selecionada."
  );
});

flashButton.addEventListener("click", alternarFlash);

timerButton.addEventListener("click", alterarTemporizador);

ratioButton.addEventListener("click", alterarProporcao);

settingsButton.addEventListener("click", abrirConfiguracoes);

closeSettingsButton.addEventListener("click", fecharConfiguracoes);

gridToggle.addEventListener("change", atualizarGrade);

camera.addEventListener("pointerdown", marcarFoco);

capturedPhoto.addEventListener("pointerdown", (evento) => {
  inicioX = evento.clientX;
  inicioY = evento.clientY;
});

capturedPhoto.addEventListener("pointerup", (evento) => {
  const distanciaX = evento.clientX - inicioX;
  const distanciaY = evento.clientY - inicioY;

  const distanciaMinima = 80;

  if (
    Math.abs(distanciaX) < distanciaMinima &&
    Math.abs(distanciaY) < distanciaMinima
  ) {
    return;
  }

  if (Math.abs(distanciaY) > Math.abs(distanciaX) && distanciaY < 0) {
    mostrarCompartilhamento();
    return;
  }

  if (distanciaX < 0) {
    excluirFoto();
    return;
  }

  if (distanciaX > 0) {
    armazenarFoto();
  }
});

iniciarCamera();