import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Parameters for the usePhotoEditor hook.
 */
interface UsePhotoEditorParams {
  /**
   * The image file to be edited.
   */
  file?: File;

  /**
   * Source URL of the image to be edited.
   */
  src?: string;

  /**
   * Initial brightness level (default: 100).
   */
  defaultBrightness?: number;

  /**
   * Initial contrast level (default: 100).
   */
  defaultContrast?: number;

  /**
   * Initial saturation level (default: 100).
   */
  defaultSaturate?: number;

  /**
   * Initial grayscale level (default: 0).
   */
  defaultGrayscale?: number;

  /**
   * Flip the image horizontally (default: false).
   */
  defaultFlipHorizontal?: boolean;

  /**
   * Flip the image vertically (default: false).
   */
  defaultFlipVertical?: boolean;

  /**
   * Initial zoom level (default: 1).
   */
  defaultZoom?: number;

  /**
   * Initial rotation angle in degrees (default: 0).
   */
  defaultRotate?: number;

  /**
   * Initial line color for drawing (default: '#000000').
   */
  defaultLineColor?: string;

  /**
   * Initial line width for drawing (default: 2).
   */
  defaultLineWidth?: number;

  /**
   * Initial mode for the canvas (default: 'pan').
   */
  defaultMode?: 'pan' | 'draw';
}

/**
 * Custom hook for handling photo editing within a canvas.
 *
 * @param {UsePhotoEditorParams} params - Configuration parameters for the hook.
 * @returns {Object} - Returns state and functions for managing image editing.
 */
export const usePhotoEditor = ({
  file,
  src,
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
  // Ref to the canvas element where the image will be drawn.
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Create the image object using a ref
  const imgRef = useRef(new Image());

  // State to hold the source of the image.
  const [imageSrc, setImageSrc] = useState<string>('');

  // State variables for various image transformations.
  const [brightness, setBrightness] = useState(defaultBrightness);
  const [contrast, setContrast] = useState(defaultContrast);
  const [saturate, setSaturate] = useState(defaultSaturate);
  const [grayscale, setGrayscale] = useState(defaultGrayscale);
  const [rotate, setRotate] = useState(defaultRotate);
  const [flipHorizontal, setFlipHorizontal] = useState(defaultFlipHorizontal);
  const [flipVertical, setFlipVertical] = useState(defaultFlipVertical);
  const [zoom, setZoom] = useState(defaultZoom);

  // State variables for handling drag-and-drop panning.
  const [isDragging, setIsDragging] = useState(false);
  const prevPanPosition = useRef<{ x: number; y: number } | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const [mode, setMode] = useState<'draw' | 'pan'>(defaultMode);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);

  // State variables for drawing on the canvas.
  const [lineColor, setLineColor] = useState<string>(defaultLineColor);
  const [lineWidth, setLineWidth] = useState<number>(defaultLineWidth);

  const drawingPathsRef = useRef<
    { path: { x: number; y: number }[]; color: string; width: number }[]
  >([]);
  const pointerEvents = useRef<Array<React.PointerEvent<HTMLCanvasElement>>>([]);
  const prevPointerDiff = useRef(-1);

  const reDraw = useCallback(() => {
    if (imageSrc && canvasRef.current != null) {
      if (contextRef.current == null) {
        // Todo: still need to use image onload
        // Initial setup
        contextRef.current = canvasRef.current.getContext('2d');
        // Set canvas dimensions to match the image.
        canvasRef.current.width = imgRef.current.width;
        canvasRef.current.height = imgRef.current.height;
      }

      contextRef.current?.save()
      contextRef.current?.setTransform(1, 0, 0, 1, 0, 0);
      contextRef.current?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      contextRef.current?.drawImage(imgRef.current, 0, 0);
      contextRef.current?.restore()
    }
  }, [imageSrc]);

  // Effect to update the image source when the file changes.
  useEffect(() => {
    if (file) {
      const fileSrc = URL.createObjectURL(file);
      imgRef.current.src = fileSrc;
      setImageSrc(fileSrc);

      // Clean up the object URL when the component unmounts or file changes.
      return () => {
        URL.revokeObjectURL(fileSrc);
      };
    } else if (src) {
      imgRef.current.src = src;
      setImageSrc(src);
    }
  }, [file, src]);

  // Effect to apply transformations and filters whenever relevant state changes.
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

  /**
   * Applies the selected filters and transformations to the image on the canvas.
   */
  const applyFilter = () => {
    // if (!imageSrc) return;
    //
    //
    // const canvas = canvasRef.current;
    // const context = canvas?.getContext('2d');
    //
    // const imgElement = imgRef.current;
    // imgRef.current.src = imageSrc;
    // imgRef.current.onload = applyFilter;
    //
    // imgElement.onload = () => {
    //   if (canvas && context) {
    //     // const zoomedWidth = imgElement.width * zoom;
    //     // const zoomedHeight = imgElement.height * zoom;
    //     // const translateX = (imgElement.width - zoomedWidth) / 2;
    //     // const translateY = (imgElement.height - zoomedHeight) / 2;
    //
    //     // Set canvas dimensions to match the image.
    //     canvas.width = imgElement.width;
    //     canvas.height = imgElement.height;
    //
    //     // Clear the canvas before drawing the updated image.
    //     context.clearRect(0, 0, canvas.width, canvas.height);
    //
    //     // Apply filters and transformations.
    //     context.filter = getFilterString();
    //     context.save();
    //
    //     if (rotate) {
    //       const centerX = canvas.width / 2;
    //       const centerY = canvas.height / 2;
    //       context.translate(centerX, centerY);
    //       context.rotate((rotate * Math.PI) / 180);
    //       context.translate(-centerX, -centerY);
    //     }
    //     if (flipHorizontal) {
    //       context.translate(canvas.width, 0);
    //       context.scale(-1, 1);
    //     }
    //     if (flipVertical) {
    //       context.translate(0, canvas.height);
    //       context.scale(1, -1);
    //     }
    //
    //     // context.translate(translateX + offsetX, translateY + offsetY);
    //     // context.scale(zoom, zoom);
    //     context.drawImage(imgElement, 0, 0);
    //
    //     context.restore();
    //
    //     context.filter = 'none';
    //     // redrawDrawingPaths(context);
    //   }
    // };
  };

  /**
   * Generates a file from the canvas content.
   * @returns {Promise<File | null>} A promise that resolves with the edited file or null if the canvas is not available.
   */
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

  /**
   * Generates a string representing the current filter settings.
   *
   * @returns {string} - A CSS filter string.
   */
  const getFilterString = (): string => {
    return `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) saturate(${saturate}%)`;
  };

  /**
   * Handles the zoom-in action.
   */
  const handleZoomIn = (value?: number) => {
    setZoom((prevZoom) => prevZoom + (value ?? 0.1));
  };

  /**
   * Handles the zoom-out action.
   */
  const handleZoomOut = (value?: number) => {
    setZoom((prevZoom) => Math.max(prevZoom - (value ?? 0.1), 0.1));
  };

  /**
   * Handles the pointer down event for initiating drawing or drag-and-drop panning.
   */
  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    // Store the pointer event for later use with multiple pointers
    pointerEvents.current.push(event);

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
      prevPanPosition.current = { x: initialX, y: initialY };
    }
  };

  /**
   * Handles the pointer move event for updating the drawing path or panning the image.
   */
  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    // Find this event in the cache and update its record with this event
    const index = pointerEvents.current.findIndex(
      (cachedEv) => cachedEv.pointerId === event.pointerId
    );
    pointerEvents.current[index] = event;
    const rect = canvasRef.current?.getBoundingClientRect();

    console.log(
      event.clientX,
      event.clientY,
      canvasRef.current?.offsetLeft,
      canvasRef.current?.offsetTop,
      rect?.left,
      rect?.top,
    );
    console.log(
      event.clientX - (canvasRef.current?.offsetLeft ?? 0),
      event.clientY - (canvasRef.current?.offsetTop ?? 0),
      event.clientX - (rect?.left ?? 0),
      event.clientY - (rect?.top ?? 0),
    );

    if (mode === 'draw' && drawStart) {
      // Draw
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

    if (isDragging && prevPanPosition) {
      event.preventDefault();

      if (pointerEvents.current.length === 1 && prevPanPosition.current != null) {
        // Pan
        const offsetXDelta = event.clientX - prevPanPosition.current.x;
        const offsetYDelta = event.clientY - prevPanPosition.current.y;

        console.log(`Panning: ${offsetXDelta}, ${offsetYDelta}, context: ${!!contextRef.current}`);
        contextRef.current?.translate(offsetXDelta, offsetYDelta);
        reDraw();
        prevPanPosition.current = {x: event.clientX, y: event.clientY};
      } else if (pointerEvents.current.length === 2) {
        const rect = canvasRef.current?.getBoundingClientRect();

        // Pinch Zoom
        // If two pointers are down, check for pinch gestures
        // Calculate the distance between the two pointers
        const curDiff = Math.max(
          Math.abs(pointerEvents.current[0].clientX - pointerEvents.current[1].clientX),
          Math.abs(pointerEvents.current[0].clientY - pointerEvents.current[1].clientY)
        );
        const zoomOrigin = {
          x: ((pointerEvents.current[0].clientX - (rect?.left ?? 0)) + (pointerEvents.current[1].clientX - (rect?.left ?? 0))) / 2,
          y: ((pointerEvents.current[0].clientY - (rect?.top ?? 0)) + (pointerEvents.current[1].clientY - (rect?.top ?? 0))) / 2,
        };

        if (prevPointerDiff.current > 0) {
          let zoom = 1;
          if (curDiff > prevPointerDiff.current) {
            // The distance between the two pointers has increased
            // handleZoomIn(Math.abs(prevPointerDiff.current - curDiff) * 0.01);
            zoom = Math.abs(prevPointerDiff.current - curDiff) * 0.01;
          }
          if (curDiff < prevPointerDiff.current) {
            // The distance between the two pointers has decreased
            // handleZoomOut(Math.abs(prevPointerDiff.current - curDiff) * 0.01);
            zoom = Math.abs(prevPointerDiff.current - curDiff) * 0.01;
          }

          // const originX = imgRef.current.width * zoom / 2;
          // const originY = imgRef.current.height * zoom / 2;

          // setOffsetX(originX - zoomOrigin.x);
          // setOffsetY(originY - zoomOrigin.y);

          const context = canvasRef.current?.getContext('2d');
          if (context) {
            context.translate(zoomOrigin.x, zoomOrigin.y);
            context.scale(zoom, zoom);
            context.translate(-zoomOrigin.x, -zoomOrigin.y);
          }
        }

        // Cache the distance for the next move event
        prevPointerDiff.current = curDiff;
      }
    }
  };

  /**
   * Handles the pointer up event for ending the drawing or panning action.
   */
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Remove the pointer event from the array
    pointerEvents.current = pointerEvents.current.filter(
      (event) => event.pointerId !== e.pointerId
    );

    // If the number of pointers down is less than two then reset diff tracker
    if (pointerEvents.current.length < 2) {
      prevPointerDiff.current = -1;
    }

    setIsDragging(false);
    setDrawStart(null);
  };

  /**
   * Handles the wheel event for zooming in and out.
   */
  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    if (event.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  /**
   * Resets the filters and styles to its original state with the default settings.
   */
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
    prevPanPosition.current = null;
    setIsDragging(false);
    setMode('pan');
    // applyFilter();
    reDraw()
  };

  // Expose the necessary state and handlers for external use.
  return {
    /** Reference to the canvas element. */
    canvasRef,
    /** Source URL of the image being edited. */
    imageSrc,
    /** Current brightness level. */
    brightness,
    /** Current contrast level. */
    contrast,
    /** Current saturation level. */
    saturate,
    /** Current grayscale level. */
    grayscale,
    /** Current rotation angle in degrees. */
    rotate,
    /** Flag indicating if the image is flipped horizontally. */
    flipHorizontal,
    /** Flag indicating if the image is flipped vertically. */
    flipVertical,
    /** Current zoom level. */
    zoom,
    /** Flag indicating if the image is being dragged. */
    isDragging,
    /** Starting coordinates for panning. */
    panStart: prevPanPosition,
    /** Current horizontal offset for panning. */
    offsetX,
    /** Current vertical offset for panning. */
    offsetY,
    /** Current mode ('pan' or 'draw') */
    mode,
    /** Current line color. */
    lineColor,
    /** Current line width. */
    lineWidth,
    /** Function to set the brightness level. */
    setBrightness,
    /** Function to set the contrast level. */
    setContrast,
    /** Function to set the saturation level. */
    setSaturate,
    /** Function to set the grayscale level. */
    setGrayscale,
    /** Function to set the rotation angle. */
    setRotate,
    /** Function to set the horizontal flip state. */
    setFlipHorizontal,
    /** Function to set the vertical flip state. */
    setFlipVertical,
    /** Function to set the zoom level. */
    setZoom,
    /** Function to set the dragging state. */
    setIsDragging,
    /** Function to set the horizontal offset for panning. */
    setOffsetX,
    /** Function to set the vertical offset for panning. */
    setOffsetY,
    /** Function to zoom in. */
    handleZoomIn,
    /** Function to zoom out. */
    handleZoomOut,
    /** Function to handle pointer down events. */
    handlePointerDown,
    /** Function to handle pointer up events. */
    handlePointerUp,
    /** Function to handle pointer move events. */
    handlePointerMove,
    /** Function to handle wheel events for zooming. */
    handleWheel,
    /** Function to download the edited image. */
    downloadImage,
    /** Function to generate the edited image file. */
    generateEditedFile,
    /** Function to reset filters and styles to default. */
    resetFilters,
    /** Function to apply filters and transformations. */
    applyFilter,
    /** Function to set the mode. */
    setMode,
    /** Function to set the line color. */
    setLineColor,
    /** Function to set the line width. */
    setLineWidth,
  };
};
