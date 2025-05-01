import HttpService from "./htttp.service";

class CompaniesService {
  getCompanies = async (page = 1, limit = 20) => {
    const getCompaniesEndpoint = 'api/companies/getCompanies';
    const payload = { page: Number(page), limit: Number(limit) };
    // console.log("API call with payload:", payload);
    return await HttpService.post(getCompaniesEndpoint, payload);
  };
  
  // Add other company-related API methods here
}

export default new CompaniesService(); 