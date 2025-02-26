import { apiInstance } from "../constants/apiInstance";
import { utilsResponse } from "../types/utils";
import { Campus, PostType, Category } from "../types/post";
import { PostStatus } from "../types/order";

const api = apiInstance({
  baseURL: "http://trangiangkhanh.site:8090",
});
export const manageView = {
  getAllCampus: () => api.get<utilsResponse<Campus[]>>(`/campus`),
  getAllPostType: () => api.get<utilsResponse<PostType[]>>(`/post-type`),
  getAllCategory: () => api.get<utilsResponse<Category[]>>(`/category-type`),
  getPostStatus: () => api.get<utilsResponse<PostStatus[]>>(`/post-status`),
};
