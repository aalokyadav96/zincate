import Modal from '../../components/ui/Modal.mjs';
import { showMediaUploadForm } from '../media/mediaService';

function MediaModal(placeId, isLoggedIn) {
    const content = document.createElement('div');
    const contentx = document.createElement('div');
    // content.appendChild(generateBannerForm(contentx, profile.username));
    content.appendChild(contentx);
    
    showMediaUploadForm(isLoggedIn, "place", placeId, contentx)
    
    const modal = Modal({
        title: 'Example Modal',
        content,
        onClose: () => modal.remove(),
    });
}

export { MediaModal };