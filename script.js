const fileInput = document.getElementById('fileInput');
const originalCanvas = document.getElementById('originalCanvas');
const filteredCanvas = document.getElementById('filteredCanvas');
const pointillismCheckbox = document.getElementById('pointillism');
const applyBtn = document.getElementById('applyFilter');
const saveBtn = document.getElementById('saveImage');
const canvasContainer = document.getElementById('canvasContainer');
const controls = document.querySelector('.controls');

let image = null;

function drawOnCanvas(canvas, img) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  canvas.width = img.width;
  canvas.height = img.height;
  const aspect = img.width / img.height;
  const maxW = window.innerWidth * 0.4;
  const maxH = window.innerHeight * 0.6;
  let displayW = maxW, displayH = displayW / aspect;
  if (displayH > maxH) {
    displayH = maxH;
    displayW = displayH * aspect;
  }
  canvas.style.width = `${displayW}px`;
  canvas.style.height = `${displayH}px`;

  ctx.drawImage(img, 0, 0);
}

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  image = new Image();
  image.onload = () => [originalCanvas, filteredCanvas].forEach((canvas) => drawOnCanvas(canvas, image));
  canvasContainer.hidden = false;
  controls.hidden = false;
  applyBtn.disabled = false;
  image.src = URL.createObjectURL(file);
});

applyBtn.addEventListener('click', () => {
  if (!image) return;

  applyBtn.disabled = true;
  saveBtn.disabled = true;

  const ctx = filteredCanvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, filteredCanvas.width, filteredCanvas.height);

  const width = filteredCanvas.width;
  const height = filteredCanvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const filterType = document.querySelector('input[name="filter"]:checked').value;
  const pointillism = pointillismCheckbox.checked;
  const punt = pointillism ? 0.7 : 1.0;
  const probably = chance => Math.random() < chance;

  const colors = filterType === "1" ?
    [[0, 0, 0], [102, 0, 31], [137, 0, 146]] :
    [[0, 0, 0], [92, 36, 60], [203, 43, 43]];
  const [thresh1, thresh2] = filterType === "1" ? [120, 200] : [90, 150];

  let y = 0;

  function processRow() {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      let newColor = colors[0];
      if (brightness<=25) newColor = colors[0];
      else if (brightness <= 70) newColor = probably(punt) ? colors[0] : colors[1];
      else if (brightness < thresh1) newColor = probably(punt) ? colors[1] : colors[0];
      else if (brightness < thresh2) newColor = colors[1];
      else if (brightness < 230) newColor = probably(punt) ? colors[2] : colors[1];
      else newColor = colors[2];
      [data[i], data[i + 1], data[i + 2]] = newColor;
    }
    ctx.putImageData(imageData, 0, 0)
    y++;
    if (y < height) {
      requestAnimationFrame(processRow);
    } else {
      applyBtn.disabled = false;
      saveBtn.disabled = false;
    }
  }

  processRow();
});

saveBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'filtered-image.png';
  link.href = filteredCanvas.toDataURL('image/png');
  link.click();
});
