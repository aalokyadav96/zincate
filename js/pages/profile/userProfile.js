import { displayProfile  } from "../../services/profile/userProfileService";
import { displayUserProfile  } from "../../services/profile/otherUserProfileService";

function UserProfile(isLoggedIn, contentContainer) {
    contentContainer.innerHTML = '';
    displayProfile(isLoggedIn, contentContainer);
}

export { UserProfile, displayUserProfile  };
