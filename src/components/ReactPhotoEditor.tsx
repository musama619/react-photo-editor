import { useEffect, useRef, useState, ChangeEvent } from 'react';
import { ReactPhotoEditorProps } from './interface';
import './style.css';
const modalHeaderButtonClasses =
	'text-gray-900 bg-white border border-gray-300 ml-2 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-2 py-1 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700';
export const ReactPhotoEditor: React.FC<ReactPhotoEditorProps> = ({
	file,
	onSaveImage,
	allowColorEditing = true,
	allowFlip = true,
	allowRotate = true,
	allowZoom = true,
	downloadOnSave,
	open,
	onClose,
	modalHeight,
	modalWidth,
	canvasHeight,
	canvasWidth,
	maxCanvasHeight,
	maxCanvasWidth,
	labels = {
		close: 'Close',
		save: 'Save',
		rotate: 'Rotate',
		brightness: 'Brightness',
		contrast: 'Contrast',
		saturate: 'Saturate',
		grayscale: 'Grayscale',
		reset: 'Reset photo',
		flipHorizontal: 'Flip photo horizontally',
		flipVertical: 'Flip photo vertically',
		zoomIn: 'Zoom in',
		zoomOut: 'Zoom out'
	}
}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [imageSrc, setImageSrc] = useState('');
	const [imageName, setImageName] = useState('');
	const [brightnessValue, setBrightnessValue] = useState(100);
	const [contrastValue, setContrastValue] = useState(100);
	const [saturateValue, setSaturateValue] = useState(100);
	const [grayscaleValue, setGrayscaleValue] = useState(0);
	const [rotate, setRotate] = useState(0);
	const [flipHorizontal, setFlipHorizontal] = useState(false);
	const [flipVertical, setFlipVertical] = useState(false);
	const [zoom, setZoom] = useState(1);

	const [isDragging, setIsDragging] = useState(false);

	const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
	const [offsetX, setOffsetX] = useState(0);
	const [offsetY, setOffsetY] = useState(0);

	const handlePointerDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
		setIsDragging(true);
		const initialX = event.clientX - (flipHorizontal ? -offsetX : offsetX);
		const initialY = event.clientY - (flipVertical ? -offsetY : offsetY);
		setPanStart({ x: initialX, y: initialY });
	};

	const handlePointerMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
		if (isDragging) {
			event.preventDefault();

			const offsetXDelta = event.clientX - panStart!.x;
			const offsetYDelta = event.clientY - panStart!.y;

			setOffsetX(flipHorizontal ? -offsetXDelta : offsetXDelta);
			setOffsetY(flipVertical ? -offsetYDelta : offsetYDelta);
		}
	};

	const handlePointerUp = () => {
		setIsDragging(false);
	};

	const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
		if (event.deltaY < 0) {
			handleZoomIn();
		} else {
			handleZoomOut();
		}
	};

	useEffect(() => {
		if (file) {
			const fileSrc = URL.createObjectURL(file);
			setImageSrc(fileSrc);
			setImageName(file.name);
			return () => {
				URL.revokeObjectURL(fileSrc);
			};
		}
	}, [file, open]);

	useEffect(() => {
		applyFilter();
	}, [
		file,
		imageSrc,
		rotate,
		flipHorizontal,
		flipVertical,
		zoom,
		brightnessValue,
		contrastValue,
		saturateValue,
		grayscaleValue,
		offsetX,
		offsetY,
	]);

	const applyFilter = () => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext('2d');
		const image = new Image();

		if (!(imageSrc.startsWith('blob:'))) {
			console.error('Invalid image source');
			return;
		}

		image.src = imageSrc;
		image.onload = () => {
			if (canvas && context) {
				const zoomedWidth = image.width * zoom;
				const zoomedHeight = image.height * zoom;
				const translateX = (image.width - zoomedWidth) / 2;
				const translateY = (image.height - zoomedHeight) / 2;
				canvas.width = image.width;
				canvas.height = image.height;
				context.filter = getFilterString();
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
				context.translate(translateX, translateY);

				context.translate(offsetX, offsetY);

				context.scale(zoom, zoom);
				context.drawImage(image, 0, 0, canvas.width, canvas.height);

				context.restore();
			}
		};
	};

	const getFilterString = () => {
		return `brightness(${brightnessValue}%) contrast(${contrastValue}%) grayscale(${grayscaleValue}%) saturate(${saturateValue}%)`;
	};

	const handleInputChange = (
		event: ChangeEvent<HTMLInputElement>,
		setValue: React.Dispatch<React.SetStateAction<number>>,
		min: number,
		max: number
	) => {
		const value = parseInt(event.target?.value);
		if (!isNaN(value) && value >= min && value <= max) {
			setValue(value);
		}
	};

	const handleZoomIn = () => {
		setZoom((prevZoom) => prevZoom + 0.1);
	};

	const handleZoomOut = () => {
		setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.1));
	};

	const renderInputs = [
		{
			name: labels.rotate,
			value: rotate,
			setValue: setRotate,
			min: -180,
			max: 180,
			type: 'range',
			id: 'rotateInput',
			'aria-labelledby': 'rotateInputLabel',
			hide: !allowRotate,
		},
		{
			name: labels.brightness,
			value: brightnessValue,
			setValue: setBrightnessValue,
			min: 0,
			max: 200,
			type: 'range',
			id: 'brightnessInput',
			'aria-labelledby': 'brightnessInputLabel',
			hide: !allowColorEditing,
		},
		{
			name: labels.contrast,
			value: contrastValue,
			setValue: setContrastValue,
			min: 0,
			max: 200,
			type: 'range',
			id: 'contrastInput',
			'aria-labelledby': 'contrastInputLabel',
			hide: !allowColorEditing,
		},
		{
			name: labels.saturate,
			value: saturateValue,
			setValue: setSaturateValue,
			min: 0,
			max: 200,
			type: 'range',
			id: 'saturateInput',
			'aria-labelledby': 'saturateInputLabel',
			hide: !allowColorEditing,
		},
		{
			name: labels.grayscale,
			value: grayscaleValue,
			setValue: setGrayscaleValue,
			min: 0,
			max: 100,
			type: 'range',
			id: 'grayscaleInput',
			'aria-labelledby': 'grayscaleInputLabel',
			hide: !allowColorEditing,
		},
	];

	const resetImage = () => {
		setBrightnessValue(100);
		setContrastValue(100);
		setSaturateValue(100);
		setGrayscaleValue(0);
		setRotate(0);
		setFlipHorizontal(false);
		setFlipVertical(false);
		setZoom(1);
		setOffsetX(0);
		setOffsetY(0);
		setPanStart(null);
		setIsDragging(false);
	};

	const saveImage = () => {
		const canvas = canvasRef.current;
		if (canvas) {
			const fileExtension = (imageName.split('.').pop() || '').toLowerCase();
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
					const editedFile = new File([blob], imageName, { type: blob.type });
					if (downloadOnSave) {
						const objectUrl = URL.createObjectURL(blob);
						const linkElement = document.createElement('a');
						linkElement.download = `${imageName}`;
						linkElement.href = objectUrl;
						linkElement.click();
						URL.revokeObjectURL(objectUrl);
					}
					onSaveImage(editedFile);
					if (onClose) {
						onClose();
					}
				}
				resetImage();
			}, mimeType);
		}
	};

	const closeEditor = () => {
		resetImage();
		if (onClose) {
			onClose();
		}
	};
	return (
		<>
			{open && (
				<>
					<div
						data-testid='photo-editor-main'
						className='photo-editor-main justify-center items-center flex overflow-auto fixed inset-0 z-50'
					>
						<div
							style={{
								height: modalHeight ?? '38rem',
								width: modalWidth ?? '40rem'
							}}
							id='photo-editor-modal'
							className='relative rounded-lg shadow-lg max-sm:w-[22rem] bg-white dark:bg-[#1e1e1e]'
						>
							<div className='flex justify-end p-2 rounded-t'>
								<button
									className={modalHeaderButtonClasses}
									onClick={closeEditor}
									type='button'
								>
									{labels.close}
								</button>
								<button
									className={modalHeaderButtonClasses}
									onClick={() => saveImage()}
									type='button'
									data-testid='save-button'
								>
									{labels.save}
								</button>
							</div>
							<div className='p-2'>
								<div className='flex flex-col'>
									<canvas
										style={{
											width: canvasWidth ?? 'auto',
											height: canvasHeight ?? 'auto',
											maxHeight: maxCanvasHeight ?? '22rem',
											maxWidth: maxCanvasWidth ?? '36rem'
										}}
										className={`canvas border dark:border-gray-700 object-fit mx-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
										data-testid='image-editor-canvas'
										id='canvas'
										ref={canvasRef}
										onPointerDown={handlePointerDown}
										onPointerMove={handlePointerMove}
										onPointerUp={handlePointerUp}
										onPointerLeave={handlePointerUp}
										onWheel={handleWheel}
										width={typeof canvasWidth === 'number' ? canvasWidth : undefined}
										height={typeof canvasHeight === 'number' ? canvasHeight : undefined}
									/>
									<div className='items-center flex m-1 flex-col'>
										<div className='flex flex-col bottom-12 gap-1 mt-4 max-sm:w-72 w-11/12 absolute '>
											{renderInputs.map(
												(input) =>
													!input.hide && (
														<div key={input.name} className='flex flex-row items-center'>
															<label
																id={`${input.name}InputLabel`}
																className='text-xs font-medium text-gray-900 dark:text-white w-10'
															>
																{input.name[0].toUpperCase() + input.name.slice(1)}:{' '}
															</label>
															<input
																id={input.id}
																aria-labelledby={input['aria-labelledby']}
																type={input.type}
																value={input.value}
																step='1'
																onChange={(e) =>
																	handleInputChange(e, input.setValue, input.min, input.max)
																}
																min={input.min}
																max={input.max}
																className='ml-[1.7rem] w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm dark:bg-gray-700'
															/>
															<input
																type='number'
																aria-labelledby={input['aria-labelledby']}
																value={input.value}
																onChange={(e) =>
																	handleInputChange(e, input.setValue, input.min, input.max)
																}
																min={input.min}
																max={input.max}
																className='w-14 ml-2 rounded-md text-right bg-gray-100 text-black dark:bg-gray-700 dark:text-white'
															/>
														</div>
													)
											)}
										</div>
									</div>
									<div className='flex justify-center'>
										<div className='mb-1 absolute bottom-0 mt-2'>
											<button
												title={labels.reset}
												className='mx-1 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 rounded-md p-1'
												onClick={resetImage}
												aria-label={labels.reset}
												type='button'
											>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													width='24'
													height='24'
													viewBox='0 0 24 24'
													fill='none'
													stroke='currentColor'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'
													className='lucide lucide-rotate-ccw dark:stroke-slate-200'
												>
													<path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' />
													<path d='M3 3v5h5' />
												</svg>
											</button>
											{allowFlip && (
												<div className='inline-block' data-testid='flip-btns'>
													<button
														className='mx-1 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 rounded-md p-1'
														onClick={() => setFlipHorizontal(!flipHorizontal)}
														type='button'
														title={labels.flipHorizontal}
														aria-label={labels.flipHorizontal}
													>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															width='24'
															height='24'
															viewBox='0 0 24 24'
															fill='none'
															stroke='currentColor'
															strokeWidth='2'
															strokeLinecap='round'
															strokeLinejoin='round'
															className='lucide lucide-flip-horizontal dark:stroke-slate-200'
														>
															<path d='M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3' />
															<path d='M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3' />
															<path d='M12 20v2' />
															<path d='M12 14v2' />
															<path d='M12 8v2' />
															<path d='M12 2v2' />
														</svg>
													</button>
													<button
														className='mx-1 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 rounded-md p-1'
														onClick={() => setFlipVertical(!flipVertical)}
														type='button'
														title={labels.flipVertical}
														aria-label={labels.flipVertical}
													>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															width='24'
															height='24'
															viewBox='0 0 24 24'
															fill='none'
															stroke='currentColor'
															strokeWidth='2'
															strokeLinecap='round'
															strokeLinejoin='round'
															className='lucide lucide-flip-vertical dark:stroke-slate-200'
														>
															<path d='M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3' />
															<path d='M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3' />
															<path d='M4 12H2' />
															<path d='M10 12H8' />
															<path d='M16 12h-2' />
															<path d='M22 12h-2' />
														</svg>
													</button>
												</div>
											)}
											{allowZoom && (
												<div className='inline-block' data-testid='zoom-btns'>
													<button
														data-testid='zoom-in'
														type='button'
														className='mx-1 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 rounded-md p-1'
														onClick={handleZoomIn}
														title={labels.zoomIn}
														aria-label={labels.zoomIn}
													>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															width='24'
															height='24'
															viewBox='0 0 24 24'
															fill='none'
															stroke='currentColor'
															strokeWidth='2'
															strokeLinecap='round'
															strokeLinejoin='round'
															className='lucide lucide-zoom-in dark:stroke-slate-200'
														>
															<circle cx='11' cy='11' r='8' />
															<line x1='21' x2='16.65' y1='21' y2='16.65' />
															<line x1='11' x2='11' y1='8' y2='14' />
															<line x1='8' x2='14' y1='11' y2='11' />
														</svg>
													</button>
													<button
														data-testid='zoom-out'
														type='button'
														className='mx-1 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 rounded-md p-1'
														onClick={handleZoomOut}
														title={labels.zoomOut}
														aria-label={labels.zoomOut}
													>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															width='24'
															height='24'
															viewBox='0 0 24 24'
															fill='none'
															stroke='currentColor'
															strokeWidth='2'
															strokeLinecap='round'
															strokeLinejoin='round'
															className='lucide lucide-zoom-out dark:stroke-slate-200'
														>
															<circle cx='11' cy='11' r='8' />
															<line x1='21' x2='16.65' y1='21' y2='16.65' />
															<line x1='8' x2='14' y1='11' y2='11' />
														</svg>
													</button>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className='opacity-75 fixed inset-0 z-40 bg-black'></div>
				</>
			)}
		</>
	);
};
