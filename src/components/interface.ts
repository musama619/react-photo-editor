export interface ReactPhotoEditorProps {
	/**
	 * The input image file to be edited.
	 */
	file: File | undefined;

	/**
	 * Whether to allow color editing options.
	 * @default true
	 */
	allowColorEditing?: boolean;

	/**
	 * Whether to allow rotation of the image.
	 * @default true
	 */
	allowRotate?: boolean;

	/**
	 * Whether to allow flipping (horizontal/vertical) of the image.
	 * @default true
	 */
	allowFlip?: boolean;

	/**
	 * Whether to allow zooming of the image.
	 * @default true
	 */
	allowZoom?: boolean;

	/**
	 * Whether to enable the option to download the edited image upon saving.
	 * @default false
	 */
	downloadOnSave?: boolean;

	/**
	 * Whether the photo editor modal is open.
	 * @default false
	 */
	open?: boolean;

	/**
	 * Function invoked when the photo editor modal is closed.
	 */
	onClose?: () => void;

	/**
	 * Function invoked when the edited image is saved.
	 * @param image - The edited image file.
	 */
	onSaveImage: (image: File) => void;

	/**
	 * The height of the photo editor modal.
	 * This can be specified as a number (pixels) or string (CSS value).
	 * @default '38rem'
	 */
	modalHeight?: number | string;

	/**
	 * The width of the photo editor modal.
	 * This can be specified as a number (pixels) or string (CSS value).
	 * @default '40rem'
	 */
	modalWidth?: number | string;

	/**
	 * The width of the canvas element used for editing the image.
	 * This can be specified as a number (pixels) or string (CSS value).
	 * @default 'auto'
	 */
	canvasWidth?: number | string;

	/**
	 * The height of the canvas element used for editing the image.
	 * This can be specified as a number or string (CSS value).
	 * @default 'auto'
	 */
	canvasHeight?: number | string;

	/**
	 * The maximum height of the canvas element.
	 * This can be specified as a number or string (CSS value).
	 * @default '22rem'
	 */
	maxCanvasHeight?: number | string;

	/**
	 * The maximum width of the canvas element.
	 * This can be specified as a number or string (CSS value).
	 * @default '36rem'
	 */
	maxCanvasWidth?: number | string;
}
