![react-photo-editor](https://github.com/musama619/react-photo-editor/blob/main/react-photo-editor.png)

[![NPM Version](https://img.shields.io/npm/v/react-photo-editor.svg)](https://www.npmjs.com/package/react-photo-editor)
[![NPM Downloads](https://img.shields.io/npm/dm/react-photo-editor.svg)](https://www.npmjs.com/package/react-photo-editor)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/react-photo-editor)](https://bundlephobia.com/package/react-photo-editor)
[![License](https://img.shields.io/npm/l/react-photo-editor.svg)](https://github.com/musama619/react-photo-editor/blob/main/LICENSE)

# react-photo-editor

React component for image editing with options to set **brightness**, **contrast**, **saturation**, and **grayscale**. Also with features to **rotate**, **flip**, **pan**, **draw**, and **zoom** the photo.

### Migrating from v2.x to v3.0.0

#### ⚠️ Breaking Changes

- **CSS Import Removed**: The CSS file previously imported with `import 'react-photo-editor/dist/style.css'` is no longer required and won't be found if referenced.
- **Tailwind CSS Configuration**: No longer need to add `'./node_modules/react-photo-editor/dist/*.js'` to your Tailwind config.

## Installation

### npm

```js
npm install react-photo-editor
```

### yarn

```js
yarn add react-photo-editor
```

### [Stackblitz - Check It Live](https://stackblitz.com/edit/react-flcdhq?file=src%2FApp.js,package.json)

## Basic Usage

```ts
import { ReactPhotoEditor } from 'react-photo-editor'

function App() {
 const [file, setFile] = useState<File | undefined>()
 const [showModal, setShowModal] = useState(false)

   // Show modal if file is selected
  const showModalHandler = () => {
    if (file) {
      setShowModal(true)
    }
  }

  // Hide modal
  const hideModal = () => {
    setShowModal(false)
  }

  // Save edited image
  const handleSaveImage = (editedFile: File) => {
    setFile(editedFile);
  };

  const setFileData = (e: React.ChangeEvent<HTMLInputElement> | null) => {
    if (e?.target?.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  return (
    <>
      <input
          type="file"
          onChange={(e) => setFileData(e)}
          multiple={false}
       />

      <button onClick={showModalHandler}>Edit</button>

      <ReactPhotoEditor
        open={showModal}
        onClose={hideModal}
        file={file}
        onSaveImage={handleSaveImage}
      />

    </>
  )
}

export default App
```

## Options

```ts
export interface ReactPhotoEditorProps {
	/**
	 * The input image file to be edited.
	 */
	file: File | undefined;

	/**
	 * Whether to allow color editing options.
	 * @default  true
	 */
	allowColorEditing?: boolean;

	/**
	 * Whether to allow rotation of the image.
	 * @default  true
	 */
	allowRotate?: boolean;

	/**
	 * Whether to allow flipping (horizontal/vertical) of the image.
	 * @default  true
	 */
	allowFlip?: boolean;

	/**
	 * Whether to allow zooming of the image.
	 * @default  true
	 */
	allowZoom?: boolean;

	/**
	 * Whether to enable drawing options.
	 * @default true
	 */
	allowDrawing?: boolean;

	/**
	 * Whether to enable the option to download the edited image upon saving.
	 * @default  false
	 */
	downloadOnSave?: boolean;

	/**
	 * Whether the photo editor modal is open.
	 * @default  false
	 */
	open?: boolean;

	/**
	 * Function invoked when the photo editor modal is closed.
	 */
	onClose?: () => void;

	/**
	 * Function invoked when the edited image is saved.
	 * @param  image - The edited image file.
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

	/**
	 * Custom labels or text options for various elements in the photo editor.
	 * Use this to override default text for buttons, tooltips, etc.
	 *
	 * Example:
	 * labels: {
	 *     close: 'Exit',
	 *     save: 'Apply Changes',
	 *     rotate: 'Turn',
	 * }
	 */
	labels?: ReactPhotoEditorTranslations;
}
```

## Custom component using `usePhotoEditor` hook

The usePhotoEditor hook provides a set of functionalities for integrating image editing capabilities into your custom React components. Below is a description of its props and the fields it returns.

```ts
/**
 * Parameters for the usePhotoEditor hook.
 */
interface UsePhotoEditorParams {
	/**
	 * The image file to be edited.
	 */
	file?: File;

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
}
```

### Return Fields

```ts
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
	panStart,

	/** Current horizontal offset for panning. */
	offsetX,

	/** Current vertical offset for panning. */
	offsetY,

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

	/** Function to set the starting coordinates for panning. */
	setPanStart,

	/** Function to set the horizontal offset for panning. */
	setOffsetX,

	/** Function to set the vertical offset for panning. */
	setOffsetY,

	/** Function to zoom in. */
	handleZoomIn,

	/** Function to zoom out. */
	handleZoomOut,

	/** Function to handle pointer-down events. */
	handlePointerDown,

	/** Function to handle pointer-up events. */
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
};
```

This hook is ideal for developers looking to create a custom photo editing experience with full control over the image editing parameters and interactions.

## Contributing

Contributions to `react-photo-editor` are welcome! If you have any issues, feature requests, or improvements, please open an issue or submit a pull request on the [GitHub repository](https://github.com/musama619/react-photo-editor). Your feedback and support are highly appreciated!

### Reporting Issues

If you encounter any problems while using the library, please open an issue on GitHub. Provide as much detail as possible, including steps to reproduce the issue and any relevant code or screenshots.

### Feature Requests

Have an idea for a new feature? Please open an issue with a detailed description of the feature you'd like to see, and why it would be useful.

Thank you for your interest in contributing to `react-photo-editor`!
