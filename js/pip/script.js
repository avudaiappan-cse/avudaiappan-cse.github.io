const videoElement = document.getElementById("video");
const button = document.getElementById("button");

// Prompts user to select a media stream and pass to video element and play
async function selectMediaStream() {
  try {
    const mediaStream = await navigator.mediaDevices.getDisplayMedia();
    videoElement.srcObject = mediaStream;
    videoElement.onloadedmetadata = () => {
      videoElement.play();
    };
  } catch (e) {
    alert(e.message);
  }
}

button.addEventListener("click", async () => {
  button.disabled = true;
  //Start PIP Mode
  await videoElement.requestPictureInPicture();
  //Reset Button
  button.disabled = false;
});

//On Load
selectMediaStream();
