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
		setRotate,
		flipHorizontal,
		setFlipHorizontal,
		flipVertical,
		setFlipVertical,
		zoom,
		setZoom,
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
						}}
						ref={canvasRef}
						onMouseDown={handlePointerDown}
						onMouseMove={handlePointerMove}
						onMouseUp={handlePointerUp}
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
						onChange={(e) => setRotate(Number(e.target.value))}
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
						onChange={(e) => setZoom(Number(e.target.value))}
					/>
				</div>

				<div>
					<label>
						<input
							type='checkbox'
							checked={flipHorizontal}
							onChange={(e) => setFlipHorizontal(e.target.checked)}
						/>
						Flip Horizontal
					</label>
				</div>

				<div>
					<label>
						<input
							type='checkbox'
							checked={flipVertical}
							onChange={(e) => setFlipVertical(e.target.checked)}
						/>
						Flip Vertical
					</label>
				</div>

				<div className='buttons'>
					<button onClick={resetFilters}>Reset</button>
					<button onClick={downloadImage}>Save</button>
				</div>
			</div>
		</div>
	);
};

export default CustomPhotoEditor;
