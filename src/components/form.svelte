<script lang="ts">
  let originalCanvas: HTMLCanvasElement;
  let filteredCanvas: HTMLCanvasElement;

  let image: HTMLImageElement | null = $state(null);
  let filterType: number = $state(1);
  let pointillism = $state(false);

  let isLoading: boolean = $state(false);
  let isProcessing: boolean = $state(false);
  let isProcessingFinished: boolean = $state(false);

  function drawOnCanvas(canvas: HTMLCanvasElement, img: HTMLImageElement): void {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = img.width;
    canvas.height = img.height;
    const aspect = img.width / img.height;
    const maxW = window.innerWidth * 0.4;
    const maxH = window.innerHeight * 0.6;
    let displayW = maxW;
    let displayH = displayW / aspect;
    if (displayH > maxH) {
      displayH = maxH;
      displayW = displayH * aspect;
    }
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;

    ctx!.drawImage(img, 0, 0);
  }

  async function loadImage(event: Event): Promise<void> {
    const element = event.target as HTMLInputElement;
    if (!element.files?.length) return;
    const { 0: file } = element.files;

    isLoading = true;
    await new Promise<void>((resolve, reject) => {
      image = new Image();
      image.onload = () => {
        [originalCanvas, filteredCanvas].forEach((canvas) => drawOnCanvas(canvas, image!));
        resolve();
      };
      image.onerror = reject;
      image.src = URL.createObjectURL(file);
    });

    isLoading = false;
  }

  function applyFilter(): void {
    if (!image) return;

    isProcessingFinished = false;
    isProcessing = true;

    const ctx = filteredCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(image, 0, 0, filteredCanvas.width, filteredCanvas.height);

    const { width, height } = filteredCanvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;

    const punt = pointillism ? 0.7 : 1.0;
    const probably = (chance: number) => Math.random() < chance;

    const [palette1, palette2, palette3] = filterType === 1 ? [[0, 0, 0], [102, 0, 31], [137, 0, 146]] : [[0, 0, 0], [92, 36, 60], [203, 43, 43]];
    const [thresh1, thresh2] = filterType === 1 ? [120, 200] : [90, 150];

    let y = 0;

    function processRow(): void {
      if (y >= height) {
        ctx?.putImageData(imageData, 0, 0);
        isProcessing = false;
        isProcessingFinished = true;
        return;
      }

      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        let newColor = palette1;
        if (brightness <= 25) newColor = palette1;
        else if (brightness <= 70) newColor = probably(punt) ? palette1 : palette2;
        else if (brightness < thresh1) newColor = probably(punt) ? palette2 : palette1;
        else if (brightness < thresh2) newColor = palette2;
        else if (brightness < 230) newColor = probably(punt) ? palette3 : palette2;
        else newColor = palette3;
        [data[i], data[i + 1], data[i + 2]] = newColor;
      }
      ctx?.putImageData(imageData, 0, 0);
      y++;
      requestAnimationFrame(processRow);
    }
    processRow();
  }

  function saveImage(): void {
    const link = window.document.createElement("a");
    link.href = filteredCanvas.toDataURL("image/png");
    link.download = "filtered-image.png";
    link.click();
    link.remove();
  }
</script>

<input type="file" accept="image/*" onchange={loadImage}>

<div class="canvas-container" hidden={isLoading || !image}>
  <canvas bind:this={originalCanvas}></canvas>
  <canvas bind:this={filteredCanvas}></canvas>
</div>

<div class="controls" hidden={!image}>
  <div>
    <label>
      <input type="radio" name="filter" bind:group={filterType} value={1} checked>
      Milk Inside a Bag of Milk
    </label>
    <label>
      <input type="radio" name="filter" bind:group={filterType} value={2}>
      Milk Outside a Bag of Milk
    </label>
  </div>
  <div>
    <label>
      <input type="checkbox" bind:checked={pointillism}>
      Pointillism effect
    </label>
  </div>
  <div class="buttons">
    <button disabled={isProcessing} onclick={applyFilter}>Apply Filter</button>
    <button disabled={isProcessing || !isProcessingFinished} onclick={saveImage}>Save Image</button>
  </div>
</div>

<style>
.canvas-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center
}
canvas {
  max-width: 80vw;
  max-height: 60vh;
  margin: 1rem;
  border: 1px solid #ccc;
}
.controls {
  margin-top: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
.buttons {
  display: grid;
  gap: 0.5rem;
  justify-content: start;
}
</style>
