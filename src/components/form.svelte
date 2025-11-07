<script lang="ts">
  import { FilterType } from "@/constants";
  import type { FilterPayload } from "@/filter.worker";

  let originalCanvas: HTMLCanvasElement;
  let filteredCanvas: HTMLCanvasElement;

  let image: HTMLImageElement | null = $state(null);
  let filterType: FilterType = $state(FilterType.INSIDE);
  let pointillism = $state(false);

  let worker: Worker | null = $state(null);
  let isLoading: boolean = $state(false);
  let isProcessing: boolean = $state(false);
  let processProgress: number = $state(0);
  const isProcessingFinished: boolean = $derived(processProgress === 100);

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

    isProcessing = true;

    const ctx = filteredCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(image, 0, 0, filteredCanvas.width, filteredCanvas.height);
    const imageData = ctx.getImageData(0, 0, filteredCanvas.width, filteredCanvas.height);

    if (worker) worker.terminate();
    worker = new Worker(new URL("../filter.worker.ts", import.meta.url), { type: "module" });

    worker.onmessage = (event: MessageEvent) => {
      const { imageData: newData, progress = 0 } = event.data;
      processProgress = progress;
      if (newData) {
        ctx.putImageData(newData, 0, 0);
        isProcessing = false;
        worker?.terminate();
        worker = null;
      }
    };

    const payload: FilterPayload = { imageData, pointillism, filterType };
    worker.postMessage(payload);
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

<div class="canvas-container" class:hide={isLoading || !image}>
  <canvas bind:this={originalCanvas}></canvas>
  <canvas bind:this={filteredCanvas}></canvas>
</div>

<div class="controls" class:hide={!image}>
  <div>
    <label>
      <input type="radio" name="filter" bind:group={filterType} value={FilterType.INSIDE} checked>
      Milk Inside a Bag of Milk
    </label>
    <label>
      <input type="radio" name="filter" bind:group={filterType} value={FilterType.OUTSIDE}>
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
    <button disabled={isProcessing} onclick={applyFilter}>
      Apply Filter
      <span class:hide={!isProcessing && !isProcessingFinished}>{Math.floor(processProgress)} %</span>
    </button>
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
