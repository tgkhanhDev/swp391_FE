import { apiInstance } from "../constants/apiInstance";
import { CodPayment } from "../types/order";
import { Post, PostFilter_API, PostLoadMore } from "../types/post";
import { utilsResponse } from "../types/utils";

const api = apiInstance({ 
  baseURL: "http://localhost:8080/order",
});

export const manageOrder = {
  pay_cod: (payload: CodPayment) => api.post(`/payment/pay-order`, payload),
  // pay_vnpay: (payload: string) => api.get(`/vn-pay?amount=${payload}`),
};
