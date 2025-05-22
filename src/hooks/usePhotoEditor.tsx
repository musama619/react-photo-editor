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
  const canvasInitialized = useRef(false);

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
  const currentOrigin = useRef({ x: 0, y: 0 });

  const reDraw = useCallback(() => {
    if (imgRef.current.src != '' && canvasRef.current != null) {
      const context = canvasRef.current.getContext('2d');
      if (context == null) return;

      if (!canvasInitialized.current) {
        canvasRef.current.width = imgRef.current.width;
        canvasRef.current.height = imgRef.current.height;
        canvasInitialized.current = true;
      }

      // Clear the canvas before redrawing
      context.save();
      context.resetTransform();
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      context.restore();

      // Redraw image and drawing paths with current transformations
      context.drawImage(imgRef.current, 0, 0);
      redrawDrawingPaths();
    }
  }, []);

  // Effect to update the image source when the file changes.
  useEffect(() => {
    if (file) {
      canvasInitialized.current = false;
      const fileSrc = URL.createObjectURL(file);
      imgRef.current.onload = reDraw;
      imgRef.current.src = fileSrc;
      setImageSrc(fileSrc);

      // Clean up the object URL when the component unmounts or file changes.
      return () => {
        URL.revokeObjectURL(fileSrc);
      };
    } else if (src) {
      canvasInitialized.current = false;
      imgRef.current.onload = reDraw;
      imgRef.current.src = src;
      setImageSrc(src);
    }
  }, [file, src]);

  // Effect to apply transformations and filters whenever relevant state changes.
  useEffect(() => {
    applyFilter();
  }, [brightness, contrast, saturate, grayscale]);

  const redrawDrawingPaths = () => {
    const context = canvasRef.current?.getContext('2d');
    if (context == null) return;

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
    if (!imageSrc) return;

    const context = canvasRef.current?.getContext('2d');
    if (context == null) return;

    // Apply filters and transformations.
    context.filter = getFilterString();
    reDraw();
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
  const handleZoomIn = () => {
    handleZoom(0.1);
  };

  /**
   * Handles the zoom-out action.
   */
  const handleZoomOut = () => {
    handleZoom(-0.1);
  };

  /**
   * Handles the zoom buttons, wheel, and touches.
   * @param value
   * @param position - The pointer clientX and clientY.
   */
  const handleZoom = (value: number, position?: { x: number; y: number }) => {
    if (canvasRef.current == null) return;

    let newZoom = zoom + value;

    if (newZoom < 0.1) {
      // Prevent zooming out too much
      newZoom = 0.1;
    }

    setZoom(newZoom);

    const scaleFactor = newZoom / zoom;

    let translateX;
    let translateY;
    if (position != null) {
      const transformedPoint = getCanvasPositionFromPointer(position.x, position.y);

      if (transformedPoint == null) return;

      // Translate to the transformed position of the pointer
      translateX = transformedPoint.x;
      translateY = transformedPoint.y;
    } else {
      // Translate to the center of the canvas
      translateX = canvasRef.current.width / 2;
      translateY = canvasRef.current.height / 2;
    }

    const context = canvasRef.current.getContext('2d');
    if (context == null) return;

    context.translate(translateX, translateY);
    context.scale(scaleFactor, scaleFactor);
    // translate back to the current origin
    context.translate(-translateX, -translateY);
    reDraw();
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

      const transformedPosition = getCanvasPositionFromPointer(event.clientX, event.clientY);
      if (transformedPosition == null) return;

      setDrawStart({ x: transformedPosition.x, y: transformedPosition.y });

      drawingPathsRef.current.push({
        path: [{ x: transformedPosition.x, y: transformedPosition.y }],
        color: lineColor,
        width: lineWidth,
      });
    } else {
      setIsDragging(true);
      prevPanPosition.current = { x: event.clientX, y: event.clientY };
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

    if (mode === 'draw') {
      draw(event);
    } else if (isDragging) {
      event.preventDefault();

      if (pointerEvents.current.length === 1) {
        pan(event);
      } else if (pointerEvents.current.length === 2) {
        // If two pointers are down, check for pinch gestures
        pinchZoom();
      }
    }
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const context = canvasRef.current?.getContext('2d');
    if (context == null || !drawStart) return;

    const transformedPosition = getCanvasPositionFromPointer(event.clientX, event.clientY);
    if (transformedPosition == null) return;

    const currentPath = drawingPathsRef.current[drawingPathsRef.current.length - 1].path;

    context.strokeStyle = lineColor;
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    context.beginPath();
    context.moveTo(drawStart.x, drawStart.y);
    context.lineTo(transformedPosition.x, transformedPosition.y);
    context.stroke();

    setDrawStart({ x: transformedPosition.x, y: transformedPosition.y });
    currentPath.push({ x: transformedPosition.x, y: transformedPosition.y });

    return;
  };

  const pan = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const context = canvasRef.current?.getContext('2d');
    if (context == null) return;

    if (prevPanPosition.current == null) return;

    let offsetXDelta = (event.clientX - prevPanPosition.current.x) * (flipHorizontal ? -1 : 1);
    let offsetYDelta = (event.clientY - prevPanPosition.current.y) * (flipVertical ? -1 : 1);

    // Apply scale correction
    offsetXDelta /= zoom;
    offsetYDelta /= zoom;

    // Apply rotation (need to subtract rotate from 360 for clockwise)
    const angle = ((360 - rotate) * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rotatedOffsetX = offsetXDelta * cos - offsetYDelta * sin;
    const rotatedOffsetY = offsetXDelta * sin + offsetYDelta * cos;
    offsetXDelta = rotatedOffsetX;
    offsetYDelta = rotatedOffsetY;

    context.translate(offsetXDelta, offsetYDelta);
    reDraw();
    prevPanPosition.current = { x: event.clientX, y: event.clientY };
    currentOrigin.current = {
      x: currentOrigin.current.x + offsetXDelta,
      y: currentOrigin.current.y + offsetYDelta,
    };
  };

  const pinchZoom = () => {
    if (pointerEvents.current.length !== 2) return;

    // Calculate the distance between the two pointers
    const betweenTwoPointers = {
      x: (pointerEvents.current[0].clientX + pointerEvents.current[1].clientX) / 2,
      y: (pointerEvents.current[0].clientY + pointerEvents.current[1].clientY) / 2,
    };

    const curDiff = Math.max(
      Math.abs(pointerEvents.current[0].clientX - pointerEvents.current[1].clientX),
      Math.abs(pointerEvents.current[0].clientY - pointerEvents.current[1].clientY)
    );

    if (prevPointerDiff.current > 0) {
        handleZoom((curDiff - prevPointerDiff.current) * 0.01, betweenTwoPointers);
    }

    // Cache the distance for the next move event
    prevPointerDiff.current = curDiff;
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
    handleZoom(0.01 * event.deltaY, { x: event.clientX, y: event.clientY });
  };

  /**
   * Handles the horizontal flip action.
   */
  const handleFlipHorizontal = () => {
    setFlipHorizontal((prev) => !prev);

    const context = canvasRef.current?.getContext('2d');
    if (context == null) return;

    const angle = (rotate * Math.PI) / 180;
    const centerX = (canvasRef.current?.width ?? 0) / 2;
    const centerY = (canvasRef.current?.height ?? 0) / 2;

    // Reset rotation
    context.translate(centerX, centerY);
    context.rotate(-angle);
    context.translate(-centerX, -centerY);
    // Apply horizontal flip
    context.translate(canvasRef.current?.width ?? 0, 0);
    context.scale(-1, 1);
    // Rotate back
    context.translate(centerX, centerY);
    context.rotate(angle);
    context.translate(-centerX, -centerY);
    reDraw();
  };

  /**
   * Handles the vertical flip action.
   */
  const handleFlipVertical = () => {
    setFlipVertical((prev) => !prev);

    const context = canvasRef.current?.getContext('2d');
    if (context == null) return;

    const angle = (rotate * Math.PI) / 180;
    const centerX = (canvasRef.current?.width ?? 0) / 2;
    const centerY = (canvasRef.current?.height ?? 0) / 2;

    // Reset rotation
    context.translate(centerX, centerY);
    context.rotate(-angle);
    context.translate(-centerX, -centerY);
    // Apply vertical flip
    context.translate(0, canvasRef.current?.height ?? 0);
    context.scale(1, -1);
    // Rotate back
    context.translate(centerX, centerY);
    context.rotate(angle);
    context.translate(-centerX, -centerY);
    reDraw();
  };

  /**
   * Handles the rotation of the image.
   * @param angle - The angle in degrees to rotate the image.
   */
  const handleRotate = (angle: number) => {
    setRotate(angle);

    if (canvasRef.current == null) return;

    const context = canvasRef.current.getContext('2d');
    if (context == null) return;

    const diff = angle - rotate;

    const centerX = canvasRef.current.width / 2;
    const centerY = canvasRef.current.height / 2;
    context.translate(centerX, centerY);
    context.rotate((diff * Math.PI) / 180);
    context.translate(-centerX, -centerY);
    reDraw();
  };

  /**
   * Calculates the canvas position from the pointer coordinates.
   * @param clientX - The x-coordinate of the pointer. (event.clientX)
   * @param clientY - The y-coordinate of the pointer. (event.clientY)
   */
  const getCanvasPositionFromPointer = (clientX: number, clientY: number) => {
    const context = canvasRef.current?.getContext('2d');
    if (context == null) return;

    const rect = canvasRef.current?.getBoundingClientRect();

    const projectedX = clientX - (rect?.left ?? 0);
    const projectedY = clientY - (rect?.top ?? 0);

    const scaleX = (canvasRef.current?.width ?? 0) / (rect?.width ?? 0); // relationship bitmap vs. element for x
    const scaleY = (canvasRef.current?.height ?? 0) / (rect?.height ?? 0); // relationship bitmap vs. element for y

    const x = projectedX * scaleX; // scale mouse coordinates after they have
    const y = projectedY * scaleY; // been adjusted to be relative to element

    const inverseMatrix = context.getTransform().inverse();
    return inverseMatrix?.transformPoint({ x, y });
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
    prevPanPosition.current = null;
    setIsDragging(false);
    setMode('pan');

    const context = canvasRef.current?.getContext('2d');
    context?.resetTransform();
    currentOrigin.current = { x: 0, y: 0 };
    canvasInitialized.current = false;
    reDraw();
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
    handleRotate,
    /** Function to set the horizontal flip state. */
    handleFlipHorizontal,
    /** Function to set the vertical flip state. */
    handleFlipVertical,
    /** Function to set the zoom level. */
    handleZoom,
    /** Function to set the dragging state. */
    setIsDragging,
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
