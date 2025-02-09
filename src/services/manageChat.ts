import { apiInstance } from "../constants/apiInstance";
import { utilsResponse } from "../types/utils";
import { StudentToStudentChat, SendMessage, ContactSeller, ContactStudent } from "../types/chat"

const api = apiInstance({
  baseURL: "http://trangiangkhanh.site:8090/chat",
});

export const manageChat = {
  chatRoom: (payload: number) =>
    api.get<utilsResponse<any>>(`chat-room/${payload}`),

  chatRoomStS: (payload: StudentToStudentChat) => {
    return api.get<utilsResponse<any>>(`chat-room/student-to-student?studentSendId=${payload.studentSendId}&studentReceiveId=${payload.studentReceiveId}`);
  },

  sendMessage: (payload: SendMessage) => {
    console.log(payload);
    return api.post<utilsResponse<any>>(`send-message`, payload);
  },

  contactSeller: (payload: ContactSeller) =>
    api.post<utilsResponse<any>>(`contact-to-seller`, payload),

  contactStudent: (payload: ContactStudent) =>
    api.post<utilsResponse<any>>(`contact-to-student`, payload),

  deleteChatRoom: (payload: number) =>
    api.put<utilsResponse<any>>(`delete-chat-room`, payload),
};
