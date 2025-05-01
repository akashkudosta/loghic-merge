import HttpService from "./htttp.service";

class PostsService {
  getPosts = async (page = 1, limit = 20) => {
    const getPostsEndpoint = 'api/posts/getPosts';
    const payload = { page: Number(page), limit: Number(limit) };
    //console.log("API call with payload:", payload);
    return await HttpService.post(getPostsEndpoint, payload);
  };
  
  createPost = async (postData) => {
    const createPostEndpoint = 'api/posts/createPost';
    return await HttpService.post(createPostEndpoint, postData);
  };
  
  // Add other post-related API methods here as needed
}

export default new PostsService(); 