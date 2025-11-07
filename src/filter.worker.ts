/* eslint-disable no-restricted-globals */
import { BRIGHTNESS_THRESHOLD, COLOR_PALETTE, FilterType } from "./constants";

export interface FilterPayload {
  imageData: ImageData
  pointillism: boolean
  filterType: FilterType
}
self.onmessage = (event: MessageEvent<FilterPayload>) => {
  const { imageData, pointillism, filterType } = event.data;
  const { width, height } = imageData;

  const punt = pointillism ? 0.7 : 1.0;
  const [palette1, palette2, palette3] = filterType === FilterType.INSIDE ?
    COLOR_PALETTE.INSIDE :
    COLOR_PALETTE.OUTSIDE;
  const [thresh1, thresh2] = filterType === FilterType.INSIDE ?
    BRIGHTNESS_THRESHOLD.INSIDE :
    BRIGHTNESS_THRESHOLD.OUTSIDE;

  const { data } = imageData;
  const probably = (chance: number) => Math.random() < chance;

  for (let y = 0; y < height; y++) {
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

    self.postMessage({ progress: (y / height) * 100 });
  }

  self.postMessage({ imageData, progress: 100 });
};
