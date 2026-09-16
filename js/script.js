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
const switchCameraButton = document.querySelector("#switch-camera-button");
const socialShareButtons = document.querySelectorAll(".social-share-button");

const openImagePickerButton = document.querySelector("#open-image-picker");
const imagePicker = document.querySelector("#image-picker");

let cameraAtual = "environment";
let inicioX = 0;
let inicioY = 0;

async function iniciarCamera() {
  try {
    const streamAtual = camera.srcObject;

    if (streamAtual) {
      streamAtual.getTracks().forEach((track) => track.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: cameraAtual
      },
      audio: false
    });

    camera.srcObject = stream;
  } catch (erro) {
    console.error("Não foi possível acessar a câmera:", erro);
  }
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
  capturedPhoto.src = foto;
  previewBackground.src = foto;
  sharePhoto.src = foto;
  shareBackground.src = foto;

  mostrarPrevia();
}

function armazenarFoto() {
  if (!capturedPhoto.src) {
    alert("Capture ou selecione uma foto antes de armazenar.");
    return;
  }

  const linkDownload = document.createElement("a");

  linkDownload.href = capturedPhoto.src;
  linkDownload.download = "smartcapture-foto.png";

  linkDownload.click();
}

async function compartilharFoto() {
  if (!capturedPhoto.src) {
    alert("Capture ou selecione uma foto antes de compartilhar.");
    return;
  }

  if (!navigator.share) {
    alert("Seu navegador não oferece compartilhamento nativo.");
    return;
  }

  try {
    const resposta = await fetch(capturedPhoto.src);
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

captureButton.addEventListener("click", () => {
  if (!camera.videoWidth) {
    alert("A câmera ainda não está disponível.");
    return;
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

  prepararFoto(fotoCapturada);
});

openImagePickerButton.addEventListener("click", () => {
  imagePicker.click();
});

imagePicker.addEventListener("change", () => {
  const arquivoSelecionado = imagePicker.files[0];

  if (!arquivoSelecionado) {
    return;
  }

  const leitorArquivo = new FileReader();

  leitorArquivo.addEventListener("load", () => {
    prepararFoto(leitorArquivo.result);
  });

  leitorArquivo.readAsDataURL(arquivoSelecionado);
});

deletePhotoButton.addEventListener("click", () => {
  capturedPhoto.src = "";
  previewBackground.src = "";
  sharePhoto.src = "";
  shareBackground.src = "";
  imagePicker.value = "";

  mostrarCamera();
});

storeButton.addEventListener("click", armazenarFoto);

shareButton.addEventListener("click", mostrarCompartilhamento);

nativeShareButton.addEventListener("click", compartilharFoto);

socialShareButtons.forEach((button) => {
  button.addEventListener("click", compartilharFoto);
});

switchCameraButton.addEventListener("click", () => {
  if (cameraAtual === "environment") {
    cameraAtual = "user";
  } else {
    cameraAtual = "environment";
  }

  iniciarCamera();
});

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
    deletePhotoButton.click();
    return;
  }

  if (distanciaX > 0) {
    storeButton.click();
  }
});

iniciarCamera();