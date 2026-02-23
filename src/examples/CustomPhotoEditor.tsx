import React, { useState } from 'react';
import { usePhotoEditor } from '../hooks/usePhotoEditor';

const CustomPhotoEditor = () => {
  const [file, setFile] = useState<File>();

  const setFileData = (e: React.ChangeEvent<HTMLInputElement> | null) => {
    if (e?.target?.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const {
    canvasRef,
    imageSrc,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    saturate,
    setSaturate,
    grayscale,
    setGrayscale,
    rotate,
    handleRotate,
    flipHorizontal,
    handleFlipHorizontal,
    flipVertical,
    handleFlipVertical,
    zoom,
    handleZoom,
    mode,
    setMode,
    setLineColor,
    lineColor,
    setLineWidth,
    lineWidth,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
    handleWheel,
    downloadImage,
    resetFilters,
  } = usePhotoEditor({ file });

  return (
    <div className='photo-editor'>
      <input type='file' onChange={(e) => setFileData(e)} multiple={false} />
      {imageSrc && (
        <div className='canvas-container'>
          <canvas
            style={{
              width: 'auto',
              height: 'auto',
              maxHeight: '22rem',
              maxWidth: '36rem',
              touchAction: 'none',
            }}
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
          />
        </div>
      )}

      <div className='controls'>
        <div>
          <label>Brightness</label>
          <input
            type='range'
            min='0'
            max='200'
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
          />
        </div>

        <div>
          <label>Contrast</label>
          <input
            type='range'
            min='0'
            max='200'
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
          />
        </div>

        <div>
          <label>Saturate</label>
          <input
            type='range'
            min='0'
            max='200'
            value={saturate}
            onChange={(e) => setSaturate(Number(e.target.value))}
          />
        </div>

        <div>
          <label>Grayscale</label>
          <input
            type='range'
            min='0'
            max='100'
            value={grayscale}
            onChange={(e) => setGrayscale(Number(e.target.value))}
          />
        </div>

        <div>
          <label>Rotate</label>
          <input
            type='range'
            min='0'
            max='360'
            value={rotate}
            onChange={(e) => handleRotate(Number(e.target.value))}
          />
        </div>

        <div>
          <label>Zoom</label>
          <input
            type='range'
            min='0.1'
            max='3'
            step='0.1'
            value={zoom}
            onChange={(e) =>
              handleZoom(Number(e.target.value) - zoom)
            }
          />
        </div>

        <div>
          <label>
            <input
              type='checkbox'
              checked={flipHorizontal}
              onChange={() => handleFlipHorizontal()}
            />
            Flip Horizontal
          </label>
        </div>

        <div>
          <label>
            <input type='checkbox' checked={flipVertical} onChange={() => handleFlipVertical()} />
            Flip Vertical
          </label>
        </div>

        <div>
          <label>
            <input
              type='checkbox'
              checked={mode == 'draw'}
              onChange={(e) => setMode(e.target.checked ? 'draw' : 'pan')}
            />
            Draw Mode
          </label>
        </div>

        {mode == 'draw' && (
          <>
            <input type='color' onChange={(e) => setLineColor(e.target.value)} value={lineColor} />
            <input
              type='number'
              onChange={(e) => setLineWidth(Number(e.target.value))}
              value={lineWidth}
              min={2}
              max={100}
            />
          </>
        )}

        <div className='buttons rpe-flex rpe-gap-4'>
          <button className='rpe-border rpe-p-1 rpe-rounded-md' onClick={resetFilters}>
            Reset
          </button>
          <button className='rpe-border rpe-p-1 rpe-rounded-md' onClick={downloadImage}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomPhotoEditor;
