import { useState } from 'react'
import { ReactPhotoEditor } from '../components/ReactPhotoEditor'


const PhotoEditor = () => {
    const [file, setFile] = useState<File>()
    const [showModal, setShowModal] = useState<boolean>(false)

    const showModalHandler = () => {
        if (file) {
            setShowModal(true)
        }
    }

    const hideModal = () => {
        setShowModal(false)
    }
    const handleSaveImage = (editedFile: File) => {
        setFile(editedFile);
    };

    const setFileData = (e: React.ChangeEvent<HTMLInputElement> | null) => {
        if (e?.target?.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
        }
    }

    const translationsFr = {
        close: 'fermer',
        save: 'sauvegarder',
        rotate: 'faire pivoter',
        brightness: 'luminosité',
        contrast: 'contraste',
        saturate: 'saturer',
        grayscale: 'niveaux de gris',
        reset: 'réinitialiser',
        flipHorizontal: 'retourner horizontalement',
        flipVertical: 'retourner verticalement',
        zoomIn: 'zoomer',
        zoomOut: 'dézoomer',
    };

    return (
        <div>
            <input type="file" onChange={(e) => setFileData(e)} multiple={false} />
            <button className='bg-gray-200 p-2 rounded-md ml-2' onClick={() => showModalHandler()}>Edit</button>
            <ReactPhotoEditor
                open={showModal}
                onClose={hideModal}
                file={file}
                allowColorEditing={true}
                allowFlip={true}
                allowRotate={true}
                allowZoom={true}
                onSaveImage={handleSaveImage}
                downloadOnSave={true}
            // labels={translationsFr}
            />
        </div>
    )
}

export default PhotoEditor

