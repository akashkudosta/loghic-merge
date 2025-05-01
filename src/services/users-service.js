import HttpService from "./htttp.service";
import userPlaceholderImage from "../assets/images/user-placehoder.png";

// Helper function to get valid avatar URL
const getValidAvatarUrl = (imageUrl) => {
  if (!imageUrl) return userPlaceholderImage;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${process.env.REACT_APP_API_URL}${imageUrl}`;
};

class UsersService {
  getUsers = async (page = 1, limit = 20) => {
    const getUsersEndpoint = 'api/users/getUsers';
    const payload = { page: Number(page), limit: Number(limit) }; 
    return await HttpService.post(getUsersEndpoint, payload);
  };

  getUserById = async (userId) => {
    const getUserByIdEndpoint = 'api/users/getUserbyId';
    const payload = { User_PublicID: userId };
    return await HttpService.post(getUserByIdEndpoint, payload);
  };

  updateProfile = async (userId, userData) => {
    const updateUserEndpoint = 'api/users/updateUserProfile';
    const payload = { User_PublicID: userId, ...userData };
    return await HttpService.post(updateUserEndpoint, payload);
  };

  updateUserSettings = async (userId, settingsData) => {
    const updateUserSettingsEndpoint = 'api/users/updateUserPermissions';
    const payload = { User_PublicID: userId, ...settingsData };
    return await HttpService.post(updateUserSettingsEndpoint, payload);
  };

  changePassword = async (userId, passwordData) => {
    const changePasswordEndpoint = 'api/users/updateUserPassword';
    const payload = { User_PublicID: userId, ...passwordData };
    return await HttpService.post(changePasswordEndpoint, payload);
  };

  static async getUserById(userId) {
    try {
      const response = await HttpService.get(`/users/${userId}`);
      if (response.data && response.data.data) {
        response.data.data.User_ImageURL = getValidAvatarUrl(response.data.data.User_ImageURL);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async updateProfile(userId, userData) {
    try {
      // If there's an image URL in the update data, ensure it's properly formatted
      if (userData.data?.attributes?.User_ImageURL) {
        userData.data.attributes.User_ImageURL = getValidAvatarUrl(userData.data.attributes.User_ImageURL);
      }
      return await HttpService.put(`/users/${userId}`, userData);
    } catch (error) {
      throw error;
    }
  }

  // Add other user-related API methods here
}

export default new UsersService(); 