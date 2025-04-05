import { useState } from 'react';
import { ReactPhotoEditor } from '../components/ReactPhotoEditor';

const PhotoEditor = () => {
	const [file, setFile] = useState<File>();
	const [showModal, setShowModal] = useState<boolean>(false);

	const showModalHandler = () => {
		if (file) {
			setShowModal(true);
		}
	};

	const hideModal = () => {
		setShowModal(false);
	};
	const handleSaveImage = (editedFile: File) => {
		setFile(editedFile);
	};

	const setFileData = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e?.target?.files && e.target.files.length > 0) {
			setFile(e.target.files[0]);
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
			<input type='file' onChange={(e) => setFileData(e)} multiple={false} />
			<button
				className='rpe-bg-gray-200 rpe-p-2 rpe-rounded-md rpe-ml-2'
				onClick={() => showModalHandler()}
			>
				Edit
			</button>
			<ReactPhotoEditor
				open={showModal}
				onClose={hideModal}
				file={file}
				onSaveImage={handleSaveImage}
				downloadOnSave={true}
				// labels={translationsFr}
			/>
		</div>
	);
};

export default PhotoEditor;
