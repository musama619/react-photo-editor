import { useState, useEffect, useRef, useCallback } from 'react';

interface UsePhotoEditorParams {
  file?: File;
  defaultBrightness?: number;
  defaultContrast?: number;
  defaultSaturate?: number;
  defaultGrayscale?: number;
  defaultFlipHorizontal?: boolean;
  defaultFlipVertical?: boolean;
  defaultZoom?: number;
  defaultRotate?: number;
  defaultLineColor?: string;
  defaultLineWidth?: number;
  defaultMode?: 'pan' | 'draw';
}

export const usePhotoEditor = ({
  file,
  defaultBrightness = 100,
  defaultContrast = 100,
  defaultSaturate = 100,
  defaultGrayscale = 0,
  defaultFlipHorizontal = false,
  defaultFlipVertical = false,
  defaultZoom = 1,
  defaultRotate = 0,
  defaultLineColor = '#000000',
  defaultLineWidth = 2,
  defaultMode = 'pan',
}: UsePhotoEditorParams) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef(new Image());
  const [imageSrc, setImageSrc] = useState<string>('');
  const [brightness, setBrightness] = useState(defaultBrightness);
  const [contrast, setContrast] = useState(defaultContrast);
  const [saturate, setSaturate] = useState(defaultSaturate);
  const [grayscale, setGrayscale] = useState(defaultGrayscale);
  const [rotate, setRotate] = useState(defaultRotate);
  const [flipHorizontal, setFlipHorizontal] = useState(defaultFlipHorizontal);
  const [flipVertical, setFlipVertical] = useState(defaultFlipVertical);
  const [zoom, setZoom] = useState(defaultZoom);
  const [isDragging, setIsDragging] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [mode, setMode] = useState<'draw' | 'pan'>(defaultMode);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [lineColor, setLineColor] = useState<string>(defaultLineColor);
  const [lineWidth, setLineWidth] = useState<number>(defaultLineWidth);
  const drawingPathsRef = useRef<
    { path: { x: number; y: number }[]; color: string; width: number }[]
  >([]);

  useEffect(() => {
    if (file) {
      const fileSrc = URL.createObjectURL(file);
      setImageSrc(fileSrc);
      return () => {
        URL.revokeObjectURL(fileSrc);
      };
    }
  }, [file]);

  useEffect(() => {
    applyFilter();
  }, [
    file,
    imageSrc,
    rotate,
    flipHorizontal,
    flipVertical,
    zoom,
    brightness,
    contrast,
    saturate,
    grayscale,
    offsetX,
    offsetY,
  ]);

  const redrawDrawingPaths = (context: CanvasRenderingContext2D) => {
    drawingPathsRef.current.forEach(({ path, color, width }) => {
      context.beginPath();
      context.strokeStyle = color;
      context.lineWidth = width;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      path.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      });
      context.stroke();
    });
  };

  const applyFilter = useCallback(() => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    const imgElement = imgRef.current;
    imgRef.current.src = imageSrc;

    const drawImage = () => {
      if (canvas && context) {
        const zoomedWidth = imgElement.width * zoom;
        const zoomedHeight = imgElement.height * zoom;
        const translateX = (imgElement.width - zoomedWidth) / 2;
        const translateY = (imgElement.height - zoomedHeight) / 2;

        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();

        if (rotate) {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          context.translate(centerX, centerY);
          context.rotate((rotate * Math.PI) / 180);
          context.translate(-centerX, -centerY);
        }
        if (flipHorizontal) {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        if (flipVertical) {
          context.translate(0, canvas.height);
          context.scale(1, -1);
        }

        context.translate(translateX + offsetX, translateY + offsetY);
        context.scale(zoom, zoom);
        context.filter = getFilterString();
        context.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
        context.restore();

        const ua = navigator.userAgent.toLowerCase();
        const isSafari =
          (ua.includes('safari') && !ua.includes('chrome') && !ua.includes('chromium') && !ua.includes('electron')) ||
          (navigator.vendor && navigator.vendor.includes('Apple') && !ua.includes('chrome') && !ua.includes('chromium') && !ua.includes('electron'));

        const urlParams = new URLSearchParams(window.location.search);
        const forceFallback = urlParams.get('forceFilterFallback') === 'true';

        if (isSafari || forceFallback) {
          context.save();
          context.clearRect(0, 0, canvas.width, canvas.height);
          if (rotate) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            context.translate(centerX, centerY);
            context.rotate((rotate * Math.PI) / 180);
            context.translate(-centerX, -centerY);
          }
          if (flipHorizontal) {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
          }
          if (flipVertical) {
            context.translate(0, canvas.height);
            context.scale(1, -1);
          }
          context.translate(translateX + offsetX, translateY + offsetY);
          context.scale(zoom, zoom);
          context.filter = 'none';
          context.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
          context.restore();

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          applyFallbackFilters(imageData.data);
          context.putImageData(imageData, 0, 0);
        }

        context.filter = 'none';
        redrawDrawingPaths(context);
      }
    };

    imgElement.onload = drawImage;
    if (imgElement.complete) {
      drawImage();
    }

  }, [
    imageSrc,
    rotate,
    flipHorizontal,
    flipVertical,
    zoom,
    brightness,
    contrast,
    saturate,
    grayscale,
    offsetX,
    offsetY,
    lineWidth,
    lineColor,
  ]);

  const applyFallbackFilters = (data: Uint8ClampedArray) => {
    const b = brightness / 100;
    const c = contrast / 100;
    const s = saturate / 100;
    const g = grayscale / 100;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let gVal = data[i + 1];
      let bVal = data[i + 2];

      r *= b;
      gVal *= b;
      bVal *= b;

      r = (r - 128) * c + 128;
      gVal = (gVal - 128) * c + 128;
      bVal = (bVal - 128) * c + 128;

      r = Math.min(255, Math.max(0, r));
      gVal = Math.min(255, Math.max(0, gVal));
      bVal = Math.min(255, Math.max(0, bVal));

      const luma = 0.299 * r + 0.587 * gVal + 0.114 * bVal;
      r = r * (1 - g) + luma * g;
      gVal = gVal * (1 - g) + luma * g;
      bVal = bVal * (1 - g) + luma * g;

      const lu = 0.299 * r + 0.587 * gVal + 0.114 * bVal;
      r = lu + (r - lu) * s;
      gVal = lu + (gVal - lu) * s;
      bVal = lu + (bVal - lu) * s;

      data[i] = r;
      data[i + 1] = gVal;
      data[i + 2] = bVal;
    }
  };

  const generateEditedFile = (): Promise<File | null> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas || !file) {
        resolve(null);
        return;
      }

      const fileExtension = (file.name.split('.').pop() || '').toLowerCase();
      let mimeType;
      switch (fileExtension) {
        case 'jpg':
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'png':
          mimeType = 'image/png';
          break;
        default:
          mimeType = 'image/png';
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], file.name, { type: blob.type });
          resolve(newFile);
        } else {
          resolve(null);
        }
      }, mimeType);
    });
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas && file) {
      const link = document.createElement('a');
      link.download = file.name;
      link.href = canvas.toDataURL(file?.type);
      link.click();
    }
  };

  const getFilterString = (): string => {
    return `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) saturate(${saturate}%)`;
  };

  const handleZoomIn = () => {
    setZoom((prevZoom) => prevZoom + 0.1);
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.1));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      setDrawStart({ x, y });

      drawingPathsRef.current.push({ path: [{ x, y }], color: lineColor, width: lineWidth });
    } else {
      setIsDragging(true);
      const initialX = event.clientX - (flipHorizontal ? -offsetX : offsetX);
      const initialY = event.clientY - (flipVertical ? -offsetY : offsetY);
      setPanStart({ x: initialX, y: initialY });
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode === 'draw' && drawStart) {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      const rect = canvas?.getBoundingClientRect();

      if (!canvas || !context || !rect) return;

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      const currentPath = drawingPathsRef.current[drawingPathsRef.current.length - 1].path;

      context.strokeStyle = lineColor;
      context.lineWidth = lineWidth;
      context.lineCap = 'round';
      context.lineJoin = 'round';

      context.beginPath();
      context.moveTo(drawStart.x, drawStart.y);
      context.lineTo(x, y);
      context.stroke();

      setDrawStart({ x, y });
      currentPath.push({ x, y });

      return;
    }

    if (isDragging && panStart) {
      event.preventDefault();

      const offsetXDelta = event.clientX - panStart.x;
      const offsetYDelta = event.clientY - panStart.y;

      setOffsetX(flipHorizontal ? -offsetXDelta : offsetXDelta);
      setOffsetY(flipVertical ? -offsetYDelta : offsetYDelta);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setDrawStart(null);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    if (event.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const resetFilters = () => {
    setBrightness(defaultBrightness);
    setContrast(defaultContrast);
    setSaturate(defaultSaturate);
    setGrayscale(defaultGrayscale);
    setRotate(defaultRotate);
    setFlipHorizontal(defaultFlipHorizontal);
    setFlipVertical(defaultFlipVertical);
    setZoom(defaultZoom);
    setLineColor(defaultLineColor);
    setLineWidth(defaultLineWidth);
    drawingPathsRef.current = [];
    setOffsetX(0);
    setOffsetY(0);
    setPanStart(null);
    setIsDragging(false);
    setMode('pan');
    applyFilter();
  };

  return {
    canvasRef,
    imageSrc,
    brightness,
    contrast,
    saturate,
    grayscale,
    rotate,
    flipHorizontal,
    flipVertical,
    zoom,
    isDragging,
    panStart,
    offsetX,
    offsetY,
    mode,
    lineColor,
    lineWidth,
    setBrightness,
    setContrast,
    setSaturate,
    setGrayscale,
    setRotate,
    setFlipHorizontal,
    setFlipVertical,
    setZoom,
    setIsDragging,
    setPanStart,
    setOffsetX,
    setOffsetY,
    handleZoomIn,
    handleZoomOut,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
    handleWheel,
    downloadImage,
    generateEditedFile,
    resetFilters,
    applyFilter,
    setMode,
    setLineColor,
    setLineWidth,
  };
};