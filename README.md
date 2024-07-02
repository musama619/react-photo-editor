![react-photo-editor](https://github.com/musama619/react-photo-editor/blob/main/react-photo-editor.png)

# react-photo-editor

React component for image editing with options to set **brightness**, **contrast**, **saturation**, and **grayscale**. Also with features to **rotate**, **flip** and **zoom** the photo.

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
import 'react-photo-editor/dist/style.css'

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

## Usage with Tailwind CSS
If your project uses Tailwind CSS, you don’t need to import the CSS file directly. Instead, add the following path to the content array in your tailwind.config.js file:
```js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/react-photo-editor/dist/*.js', // Add this line
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Options
   
```ts 
export  interface  ReactPhotoEditorProps {

    /**
    * The input image file to be edited.
    */
    file:  File  |  undefined,

    /**
    * Whether to allow color editing options.
    * @default  true
    */
    allowColorEditing?:  boolean,
    
    /**
    * Whether to allow rotation of the image.
    * @default  true
    */
    allowRotate?:  boolean,
    
    /**
    * Whether to allow flipping (horizontal/vertical) of the image.
    * @default  true
    */
    allowFlip?:  boolean,
    
    /**
    * Whether to allow zooming of the image.
    * @default  true
    */
    allowZoom?:  boolean,
    
    /**
    * Whether to enable the option to download the edited image upon saving.
    * @default  false
    */
    downloadOnSave?:  boolean,
    
    /**
    * Whether the photo editor modal is open.
    * @default  false
    */
    open?:  boolean,
    
    /**
    * Function invoked when the photo editor modal is closed.
    */
    onClose?: () =>  void,
    
    /**
    * Function invoked when the edited image is saved.
    * @param  image - The edited image file.
    */
    onSaveImage: (image:  File) =>  void,
 }
```

## Contributing

Contributions to `react-photo-editor` are welcome! If you have any issues, feature requests, or improvements, please open an issue or submit a pull request on the [GitHub repository](https://github.com/musama619/react-photo-editor). Your feedback and support are highly appreciated!

### Reporting Issues

If you encounter any problems while using the library, please open an issue on GitHub. Provide as much detail as possible, including steps to reproduce the issue and any relevant code or screenshots.

### Feature Requests

Have an idea for a new feature? Please open an issue with a detailed description of the feature you'd like to see, and why it would be useful.

Thank you for your interest in contributing to `react-photo-editor`!

