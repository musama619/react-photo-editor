/* eslint-disable @typescript-eslint/unbound-method */
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePhotoEditor } from '../hooks/usePhotoEditor'; // Adjust path as needed
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';

describe('usePhotoEditor Hook', () => {
  const mockFile = new File(['(dummytest)'], 'test.png', { type: 'image/png' });

  const mockCanvas = {
    getContext: vi.fn(),
    toBlob: vi.fn().mockImplementation((callback) => {
      callback(new Blob(['test'], { type: 'image/png' }));
    }),
    width: 100,
    height: 100,
    getBoundingClientRect: vi.fn().mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    }),
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mocked-data'),
  } as unknown as HTMLCanvasElement;

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn().mockReturnValue('mocked-url');
    global.URL.revokeObjectURL = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    // mockCanvas.getContext.mockReturnValue({
    //   drawImage: vi.fn(),
    //   clearRect: vi.fn(),
    //   save: vi.fn(),
    //   restore: vi.fn(),
    //   translate: vi.fn(),
    //   rotate: vi.fn(),
    //   scale: vi.fn(),
    //   filter: '',
    //   beginPath: vi.fn(),
    //   moveTo: vi.fn(),
    //   lineTo: vi.fn(),
    //   stroke: vi.fn(),
    //   strokeStyle: '',
    //   lineWidth: 2,
    //   lineCap: 'round',
    //   lineJoin: 'round',
    // } as unknown);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePhotoEditor({}));

    expect(result.current.brightness).toBe(100);
    expect(result.current.contrast).toBe(100);
    expect(result.current.saturate).toBe(100);
    expect(result.current.grayscale).toBe(0);
    expect(result.current.rotate).toBe(0);
    expect(result.current.flipHorizontal).toBe(false);
    expect(result.current.flipVertical).toBe(false);
    expect(result.current.zoom).toBe(1);
    expect(result.current.mode).toBe('pan');
    expect(result.current.lineColor).toBe('#000000');
    expect(result.current.lineWidth).toBe(2);
  });

  it('should initialize with provided values', () => {
    const { result } = renderHook(() =>
      usePhotoEditor({
        file: mockFile,
        defaultBrightness: 50,
        defaultContrast: 150,
        defaultSaturate: 75,
        defaultGrayscale: 25,
        defaultRotate: 90,
        defaultFlipHorizontal: true,
        defaultFlipVertical: true,
        defaultZoom: 2,
        defaultMode: 'draw',
        defaultLineColor: '#FF0000',
        defaultLineWidth: 5,
      })
    );

    expect(result.current.brightness).toBe(50);
    expect(result.current.contrast).toBe(150);
    expect(result.current.saturate).toBe(75);
    expect(result.current.grayscale).toBe(25);
    expect(result.current.rotate).toBe(90);
    expect(result.current.flipHorizontal).toBe(true);
    expect(result.current.flipVertical).toBe(true);
    expect(result.current.zoom).toBe(2);
    expect(result.current.mode).toBe('draw');
    expect(result.current.lineColor).toBe('#FF0000');
    expect(result.current.lineWidth).toBe(5);
  });

  it('should set image source when file is provided', async () => {
    const { result } = renderHook(() => usePhotoEditor({ file: mockFile }));

    // Use waitFor to wait for the imageSrc to be set
    await waitFor(() => expect(result.current.imageSrc).toBe('mocked-url'));

    expect(result.current.imageSrc).toBe('mocked-url');
  });

  it('should update brightness', () => {
    const { result } = renderHook(() => usePhotoEditor({}));

    act(() => {
      result.current.setBrightness(120);
    });

    expect(result.current.brightness).toBe(120);
  });

  it('should update contrast', () => {
    const { result } = renderHook(() => usePhotoEditor({}));

    act(() => {
      result.current.setContrast(80);
    });

    expect(result.current.contrast).toBe(80);
  });

  it('should update saturate', () => {
    const { result } = renderHook(() => usePhotoEditor({}));

    act(() => {
      result.current.setSaturate(50);
    });

    expect(result.current.saturate).toBe(50);
  });

  it('should update grayscale', () => {
    const { result } = renderHook(() => usePhotoEditor({}));

    act(() => {
      result.current.setGrayscale(30);
    });

    expect(result.current.grayscale).toBe(30);
  });

  it('should update rotate', () => {
    const { result } = renderHook(() => usePhotoEditor({}));

    act(() => {
      result.current.setRotate(45);
    });

    expect(result.current.rotate).toBe(45);
  });

  it('should update flipHorizontal', () => {
    const { result } = renderHook(() => usePhotoEditor({}));

    act(() => {
      result.current.setFlipHorizontal(true);
    });

    expect(result.current.flipHorizontal).toBe(true);
  });

  it('should update flipVertical', () => {
    const { result } = renderHook(() => usePhotoEditor({}));

    act(() => {
      result.current.setFlipVertical(true);
    });

    expect(result.current.flipVertical).toBe(true);
  });

  it('should update zoom', () => {
    const { result } = renderHook(() => usePhotoEditor({}));

    act(() => {
      result.current.setZoom(1.5);
    });

    expect(result.current.zoom).toBe(1.5);
  });

  it('should handle zoom in', () => {
    const { result } = renderHook(() => usePhotoEditor({}));

    act(() => {
      result.current.handleZoomIn();
    });

    expect(result.current.zoom).toBe(1.1);
  });

  it('should handle zoom out', () => {
    const { result } = renderHook(() => usePhotoEditor({}));

    act(() => {
      result.current.handleZoomOut();
    });

    expect(result.current.zoom).toBe(0.9);
  });

  it('should reset filters', () => {
    const { result } = renderHook(() =>
      usePhotoEditor({
        defaultBrightness: 50,
        defaultContrast: 150,
        defaultSaturate: 75,
        defaultGrayscale: 25,
        defaultRotate: 90,
        defaultFlipHorizontal: true,
        defaultFlipVertical: true,
        defaultZoom: 2,
        defaultMode: 'draw',
        defaultLineColor: '#000000',
        defaultLineWidth: 5,
      })
    );

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.brightness).toBe(50);
    expect(result.current.contrast).toBe(150);
    expect(result.current.saturate).toBe(75);
    expect(result.current.grayscale).toBe(25);
    expect(result.current.rotate).toBe(90);
    expect(result.current.flipHorizontal).toBe(true);
    expect(result.current.flipVertical).toBe(true);
    expect(result.current.zoom).toBe(2);
    expect(result.current.mode).toBe('pan');
    expect(result.current.lineColor).toBe('#000000');
    expect(result.current.lineWidth).toBe(5);
  });

  it('should generate edited file', async () => {
    const mockCanvas = {
      toBlob: vi.fn().mockImplementation((callback) => {
        callback(new Blob(['test'], { type: 'image/png' }));
      }),
    } as unknown as HTMLCanvasElement;

    const { result } = renderHook(() => usePhotoEditor({ file: mockFile }));

    act(() => {
      result.current.canvasRef.current = mockCanvas;
    });

    const file = await result.current.generateEditedFile();

    // Use waitFor to wait for the file to be defined
    await waitFor(() => expect(file).toBeDefined());

    expect(file).toBeDefined();
    expect(file?.name).toBe('test.png');
  });

  it('should return null when canvas is not available on generateEditedFile', async () => {
    const { result } = renderHook(() => usePhotoEditor({ file: mockFile }));

    const file = await result.current.generateEditedFile();

    expect(file).toBeNull();
  });

  it('should handle pointer down for panning', () => {
    const { result } = renderHook(() => usePhotoEditor({ file: mockFile }));
    act(() => {
      result.current.canvasRef.current = mockCanvas;
    });
    act(() => {
      result.current.handlePointerDown({
        clientX: 50,
        clientY: 50,
      } as React.PointerEvent<HTMLCanvasElement>);
    });
    expect(result.current.isDragging).toBe(true);
  });

  it('should handle wheel zoom in', () => {
    const { result } = renderHook(() => usePhotoEditor({ file: mockFile }));
    act(() => {
      result.current.handleWheel({ deltaY: -10 } as React.WheelEvent<HTMLCanvasElement>);
    });
    expect(result.current.zoom).toBe(1.1);
  });

  it('should handle wheel zoom out', () => {
    const { result } = renderHook(() => usePhotoEditor({ file: mockFile }));
    act(() => {
      result.current.handleWheel({ deltaY: 10 } as React.WheelEvent<HTMLCanvasElement>);
    });
    expect(result.current.zoom).toBe(0.9);
  });

  it('should download image', () => {
    const { result } = renderHook(() => usePhotoEditor({ file: mockFile }));
    act(() => {
      result.current.canvasRef.current = mockCanvas;
    });
    act(() => {
      result.current.downloadImage();
    });
    expect(mockCanvas.toDataURL).toHaveBeenCalled();
  });

  it('should handle pointer up', () => {
    const { result } = renderHook(() => usePhotoEditor({ file: mockFile }));

    // Set drawStart since it's part of the state we're testing
    act(() => {
      result.current.isDragging = true;
      result.current.handlePointerDown({
        clientX: 50,
        clientY: 50,
      } as React.PointerEvent<HTMLCanvasElement>);
    });

    act(() => {
      result.current.handlePointerUp();
    });

    expect(result.current.isDragging).toBe(false);
  });
  it('should handle pointer move for drawing', () => {
    const { result } = renderHook(() => usePhotoEditor({ file: mockFile, defaultMode: 'draw' }));

    // Create a more complete mock canvas
    const mockCanvas = {
      width: 100,
      height: 100,
      getBoundingClientRect: vi.fn().mockReturnValue({
        left: 0,
        top: 0,
        width: 100,
        height: 100,
      }),
      getContext: vi.fn().mockReturnValue({
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        strokeStyle: '',
        lineWidth: 2,
        lineCap: 'round',
        lineJoin: 'round',
      }),
    } as unknown as HTMLCanvasElement;

    act(() => {
      result.current.canvasRef.current = mockCanvas;
      result.current.setMode('draw');
    });

    // First trigger pointer down to set drawStart
    act(() => {
      result.current.handlePointerDown({
        clientX: 50,
        clientY: 50,
        preventDefault: vi.fn(),
      } as unknown as React.PointerEvent<HTMLCanvasElement>);
    });

    // Then trigger pointer move to test drawing
    act(() => {
      result.current.handlePointerMove({
        clientX: 60,
        clientY: 60,
        preventDefault: vi.fn(),
      } as unknown as React.PointerEvent<HTMLCanvasElement>);
    });

    const context = mockCanvas.getContext('2d');
    if (context) {
      expect(context.beginPath).toHaveBeenCalled();
      expect(context.moveTo).toHaveBeenCalled();
      expect(context.lineTo).toHaveBeenCalled();
      expect(context.stroke).toHaveBeenCalled();
    }
  });

  it('should handle pointer move for panning', () => {
    const { result } = renderHook(() => usePhotoEditor({ file: mockFile }));
    act(() => {
      result.current.canvasRef.current = mockCanvas;
      result.current.handlePointerDown({
        clientX: 50,
        clientY: 50,
      } as React.PointerEvent<HTMLCanvasElement>);
    });

    act(() => {
      result.current.handlePointerMove({
        clientX: 60,
        clientY: 60,
        preventDefault: vi.fn(),
      } as unknown as React.PointerEvent<HTMLCanvasElement>);
    });

    expect(result.current.offsetX).toBe(10);
    expect(result.current.offsetY).toBe(10);
  });

  it('should handle pointer move when not dragging or drawing', () => {
    const { result } = renderHook(() => usePhotoEditor({ file: mockFile }));
    act(() => {
      result.current.canvasRef.current = mockCanvas;
    });

    act(() => {
      result.current.handlePointerMove({
        clientX: 60,
        clientY: 60,
        preventDefault: vi.fn(),
      } as unknown as React.PointerEvent<HTMLCanvasElement>);
    });

    // No assertions needed, just verifying no errors occur
  });

  it('should not access canvas context when no image source', () => {
    const { result } = renderHook(() => usePhotoEditor({}));

    const getContextSpy = vi.spyOn(mockCanvas, 'getContext');

    act(() => {
      result.current.canvasRef.current = mockCanvas;
      result.current.applyFilter();
    });

    expect(getContextSpy).not.toHaveBeenCalled();

    getContextSpy.mockRestore();
  });

  it('should not download image when no canvas or file', () => {
    const { result } = renderHook(() => usePhotoEditor({}));

    act(() => {
      result.current.downloadImage();
    });

    expect(mockCanvas.toDataURL).not.toHaveBeenCalled();
  });

  it('should set mode correctly', () => {
    const { result } = renderHook(() => usePhotoEditor({}));

    act(() => {
      result.current.setMode('draw');
    });

    expect(result.current.mode).toBe('draw');
  });

  it('should set line color correctly', () => {
    const { result } = renderHook(() => usePhotoEditor({}));

    act(() => {
      result.current.setLineColor('#ff0000');
    });

    expect(result.current.lineColor).toBe('#ff0000');
  });

  it('should set line width correctly', () => {
    const { result } = renderHook(() => usePhotoEditor({}));

    act(() => {
      result.current.setLineWidth(5);
    });

    expect(result.current.lineWidth).toBe(5);
  });

  it('should handle zoom with minimum limit', () => {
    const { result } = renderHook(() => usePhotoEditor({ defaultZoom: 0.2 }));

    act(() => {
      result.current.handleZoomOut();
    });

    expect(result.current.zoom).toBe(0.1);

    act(() => {
      result.current.handleZoomOut();
    });

    expect(result.current.zoom).toBe(0.1); // Shouldn't go below 0.1
  });

  it('should generate edited file with correct mime type for jpg', async () => {
    const jpgFile = new File(['(dummytest)'], 'test.jpg', { type: 'image/jpeg' });

    // Mock canvas with proper toBlob implementation
    const mockCanvasWithBlob = {
      ...mockCanvas,
      toBlob: vi.fn().mockImplementation((callback) => {
        callback(new Blob(['test'], { type: 'image/jpeg' }));
      }),
    } as unknown as HTMLCanvasElement;

    const { result } = renderHook(() => usePhotoEditor({ file: jpgFile }));

    act(() => {
      result.current.canvasRef.current = mockCanvasWithBlob;
    });

    const file = await result.current.generateEditedFile();
    expect(file).toBeDefined();
    expect(file?.type).toBe('image/jpeg');
  }, 10000); // Increased timeout

  it('should generate edited file with correct mime type for png', async () => {
    // Mock canvas with proper toBlob implementation
    const mockCanvasWithBlob = {
      ...mockCanvas,
      toBlob: vi.fn().mockImplementation((callback) => {
        callback(new Blob(['test'], { type: 'image/png' }));
      }),
    } as unknown as HTMLCanvasElement;

    const { result } = renderHook(() => usePhotoEditor({ file: mockFile }));

    act(() => {
      result.current.canvasRef.current = mockCanvasWithBlob;
    });

    const file = await result.current.generateEditedFile();
    expect(file).toBeDefined();
    expect(file?.type).toBe('image/png');
  }, 10000); // Increased timeout
});
